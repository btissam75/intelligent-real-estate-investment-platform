import React from "react";
import { Link } from "react-router-dom";

type Offer = {
  id: string;
  title: string;
  city: string;
  img: string;
  apr: number;
  minTicket: number;
  status: "Open" | "Closed" | "Coming";
  tags?: string[];
  progress?: number;
};

const DATA: Offer[] = [
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

export default function FeaturedOffers({ items = DATA }: { items?: Offer[] }) {
  return (
    <section style={sx.section}>
      <div style={sx.head}>
        <div>
          <h2 style={sx.h2}>Offres vedettes</h2>
          <p style={sx.sub}>Consultation libre — investir nécessite une connexion.</p>
        </div>
        <Link to="/offers" style={sx.linkViewAll}>Voir toutes les offres →</Link>
      </div>

      <div style={sx.carouselWrap}>
        <button aria-label="Précédent" style={sx.ctrlLeft} onClick={() => scroll(-1)}>‹</button>
        <div id="featured-carousel" style={sx.carousel}>
          {items.map((o) => (
            <article key={o.id} style={sx.card}>
              {/* image + ruban */}
              <div style={sx.coverWrap}>
                <img src={o.img} alt={o.title} style={sx.cover} />
                {o.status !== "Open" && (
                  <span style={sx.ribbon(o.status)}>{o.status}</span>
                )}
              </div>

              {/* body */}
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
                  <Link
                    to="/signin"
                    style={{
                      ...sx.btnGhost,
                      pointerEvents: o.status !== "Open" ? "none" : "auto",
                      opacity: o.status !== "Open" ? 0.5 : 1,
                    }}
                    title={o.status !== "Open" ? "Souscription indisponible" : "Souscrire"}
                  >
                    Souscrire
                  </Link>
                  <Link to={`/properties/${o.id}`} style={sx.btnPrimary}>Détails token</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button aria-label="Suivant" style={sx.ctrlRight} onClick={() => scroll(1)}>›</button>
      </div>
    </section>
  );
}

/* ------- styles ------- */
const sx: Record<string, React.CSSProperties | any> = {
  section: { marginTop: 24 },
  head: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  h2: { margin: 0, fontSize: 24, fontWeight: 900, color: "var(--ink)" },
  sub: { margin: 6, marginLeft: 0, color: "var(--sub)", fontSize: 13 },
  linkViewAll: { color: "var(--red)", fontWeight: 900 },

  carouselWrap: { position: "relative" },
  carousel: {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "minmax(320px, 1fr)",
    gap: 12,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    paddingBottom: 6,
  },
  ctrlLeft: ctrl("left"),
  ctrlRight: ctrl("right"),

  card: { border: "1px solid var(--line)", borderRadius: 16, background: "var(--card)", overflow: "hidden", scrollSnapAlign: "start" },
  coverWrap: { position: "relative", height: 160, overflow: "hidden" },
  cover: { width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scale(1.02)" },
  ribbon: (status: Offer["status"]) => ({
    position: "absolute",
    left: 10, top: 10,
    background:
      status === "Open" ? "linear-gradient(135deg,#dc2626,#ef4444)"
      : status === "Coming" ? "#f59e0b"
      : "#94a3b8",
    color: "#fff", fontWeight: 800, fontSize: 12,
    borderRadius: 10, padding: "4px 8px",
  }),
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { fontWeight: 900, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 420 },
  meta: { fontSize: 12, color: "var(--sub)" },
  aprBlock: { textAlign: "right" },
  aprVal: { fontWeight: 900, color: "var(--red)", fontSize: 18, lineHeight: 1 },
  aprLabel: { fontSize: 11, color: "var(--sub)" },

  tags: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 },
  tag: { fontSize: 11, padding: "4px 8px", borderRadius: 999, border: "1px solid var(--line)", color: "var(--sub)" },

  rowSplit: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 },
  pair: { display: "grid", gap: 2 },
  key: { fontSize: 12, color: "var(--sub)", fontWeight: 700 },
  val: { fontWeight: 900, color: "var(--ink)" },

  progress: { width: "100%", height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden", marginTop: 4 },
  progressBar: (p: number) => ({
    display: "block", width: `${Math.max(0, Math.min(100, p))}%`,
    height: "100%", background: "linear-gradient(90deg,#fecaca,#dc2626)",
  }),

  actions: { display: "flex", gap: 8, marginTop: 10 },
  btnGhost: btnOutline(),
  btnPrimary: btnPrimary(),
};

function ctrl(pos: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [pos]: -10,
    top: "45%",
    transform: "translateY(-50%)",
    border: "1px solid var(--line)",
    background: "#fff",
    borderRadius: 999,
    width: 36, height: 36,
    display: "grid", placeItems: "center",
    fontWeight: 900, cursor: "pointer",
    boxShadow: "0 8px 24px rgba(2,6,23,.08)",
  } as any;
}

function btnPrimary(): React.CSSProperties {
  return {
    border: "1px solid var(--red)",
    background: "linear-gradient(135deg,var(--red),#ef4444)",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer",
  };
}
function btnOutline(): React.CSSProperties {
  return {
    border: "1px solid var(--red)",
    background: "transparent",
    color: "var(--red)",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer",
  };
}

/* simple scroll helper (scrolle le conteneur par pas fixe) */
function scroll(dir: 1 | -1) {
  const el = document.getElementById("featured-carousel");
  if (!el) return;
  const step = el.clientWidth * 0.8;
  el.scrollBy({ left: step * dir, behavior: "smooth" });
}
