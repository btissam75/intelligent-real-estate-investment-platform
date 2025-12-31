// api/src/routes/payments.route.ts
import { Router } from "express";
import { z } from "zod";
import { Investments } from "../store";
// (si tu as les helpers "Created" pour l’onglet Mes NFTs, décommente)
// import { created_markFundsReceived } from "../store";

const router = Router();

const BodySession = z.object({
  investmentId: z.string().min(3),
});

/* Util: montant MAD de l’investissement */
function getAmountMAD(inv: any): number {
  if (typeof inv?.amountMAD === "number") return inv.amountMAD;
  // fallback "FIXED": units * unitPriceMAD si tu l’as dans l’investissement (sinon 0)
  // return (inv?.units ?? 0) * (inv?.unitPriceMAD ?? 0);
  return 0;
}

/* ========================
   1) Carte – créer session
   ======================== */
router.post("/card/session", async (req, res) => {
  try {
    const { investmentId } = BodySession.parse(req.body);
    const inv = Investments.get(investmentId);
    if (!inv) return res.status(404).json({ ok: false, error: "investment_not_found" });

    const amountMAD = getAmountMAD(inv);

    // ─── MOCK ───
    // Remplace ici par Stripe/Checkout.com en prod :
    // - Stripe: checkout.sessions.create({ line_items, mode, success_url, cancel_url, metadata:{ investmentId } })
    // - Retourner res.json({ ok:true, url: session.url })
    const fakeRedirect = `http://localhost:3000/mock/card/success?investmentId=${investmentId}`;
    return res.json({ ok: true, url: fakeRedirect, amountMAD });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || "card_session_failed" });
  }
});

/* =========================
   2) Virement – init détails
   ========================= */
router.post("/bank/init", async (req, res) => {
  try {
    const { investmentId } = BodySession.parse(req.body);
    const inv = Investments.get(investmentId);
    if (!inv) return res.status(404).json({ ok: false, error: "investment_not_found" });

    const amountMAD = getAmountMAD(inv);
    const bank = {
      beneficiary: "Invest-Immo SA",
      iban: "MA64 1234 5678 9012 3456 7890", // put real IBAN
      reference: `VIR-${investmentId.toUpperCase()}`, // à mettre dans le libellé !
      amountMAD,
    };
    return res.json({ ok: true, bank });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || "bank_init_failed" });
  }
});

/* ==========================
   3) Crypto – init de dépôt
   ========================== */
router.post("/crypto/init", async (req, res) => {
  try {
    const { investmentId } = BodySession.parse(req.body);
    const inv = Investments.get(investmentId);
    if (!inv) return res.status(404).json({ ok: false, error: "investment_not_found" });

    const amountMAD = getAmountMAD(inv);
    // MOCK conversion: 1 ETH = 20 000 MAD
    const amountETH = Number(((amountMAD ?? 0) / 20000).toFixed(5));

    const crypto = {
      chain: "sepolia" as const,
      token: "ETH" as const,
      address: "0xDeaDbeefDeaDbeefDeaDbeefDeaDbeefDeaDbeef", // à remplacer par votre adresse
      amount: amountETH,
      memo: investmentId,
    };
    return res.json({ ok: true, crypto });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || "crypto_init_failed" });
  }
});

/* ===========================================================
   4) TES ROUTES EXISTANTES – confirmations (mock / back-office)
   =========================================================== */

/** POST /api/payments/confirm  { investmentId }  → passe à funds_received (banque / mock) */
router.post("/confirm", (req, res) => {
  const { investmentId } = req.body ?? {};
  const inv = investmentId ? Investments.get(String(investmentId)) : undefined;
  if (!inv) return res.status(404).json({ ok: false, error: "not_found" });

  inv.status = "funds_received";
  Investments.set(inv.id, inv);
  // created_markFundsReceived?.(inv.id); // si tu utilises l’onglet "Créés"
  res.json({ ok: true, investment: inv });
});

/** GET /api/payments/onchain/confirm?investmentId=...&txHash=0x...  → mock on-chain */
router.get("/onchain/confirm", (req, res) => {
  const { investmentId } = req.query as any;
  const inv = investmentId ? Investments.get(String(investmentId)) : undefined;
  if (!inv) return res.status(404).json({ ok: false, error: "not_found" });

  inv.status = "funds_received";
  Investments.set(inv.id, inv);
  // created_markFundsReceived?.(inv.id);
  res.json({ ok: true, investment: inv });
});

export default router;
