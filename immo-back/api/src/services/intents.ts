type Intent =
  | { type:"FAQ"; hit:{q:string,a:string} }
  | { type:"SIM_RENT"; input:{price:number; rentGross:number; opexPct:number; mgmtPct:number} }
  | { type:"PAYMENT_INIT"; payload:{ amountEth:string; toAddress:string } }
  | { type:"FALLBACK" };

export function detectIntent(text: string): Intent {
  const t = text.toLowerCase();

  // 1) paiement
  if (/(payer|paiement|envoyer|transfer)/.test(t)) {
    const mAmt = t.match(/(\d+(\.\d+)?)\s*eth/);
    const amt = mAmt?.[1] ?? "0.05";
    // adresse placeholder, remplacée côté UI si besoin
    return { type:"PAYMENT_INIT", payload:{ amountEth: amt, toAddress: "0x0000000000000000000000000000000000000000" }};
  }

  // 2) simu location
  if (t.includes("simu") || t.includes("simulation") || t.includes("loyer")) {
    // très simplifié ; affiner selon ton UI
    return { type:"SIM_RENT", input:{ price: 100000, rentGross: 1200, opexPct: 0.15, mgmtPct: 0.05 } };
  }

  // 3) FAQ simple
  const hit = require("./knowledge") as any; // si TS râle, importe proprement au-dessus
  const res = hit.searchFAQ(text);
  if (res) return { type:"FAQ", hit: res };

  return { type:"FALLBACK" };
}
