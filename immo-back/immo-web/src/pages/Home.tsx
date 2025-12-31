// src/pages/Home.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Home — White & Red Premium
 * - Sticky header (shrink on scroll)
 * - Hero “banner” plein écran avec overlay + counters animés
 * - Ruban d’accès rapide (ancres)
 * - Simulateurs express (cards pro)
 * - Offres vedettes (cartes style Offers, progress bar, badges)
 * - Témoignages
 * - CTA final
 * - Micro-interactions: reveal, ripple, hover-tilt, parallax léger
 */

const css = `
:root{
  --bg:#ffffff;
  --ink:#0b1220;
  --sub:#6b7280;
  --line:#eceff3;
  --pri:#e11d2e;           /* rouge principal */
  --pri-700:#be123c;
  --pri-300:#fecaca;
  --chip:#fff2f3;
  --glass:rgba(255,255,255,.75);
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial}
a{text-decoration:none;color:inherit}
button{font-family:inherit}
img{display:block}

/* ====== Header ====== */
.header{
  position:sticky; top:0; z-index:60;
  background:rgba(255,255,255,.85);
  backdrop-filter:saturate(160%) blur(10px);
  border-bottom:1px solid var(--line);
  transition:all .2s ease;
}
.header.shrink{ transform:translateY(-1px); }
.wrap{max-width:1160px;margin:0 auto;padding:0 24px}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;transition:padding .18s ease}
.header.shrink .nav{padding:10px 0}
.brand{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:.2px}
.logo{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--pri),#ff4d61)}
.navlinks{display:flex;gap:14px;align-items:center}
.link{padding:8px 10px;border-radius:10px;color:var(--sub);font-size:14px}
.link:hover{background:#fafafa;color:var(--ink)}
.ctaSmall{border:1px solid var(--pri);color:#fff;background:var(--pri);padding:8px 12px;border-radius:10px;font-weight:800}
.ctaSmall:hover{background:var(--pri-700);border-color:var(--pri-700)}

/* ====== Hero Banner ====== */
.hero{
  position:relative; min-height:72vh; display:grid; align-items:center;
  border-bottom:1px solid var(--line); overflow:hidden;
  background: #fff url('/assets/home/hero-overlay.jpg') center/cover no-repeat;
}
.hero::after{
  content:""; position:absolute; inset:0;
  background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.98) 60%,rgba(255,255,255,1));
}
.heroInner{position:relative; z-index:1; display:grid; grid-template-columns:1.08fr 0.92fr; gap:28px; align-items:center;}
@media (max-width: 980px){.heroInner{grid-template-columns:1fr; padding:16px 0;}}
.kicker{display:inline-flex;gap:8px;align-items:center;padding:6px 10px;border-radius:999px;border:1px solid var(--line);color:var(--sub);font-size:12px;background:#fff}
.h1{margin:14px 0 10px;font-size:clamp(36px,4.6vw,64px);line-height:1.05;font-weight:900;letter-spacing:-.02em}
.h1 strong{color:var(--pri)}
.lead{color:var(--sub);max-width:62ch;line-height:1.6}

/* CTA + ripple */
.cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.btn{
  position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; gap:10px;
  padding:12px 16px; border-radius:12px; font-weight:900; cursor:pointer;
  border:1px solid var(--line); transition:transform .15s ease, box-shadow .15s ease, background .15s ease;
}
.btnPrimary{background:var(--pri);border-color:var(--pri);color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
.btnPrimary:hover{transform:translateY(-1px);background:var(--pri-700);border-color:var(--pri-700)}
.btnGhost{background:#fff;color:var(--ink)}
.btnGhost:hover{transform:translateY(-1px);border-color:#e6e9ee}
.btn:focus-visible{outline:3px solid #ffccd1;outline-offset:2px}
.rip{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none}
.rip>span{position:absolute;width:12px;height:12px;background:rgba(255,255,255,.75);border-radius:999px;transform:scale(0);opacity:.95}
.rip.show>span{animation:r .6s ease-out forwards}
@keyframes r{to{transform:scale(22);opacity:0}}

/* Hero / panneau stats + parallax */
.illu{
  position:relative;border:1px solid var(--line);border-radius:18px;background:var(--glass);
  backdrop-filter:blur(8px) saturate(160%);padding:14px;box-shadow:0 18px 50px rgba(0,0,0,.08);min-height:320px;overflow:hidden;
}
.illuCanvas{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.cardStats{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.metric{border:1px solid var(--line);border-radius:12px;background:#fff;padding:12px}
.metric .tag{font-size:12px;color:var(--sub)}
.metric .big{margin-top:2px;font-weight:900;font-size:22px;color:var(--ink)}
.blob{position:absolute;border-radius:9999px;filter:blur(26px);mix-blend:multiply;opacity:.38}
.blob.a{width:260px;height:260px;right:-60px;bottom:-60px;background:radial-gradient(circle,#ff4d61,transparent 60%)}
.blob.b{width:220px;height:220px;left:-50px;top:-50px;background:radial-gradient(circle,var(--pri),transparent 60%)}

/* ====== Quick access pills ====== */
.quickbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.pill{
  display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px;
  border:1px solid var(--pri-300); background:#fff; color:#a71a2b; font-weight:800; cursor:pointer;
  transition:transform .15s ease, box-shadow .15s ease, background .15s ease;
}
.pill:hover{transform:translateY(-1px); box-shadow:0 10px 30px rgba(225,29,46,.08)}
.pill .dot{width:6px;height:6px;border-radius:999px;background:linear-gradient(135deg,var(--pri),#ff4d61)}

/* ====== Sections génériques ====== */
.section{padding:28px 0;border-bottom:1px solid var(--line)}
.h2{margin:0 0 8px;font-size:24px;letter-spacing:.2px;font-weight:900}
.sub{color:var(--sub);max-width:70ch}

/* Reveal on scroll */
.reveal{opacity:0;transform:translateY(8px);transition:opacity .35s ease, transform .35s ease}
.reveal.on{opacity:1;transform:translateY(0)}

/* ====== Simulateurs express ====== */
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}
@media (max-width:980px){.grid3{grid-template-columns:1fr}}
.scard{
  position:relative; border:1px solid var(--line); border-radius:16px; background:#fff; padding:16px;
  transition:transform .15s ease, box-shadow .15s ease;
}
.scard:hover{transform:translateY(-2px); box-shadow:0 16px 48px rgba(0,0,0,.08)}
.shead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.stitle{font-weight:900}
.scta{border:1px solid var(--pri); color:#fff; background:var(--pri); padding:8px 12px; border-radius:10px; font-weight:800}
.scta:hover{background:var(--pri-700);border-color:var(--pri-700)}
.ul{list-style:none; padding:0; margin:10px 0 0}
.ul li{font-size:13px; color:var(--sub); display:flex; gap:8px; align-items:center; margin:6px 0}
.ul li::before{content:"•"; color:var(--pri); font-weight:900}

/* ====== Offres vedettes ====== */
.gridOffers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}
@media (max-width:980px){.gridOffers{grid-template-columns:1fr}}
.offerCard{
  border:1px solid var(--line); border-radius:16px; background:#fff; overflow:hidden;
  transition:transform .12s ease, box-shadow .12s ease; will-change:transform;
}
.offerCard:hover{transform:translateY(-3px); box-shadow:0 18px 52px rgba(0,0,0,.08)}
.coverWrap{position:relative;height:180px;overflow:hidden}
.cover{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.02);transition:transform .45s ease}
.offerCard:hover .cover{transform:scale(1.06)}
.ribbon{position:absolute;left:10px;top:10px;background:linear-gradient(135deg,var(--pri),#ff4d61);color:#fff;font-weight:800;font-size:12px;border-radius:10px;padding:4px 8px}
.apr{position:absolute;right:10px;bottom:10px;background:#fff;color:var(--pri);border:1px solid var(--pri-300);border-radius:999px;padding:4px 8px;font-weight:900;font-size:12px}
.offerBody{padding:12px}
.title{font-weight:900;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.meta{font-size:12px;color:var(--sub)}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
.tag{font-size:11px;padding:4px 8px;border-radius:999px;border:1px solid var(--line);color:var(--sub)}
.rowSplit{display:grid;grid-template-columns:1fr 1fr;gap:8;margin-top:6px}
.key{font-size:12px;color:var(--sub);font-weight:700}
.val{font-weight:900;color:var(--ink)}
.progress{width:100%;height:8px;border-radius:999px;background:#f1f5f9;overflow:hidden;margin-top:4px}
.bar{display:block;height:100%;background:linear-gradient(90deg,#fecaca,var(--pri));}

/* ====== Témoignages ====== */
.quote{border:1px solid var(--line);border-radius:16px;background:#fff;padding:16px}
.qhead{display:flex;align-items:center;gap:10px}
.ava{width:34px;height:34px;border-radius:999px;background:linear-gradient(135deg,#ff8a95,#ffccd1)}
.qname{font-weight:900}
.qbody{color:var(--sub);margin-top:8px}

/* ====== CTA final ====== */
.ctaBlock{text-align:center;padding:26px;border:1px dashed var(--line);border-radius:16px;background:#fff}

/* ====== Footer ====== */
.footer{padding:16px 24px;color:var(--sub);font-size:12px;display:flex;align-items:center;justify-content:space-between}
`;

