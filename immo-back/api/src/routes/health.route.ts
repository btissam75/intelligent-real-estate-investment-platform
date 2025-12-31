// src/routes/health.route.ts
import { Router } from "express";
import { nftServiceHealth } from "../services/nft.service";

const router = Router();
router.get("/health/nft", async (_req, res, next) => {
  try {
    const health = await nftServiceHealth();
    res.json({ ok: true, ...(typeof health === 'object' && health !== null ? health : { health }) });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});
export default router;
