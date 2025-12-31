import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/** Types */
type Offer = {
  id: string;
  title: string;
  city: string;
  img: string;
  apr: number;           // rendement annuel cible (%)
  minTicket: number;     // ticket minimum en EUR
  status: "Open" | "Closed" | "Coming";
  tags?: string[];
  subscribed?: boolean;
  progress?: number;     // % financé
};

/** Données mock (à remplacer par ton API) */
const SEED: Offer[] = [
  {
    id: "ofr_a",
    title: "Project A — Immeuble Manar",
    city: "Casablanca",
    img: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
    apr: 10.2,
    minTicket: 250,
    status: "Open",
    tags: ["Résidentiel", "Core+"],
    progress: 62,
  },
  {
    id: "ofr_b",
    title: "Project B — Résidence Oasis",
    city: "Rabat",
    img: "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
    apr: 8.1,
    minTicket: 100,
    status: "Open",
    tags: ["Locatif", "Stabilité"],
    progress: 41,
  },
  {
    id: "ofr_c",
    title: "Project C — Bureau Marina",
    city: "Tanger",
    img: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
    apr: 12.9,
    minTicket: 500,
    status: "Coming",
    tags: ["Bureau", "Value-add"],
    progress: 0,
  },
  {
    id: "ofr_d",
    title: "Project D — Retail Val Fleuri",
    city: "Casablanca",
    img: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
    apr: 7.3,
    minTicket: 100,
    status: "Closed",
    tags: ["Retail", "Diversification"],
    progress: 100,
  },
];

export default function Offers() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | "Open" | "Coming" | "Closed">("All");
  const [minApr, setMinApr] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [active, setActive] = useState<Offer | null>(null);
  const [data, setData] = useState<Offer[]>(SEED);

  const results = useMemo(() => {
    return data
      .filter((o) => (filter === "All" ? true : o.status === filter))
      .filter((o) => o.apr >= minApr)
      .filter((o) =>
        q.trim()
          ? o.title.toLowerCase().includes(q.toLowerCase()) ||
            o.city.toLowerCase().includes(q.toLowerCase())
          : true
      );
  }, [data, q, filter, minApr]);

  const subscribe = async (offer: Offer, amount: number) => {
    // Ici tu brancheras ton backend / smart contract
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setData((prev) =>
      prev.map((x) => (x.id === offer.id ? { ...x, subscribed: true, progress: Math.min(100, (x.progress ?? 0) + Math.min(30, Math.round(amount / 50))) } : x))
    );
    setSubmitting(false);
    setActive(null);
    // Rediriger vers Wallet après souscription ?
    // nav("/");
  };

  return (
    <div style={sx.page}>
      {/* Hero */}
      <div style={sx.hero} className="fade">
        <div>
          <div style={sx.kicker}>Invest-Immo</div>
          <h1 style={sx.h1}>Offers & Subscriptions</h1>
          <div style={sx.sub}>
            Découvrez des opportunités tokenisées. Comparez les rendements, tickets
            minimum et souscrivez en quelques clics.
          </div>
        </div>

        <div style={sx.toolsRow}>
          <div style={sx.search}>
            <span>🔎</span>
            <input
              placeholder="Rechercher par ville ou projet…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={sx.input}
            />
          </div>

          <div style={sx.chip}>
            <span>📂</span>
            <select
              style={sx.sel}
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option>All</option>
              <option>Open</option>
              <option>Coming</option>
              <option>Closed</option>
            </select>
          </div>

          <div style={sx.chip}>
            <span>📈</span>
            <select
              style={sx.sel}
              value={minApr}
              onChange={(e) => setMinApr(Number(e.target.value))}
            >
              <option value={0}>APR ≥ 0%</option>
              <option value={6}>APR ≥ 6%</option>
              <option value={8}>APR ≥ 8%</option>
              <option value={10}>APR ≥ 10%</option>
            </select>
          </div>

          <button style={sx.btnGhost} onClick={() => { setQ(""); setFilter("All"); setMinApr(0); }}>
            Reset
          </button>
        </div>
      </div>

      {/* Grid cartes */}
      <div style={sx.grid}>
        {results.map((o) => (
          <article key={o.id} style={sx.card} className="lift">
            <div style={sx.coverWrap}>
              <img src={o.img} alt={o.title} style={sx.cover} />
              {o.status !== "Open" && (
                <span style={sx.ribbon(o.status)}>
                  {o.status}
                </span>
              )}
            </div>

            <div style={{ padding: 12 }}>
              <div style={sx.cardTop}>
                <div style={{ minWidth: 0 }}>
                  <div style={sx.title}>{o.title}</div>
                  <div style={sx.meta}>{o.city}</div>
                </div>
                <div style={sx.aprBlock}>
                  <div style={sx.aprVal}>{o.apr.toFixed(1)}%</div>
                  <div style={sx.aprLabel}>APR cible</div>
                </div>
              </div>

              {o.tags && (
                <div style={sx.tags}>
                  {o.tags.map((t) => (
                    <span key={t} style={sx.tag}>{t}</span>
                  ))}
                </div>
              )}

              <div style={sx.rowSplit}>
                <div style={sx.pair}>
                  <div style={sx.key}>Min. ticket</div>
                  <div style={sx.val}>{o.minTicket.toLocaleString()} EUR</div>
                </div>

                <div style={sx.pair}>
                  <div style={sx.key}>Financement</div>
                  <div style={sx.val}>{Math.round(o.progress ?? 0)}%</div>
                  <div style={sx.progress}>
                    <span style={sx.progressBar(o.progress ?? 0)} />
                  </div>
                </div>
              </div>

              <div style={sx.actions}>
                <button
                  style={sx.btnGhost}
                  onClick={() => setActive(o)}
                  disabled={o.status !== "Open"}
                  title={o.status !== "Open" ? "Souscription indisponible" : "Souscrire"}
                >
                  {o.subscribed ? "Augmenter" : "Souscrire"}
                </button>
                <button style={sx.btnPrimary} onClick={() => nav("/tokens")}>
                  Détails token
                </button>
              </div>
            </div>
          </article>
        ))}

        {results.length === 0 && (
          <div style={sx.empty}>Aucune offre ne correspond aux filtres.</div>
        )}
      </div>

      {/* Panneau / Modal de souscription */}
      {active && (
        <SubscribePanel
          offer={active}
          busy={submitting}
          onClose={() => setActive(null)}
          onSubmit={subscribe}
        />
      )}
    </div>
  );
}

