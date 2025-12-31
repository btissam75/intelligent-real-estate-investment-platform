// src/services/dashboard.ts
export type Kpis = {
  tvlFiat: number;          // total value (fiat)
  monthlyYield: number;     // % mois
  usersUnits: number;       // unités détenues par l’utilisateur
  pendingPayments: number;  // nb d'investissements en attente
};

export type TimeseriesPoint = { t: string; v: number };
export type Holding = { symbol: string; label: string; value: number };

export type SummaryResponse = {
  kpis: Kpis;
  activity7d: TimeseriesPoint[];  // dépôts/retraits/achats…
  holdings: Holding[];            // répartition portefeuille (fiat + crypto + units)
};

export type ActivityItem = {
  id: string;
  kind: "deposit" | "withdraw" | "buy_units" | "mint_nft" | "rent_income";
  ts: string;
  title: string;
  amount?: number;
  ccy?: string;
  status?: "pending" | "confirmed" | "failed";
};

export type UnitRow = {
  propertyId: string;
  title: string;
  kind: "achat_solo" | "achat_collectif" | "location" | "exploitation" | "fonds_garanti";
  units: number;
  status: "en_attente" | "confirmé" | "livré" | "annulé";
  investmentId?: string;
};

async function getJSON<T>({ url, init, fallback }: { url: string; init?: RequestInit; fallback: T; }): Promise<T> {
  try {
    const r = await fetch(url, { credentials: "include", ...init });
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()) as T;
  } catch {
    return fallback; // fallback mock si API down
  }
}

/** Résumé dashboard (KPIs + graphe + holdings) */
export async function getDashboardSummary(): Promise<SummaryResponse> {
  return getJSON<SummaryResponse>(
      {
          url: "/api/dashboard/summary", init: undefined, fallback: {
              kpis: { tvlFiat: 32540, monthlyYield: 0.82, usersUnits: 12, pendingPayments: 1 },
              activity7d: [
                  { t: "J-6", v: 1200 }, { t: "J-5", v: 800 }, { t: "J-4", v: 1600 },
                  { t: "J-3", v: 400 }, { t: "J-2", v: 2200 }, { t: "Hier", v: 900 },
                  { t: "Auj.", v: 1300 },
              ],
              holdings: [
                  { symbol: "CASH", label: "Fiat cash", value: 1250 },
                  { symbol: "ETH", label: "Ethereum", value: 6800 },
                  { symbol: "USDC", label: "USDC", value: 540 },
                  { symbol: "DAI", label: "DAI", value: 460 },
                  { symbol: "UNITS", label: "Unités", value: 23500 },
              ],
          }
      }  );
}

/** Activité récente (table) */
export async function getRecentActivity(): Promise<ActivityItem[]> {
  return getJSON<ActivityItem[]>(
      {
          url: "/api/dashboard/activity?limit=10", init: undefined, fallback: [
              { id: "a1", kind: "buy_units", ts: new Date().toISOString(), title: "Achat Studio — Gauthier", amount: 1200, ccy: "EUR", status: "pending" },
              { id: "a2", kind: "rent_income", ts: new Date(Date.now() - 864e5).toISOString(), title: "Revenus locatifs — F3 Casablanca", amount: 185, ccy: "EUR", status: "confirmed" },
              { id: "a3", kind: "mint_nft", ts: new Date(Date.now() - 2 * 864e5).toISOString(), title: "Mint NFT — Tranche A", status: "confirmed" },
          ]
      }  );
}

/** Unités de l’utilisateur (pour bloc “mes unités”) */
export async function getUserUnits(): Promise<UnitRow[]> {
  return getJSON<UnitRow[]>(
      {
          url: "/api/properties/my-units", init: undefined, fallback: [
              { propertyId: "204", title: "Studio — Gauthier", kind: "achat_collectif", units: 1, status: "en_attente", investmentId: "d1i0lfia13n" },
              { propertyId: "305", title: "Local — Location LT", kind: "location", units: 2, status: "confirmé" },
              { propertyId: "101", title: "F3 — Casablanca Centre", kind: "achat_solo", units: 3, status: "livré" },
          ]
      }  );
}
