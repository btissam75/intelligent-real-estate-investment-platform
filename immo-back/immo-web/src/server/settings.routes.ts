// ──────────────────────────────────────────────────────────────────────────────
// File: src/server/settings.routes.ts
// Express Router (TypeScript) — stubs pour la page Settings.tsx
// Fournit des endpoints /api/settings/* qui répondent 200 OK avec des mocks.
// À brancher sur src/server/index.ts via app.use(settingsRouter)
// ──────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response } from "express";

export const settingsRouter = Router();

// Petit helper pour réponses OK
const ok = (res: Response, data: any = { ok: true }) => res.status(200).json(data);

// Génération d'IDs/Clés (démo)
const rid = () => Math.random().toString(36).slice(2, 10);
const genKey = () => "rk_" + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const last4 = (s: string) => (s || "0000").slice(-4);

// Mémoire locale (mock)
const mem = {
  profile: { fullName: "", email: "", phone: "", country: "FR", tz: "Africa/Casablanca" },
  twofa: { enabled: false, secret: "" },
  bank: { iban: "", bic: "" },
  notifications: { email: true, sms: false, push: true },
  apiKeys: [] as { id: string; label: string; last4: string; plaintext: string; createdAt: string }[],
  webhook: { url: "", secret: "", events: { deposit: true, withdraw: true, kyc: false, webhookPing: true } },
  kyc: { status: "none", first: "", last: "", doc: "" },
  preferences: { theme: "light", lang: "fr", currency: "EUR", beta: true },
  sessions: [
    { id: rid(), agent: "Chrome on Windows", ip: "192.168.0.12", lastSeen: new Date().toISOString() },
  ] as { id: string; agent: string; ip: string; lastSeen: string }[],
};

// ── Profil
settingsRouter.post("/api/settings/profile", (req: Request, res: Response) => {
  const { fullName, email, phone, country, tz } = req.body || {};
  mem.profile = { fullName: fullName || "", email: email || "", phone: phone || "", country: country || "FR", tz: tz || "Africa/Casablanca" };
  return ok(res, mem.profile);
});

// ── Sécurité: Mot de passe (stub)
settingsRouter.post("/api/settings/security/password", (req: Request, res: Response) => {
  const { newPass } = req.body || {};
  if (typeof newPass !== "string" || newPass.length < 8) return res.status(400).json({ error: "Password too short" });
  // en prod: vérifier l'ancien mdp, hasher/bcrpyt, etc.
  return ok(res);
});

// ── Sécurité: 2FA enable/disable (stub)
settingsRouter.post("/api/settings/security/2fa/enable", (req: Request, res: Response) => {
  const { secret, code } = req.body || {};
  // en prod: vérifier TOTP(code, secret)
  if (!secret || !code) return res.status(400).json({ error: "Missing secret or code" });
  mem.twofa = { enabled: true, secret };
  return ok(res, { enabled: true });
});

settingsRouter.post("/api/settings/security/2fa/disable", (_req: Request, res: Response) => {
  mem.twofa = { enabled: false, secret: "" };
  return ok(res, { enabled: false });
});

// ── Paiements: Bank (IBAN/BIC)
settingsRouter.post("/api/settings/payments/bank", (req: Request, res: Response) => {
  const { iban, bic } = req.body || {};
  if (!iban || !bic) return res.status(400).json({ error: "IBAN/BIC requis" });
  mem.bank = { iban, bic };
  return ok(res, mem.bank);
});

// ── Notifications
settingsRouter.post("/api/settings/notifications", (req: Request, res: Response) => {
  const { email, sms, push } = req.body || {};
  mem.notifications = { email: !!email, sms: !!sms, push: !!push };
  return ok(res, mem.notifications);
});

// ── API Keys
settingsRouter.post("/api/settings/keys", (req: Request, res: Response) => {
  const { label } = req.body || {};
  if (!label) return res.status(400).json({ error: "Label requis" });
  const plaintext = genKey();
  const item = { id: rid(), label, last4: last4(plaintext), plaintext, createdAt: new Date().toISOString() };
  mem.apiKeys.unshift(item);
  // ne renvoyer le plaintext qu'une seule fois
  return ok(res, { id: item.id, last4: item.last4, plaintext: item.plaintext });
});

settingsRouter.delete("/api/settings/keys/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const before = mem.apiKeys.length;
  mem.apiKeys = mem.apiKeys.filter(k => k.id !== id);
  if (mem.apiKeys.length === before) return res.status(404).json({ error: "Key not found" });
  return ok(res);
});

// ── Webhooks
settingsRouter.post("/api/settings/webhook", (req: Request, res: Response) => {
  const { url, secret, events } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL requise" });
  mem.webhook = { url, secret: secret || "", events: events || mem.webhook.events };
  return ok(res, mem.webhook);
});

settingsRouter.post("/api/settings/webhook/ping", async (_req: Request, res: Response) => {
  // en prod: POST mem.webhook.url avec un petit payload de test signé avec mem.webhook.secret
  return ok(res, { delivered: !!mem.webhook.url });
});

// ── KYC
settingsRouter.post("/api/settings/kyc", (req: Request, res: Response) => {
  const { first, last, doc } = req.body || {};
  if (!first || !last || !doc) return res.status(400).json({ error: "Champs manquants" });
  mem.kyc = { status: "pending", first, last, doc };
  return ok(res, mem.kyc);
});

// ── Préférences
settingsRouter.post("/api/settings/preferences", (req: Request, res: Response) => {
  const { theme, lang, currency, beta } = req.body || {};
  mem.preferences = { theme: theme || "light", lang: lang || "fr", currency: currency || "EUR", beta: !!beta };
  return ok(res, mem.preferences);
});

// ── Sessions
settingsRouter.get("/api/settings/sessions", (_req: Request, res: Response) => {
  return ok(res, mem.sessions);
});

settingsRouter.delete("/api/settings/sessions/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const before = mem.sessions.length;
  mem.sessions = mem.sessions.filter(s => s.id !== id);
  if (mem.sessions.length === before) return res.status(404).json({ error: "Session not found" });
  return ok(res);
});

// ──────────────────────────────────────────────────────────────────────────────
// File: src/server/index.ts (exemple de serveur qui monte le router ci-dessus)
// Lancer: npx tsx src/server/index.ts
// Assure-toi d'avoir: npm i express cors body-parser
// ──────────────────────────────────────────────────────────────────────────────

/*
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { settingsRouter } from "./settings.routes";

const PORT = Number(process.env.PORT || 5174);
const ORIGIN = process.env.APP_URL || "http://localhost:5173";

const app = express();
app.use(cors({ origin: ORIGIN }));

// ⚠️ Le webhook Stripe attend un body "raw". Ici, on n'en a pas besoin.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "settings-api", time: new Date().toISOString() }));

// Monte toutes les routes Settings
app.use(settingsRouter);

app.listen(PORT, () => {
  console.log(`✅ API Settings ready on http://localhost:${PORT}`);
  console.log(`   CORS origin: ${ORIGIN}`);
});
*/
