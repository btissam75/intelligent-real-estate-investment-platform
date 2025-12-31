// src/server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");
const QRCode = require("qrcode");
const { PrismaClient } = require("@prisma/client");
const Stripe = require("stripe");

// ───────────────────────── 1) ENV & Services ─────────────────────────
const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,      // peut être vide si tu n'utilises pas le webhook
  APP_URL = "http://localhost:5173",
  PORT = 3000,
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY manquante dans .env");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const prisma = new PrismaClient();

// Références bancaires à afficher côté app
const BANK = {
  holder: "Reinv Capital",
  iban:   "FR7630004000500060007000189",
  bic:    "BNPAFRPPXXX",
};

// ───────────────────────── 2) App & Middlewares ─────────────────────
const app = express();

app.use(
  cors({
    origin: APP_URL,
    credentials: true,
  })
);
// --- Notifier le backend qu'un dépôt crypto a été envoyé (mock)
app.post("/api/deposits/notify", async (req, res) => {
  try {
    const { mode, asset, amount, from, txHash } = req.body || {};
    if (mode !== "crypto") return res.status(400).json({ error: "mode invalide" });
    if (!asset || !amount)  return res.status(400).json({ error: "données incomplètes" });

    console.log("🔔 Dépôt crypto notifié:", { asset, amount, from, txHash });
    // TODO: ici tu peux logguer en DB, créer une tâche de validation, etc.
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// --- Paiement Carte mock (remplacera plus tard Stripe Elements)
app.post("/api/fiat/card-mock", async (req, res) => {
  try {
    const { amount, currency, fullName, email, cardLast4 } = req.body || {};
    if (!amount || !currency) return res.status(400).json({ error: "Montant/devise manquants" });

    console.log("💳 Mock card payment:", { amount, currency, fullName, email, cardLast4 });
    // TODO: en prod, appelle ton endpoint create-payment-intent + Elements
    return res.json({ ok: true, status: "succeeded" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// IMPORTANT : le webhook Stripe doit recevoir le RAW body AVANT json()
app.post(
  "/api/fiat/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    if (!STRIPE_WEBHOOK_SECRET) {
      console.warn("⚠️ STRIPE_WEBHOOK_SECRET non défini — webhook ignoré.");
      return res.status(200).json({ ignored: true });
    }

    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Exemple : créditer après succès
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      console.log(
        "✅ Paiement reçu:",
        pi.amount,
        pi.currency,
        "user:",
        pi.metadata?.app_user_id || "-"
      );
      // TODO: créditer l’utilisateur (mise à jour en DB) si besoin.
    }

    res.json({ received: true });
  }
);

// JSON parser pour toutes les autres routes
app.use(bodyParser.json());

// Multer (upload de justificatifs)
const uploadDir = path.join(process.cwd(), "uploads", "receipts");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

// ───────────────────────── 3) Helpers ────────────────────────────────
function toMinor(amount) {
  return Math.round(Number(amount) * 100);
}

/** EPC QR texte minimal pour virement SEPA SCT
 * Réf. format: https://www.europeanpaymentscouncil.eu/
 * BCD\n002\n1\nSCT\n{BIC}\n{NOM}\n{IBAN}\nEUR{amount}\n\n{reference}
 */
function makeEpcText({ amountMinor, reference }) {
  const amountStr = (amountMinor / 100).toFixed(2);
  return [
    "BCD",
    "002",
    "1",
    "SCT",
    BANK.bic,
    BANK.holder,
    BANK.iban,
    `EUR${amountStr}`,
    "",
    reference || "",
  ].join("\n");
}

// ───────────────────────── 4) Health ────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "api", time: new Date().toISOString() });
});

// ───────────────────────── 5) Paiement CARTE (Stripe) ───────────────
app.post("/api/fiat/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "eur", customerInfo, userId } = req.body;
    const amountMinor = toMinor(amount);
    if (!amountMinor || amountMinor <= 0) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    const customer = await stripe.customers.create({
      name:  customerInfo?.fullName,
      email: customerInfo?.email,
      phone: customerInfo?.phone,
      address: customerInfo?.address
        ? {
            line1: customerInfo.address,
            postal_code: customerInfo?.zip,
            city: customerInfo?.city,
            country: customerInfo?.country,
          }
        : undefined,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency: currency.toLowerCase(),
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        // évite les moyens nécessitant return_url durant les tests CLI
        allow_redirects: "never",
      },
      metadata: { app_user_id: userId || "" },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
});

// ───────────────────────── 6) Dépôt SEPA — Intent ───────────────────
app.post("/api/fiat/sepa/intent", async (req, res) => {
  try {
    const { amount, currency = "EUR", reference, billing } = req.body || {};
    const amountMinor = toMinor(amount);
    if (!amountMinor || amountMinor <= 0) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    // Profil de facturation minimal (optionnel)
    let billingProfile = null;
    if (billing && (billing.fullName || billing.email)) {
      billingProfile = await prisma.billingProfile.create({
        data: {
          fullName: billing.fullName || null,
          email:    billing.email || null,
          phone:    billing.phone || null,
          country:  billing.country || null,
          city:     billing.city || null,
          address:  billing.address || null,
          zip:      billing.zip || null,
        },
      });
    }

    // Enregistrer le dépôt
    const epcText = makeEpcText({ amountMinor, reference });
    const deposit = await prisma.fiatDeposit.create({
      data: {
        method: "SEPA",
        currency,
        amountMinor,
        reference: reference || "",
        iban: BANK.iban,
        bic: BANK.bic,
        holder: BANK.holder,
        epcText,
        billingProfileId: billingProfile?.id ?? null,
      },
    });

    // QR code en DataURL PNG
    const qrPngDataUrl = await QRCode.toDataURL(epcText, { margin: 1, width: 340 });

    // petit calcul de net (exemple de frais 1 EUR + 0,5 %)
    const feeFixedMinor = 100;
    const feePctMinor = Math.round(amountMinor * 0.005);
    const netMinor = Math.max(0, amountMinor - feeFixedMinor - feePctMinor);

    res.json({
      id: deposit.id,
      status: deposit.status,
      bank: BANK,
      reference: reference || "",
      epcText,
      qrPngDataUrl,
      summary: {
        gross: amountMinor / 100,
        currency,
        fees: {
          fixed: feeFixedMinor / 100,
          pct: 0.5,
          total: (feeFixedMinor + feePctMinor) / 100,
        },
        net: netMinor / 100,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// ───────────────────────── 7) Dépôt SEPA — Confirmation ─────────────
app.post(
  "/api/fiat/sepa/confirm/:id",
  upload.single("receipt"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { acceptedTos, isAccountHolder } = req.body;

      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ error: "id invalide" });
      }
      if (acceptedTos !== "true" || isAccountHolder !== "true") {
        return res.status(400).json({ error: "cases requises non cochées" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "receipt manquant" });
      }

      const updated = await prisma.fiatDeposit.update({
        where: { id },
        data: {
          status: "SUBMITTED",
          receiptPath: req.file.path.replace(process.cwd(), "").replace(/\\/g, "/"),
        },
      });

      res.json({
        ok: true,
        id: updated.id,
        status: updated.status,
        receiptPath: updated.receiptPath,
      });
    } catch (e) {
      console.error(e);
      if (e.code === "P2025")
        return res.status(404).json({ error: "deposit_not_found" });
      res.status(500).json({ error: "server_error" });
    }
  }
);

// ───────────────────────── 8) Dépôt bancaire mock simple ────────────
app.post("/api/fiat/bank-deposit", upload.single("receipt"), (req, res) => {
  const f = req.body || {};
  if (!f.amount || !f.currency)
    return res.status(400).json({ error: "Montant/devise manquants" });
  res.json({ ok: true, data: f });
});

// ───────────────────────── 9) Start ──────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
