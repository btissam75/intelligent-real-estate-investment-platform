// // api/src/routes/investments.route.ts
// import { Router } from "express";
// import { z } from "zod";
// import { ethers } from "ethers";
// import { Investments, type Investment } from "../store";

// const router = Router();

// /** Body: un des deux (amountMAD > 0) ou (units > 0) selon le mode */
// const BodySchema = z
//   .object({
//     propertyId: z.string().min(1),
//     mode: z.enum(["SOLO", "COLLECTIVE_FIXED", "COLLECTIVE_VAR"]),
//     amountMAD: z.number().int().positive().optional(),
//     units: z.number().int().positive().optional(),
//     orderMessage: z.string().min(10),
//     signature: z.string().min(10),
//   })
//   .superRefine((val, ctx) => {
//     if (val.mode === "SOLO" || val.mode === "COLLECTIVE_VAR") {
//       if (!val.amountMAD || val.amountMAD <= 0) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "amountMAD requis",
//           path: ["amountMAD"],
//         });
//       }
//     }
//     if (val.mode === "COLLECTIVE_FIXED") {
//       if (!val.units || val.units <= 0) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "units requis",
//           path: ["units"],
//         });
//       }
//     }
//   });

// router.post("/", async (req, res) => {
//   try {
//     // 1) Doit être SIWE (adresse stockée en session)
//     const addr = (req.session as any)?.address as string | undefined; // <= cast rapide (ou fais l'augmentation de type)
//     if (!addr) return res.status(401).json({ ok: false, error: "not_authenticated" });

//     // 2) Valider le body
//     const data = BodySchema.parse(req.body);

//     // 3) Vérifier la signature de l’ordre
//     const recovered = ethers.verifyMessage(data.orderMessage, data.signature);
//     if (ethers.getAddress(recovered) !== ethers.getAddress(addr)) {
//       return res.status(401).json({ ok: false, error: "bad_signature" });
//     }

//     // 4) Créer l’investissement (in-memory)
//     const id = Math.random().toString(36).slice(2);
//     const inv: Investment = {
//       id,
//       userAddress: addr,
//       propertyId: data.propertyId,
//       mode: data.mode,
//       amountMAD: data.amountMAD, // optionnel
//       units: data.units,         // optionnel
//       status: "pending_funds",
//       createdAt: new Date().toISOString(),
//       orderMessage: data.orderMessage,
//       signature: data.signature,
//     };
//     Investments.set(id, inv);

//     // 5) Stub “paiement”
//     const payment = {
//       methods: [
//         { type: "bank", label: "Virement bancaire (mock)", ref: `VIR-${id}` },
//         { type: "onchain", label: "On-chain (mock)" },
//       ],
//       expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
//     };

//     return res.status(201).json({ ok: true, investment: inv, payment });
//   } catch (e: any) {
//     const msg =
//       e?.issues?.map((i: any) => i.message).join(", ") ||
//       e?.message ||
//       "create_investment_failed";
//     return res.status(400).json({ ok: false, error: msg });
//   }
// });

// export default router;
// import { Router } from "express";
// import { z } from "zod";
// import { ethers } from "ethers";
// import { Investments, type Investment, created_addFromInvestment } from "../store";
// import { created_markFundsReceived } from "../store";

// const router = Router();

// const BodySchema = z.object({
//   propertyId: z.string().min(1),
//   mode: z.enum(["SOLO","COLLECTIVE_FIXED","COLLECTIVE_VAR"]),
//   amountMAD: z.number().int().positive().optional(),
//   units: z.number().int().positive().optional(),
//   orderMessage: z.string().min(10),
//   signature: z.string().min(10),
// }).superRefine((v,ctx)=>{
//   if (v.mode==="SOLO" || v.mode==="COLLECTIVE_VAR") {
//     if (!v.amountMAD) ctx.addIssue({ code:"custom", message:"amountMAD requis", path:["amountMAD"] });
//   }
//   if (v.mode==="COLLECTIVE_FIXED") {
//     if (!v.units) ctx.addIssue({ code:"custom", message:"units requis", path:["units"] });
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     // ✅ lire l’adresse SIWE correctement
//     const s: any = req.session;
//     const addr: string | undefined = s?.siwe?.address || s?.address;
//     if (!addr) return res.status(401).json({ ok:false, error:"not_authenticated" });

//     const data = BodySchema.parse(req.body);

//     // vérif signature d’ordre
//     const recovered = ethers.verifyMessage(data.orderMessage, data.signature);
//     if (ethers.getAddress(recovered) !== ethers.getAddress(addr)) {
//       return res.status(401).json({ ok:false, error:"bad_signature" });
//     }