/* ---------- Hooks d'interaction ---------- */
function useHeaderShrink() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current!;
    const on = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y > 6) el.classList.add("shrink"); else el.classList.remove("shrink");
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return ref;
}
function useCounter(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(target * (0.5 - Math.cos(Math.PI * p) / 2)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}
function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current!;
    const obs = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && el.classList.add("on")),
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
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
function useParallax() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current!;
    const on = (ev: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (ev.clientX - cx) / r.width;
      const dy = (ev.clientY - cy) / r.height;
      el.style.transform = `translate(${dx * 8}px, ${dy * 8}px)`;
    };
    const off = () => (el.style.transform = "translate(0,0)");
    el.addEventListener("mousemove", on);
    el.addEventListener("mouseleave", off);
    return () => {
      el.removeEventListener("mousemove", on);
      el.removeEventListener("mouseleave", off);
    };
  }, []);
  return ref;
}
function smoothScroll(anchorId: string) {
  const el = document.getElementById(anchorId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Données mock offres (images locales) ---------- */
type Featured = {
  id: string;
  title: string;
  city: string;
  img: string;
  status: "Open" | "Coming" | "Closed";
  apr: number;
  minTicket: number;
  progress: number; // %
  tags: string[];
};
const FEATURED: Featured[] = [
  {
    id: "101",
    title: "F3 — Casablanca Centre",
    city: "Casablanca",
    img: "/assets/home/casa-f3.jpg",
    status: "Open",
    apr: 10.2,
    minTicket: 250,
    progress: 62,
    tags: ["Résidentiel", "Core+"],
  },
  {
    id: "202",
    title: "Villa — Rabat Agdal",
    city: "Rabat",
    img: "/assets/home/rabat-villa.jpg",
    status: "Open",
    apr: 8.1,
    minTicket: 100,
    progress: 41,
    tags: ["Locatif", "Stabilité"],
  },
  {
    id: "303",
    title: "Studio — Marrakech Gueliz",
    city: "Marrakech",
    img: "/assets/home/marrakech-studio.jpg",
    status: "Coming",
    apr: 9.4,
    minTicket: 150,
    progress: 0,
    tags: ["Urbain", "Starter"],
  },
  {
    id: "404",
    title: "Plateau — Tanger Marina",
    city: "Tanger",
    img: "/assets/home/tanger-plateau.jpg",
    status: "Closed",
    apr: 7.3,
    minTicket: 500,
    progress: 100,
    tags: ["Bureau", "Value-add"],
  },
];

/* ---------- Sous-composants ---------- */
function Quote({ who, role, text }: { who: string; role: string; text: string }) {
  return (
    <div className="quote">
      <div className="qhead">
        <div className="ava" />
        <div>
          <div className="qname">{who}</div>
          <div style={{fontSize:12,color:"var(--sub)"}}>{role}</div>
        </div>
      </div>
      <div className="qbody">“{text}”</div>
    </div>
  );
}

function SimMini({ title, link, bullets }: { title:string; link:string; bullets:string[] }) {
  return (
    <div className="scard">
      <div className="shead">
        <div className="stitle">{title}</div>
        <Link to={link} className="scta">Ouvrir</Link>
      </div>
      <ul className="ul">
        {bullets.map((b,i)=><li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

/* ---------- Page ---------- */
export default function Home(){
  const headerRef = useHeaderShrink();
  const parallaxRef = useParallax();

  // counters
  const volMAD = useCounter(18700000);
  const success = useCounter(92);
  const investors = useCounter(2430);
  const volMADFmt = useMemo(()=> volMAD.toLocaleString(undefined,{maximumFractionDigits:0})+" MAD",[volMAD]);

  // reveals
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal();

  return (
    <div>
      <style>{css}</style>

      {/* Header */}
      <header className="header" ref={headerRef as any}>
        {/* <div className="wrap nav">
          <div className="brand">
            <div className="logo" />
            Immo<span style={{color:"var(--pri)"}}>Back</span>
          </div>
          <nav className="navlinks">
            <Link to="/" className="link">Accueil</Link>
            <Link to="/properties" className="link">Biens</Link>
            <Link to="/signin" className="link ctaSmall">Se connecter</Link>
          </nav>
        </div> */}
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="wrap heroInner">
          <div>
            <div className="kicker">Plateforme d’investissement — accès libre, investissement après connexion</div>
            <h1 className="h1">Investir <strong>simplement</strong>, gérer <strong>clairement</strong>.</h1>
            <p className="lead">
              Explorez librement les opportunités. Quand vous êtes prêt·e, connectez-vous et choisissez l’achat
              <b> solo</b> ou <b> collectif</b> (lots fixes / variables) — protocole anti-dépassement, reçus & contrats, paiement carte / virement / crypto.
            </p>

            {/* Ruban d’accès rapide */}
            <div className="quickbar">
              <button className="pill" onClick={()=>smoothScroll("anchor-achat")}><span className="dot" />Achat immobilier</button>
              <button className="pill" onClick={()=>smoothScroll("anchor-location")}><span className="dot" />Mise en location</button>
              <button className="pill" onClick={()=>smoothScroll("anchor-exploitation")}><span className="dot" />Exploitation commerciale</button>
              <button className="pill" onClick={()=>smoothScroll("anchor-residence")}><span className="dot" />Résidence gérée</button>
              <button className="pill" onClick={()=>smoothScroll("anchor-fonds")}><span className="dot" />Fonds à revenu garanti</button>
            </div>

            <div className="cta">
              <Link to="/properties">
                <button className="btn btnPrimary" onClick={ripple}>
                  Voir les biens <div className="rip"><span/></div>
                </button>
              </Link>
              <Link to="/signin">
                <button className="btn btnGhost" onClick={ripple}>
                  Se connecter <div className="rip"><span/></div>
                </button>
              </Link>
            </div>
          </div>

          {/* Panneau stats + parallax */}
          <div className="illu">
            <div className="cardStats">
              <div className="metric">
                <div className="tag">Volume financé</div>
                <div className="big">{volMADFmt}</div>
              </div>
              <div className="metric">
                <div className="tag">% collectes réussies</div>
                <div className="big">{success}%</div>
              </div>
              <div className="metric">
                <div className="tag">Investisseurs actifs</div>
                <div className="big">{investors}</div>
              </div>
            </div>
            <div className="illuCanvas" ref={parallaxRef as any} aria-hidden>
              <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
                <rect x="8" y="12" width="72" height="52" rx="8" stroke="#ef4444" strokeWidth="2" />
                <rect x="52" y="40" width="88" height="56" rx="10" stroke="#e11d2e" strokeWidth="2" />
                <rect x="112" y="16" width="96" height="72" rx="12" stroke="#f87171" strokeWidth="2" />
                <path d="M18 84h184" stroke="#e5e7eb" />
                <circle cx="36" cy="100" r="6" fill="#ef4444" />
                <rect x="52" y="94" width="148" height="12" rx="6" fill="#fee2e2" />
              </svg>
            </div>
            <div className="blob a" /><div className="blob b" />
          </div>
        </div>
      </section>

      <main className="wrap">
        {/* SIMULATEURS EXPRESS */}
        <section className="section reveal" id="simulateurs" ref={r1 as any}>
          <h2 className="h2">Simulateurs express</h2>
          <p className="sub">Aperçu rapide avant d’entrer dans l’assistant d’investissement (public).</p>

          <div className="grid3" style={{marginTop:10}}>
            <div id="anchor-achat">
              <SimMini title="Achat immobilier (solo/collectif)" link="/properties?type=achat"
                bullets={["Achat solo", "Lots fixes", "Lots variables"]}/>
            </div>
            <div id="anchor-location">
              <SimMini title="Mise en location (revenus locatifs)" link="/properties?type=location"
                bullets={["Net mensuel", "Cumul des revenus", "Point de retour (ROI)"]}/>
            </div>
            <div id="anchor-exploitation">
              <SimMini title="Exploitation commerciale" link="/properties?type=exploitation"
                bullets={["Permanent", "Non permanent", "Part des revenus (%)"]}/>
            </div>
          </div>

          <div className="grid3" style={{marginTop:10}}>
            <div id="anchor-residence">
              <SimMini title="Résidence gérée (appart-hôtel)" link="/properties?type=residence"
                bullets={["Franchise", "Garantie optionnelle", "Versements périodiques"]}/>
            </div>
            <div id="anchor-fonds">
              <SimMini title="Fonds à revenu garanti" link="/properties?type=fonds"
                bullets={["Franchise", "Revenu minimum garanti", "Top-up si insuffisant"]}/>
            </div>
            <SimMini title="Catalogue complet" link="/properties"
              bullets={["Tous les cas", "Filtres & tri", "Détails projets"]}/>
          </div>
        </section>

        {/* OFFRES VEDETTES */}
        <section className="section reveal" ref={r2 as any}>
          <h2 className="h2">Offres vedettes</h2>
          <p className="sub">Consultation publique. L’investissement nécessite une connexion.</p>

          <div className="gridOffers">
            {FEATURED.map((o) => (
              <article key={o.id} className="offerCard">
                <div className="coverWrap">
                  <img
                    src={o.img}
                    alt={o.title}
                    className="cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop";
                    }}
                  />
                  {o.status !== "Open" && <span className="ribbon">{o.status}</span>}
                  <span className="apr">{o.apr.toFixed(1)}% Rendement</span>
                </div>

                <div className="offerBody">
                  <div className="title">{o.title}</div>
                  <div className="meta">📍 {o.city}</div>

                  <div className="tags">
                    {o.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                  </div>

                  <div className="rowSplit">
                    <div>
                      <div className="key">Min. ticket</div>
                      <div className="val">{o.minTicket.toLocaleString()} EUR</div>
                    </div>
                    <div>
                      <div className="key">Financement</div>
                      <div className="val">{o.progress}%</div>
                      <div className="progress"><span className="bar" style={{width:`${o.progress}%`}}/></div>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <Link to={`/properties/${o.id}`}>
                      <button className="btn btnGhost" onClick={ripple}>
                        Voir le bien <div className="rip"><span/></div>
                      </button>
                    </Link>
                    <Link to="/properties">
                      <button className="btn btnPrimary" onClick={ripple}>
                        Toutes les offres <div className="rip"><span/></div>
                      </button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section className="section reveal" ref={r3 as any}>
          <h2 className="h2">Témoignages</h2>
          <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:12}}>
            <Quote who="Lamia"   role="Investisseuse — Casablanca" text="Réservation fluide, paiement simple. Je me suis engagée à mon rythme." />
            <Quote who="Youssef" role="Propriétaire — Rabat"       text="Zéro dépassement, tout tracé. La plateforme est carrée." />
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="section reveal" ref={r4 as any}>
          <div className="ctaBlock">
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Découvrir les opportunités</h3>
            <p className="sub" style={{ margin: "8px auto 12px" }}>
              Parcourez librement le catalogue. Connectez-vous lorsque vous voulez investir.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/properties">
                <button className="btn btnPrimary" onClick={ripple}>
                  Voir les biens <div className="rip"><span /></div>
                </button>
              </Link>
              <Link to="/signin">
                <button className="btn btnGhost" onClick={ripple}>
                  Se connecter <div className="rip"><span /></div>
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer wrap">
        <div>© {new Date().getFullYear()} ImmoBack</div>
        <div style={{ display: "flex", gap: 12 }}>
          <a className="link" href="#">Conditions</a>
          <a className="link" href="#">Confidentialité</a>
          <a className="link" href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}
