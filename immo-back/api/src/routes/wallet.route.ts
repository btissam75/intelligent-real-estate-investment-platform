import { Router } from "express";
export const walletRouter = Router();

const rpc = process.env.CHAIN_RPC!;

// 🔹 Définir les types JSON-RPC
type JsonRpcSuccess = { jsonrpc: "2.0"; id: number | string | null; result: string };
type JsonRpcError   = { jsonrpc: "2.0"; id: number | string | null; error: { code: number; message: string; data?: unknown } };
type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

// 📌 Route: solde ETH via JSON-RPC
walletRouter.get("/:address/eth", async (req, res) => {
  try {
    const { address } = req.params;

    const r = await fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"]
      }),
    });

    const j = (await r.json()) as JsonRpcResponse;

    if ("error" in j) {
      return res.status(502).json({ error: j.error.message, code: j.error.code });
    }
    if (typeof j.result !== "string") {
      return res.status(502).json({ error: "Invalid RPC response: result is missing" });
    }

    // ✅ Conversion hex string → BigInt
    const ethWei = BigInt(j.result);

    res.json({
      address,
      wei: ethWei.toString(),
      eth: Number(ethWei) / 1e18
    });

  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