//     const id = Math.random().toString(36).slice(2);
//     const inv: Investment = {
//       id,
//       userAddress: addr,                   // ✅ important
//       propertyId: data.propertyId,
//       mode: data.mode,
//       amountMAD: data.amountMAD,
//       units: data.units,
//       status: "pending_funds",
//       createdAt: new Date().toISOString(),
//       orderMessage: data.orderMessage,
//       signature: data.signature,
//     };
//     Investments.set(id, inv);

//     // ✅ push dans la liste “créés” pour l’onglet Mes NFTs
//     created_addFromInvestment(inv);
//     console.log("[created] push", inv.id, inv.userAddress);

//     const payment = {
//       methods: [
//         { type: "bank", label: "Virement bancaire (mock)", ref: `VIR-${id}` },
//         { type: "onchain", label: "On-chain (mock)" },
//       ],
//       expiresAt: new Date(Date.now()+15*60_000).toISOString(),
//     };

//     res.status(201).json({ ok:true, investment:inv, payment });
//   } catch (e:any) {
//     const msg = e?.issues?.map((i:any)=>i.message).join(", ") || e?.message || "create_investment_failed";
//     res.status(400).json({ ok:false, error: msg });
//   }
// });

// export default router;
// api/src/routes/investments.route.ts
// api/src/routes/investments.route.ts
import { Router } from "express";
import { z } from "zod";
import { ethers } from "ethers";
import {
  Investments,
  type Investment,
  created_addFromInvestment,
} from "../store";

const router = Router();

/** Body: un des deux (amountMAD > 0) OU (units > 0) selon le mode */
const BodySchema = z
  .object({
    propertyId: z.string().min(1),
    mode: z.enum(["SOLO", "COLLECTIVE_FIXED", "COLLECTIVE_VAR"]),
    amountMAD: z.number().int().positive().optional(),
    units: z.number().int().positive().optional(),
    orderMessage: z.string().min(10),
    signature: z.string().min(10),

    // optionnels pour enrichir l’UI et les metadata NFT
    propertyTitle: z.string().min(1).optional(),
    imageUrl: z.string().url().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "SOLO" || v.mode === "COLLECTIVE_VAR") {
      if (!v.amountMAD || v.amountMAD <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "amountMAD requis",
          path: ["amountMAD"],
        });
      }
    }
    if (v.mode === "COLLECTIVE_FIXED") {
      if (!v.units || v.units <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "units requis",
          path: ["units"],
        });
      }
    }
  });

router.post("/", async (req, res) => {
  try {
    // 1) Auth SIWE : adresse en session
    const s: any = req.session;
    const addr: string | undefined = s?.siwe?.address || s?.address;
    if (!addr) {
      return res.status(401).json({ ok: false, error: "not_authenticated" });
    }

    // 2) Valider le body
    const data = BodySchema.parse(req.body);

    // 3) Vérifier la signature d’ordre
    const recovered = ethers.verifyMessage(data.orderMessage, data.signature);
    if (ethers.getAddress(recovered) !== ethers.getAddress(addr)) {
      return res.status(401).json({ ok: false, error: "bad_signature" });
    }

    // 4) Créer l’investissement (in-memory)
    const id = Math.random().toString(36).slice(2);
    const inv: Investment = {
      id,
      userAddress: addr,
      propertyId: data.propertyId,
      mode: data.mode,
      amountMAD: data.amountMAD, // optionnel
      units: data.units, // optionnel
      status: "pending_funds",
      createdAt: new Date().toISOString(),
      orderMessage: data.orderMessage,
      signature: data.signature,
    };
    Investments.set(id, inv);

    // 5) Enregistrer l’entrée “Créée” pour l’onglet Mes NFTs (avec image + titre)
    const meta = {
      propertyId: inv.propertyId,
      mode: inv.mode,
      ...(inv.units !== undefined ? { units: inv.units } : {}),
      ...(inv.amountMAD !== undefined ? { amountMAD: inv.amountMAD } : {}),
      ...(data.propertyTitle
        ? { title: data.propertyTitle }
        : { title: `Bien #${inv.propertyId}` }),
      ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
    };
    created_addFromInvestment(inv, meta);

    // 6) Paiement (mock)
    const payment = {
      methods: [
        { type: "bank", label: "Virement bancaire (mock)", ref: `VIR-${id}` },
        { type: "onchain", label: "On-chain (mock)" },
      ],
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    };

    return res.status(201).json({ ok: true, investment: inv, payment });
  } catch (e: any) {
    const msg =
      e?.issues?.map((i: any) => i.message).join(", ") ||
      e?.message ||
      "create_investment_failed";
    return res.status(400).json({ ok: false, error: msg });
  }
});

export default router;
