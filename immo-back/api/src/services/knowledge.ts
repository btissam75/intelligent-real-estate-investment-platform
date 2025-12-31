// Quick RAG-lite : FAQ + “cartes projet”
export const FAQ = [
  { q: "achat solo", a: "Achat global par un seul investisseur." },
  { q: "achat collectif", a: "Achat par unités fixes/variables. Frais partagés." },
  { q: "location ROI", a: "ROI = prix / (revenu net mensuel × 12)."},
];

export function searchFAQ(query: string) {
  const q = query.toLowerCase();
  const best = FAQ
    .map(x => ({ ...x, score: (q.includes(x.q) ? 2 : 0) + (x.a.toLowerCase().includes(q) ? 1 : 0) }))
    .sort((a,b)=>b.score-a.score)[0];
  return best?.score ? best : null;
}

// mini simu
export function simulateRent({ price, rentGross, opexPct, mgmtPct }:{
  price:number, rentGross:number, opexPct:number, mgmtPct:number
}) {
  const charges = rentGross*(opexPct+mgmtPct);
  const net = rentGross - charges;
  const yearly = net*12;
  const paybackYears = price / yearly;
  return { net, yearly, paybackYears };
}
