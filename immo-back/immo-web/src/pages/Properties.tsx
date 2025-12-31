import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Properties — Catalogue public des biens
 * Thème blanc/rouge, filtres, tri, cartes responsives, animations.
 */

/* ====================== STYLES ====================== */
const css = `
:root{
  --bg:#ffffff; --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
  --red:#e11d2e; --red-700:#be123c; --chip:#fff2f3; --card:#fff;
}
*{box-sizing:border-box}
a{color:inherit;text-decoration:none}
button{font-family:inherit}
.wrap{max-width:1160px;margin:0 auto;padding:0 24px}

/* Hero barre */
.hero{
  position:sticky; top:0; z-index:20;
  background:rgba(255,255,255,.92); backdrop-filter:saturate(160%) blur(10px);
  border-bottom:1px solid var(--line);
}
.heroIn{
  display:flex; gap:10px; align-items:center; flex-wrap:wrap; padding:12px 0;
}
.h1{margin:0; font-size:22px; font-weight:900; letter-spacing:.2px}

/* Outils */
.tools{display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-left:auto}
.input, .select{
  border:1px solid var(--line); background:#fff; color:var(--ink);
  border-radius:12px; padding:10px 12px; outline:none;
}
.input{min-width:220px}
.select{appearance:none}

/* Boutons */
.btn{
  position:relative; overflow:hidden;
  border:1px solid var(--line); background:#fff; color:var(--ink);
  border-radius:12px; padding:10px 12px; font-weight:900; cursor:pointer;
}
.btnPrimary{border-color:var(--red); background:var(--red); color:#fff; box-shadow:0 12px 30px rgba(225,29,46,.18)}
.btnPrimary:hover{background:var(--red-700); border-color:var(--red-700)}
.btnGhost:hover{border-color:#e2e6eb}
.rip{position:absolute; inset:0; border-radius:inherit; overflow:hidden; pointer-events:none}
.rip>span{position:absolute; width:14px; height:14px; background:rgba(255,255,255,.75); border-radius:999px; transform:scale(0); opacity:.95}
.rip.show>span{animation:r .6s ease-out forwards}
@keyframes r{to{transform:scale(20);opacity:0}}

/* Grille */
.grid{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; padding:14px 0 24px}
@media (max-width: 1024px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width: 640px){.grid{grid-template-columns:1fr}}

/* Carte */
.card{
  border:1px solid var(--line); border-radius:16px; background:var(--card); overflow:hidden;
  transition:transform .12s ease, box-shadow .12s ease;
}
.card:hover{transform:translateY(-2px); box-shadow:0 18px 44px rgba(2,6,23,.06)}
.coverWrap{position:relative; height:180px; overflow:hidden}
.cover{width:100%; height:100%; object-fit:cover; display:block; transform:scale(1.02)}
.ribbon{
  position:absolute; left:10px; top:10px; color:#fff; font-weight:900; font-size:12px;
  border-radius:10px; padding:4px 8px;
}
.ribbon.open{background:linear-gradient(135deg,#dc2626,#ef4444)}
.ribbon.funded{background:#10b981}
.ribbon.closed{background:#94a3b8}

.body{padding:12px}
.top{display:flex; align-items:center; justify-content:space-between; gap:8px}
.title{font-weight:900; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:420px}
.city{font-size:12px; color:var(--sub)}
.apr{font-weight:900; color:var(--red); text-align:right}
.chips{display:flex; gap:6px; flex-wrap:wrap; margin-top:6px}
.chip{font-size:11px; padding:4px 8px; border-radius:999px; background:var(--chip); color:var(--red); font-weight:800}

.row2{display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px}
.k{font-size:12px; color:var(--sub); font-weight:700}
.v{font-weight:900; color:var(--ink)}

.progress{width:100%; height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden; margin-top:4px}
.bar{height:100%; background:linear-gradient(90deg,#fecaca,#dc2626)}

.actions{display:flex; gap:8px; margin-top:10px}

/* barre inférieure */
.footerLine{border-top:1px dashed var(--line); padding:14px 0; color:var(--sub); font-size:12px; display:flex; align-items:center; justify-content:space-between}

/* Reveal on scroll */
.reveal{opacity:0; transform:translateY(8px); transition:opacity .35s ease, transform .35s ease}
.reveal.on{opacity:1; transform:translateY(0)}
`;

