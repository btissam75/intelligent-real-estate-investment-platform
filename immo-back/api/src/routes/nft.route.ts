// // src/routes/nft.route.ts
// import { Router } from "express";
// import { z } from "zod";
// import { mintTitleNFT, getTokenURI, type MintInput } from "../services/nft.service";

// export const nftRouter = Router();

// /* ─────────────────────────────────────────────
//    Schemas de validation
// ────────────────────────────────────────────── */
// const MintSchema = z.object({
//   to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Adresse EVM invalide"),
//   tokenId: z.union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)]),
//   title: z.string().min(1),
//   amount: z.number().positive(),
//   currency: z.string().min(2).max(6),
//   units: z.number().int().positive().optional(),
//   category: z.enum(["Achat solo", "Location", "Exploitation", "Résidence", "Fonds"]),
//   imageIpfs: z.string().url().startsWith("ipfs://").optional(),
//   pdfIpfs: z.string().url().startsWith("ipfs://").optional(),
//   pdfSha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
//   positionUrl: z.string().url().optional(),
// });

// /* ─────────────────────────────────────────────
//    POST /api/nft/mint
//    - Mints an on-chain “Titre d’investissement” NFT
// ────────────────────────────────────────────── */
// nftRouter.post("/mint", async (req, res) => {
//   try {
//     const input = MintSchema.parse(req.body) as MintInput;

//     // Appel service (upload metadata → IPFS puis mint on-chain)
//     const out = await mintTitleNFT(input);

//     return res.status(201).json({
//       ok: true,
//       tokenId: out.tokenId,
//       tokenUri: out.tokenUri,
//       txHash: out.txHash,
//     });
//   } catch (err: any) {
//     const msg =
//       err?.issues?.map((i: any) => i.message).join(", ") ||
//       err?.message ||
//       "mint_failed";
//     return res.status(400).json({ ok: false, error: msg });
//   }
// });

// /* ─────────────────────────────────────────────
//    GET /api/nft/:id  → tokenURI (metadata IPFS)
// ────────────────────────────────────────────── */
// nftRouter.get("/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     if (!/^\d+$/.test(id)) return res.status(400).json({ ok: false, error: "bad_token_id" });

//     const uri = await getTokenURI(id);
//     return res.json({ ok: true, tokenId: id, tokenUri: uri });
//   } catch (err: any) {
//     return res.status(404).json({ ok: false, error: err?.message || "not_found" });
//   }
// });



// import { Investments, UserNFTs } from "../store";
// import { mintAttestation } from "../services/nft.service";

// const router = Router();

// // (admin/cron) POST /api/nft/mint?investmentId=...
// router.post("/mint", async (req,res)=>{
//   const { investmentId } = req.query as any;
//   const inv = investmentId ? Investments.get(investmentId) : undefined;
//   if(!inv) return res.status(404).json({error:"not found"});
//   if(inv.status !== "funds_received") return res.status(400).json({error:"not funded yet"});

//   // mock PDF link:
//   const pdfLink = `https://example.com/attestations/${investmentId}.pdf`;

//   const { tokenId, tokenUri, txHash } = await mintAttestation({
//     to: inv.userAddress,
//     propertyId: inv.propertyId,
//     title: `Bien ${inv.propertyId}`,
//     pdfLink,
//     image: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
//     category: inv.mode,
//     units: inv.units,
//   });

//   // état confirmé + catalogue NFT par owner
//   inv.status = "confirmed";
//   Investments.set(inv.id, inv);

//   const arr = UserNFTs.get(inv.userAddress) || [];
//   arr.push({
//     tokenId, contract: process.env.NFT_CONTRACT_ADDRESS!,
//     title: `Immo — ${inv.propertyId}`, category: inv.mode, imageUrl: undefined,
//     units: inv.units, transferable: true
//   });
//   UserNFTs.set(inv.userAddress, arr);

//   res.json({ ok:true, tokenId, tokenUri, txHash });
// });

// // GET /api/nft/list?owner=0x...
// router.get("/list",(req,res)=>{
//   const owner = String(req.query.owner||"").toLowerCase();
//   if(!owner) return res.json([]);
//   res.json(UserNFTs.get(owner) || []);
// });

// export default router;
// src/routes/nft.route.ts
// src/routes/nft.route.ts

