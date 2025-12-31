// src/server/routes/fiat.js
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  APP_URL = 'http://localhost:5173',
  FIAT_IBAN,
  FIAT_BIC,
  FIAT_HOLDER
} = process.env;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

const r = express.Router();

// ----------  A. CONFIG (affichage IBAN/BIC + référence utilisateur) ----------
r.get('/config', async (req, res) => {
  // récupère la "référence" utilisateur à afficher (adresse abrégée)
  // tu peux utiliser l’adresse connectée (ex: req.query.address) ou le userId côté session
  const userRef = req.query.ref || 'Oxbd...197e'; // à remplacer par ta logique
  res.json({
    holder: FIAT_HOLDER,
    iban: FIAT_IBAN,
    bic: FIAT_BIC,
    userReference: userRef
  });
});

// ----------  B. EPC-QR : créer un intent SEPA + renvoyer payload QR ----------
/**
 * EPC QR payload minimal:
 *  BCD
 *  001
 *  1
 *  SCT
 *  BIC
 *  Holder
 *  IBAN
 *  EUR12.34
 *  Référence (remittance)
 *  (lignes vides)
 */
function buildEpcPayload({ holder, iban, bic, amountStr, reference }) {
  const lines = [
    'BCD',
    '001',
    '1',
    'SCT',
    bic || '',
    holder || '',
    iban || '',
    `EUR${amountStr}`,
    reference || '',
    '',
    ''
  ];
  return lines.join('\n');
}

r.post('/sepa/intent', bodyParser.json(), async (req, res) => {
  try {
    const { amount, currency = 'EUR', userId, billing } = req.body;
    const amountMinor = Math.round(parseFloat(String(amount)) * 100);
    if (!amountMinor || amountMinor <= 0) return res.status(400).json({ error: 'Montant invalide' });

    // crée/MAJ profil facturation (facultatif)
    let billingProfileId = null;
    if (billing) {
      const bp = await prisma.billingProfile.create({
        data: {
          userId: userId || null,
          fullName: billing.fullName || null,
          email: billing.email || null,
          phone: billing.phone || null,
          country: billing.country || null,
          city: billing.city || null,
          address: billing.address || null,
          zip: billing.zip || null
        }
      });
      billingProfileId = bp.id;
    }

    // référence utilisateur à mettre dans le libellé (ex: adresse abrégée)
    const reference = req.body.reference || 'Oxbd...197e';

    // payload QR EPC
    const amountStr = (amountMinor / 100).toFixed(2); // "12.34"
    const epcText = buildEpcPayload({
      holder: FIAT_HOLDER,
      iban: FIAT_IBAN,
      bic: FIAT_BIC,
      amountStr,
      reference
    });

    const dep = await prisma.fiatDeposit.create({
      data: {
        userId: userId || null,
        method: 'SEPA',
        currency: currency.toUpperCase(),
        amountMinor,
        status: 'PENDING',
        reference,
        iban: FIAT_IBAN,
        bic: FIAT_BIC,
        holder: FIAT_HOLDER,
        epcText,
        billingProfileId
      }
    });

    res.json({
      id: dep.id,
      epcText,          // côté front: générer le QR avec qrcode/fromText
      iban: FIAT_IBAN,
      bic: FIAT_BIC,
      holder: FIAT_HOLDER,
      reference
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------  C. SEPA: upload du justificatif + checkboxes ----------
const upload = multer({ dest: 'uploads/' });

r.post('/sepa/confirm/:id', upload.single('receipt'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { acceptedTos, isAccountHolder } = req.body;

    const dep = await prisma.fiatDeposit.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        receiptPath: req.file ? req.file.path : null
      }
    });

    res.json({ ok: true, deposit: dep });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------  D. Stripe: créer un PaymentIntent (carte) ----------
r.post('/card/create-payment-intent', bodyParser.json(), async (req, res) => {
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
  try {
    const { amount, currency = 'eur', customerInfo, userId } = req.body;
    const amountMinor = Math.round(parseFloat(String(amount)) * 100);
    if (!amountMinor || amountMinor <= 0) return res.status(400).json({ error: 'Montant invalide' });

    const customer = await stripe.customers.create({
      name: customerInfo?.fullName,
      email: customerInfo?.email,
      phone: customerInfo?.phone,
      address: customerInfo?.address
        ? {
            line1: customerInfo.address,
            postal_code: customerInfo?.zip,
            city: customerInfo?.city,
            country: customerInfo?.country
          }
        : undefined
    });

    const pi = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency: currency.toLowerCase(),
      customer: customer.id,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: { app_user_id: userId || '' }
    });

    // garde une trace côté DB (optionnel)
    await prisma.fiatDeposit.create({
      data: {
        userId: userId || null,
        method: 'CARD',
        currency: currency.toUpperCase(),
        amountMinor,
        status: 'PENDING',
        reference: 'CARD', // pas utile pour carte
        iban: '',
        bic: '',
        holder: '',
        stripePiId: pi.id
      }
    });

    res.json({ clientSecret: pi.client_secret, piId: pi.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Stripe error' });
  }
});

// ----------  E. Webhook Stripe ----------
r.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(500).send('Stripe not configured');
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    console.log('✅ Paiement reçu:', pi.amount, pi.currency, pi.id);
    try {
      await prisma.fiatDeposit.update({
        where: { stripePiId: pi.id },
        data: { status: 'SUCCEEDED' }
      });
      // TODO: créditer le solde utilisateur ici si tu as une table User
    } catch (e) {
      console.error('Prisma update error:', e);
    }
  }

  res.json({ received: true });
});

module.exports = r;