/** Panneau latéral pour investir */
function SubscribePanel({
  offer,
  busy,
  onClose,
  onSubmit,
}: {
  offer: Offer;
  busy: boolean;
  onClose: () => void;
  onSubmit: (o: Offer, amount: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState<number>(offer.minTicket);

  return (
    <div style={sx.drawerBackdrop} onClick={onClose}>
      <div style={sx.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={sx.drawerHead}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={sx.dot} />
            <b style={{ color: "var(--ink)" }}>Souscrire — {offer.title}</b>
          </div>
          <button style={sx.x} onClick={onClose}>×</button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={sx.row}>
            <div style={sx.key}>Projet</div>
            <div style={sx.val}>{offer.city}</div>
          </div>
          <div style={sx.row}>
            <div style={sx.key}>APR cible</div>
            <div style={sx.val}>{offer.apr.toFixed(1)}%</div>
          </div>
          <div style={sx.row}>
            <div style={sx.key}>Ticket minimum</div>
            <div style={sx.val}>{offer.minTicket.toLocaleString()} EUR</div>
          </div>

          <label style={{ ...sx.key, marginTop: 6 }}>Montant à investir</label>
          <div style={sx.inputWrap}>
            <input
              type="number"
              min={offer.minTicket}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={sx.inputInline}
            />
            <span style={{ color: "var(--sub)", fontSize: 12 }}>EUR</span>
          </div>

          <div style={sx.hint}>
            * Exemple indicatif. La souscription réelle déclenchera un flux Wallet / KYC.
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button style={sx.btnGhost} onClick={onClose} disabled={busy}>Annuler</button>
            <button
              style={sx.btnPrimary}
              disabled={busy || amount < offer.minTicket}
              onClick={() => onSubmit(offer, amount)}
            >
              {busy ? "Traitement…" : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Styles (utilise les variables :root définies par AppShell) */
const sx: Record<string, React.CSSProperties | any> = {
  page: { display: "grid", gap: 12 },

  hero: {
    display: "grid",
    gap: 10,
    padding: 12,
    border: "1px solid var(--line)",
    borderRadius: 16,
    background: "var(--card)",
  },
  kicker: { fontSize: 12, color: "var(--sub)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" },
  h1: { margin: 0, fontWeight: 900, fontSize: 24, color: "var(--ink)" },
  sub: { color: "var(--sub)", fontSize: 13 },

  toolsRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  search: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1px solid #fecaca", borderRadius: 12, padding: "8px 10px", minWidth: 260
  },
  chip: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1px solid #fecaca", borderRadius: 12, padding: "8px 10px"
  },
  sel: { border: "none", outline: "none", background: "transparent", color: "#1f2937", fontWeight: 800 },
  input: { border: "none", outline: "none", flex: 1, background: "transparent", color: "#1f2937", fontSize: 14 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 12,
  },
  card: {
    border: "1px solid var(--line)",
    borderRadius: 16,
    background: "var(--card)",
    overflow: "hidden",
  },
  coverWrap: { position: "relative", height: 160, overflow: "hidden" },
  cover: { width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scale(1.02)" },
  ribbon: (status: Offer["status"]) => ({
    position: "absolute",
    left: 10,
    top: 10,
    background:
      status === "Open" ? "linear-gradient(135deg,#dc2626,#ef4444)" :
      status === "Coming" ? "#f59e0b" :
      "#94a3b8",
    color: "#fff",
    fontWeight: 800,
    fontSize: 12,
    borderRadius: 10,
    padding: "4px 8px",
  }),
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { fontWeight: 900, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 420 },
  meta: { fontSize: 12, color: "var(--sub)" },
  aprBlock: { textAlign: "right" },
  aprVal: { fontWeight: 900, color: "var(--pri)", fontSize: 18, lineHeight: 1 },
  aprLabel: { fontSize: 11, color: "var(--sub)" },

  tags: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 },
  tag: { fontSize: 11, padding: "4px 8px", borderRadius: 999, border: "1px solid var(--line)", color: "var(--sub)" },

  rowSplit: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 },
  pair: { display: "grid", gap: 2 },
  key: { fontSize: 12, color: "var(--sub)", fontWeight: 700 },
  val: { fontWeight: 900, color: "var(--ink)" },

  progress: { width: "100%", height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden", marginTop: 4 },
  progressBar: (p: number) => ({
    display: "block",
    width: `${Math.max(0, Math.min(100, p))}%`,
    height: "100%",
    background: "linear-gradient(90deg,#fecaca,#dc2626)",
  }),

  actions: { display: "flex", gap: 8, marginTop: 10 },
  btnGhost: {
    border: "1px solid var(--pri)", background: "transparent", color: "var(--pri)",
    borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: "pointer"
  },
  btnPrimary: {
    border: "1px solid var(--pri)", background: "linear-gradient(135deg,var(--pri),var(--acc))", color: "#fff",
    borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: "pointer"
  },

  empty: {
    gridColumn: "1 / -1",
    border: "1px dashed var(--line)",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
    color: "var(--sub)",
  },

  /* Drawer / Panel */
  drawerBackdrop: {
    position: "fixed", inset: 0, background: "rgba(2,6,23,.35)",
    display: "grid", placeItems: "end", zIndex: 40
  },
  drawer: {
    width: "min(560px, 100%)",
    background: "var(--card)",
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    borderTop: "1px solid var(--line)", borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)",
    padding: 14, animation: "slideUp .22s ease-out both"
  },
  drawerHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  x: { width: 34, height: 34, borderRadius: 10, border: "1px solid var(--line)", background: "transparent", cursor: "pointer" },
  dot: { width: 10, height: 10, borderRadius: 999, background: "linear-gradient(120deg,var(--pri),var(--acc))" },
  row: { display: "flex", alignItems: "baseline", justifyContent: "space-between" },
  hint: { fontSize: 12, color: "var(--sub)" },

  inputWrap: {
    display: "flex", alignItems: "center", gap: 8,
    border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", background: "#fff"
  },
  inputInline: { border: "none", outline: "none", flex: 1, fontSize: 16, background: "transparent", color: "var(--ink)" },

  /* keyframes */
  "@keyframes slideUp": { from: { transform: "translateY(20px)", opacity: 0 }, to: { transform: "translateY(0)", opacity: 1 } },
};