/* ====================== DATASET ====================== */
export type Property = {
  id: string;
  title: string;
  city: string;
  img: string;
  totalPriceMAD: number;
  status: "OPEN" | "FUNDED" | "CLOSED";
  mode: "SOLO" | "COLLECTIVE";
  lotType?: "FIXED" | "VARIABLE";
  progress: number;          // % financé
  minTicketMAD?: number;     // si collectif
};

const DATA: Property[] = [
  {
    id: "p101",
    title: "F3 — Casablanca Centre",
    city: "Casablanca",
    img: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
    totalPriceMAD: 1000000,
    status: "OPEN",
    mode: "COLLECTIVE",
    lotType: "FIXED",
    progress: 62,
    minTicketMAD: 100000,
  },
  {
    id: "p202",
    title: "Villa — Rabat Agdal",
    city: "Rabat",
    img: "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
    totalPriceMAD: 3000000,
    status: "OPEN",
    mode: "COLLECTIVE",
    lotType: "VARIABLE",
    progress: 41,
    minTicketMAD: 50000,
  },
  {
    id: "p303",
    title: "Studio — Marrakech Gueliz",
    city: "Marrakech",
    img: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
    totalPriceMAD: 680000,
    status: "OPEN",
    mode: "SOLO",
    progress: 18,
  },
  {
    id: "p404",
    title: "Plateau — Tanger Marina",
    city: "Tanger",
    img: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
    totalPriceMAD: 2450000,
    status: "FUNDED",
    mode: "COLLECTIVE",
    lotType: "FIXED",
    progress: 100,
    minTicketMAD: 150000,
  },
  {
    id: "p505",
    title: "Penthouse — Casa Anfa",
    city: "Casablanca",
    img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1600&auto=format&fit=crop",
    totalPriceMAD: 5200000,
    status: "CLOSED",
    mode: "SOLO",
    progress: 100,
  },
];

/* ====================== HELPERS ====================== */
const mad = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " MAD";

function ripple(e: React.MouseEvent<HTMLButtonElement>) {
  const host = e.currentTarget.querySelector(".rip") as HTMLDivElement;
  if (!host) return;
  host.classList.remove("show");
  // @ts-ignore
  void host.offsetWidth;
  const span = host.firstElementChild as HTMLSpanElement;
  const d = Math.max(host.clientWidth, host.clientHeight);
  const rect = host.getBoundingClientRect();
  span.style.width = span.style.height = `${d}px`;
  span.style.left = `${e.clientX - rect.left - d / 2}px`;
  span.style.top = `${e.clientY - rect.top - d / 2}px`;
  host.classList.add("show");
}

