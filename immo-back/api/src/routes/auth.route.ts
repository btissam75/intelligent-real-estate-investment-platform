// // api/src/routes/auth.route.ts
// import { Router } from "express";
// import crypto from "crypto";
// import {
//   verifyMessage,
//   getAddress,
//   isHex,
//   type Address,
//   type Hex,
// } from "viem";

// import { Nonces } from "../store"; // ton set mémoire des nonces

// const router = Router();

// /** GET /auth/nonce — génère un nonce à signer */
// router.get("/nonce", (_req, res) => {
//   const nonce = crypto.randomBytes(16).toString("hex"); // 32 chars
//   Nonces.add(nonce);
//   res.json({ nonce });
// });

// /** POST /auth/verify — vérifie la signature SIWE-like et crée la "session" */
// router.post("/verify", async (req, res) => {
//   try {
//     const { address, message, signature } = (req.body ?? {}) as {
//       address?: string;
//       message?: string;
//       signature?: string;
//     };

//     if (!address || !message || !signature) {
//       return res.status(400).json({ error: "missing_fields" });
//     }

//     // 1) sécurité : extraire et vérifier le nonce dans le message
//     const m = String(message).match(/nonce:\s*([a-f0-9]{32})/i);
//     const nonce = m?.[1];
//     if (!nonce || !Nonces.has(nonce)) {
//       return res.status(400).json({ error: "bad_nonce" });
//     }
//     Nonces.delete(nonce);

//     // 2) normaliser & typer pour viem
//     const addr = getAddress(address) as Address; // valide & checksum
//     const sig = ((isHex(signature) ? signature : `0x${signature}`) as unknown) as Hex;

//     // 3) vérifier la signature
//     const ok = await verifyMessage({
//       address: addr,
//       message,          // string ok
//       signature: sig,   // <- typé Hex
//     });

//     if (!ok) return res.status(401).json({ error: "invalid_signature" });

//     // 4) attacher l'adresse en session (typing ajouté via types/express-session.d.ts)
//     req.session.address = addr;

//     res.json({ ok: true, address: addr });
//   } catch (e: any) {
//     res.status(400).json({ error: e?.message || "verify_failed" });
//   }
// });

// /** POST /auth/logout — détruit la session */
// router.post("/logout", (req, res) => {
//   req.session.destroy(() => {});
//   res.json({ ok: true });
// });

// export default router;

// api/src/routes/auth.route.ts
import { Router } from "express";
import crypto from "crypto";
import { verifyMessage, getAddress, isHex, type Address, type Hex } from "viem";
import { Nonces } from "../store";

const router = Router();

/**
 * GET /auth/nonce
 * Génère un nonce aléatoire et le stocke (anti-replay).
 */
router.get("/nonce", (_req, res) => {
  const nonce = crypto.randomBytes(16).toString("hex"); // 32 hex chars
  Nonces.add(nonce);
  res.json({ ok: true, nonce });
});

/**
 * POST /auth/verify
 * Body: { address, message, signature }
 * - Vérifie que le message contient un nonce valide
 * - Vérifie la signature (viem)
 * - Écrit l'adresse en session (siwe.address + address)
 */
router.post("/verify", async (req, res) => {
  try {
    const { address, message, signature } = (req.body ?? {}) as {
      address?: string;
      message?: string;
      signature?: string;
    };
    if (!address || !message || !signature) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    // 1) extraire le nonce du message (ligne "nonce: <32 hex>")
    const m = String(message).match(/nonce:\s*([a-f0-9]{32})/i);
    const nonce = m?.[1];
    if (!nonce || !Nonces.has(nonce)) {
      return res.status(400).json({ ok: false, error: "bad_nonce" });
    }
    // Consommer le nonce (anti-replay)
    Nonces.delete(nonce);

    // 2) normaliser adresse & signature
    const addr = getAddress(address) as Address; // checksum
    const sig = (isHex(signature) ? signature : (`0x${signature}`)) as Hex;

    // 3) vérifier la signature du message
    const ok = await verifyMessage({ address: addr, message, signature: sig });
    if (!ok) {
      return res.status(401).json({ ok: false, error: "invalid_signature" });
    }

    // 4) écrire la session
    const lower = addr.toLowerCase();
    const s: any = req.session;
    s.siwe = { address: lower };
    s.address = lower; // compat pour routes existantes

    res.json({ ok: true, address: lower });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "verify_failed" });
  }
});

/**
 * GET /auth/me
 * Retourne l'adresse stockée en session (siwe.address / address)
 */
router.get("/me", (req, res) => {
  const s: any = req.session;
  const addr: string | null = s?.siwe?.address || s?.address || null;
  res.json({ ok: !!addr, address: addr });
});

/**
 * POST /auth/logout
 * Détruit la session et nettoie le cookie
 */
router.post("/logout", (req, res) => {
  const name = (req.session as any)?.cookie?.name || "sid";
  req.session.destroy(() => {});
  // Optionnel : nettoyer le cookie côté client
  try { res.clearCookie(name); } catch { /* noop */ }
  res.json({ ok: true });
});

export default router;
