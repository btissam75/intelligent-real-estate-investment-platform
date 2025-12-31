const API = import.meta.env.VITE_API_URL as string;


export async function apiGet<T=any>(path: string): Promise<T> {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:3000";
  const r = await fetch(base + path, { credentials: "omit" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function listNfts(owner: string){
  const r = await fetch(`${BASE}/api/nft/list?owner=${owner}`, { credentials:'include' });
  if(!r.ok) throw new Error("list_nfts_failed");
  return r.json();
}

export async function createInvestment(payload: any, orderSig: string){
  const r = await fetch(`${BASE}/api/investments`, {
    method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
    body: JSON.stringify({ payload, orderSig })
  });
  return r.json();
}

export async function confirmOnchain(investmentId: string, txHash: string){
  const r = await fetch(`${BASE}/api/payments/onchain/confirm`, {
    method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
    body: JSON.stringify({ investmentId, txHash })
  });
  return r.json();
}