function useRevealList() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = ref.current!;
    const items = Array.from(root.querySelectorAll(".reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.isIntersecting && en.target.classList.add("on"));
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ====================== PAGE ====================== */
export default function Properties() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | "OPEN" | "FUNDED" | "CLOSED">("ALL");
  const [mode, setMode] = useState<"ALL" | "SOLO" | "COLLECTIVE">("ALL");
  const [lot, setLot] = useState<"ALL" | "FIXED" | "VARIABLE">("ALL");
  const [sort, setSort] = useState<"PRICE_ASC" | "PRICE_DESC" | "PROGRESS_DESC">("PRICE_ASC");

  const listRef = useRevealList();

  const filtered = useMemo(() => {
    return DATA
      .filter((p) => (status === "ALL" ? true : p.status === status))
      .filter((p) => (mode === "ALL" ? true : p.mode === mode))
      .filter((p) => (lot === "ALL" ? true : p.lotType === lot))
      .filter((p) => {
        if (!q.trim()) return true;
        const t = q.toLowerCase();
        return p.title.toLowerCase().includes(t) || p.city.toLowerCase().includes(t);
      })
      .sort((a, b) => {
        if (sort === "PRICE_ASC") return a.totalPriceMAD - b.totalPriceMAD;
        if (sort === "PRICE_DESC") return b.totalPriceMAD - a.totalPriceMAD;
        return (b.progress ?? 0) - (a.progress ?? 0);
      });
  }, [q, status, mode, lot, sort]);

  return (
    <div>
      <style>{css}</style>

      {/* HERO / BARRE D’OUTILS */}
      <div className="hero">
        <div className="wrap heroIn">
          <h1 className="h1">Biens disponibles</h1>

          <div className="tools">
            <input
              className="input"
              placeholder="Rechercher ville / titre…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="ALL">Statut — Tous</option>
              <option value="OPEN">Open</option>
              <option value="FUNDED">Funded</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select className="select" value={mode} onChange={(e) => setMode(e.target.value as any)}>
              <option value="ALL">Mode — Tous</option>
              <option value="SOLO">Solo</option>
              <option value="COLLECTIVE">Collectif</option>
            </select>

            <select className="select" value={lot} onChange={(e) => setLot(e.target.value as any)}>
              <option value="ALL">Lots — Tous</option>
              <option value="FIXED">Lots fixes</option>
              <option value="VARIABLE">Lots variables</option>
            </select>

            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="PRICE_ASC">Prix ↑</option>
              <option value="PRICE_DESC">Prix ↓</option>
              <option value="PROGRESS_DESC">Progression ↓</option>
            </select>

            <button
              className="btn"
              onClick={(e) => {
                ripple(e);
                setQ(""); setStatus("ALL"); setMode("ALL"); setLot("ALL"); setSort("PRICE_ASC");
              }}
            >
              Réinitialiser
              <div className="rip"><span/></div>
            </button>
          </div>
        </div>
      </div>

      {/* LISTE */}
      <div className="wrap" ref={listRef}>
        <div className="grid">
          {filtered.map((p) => (
            <article key={p.id} className="card reveal">
              <div className="coverWrap">
                <img className="cover" src={p.img} alt={p.title} />
                <span className={`ribbon ${p.status === "OPEN" ? "open" : p.status === "FUNDED" ? "funded" : "closed"}`}>
                  {p.status}
                </span>
              </div>

              <div className="body">
                <div className="top">
                  <div style={{minWidth:0}}>
                    <div className="title">{p.title}</div>
                    <div className="city">{p.city}</div>
                  </div>
                  <div className="apr" title="Prix total">{mad(p.totalPriceMAD)}</div>
                </div>

                <div className="chips">
                  <span className="chip">{p.mode}</span>
                  {p.mode === "COLLECTIVE" && <span className="chip">{p.lotType}</span>}
                </div>

                <div className="row2">
                  <div>
                    <div className="k">Progression</div>
                    <div className="v">{Math.round(p.progress)}%</div>
                    <div className="progress"><span className="bar" style={{width: `${Math.min(100,Math.max(0,p.progress))}%`}} /></div>
                  </div>
                  <div>
                    <div className="k">Ticket min.</div>
                    <div className="v">{p.minTicketMAD ? mad(p.minTicketMAD) : "—"}</div>
                  </div>
                </div>

                <div className="actions">
                  <Link to={`/properties/${p.id}`}>
                    <button className="btn btnPrimary" onClick={ripple}>
                      Voir le bien
                      <div className="rip"><span/></div>
                    </button>
                  </Link>
                  <Link to={`/properties/${p.id}`}>
                    <button className="btn btnGhost" onClick={ripple}>
                      Simuler
                      <div className="rip"><span/></div>
                    </button>
                  </Link>
                </div>
              </div>

              <div className="footerLine">
                <span>Id: {p.id}</span>
                <span>{p.mode === "COLLECTIVE" ? (p.lotType === "FIXED" ? "Parts prédéfinies" : "Montant libre") : "Achat 100%"}</span>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="card" style={{padding:16, gridColumn:"1 / -1", textAlign:"center", color:"var(--sub)"}}>
              Aucun bien ne correspond aux filtres.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