// api/src/routes/nft.route.ts
// api/src/routes/nft.route.ts
import { Router } from "express";
import { z } from "zod";
import {
  mintTitleNFT,
  getTokenURI,
  type MintInput,
  nftServiceHealth,
} from "../services/nft.service";
import { CreatedByOwner, created_listForOwner } from "../store";

const router = Router();

/* ─────────────────────────────────────────────
   Schemas de validation (Zod)
────────────────────────────────────────────── */
const MintSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Adresse EVM invalide"),
  tokenId: z.union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)]),
  title: z.string().min(1),

  // infos financières affichées dans les metadata
  amount: z.number().positive(),
  currency: z.string().min(2).max(6),

  // facultatif selon le mode
  units: z.number().int().positive().optional(),
  category: z.enum(["Achat solo", "Location", "Exploitation", "Résidence", "Fonds"]),

  // pièces jointes / liens
  imageIpfs: z.string().url().startsWith("ipfs://").optional(),
  pdfIpfs: z.string().url().startsWith("ipfs://").optional(),
  pdfSha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  positionUrl: z.string().url().optional(),
});

/* ─────────────────────────────────────────────
   A) Timeline “créés / pending / mintés”
   GET /api/nft/created?owner=0x...
────────────────────────────────────────────── */
router.get("/created", (req, res) => {
  const owner = String(req.query.owner || "").toLowerCase();
  const items = created_listForOwner(owner);
  console.log("[created] list for", owner, "->", items.length);
  res.json({ ok: true, items });
});

/* ─────────────────────────────────────────────
   B) Possédés on-chain (sécurisé par store + getTokenURI)
   GET /api/nft/owned?owner=0x...
────────────────────────────────────────────── */
router.get("/owned", async (req, res) => {
  try {
    const owner = String(req.query.owner || "").toLowerCase();
    if (!owner) return res.json({ ok: true, items: [] });

    // uniquement les entrées marquées "minted" dans le store
    const rows = (CreatedByOwner.get(owner) ?? []).filter(
      (r) => r.status === "minted" && r.tokenId
    );
    if (rows.length === 0) return res.json({ ok: true, items: [] });

    const items: Array<{ tokenId: string; tokenUri: string }> = [];
    for (const r of rows) {
      const idStr = String(r.tokenId);
      if (!/^\d+$/.test(idStr)) continue; // ignore les ids invalides
      try {
        const { tokenUri } = await getTokenURI(idStr);
        items.push({ tokenId: idStr, tokenUri });
      } catch {
        // token inexistant / revert → on ignore
      }
    }
    return res.json({ ok: true, items });
  } catch {
    return res.json({ ok: true, items: [] });
  }
});

/* ─────────────────────────────────────────────
   C) Mint : upload metadata (IPFS/DataURI) + mint on-chain
   POST /api/nft/mint
────────────────────────────────────────────── */
router.post("/mint", async (req, res) => {
  try {
    const input = MintSchema.parse(req.body) as MintInput;
    const out = await mintTitleNFT(input);
    return res.status(201).json({
      ok: true,
      tokenId: out.tokenId,
      tokenUri: out.tokenUri,
      txHash: out.txHash,
      blockNumber: out.blockNumber ?? null,
    });
  } catch (err: any) {
    const msg =
      err?.issues?.map((i: any) => i.message).join(", ") ||
      err?.message ||
      "mint_failed";
    return res.status(400).json({ ok: false, error: msg });
  }
});

/* ─────────────────────────────────────────────
   D) tokenURI direct
   GET /api/nft/:id
────────────────────────────────────────────── */
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ ok: false, error: "bad_token_id" });
    }
    const { tokenUri } = await getTokenURI(id);
    return res.json({ ok: true, tokenId: id, tokenUri });
  } catch (err: any) {
    return res
      .status(404)
      .json({ ok: false, error: err?.message || "not_found" });
  }
});

/* ─────────────────────────────────────────────
   E) Health check (réseau / minter / ipfs)
   GET /api/nft/health/ping
────────────────────────────────────────────── */
router.get("/health/ping", async (_req, res) => {
  try {
    const h = await nftServiceHealth();
    res.json({ ok: true, ...h });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "health_failed" });
  }
});

export default router;



