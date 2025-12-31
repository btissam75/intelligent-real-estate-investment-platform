import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// Etherscan tx list (Ethereum + Sepolia). Pour autres chains, prends leurs explorers ou Alchemy.
router.get("/txs/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const network = (req.query.network as string) || "sepolia"; // "mainnet" | "sepolia"

    const base = network === "mainnet"
      ? "https://api.etherscan.io/api"
      : "https://api-sepolia.etherscan.io/api";

    const url = `${base}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_KEY}`;

    const r = await fetch(url);
    const data = await r.json();
    res.json({ ok: true, data });
  } catch (e:any) {
    res.status(500).json({ ok: false, error: e?.message || "fetch_error" });
  }
});

export default router;
