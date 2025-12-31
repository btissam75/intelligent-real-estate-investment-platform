// // src/pages/PropertyPage.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// type Status = "OPEN" | "FUNDED" | "CLOSED";
// type Mode = "SOLO" | "COLLECTIF";
// type Lots = "FIXED" | "VARIABLE";

// type Property = {
//   id: string;
//   title: string;
//   city: string;
//   description: string;
//   totalPriceMAD: number;
//   apr: number; // % annuel cible
//   mode: Mode;
//   lotType?: Lots;
//   images: string[];
//   // Financement
//   unitsTotal?: number;     // FIXED
//   unitPriceMAD?: number;   // prix/lot (FIXED)
//   unitsSold?: number;
//   fundedMAD?: number;      // VARIABLE
//   targetMAD?: number;      // VARIABLE (sinon = totalPriceMAD)
//   // Overrides statut
//   closed?: boolean;
// };

// const css = `
// :root{
//   --bg:#ffffff;
//   --ink:#0b1220;
//   --sub:#6b7280;
//   --line:#eceff3;
//   --red:#e11d2e;
//   --red-700:#be123c;
//   --chip:#fff2f3;
//   --glass:rgba(255,255,255,.78);
// }
// *{box-sizing:border-box} html,body,#root{height:100%}
// body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit}
// button{font-family:inherit}
// .wrap{max-width:1160px;margin:0 auto;padding:0 20px}

// /* Head */
// .head{border-bottom:1px solid var(--line);background:linear-gradient(180deg,#fff, #fff 70%, #fff0 100%)}
// .breadcrumbs{display:flex;gap:10px;align-items:center;color:var(--sub);font-size:12px;padding:14px 0}
// .titleRow{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:6px 0 14px}
// .h1{margin:0;font-size:clamp(24px,3.5vw,36px);font-weight:900;letter-spacing:-.01em}
// .badges{display:flex;gap:8px;flex-wrap:wrap}
// .badge{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 8px;background:#fff;color:var(--sub);font-weight:800}
// .badgeRed{border-color:#fecaca;background:#fff1f2;color:#a71a2b}
// .kicker{font-size:12px;color:var(--sub)}

// /* Grid body */
// .body{display:grid;grid-template-columns:1.15fr .85fr;gap:16px;padding:16px 0 24px}
// @media (max-width: 980px){.body{grid-template-columns:1fr}}

// .card{border:1px solid var(--line);border-radius:16px;background:#fff;overflow:hidden}
// .section{padding:14px 14px 12px}
// .h2{margin:0 0 6px;font-size:18px;font-weight:900}
// .sub{color:var(--sub);font-size:13px}

// /* Gallery */
// .gallery{display:grid;grid-template-columns:1fr;gap:8px;padding:8px}
// .mainImgWrap{position:relative;border:1px solid var(--line);border-radius:14px;overflow:hidden;height:360px;background:var(--glass);backdrop-filter:saturate(150%) blur(8px)}
// .mainImg{width:100%;height:100%;object-fit:cover;transition:transform .25s ease}
// .thumbs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
// .thumb{height:64px;border:1px solid var(--line);border-radius:10px;overflow:hidden;cursor:pointer;opacity:.9}
// .thumb:hover{opacity:1}
// .thumb>img{width:100%;height:100%;object-fit:cover}

// /* Progress + status */
// .infobar{display:grid;grid-template-columns:1fr 1fr;gap:10px}
// .infItem{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff}
// .key{font-size:12px;color:var(--sub);font-weight:800}
// .val{font-weight:900}
// .progress{margin-top:6px;width:100%;height:10px;border-radius:999px;background:#f1f5f9;overflow:hidden}
// .progressBar{height:100%;background:linear-gradient(90deg,#fecaca,#dc2626);width:0%;transition:width .6s cubic-bezier(.22,1,.36,1)}

// .banner{border-top:1px dashed var(--line);padding:12px;margin-top:10px;font-size:13px}
// .banner.open{background:#fff}
// .banner.funded{background:#ecfdf5;border:1px solid #bbf7d0;color:#065f46;border-radius:12px}
// .banner.closed{background:#f8fafc;border:1px solid #e5e7eb;color:#475569;border-radius:12px}

// /* Tabs + simulate */
// .tabs{display:flex;gap:8px;border-bottom:1px solid var(--line);padding:0 12px}
// .tab{border:none;background:transparent;padding:12px 10px;font-weight:900;color:var(--sub);cursor:pointer;border-bottom:2px solid transparent}
// .tab.active{color:var(--ink);border-bottom-color:var(--red)}
// .simGrid{display:grid;gap:10px}
// .row{display:flex;align-items:center;justify-content:space-between;gap:10px}
// .inputWrap{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff}
// .input{border:none;outline:none;background:transparent;font-size:16px;width:100%}
// .hint{color:var(--sub);font-size:12px}

// /* CTA buttons */
// .btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:8px;
//   padding:12px 14px;border-radius:12px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink)}
// .btnPrimary{background:var(--red);border-color:var(--red);color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
// .btnPrimary:hover{transform:translateY(-1px);background:var(--red-700);border-color:var(--red-700)}
// .btnGhost{background:#fff}
// .btn:disabled{opacity:.6;cursor:not-allowed}
// .rip{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none}
// .rip>span{position:absolute;width:12px;height:12px;background:rgba(255,255,255,.75);border-radius:999px;transform:scale(0);opacity:.95}
// .rip.show>span{animation:r .6s ease-out forwards}
// @keyframes r{to{transform:scale(18);opacity:0}}

// /* Sticky action bar */
// .stickyBar{position:sticky;bottom:0;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.86);backdrop-filter:saturate(150%) blur(8px);padding:10px;display:flex;align-items:center;justify-content:space-between;gap:12px}

// /* Reveal */
// .reveal{opacity:0;transform:translateY(8px);transition:opacity .35s ease, transform .35s ease}
// .on{opacity:1;transform:translateY(0)}
// `;

// /* ===== Données mock (remplacer par fetch API) ===== */
// const DB: Record<string, Property> = {
//   "101": {
//     id: "101",
//     title: "F3 — Casablanca Centre",
//     city: "Casablanca",
//     description:
//       "Appartement F3 lumineux, centre-ville, proche tram. Idéal locatif à forte demande. Rénovation récente, cuisine équipée, balcon.",
//     totalPriceMAD: 1000000,
//     apr: 9.2,
//     mode: "COLLECTIF",
//     lotType: "FIXED",
//     unitsTotal: 10,
//     unitPriceMAD: 100000,
//     unitsSold: 6,
//     images: [
//       "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
//     ],
//   },
//   "202": {
//     id: "202",
//     title: "Villa — Rabat Agdal",
//     city: "Rabat",
//     description:
//       "Villa familiale quartier Agdal, jardin privatif, rendement stable via bail longue durée.",
//     totalPriceMAD: 3000000,
//     apr: 8.0,
//     mode: "COLLECTIF",
//     lotType: "VARIABLE",
//     targetMAD: 3000000,
//     fundedMAD: 1320000,
//     images: [
//       "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1600585154154-0c6b3aee3a0f?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
//     ],
//   },
//   "303": {
//     id: "303",
//     title: "Studio — Marrakech Gueliz",
//     city: "Marrakech",
//     description:
//       "Studio meublé, quartier Gueliz, forte rotation courte durée. Idéal diversification.",
//     totalPriceMAD: 680000,
//     apr: 10.8,
//     mode: "SOLO",
//     images: [
//       "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1600585154154-0c6b3aee3a0f?q=80&w=1600&auto=format&fit=crop",
//     ],
//     closed: false,
//   },
// };

// /* ===== Hooks UI ===== */
// function useReveal() {
//   const ref = useRef<HTMLDivElement | null>(null);
//   useEffect(() => {
//     const el = ref.current!;
//     const obs = new IntersectionObserver(
//       (entries) => entries.forEach((x) => x.isIntersecting && el.classList.add("on")),
//       { threshold: 0.15 }
//     );
//     obs.observe(el);
//     return () => obs.disconnect();
//   }, []);
//   return ref;
// }
// function ripple(e: React.MouseEvent<HTMLButtonElement>) {
//   const host = e.currentTarget.querySelector(".rip") as HTMLDivElement;
//   if (!host) return;
//   host.classList.remove("show");
//   // @ts-ignore
//   void host.offsetWidth;
//   const span = host.firstElementChild as HTMLSpanElement;
//   const d = Math.max(host.clientWidth, host.clientHeight);
//   const rect = host.getBoundingClientRect();
//   span.style.width = span.style.height = `${d}px`;
//   span.style.left = `${e.clientX - rect.left - d / 2}px`;
//   span.style.top = `${e.clientY - rect.top - d / 2}px`;
//   host.classList.add("show");
// }
// function useParallax() {
//   const ref = useRef<HTMLImageElement | null>(null);
//   useEffect(() => {
//     const el = ref.current!;
//     const on = (ev: MouseEvent) => {
//       const r = el.getBoundingClientRect();
//       const cx = r.left + r.width / 2;
//       const cy = r.top + r.height / 2;
//       const dx = (ev.clientX - cx) / r.width;
//       const dy = (ev.clientY - cy) / r.height;
//       el.style.transform = `scale(1.05) translate(${dx * 10}px, ${dy * 10}px)`;
//     };
//     const off = () => (el.style.transform = "scale(1.02) translate(0,0)");
//     el.addEventListener("mousemove", on);
//     el.addEventListener("mouseleave", off);
//     return () => {
//       el.removeEventListener("mousemove", on);
//       el.removeEventListener("mouseleave", off);
//     };
//   }, []);
//   return ref;
// }

// /* ===== Helpers ===== */
// const fmtMAD = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " MAD";

// /* ===== Page ===== */
// export default function PropertyPage() {
//   const { id } = useParams();
//   const nav = useNavigate();
//   const loc = useLocation();

//   const property = DB[id || "101"] || DB["101"];
//   const reveal1 = useReveal();
//   const reveal2 = useReveal();
//   const reveal3 = useReveal();
//   const mainImgRef = useParallax();

//   // Auth mock (remplace par ton vrai contexte)
//   const isAuthed = typeof window !== "undefined" && localStorage.getItem("auth") === "1";

//   // Progress + status
//   const { progressPct, remainingMAD, status, availableLots } = useMemo(() => {
//     let funded = 0;
//     let target = property.totalPriceMAD;
//     let availableLots = 0;

//     if (property.mode === "COLLECTIF" && property.lotType === "FIXED") {
//       const sold = property.unitsSold || 0;
//       const total = property.unitsTotal || 0;
//       const unit = property.unitPriceMAD || 0;
//       funded = unit * sold;
//       target  = unit * total;
//       availableLots = Math.max(0, total - sold);
//     } else if (property.mode === "COLLECTIF" && property.lotType === "VARIABLE") {
//       funded = property.fundedMAD || 0;
//       target = property.targetMAD || property.totalPriceMAD;
//     } else {
//       funded = 0;
//       target = property.totalPriceMAD;
//     }

//     const pct = Math.max(0, Math.min(100, Math.round((funded / Math.max(1, target)) * 100)));
//     let st: Status = "OPEN";
//     if (property.closed) st = "CLOSED";
//     else if (pct >= 100) st = "FUNDED";

//     return {
//       progressPct: pct,
//       remainingMAD: Math.max(0, target - funded),
//       status: st,
//       availableLots,
//     };
//   }, [property]);

//   // Tabs
//   const [tab, setTab] = useState<"SOLO" | "COLLECTIF">(property.mode === "SOLO" ? "SOLO" : "COLLECTIF");

//   // Gallery
//   const [mainIdx, setMainIdx] = useState(0);
//   const main = property.images[mainIdx] || property.images[0];

//   // Simulator state
//   const [units, setUnits] = useState(1); // FIXED
//   const [amount, setAmount] = useState<number>(property.mode === "SOLO" ? property.totalPriceMAD : 10000);

//   // Clamp on tab change / id change
//   useEffect(() => {
//     if (tab === "SOLO") {
//       setAmount(property.totalPriceMAD);
//     } else if (property.lotType === "FIXED") {
//       setUnits(availableLots > 0 ? 1 : 0);
//     } else {
//       // VARIABLE : min 1000, max restant
//       setAmount((v) => Math.max(1000, Math.min(remainingMAD, v || 1000)));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tab, id, availableLots, remainingMAD]);

//   // Calcul simulation
//   const sim = useMemo(() => {
//     if (tab === "SOLO") {
//       const invest = property.totalPriceMAD;
//       return {
//         invest,
//         sharePct: 100,
//         yearlyReturn: (invest * property.apr) / 100,
//       };
//     }
//     if (property.lotType === "FIXED") {
//       const unitPrice = property.unitPriceMAD || 0;
//       const safeUnits = Math.max(0, Math.min(units, availableLots));
//       const invest = safeUnits * unitPrice;
//       const sharePct = (invest / Math.max(1, property.totalPriceMAD)) * 100;
//       return {
//         invest,
//         sharePct,
//         yearlyReturn: (invest * property.apr) / 100,
//       };
//     } else {
//       // VARIABLE
//       const invest = Math.max(0, Math.min(amount, remainingMAD));
//       const sharePct = (invest / Math.max(1, property.totalPriceMAD)) * 100;
//       return {
//         invest,
//         sharePct,
//         yearlyReturn: (invest * property.apr) / 100,
//       };
//     }
//   }, [tab, units, amount, property, remainingMAD, availableLots]);

//   // Progress animation
//   const barRef = useRef<HTMLSpanElement | null>(null);
//   useEffect(() => {
//     const el = barRef.current!;
//     requestAnimationFrame(() => {
//       el.style.width = `${progressPct}%`;
//     });
//   }, [progressPct]);

//   // Composition des params d'investissement
//   function buildInvestParams(): string {
//     if (tab === "SOLO") {
//       return `mode=SOLO`;
//     }
//     if (property.lotType === "FIXED") {
//       const safeUnits = Math.max(0, Math.min(units, availableLots));
//       return `mode=COLLECTIVE_FIXED&parts=${safeUnits}`;
//     }
//     // VARIABLE
//     const safeAmount = Math.max(0, Math.min(amount || 0, remainingMAD));
//     return `mode=COLLECTIVE_VAR&amount=${Math.round(safeAmount)}`;
//   }

//   // Redirection investir (protégé)
//  const goInvest = (e: React.MouseEvent<HTMLButtonElement>) => {
//   ripple(e);
//   const isAuthed = localStorage.getItem("token"); // adapte à ton auth
//   const url = `/wallet?next=invest&propertyId=${property.id}`;
//   if (!isAuthed) {
//     nav(`/signin?next=${encodeURIComponent(url)}`);
//     return;
//   }

//   nav(url);};

//   // déduire le mode depuis les onglets/lotType
//   const mode =
//     tab === "SOLO"
//       ? "SOLO"
//       : property.lotType === "FIXED"
//       ? "COLLECTIVE_FIXED"
//       : "COLLECTIVE_VAR";
// // helper
// // import { useNavigate } from "react-router-dom";

// // const nav = useNavigate();

// function onInvestClick() {
//   nav(`/wallet?next=invest&propertyId=villa-rabat-agdal`);
// }

// <button className="btn btnPrimary" onClick={onInvestClick}>
//   Investir dans ce bien
// </button>

// function toDashboardInvestURL(p: {
//   propertyId: string;
//   mode: "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";
//   amount?: number;   // pour SOLO ou VARIABLE
//   units?: number;    // pour FIXED
// }) {
//   const q = new URLSearchParams({
//     intent: "invest",
//     property: p.propertyId,
//     mode: p.mode,
//     ...(p.amount ? { amount: String(Math.max(0, Math.floor(p.amount))) } : {}),
//     ...(p.units  ? { units:  String(Math.max(0, Math.floor(p.units  ))) } : {}),
//   });
//   return `/dashboard?${q.toString()}`;
// }
//   const url = toDashboardInvestURL({
//     propertyId: property.id,
//     mode,
//     amount: tab === "SOLO" || property.lotType === "VARIABLE" ? sim.invest : undefined,
//     units:  property.lotType === "FIXED" ? units : undefined,
//   });

//   if (!isAuthed) {
//     // demander login puis revenir au dashboard avec l’intention
//     nav(`/signin?next=${encodeURIComponent(url)}`);
//     return;
//   }

//   // déjà connecté → va directement au dashboard
//   nav(url);
// };

//   const investDisabled =
//     status !== "OPEN" ||
//     (tab === "COLLECTIF" && sim.invest <= 0) ||
//     (tab === "COLLECTIF" && property.lotType === "FIXED" && availableLots === 0);

//   return (
//     <div>
//       <style>{css}</style>

//       {/* Head */}
//       <div className="head">
//         <div className="wrap">
//           <div className="breadcrumbs">
//             <Link to="/" className="badge">Accueil</Link>
//             <span>›</span>
//             <Link to="/properties" className="badge">Biens</Link>
//             <span>›</span>
//             <span className="badgeRed">#{property.id}</span>
//           </div>

//           <div className="titleRow">
//             <div>
//               <div className="kicker">Fiche bien — accès public</div>
//               <h1 className="h1">{property.title}</h1>
//               <div className="badges" style={{ marginTop: 6 }}>
//                 <span className="badge">📍 {property.city}</span>
//                 <span className="badge">APR cible {property.apr}%</span>
//                 <span className="badgeRed">
//                   {property.mode}
//                   {property.mode === "COLLECTIF" ? ` • ${property.lotType}` : ""}
//                 </span>
//               </div>
//             </div>
//             <div className="badges" style={{ alignSelf: "flex-start" }}>
//               <span className="badge">Prix total {fmtMAD(property.totalPriceMAD)}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       <main className="wrap body">
//         {/* LEFT — Galerie + Description */}
//         <div className="reveal" ref={reveal1 as any}>
//           <article className="card">
//             <div className="gallery section">
//               <div className="mainImgWrap">
//                 <img ref={mainImgRef as any} className="mainImg" src={main} alt={property.title} style={{ transform: "scale(1.02)" }} />
//               </div>
//               <div className="thumbs">
//                 {property.images.map((src, i) => (
//                   <button
//                     key={i}
//                     className="thumb"
//                     onClick={() => setMainIdx(i)}
//                     title={`Image ${i + 1}`}
//                   >
//                     <img src={src} alt={`thumb-${i}`} />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="section">
//               <h2 className="h2">Description</h2>
//               <p className="sub">{property.description}</p>
//             </div>
//           </article>
//         </div>

//         {/* RIGHT — Financement, Tabs, Simulateur, Sticky CTA */}
//         <div className="reveal" ref={reveal2 as any}>
//           <aside className="card">
//             <div className="section">
//               <h2 className="h2">Financement</h2>

//               <div className="infobar">
//                 <div className="infItem">
//                   <div className="key">Progression</div>
//                   <div className="val">{progressPct}%</div>
//                   <div className="progress"><span className="progressBar" ref={barRef} /></div>
//                 </div>
//                 <div className="infItem">
//                   <div className="key">Montant restant</div>
//                   <div className="val">{fmtMAD(remainingMAD)}</div>
//                 </div>
//               </div>

//               {/* Statut */}
//               <div className={`banner ${status === "OPEN" ? "open" : status === "FUNDED" ? "funded" : "closed"}`} style={{ marginTop: 10 }}>
//                 {status === "OPEN" && <>✅ Offre ouverte à la souscription.</>}
//                 {status === "FUNDED" && <>🟢 Objectif atteint. Souscription clôturée.</>}
//                 {status === "CLOSED" && <>⛔ Offre fermée par l’administrateur.</>}
//               </div>
//             </div>

//             {/* Tabs */}
//             <div className="tabs">
//               <button
//                 className={`tab ${tab === "SOLO" ? "active" : ""}`}
//                 onClick={() => setTab("SOLO")}
//                 disabled={property.mode === "COLLECTIF"}
//                 title={property.mode === "COLLECTIF" ? "Indisponible pour ce bien" : "Voir achat solo"}
//               >
//                 Achat Solo
//               </button>
//               <button
//                 className={`tab ${tab === "COLLECTIF" ? "active" : ""}`}
//                 onClick={() => setTab("COLLECTIF")}
//                 disabled={property.mode === "SOLO"}
//                 title={property.mode === "SOLO" ? "Indisponible pour ce bien" : "Voir achat collectif"}
//               >
//                 Achat Collectif
//               </button>
//             </div>

//             {/* Simulateur */}
//             <div className="section simGrid">
//               {tab === "SOLO" && (
//                 <>
//                   <div className="row">
//                     <div className="key">Montant</div>
//                     <div className="val">{fmtMAD(property.totalPriceMAD)}</div>
//                   </div>
//                   <div className="row">
//                     <div className="key">Part du bien</div>
//                     <div className="val">100%</div>
//                   </div>
//                   <div className="row">
//                     <div className="key">Rendement annuel estimé</div>
//                     <div className="val">{fmtMAD((property.totalPriceMAD * property.apr) / 100)}</div>
//                   </div>
//                   <div className="hint">* Simulation indicative (hors frais/impôts). Achat global réservé aux utilisateurs connectés.</div>
//                 </>
//               )}

//               {tab === "COLLECTIF" && property.lotType === "FIXED" && (
//                 <>
//                   <div className="row">
//                     <div className="key">Prix par lot</div>
//                     <div className="val">{fmtMAD(property.unitPriceMAD || 0)}</div>
//                   </div>
//                   <div className="row">
//                     <div className="key">Lots disponibles</div>
//                     <div className="val">
//                       {availableLots} / {property.unitsTotal}
//                     </div>
//                   </div>

//                   <label className="key">Sélectionnez des lots</label>
//                   <div className="inputWrap">
//                     <input
//                       className="input"
//                       type="number"
//                       min={0}
//                       max={availableLots}
//                       value={units}
//                       onChange={(e) => {
//                         const v = Number(e.target.value);
//                         setUnits(Number.isFinite(v) ? Math.max(0, Math.min(availableLots, Math.trunc(v))) : 0);
//                       }}
//                     />
//                     <span>lots</span>
//                   </div>

//                   <div className="row">
//                     <div className="key">Montant simulé</div>
//                     <div className="val">{fmtMAD(sim.invest)}</div>
//                   </div>
//                   <div className="row">
//                     <div className="key">Part estimée</div>
//                     <div className="val">{sim.sharePct.toFixed(2)}%</div>
//                   </div>
//                   <div className="row">
//                     <div className="key">Rendement annuel</div>
//                     <div className="val">{fmtMAD(sim.yearlyReturn)}</div>
//                   </div>
//                   <div className="hint">* La réservation vérifie la disponibilité (anti-dépassement) et bloque tes lots quelques minutes.</div>
//                 </>
//               )}

//               {tab === "COLLECTIF" && property.lotType === "VARIABLE" && (
//                 <>
//                   <div className="row">
//                     <div className="key">Montant min. conseillé</div>
//                     <div className="val">{fmtMAD(1000)}</div>
//                   </div>
//                   <label className="key">Saisissez votre montant</label>
//                   <div className="inputWrap">
//                     <input
//                       className="input"
//                       type="number"
//                       min={0}
//                       value={amount}
//                       onChange={(e) => {
//                         const v = Number(e.target.value);
//                         const capped = Number.isFinite(v) ? Math.max(0, Math.min(remainingMAD, Math.trunc(v))) : 0;
//                         setAmount(capped);
//                       }}
//                     />
//                     <span>MAD</span>
//                   </div>
//                   <div className="row">
//                     <div className="key">Montant validé (capé au restant)</div>
//                     <div className="val">{fmtMAD(sim.invest)}</div>
//                   </div>
//                   <div className="row">
//                     <div className="key">Part estimée</div>
//                     <div className="val">{sim.sharePct.toFixed(2)}%</div>
//                   </div>
//                   <div className="row">
//                     <div className="key">Rendement annuel</div>
//                     <div className="val">{fmtMAD(sim.yearlyReturn)}</div>
//                   </div>
//                   <div className="hint">* Le protocole “anti-dépassement” réserve ton montant pendant le paiement.</div>
//                 </>
//               )}
//             </div>

//             {/* Sticky CTA */}
//             <div className="section">
//               <div className="stickyBar">
//                 <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
//                   <div className="key">Simulation</div>
//                   <div className="val">{fmtMAD(sim.invest)} • {sim.sharePct.toFixed(2)}%</div>
//                 </div>
//                 <div style={{ display: "flex", gap: 8 }}>
//                   <button className="btn" onClick={(e) => ripple(e)}>
//                     Simuler encore
//                     <div className="rip"><span/></div>
//                   </button>
//                   <button className="btn btnPrimary" disabled={investDisabled} onClick={goInvest}>
//                     {status !== "OPEN" ? "Indisponible" : (isAuthed ? "Investir" : "Se connecter pour investir")}
//                     <div className="rip"><span/></div>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </aside>
//         </div>
//       </main>

//       {/* Related */}
//       <div className="wrap reveal" ref={reveal3 as any} style={{ padding: "0 0 28px" }}>
//         <div className="card section" style={{ borderStyle: "dashed" }}>
//           <div className="row" style={{ marginBottom: 8 }}>
//             <h2 className="h2" style={{ margin: 0 }}>Autres opportunités</h2>
//             <Link to="/properties" className="badge">Voir tout</Link>
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
//             {Object.values(DB)
//               .filter((p) => p.id !== property.id)
//               .slice(0, 3)
//               .map((p) => (
//                 <Link key={p.id} to={`/properties/${p.id}`} className="card" style={{ overflow: "hidden" }}>
//                   <div style={{ height: 120, overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
//                     <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
//                   </div>
//                   <div className="section">
//                     <div className="row">
//                       <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</b>
//                       <span className="badge">APR {p.apr}%</span>
//                     </div>
//                     <div className="sub">📍 {p.city}</div>
//                   </div>
//                 </Link>
//               ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// immo-web/src/pages/PropertyPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/* ─────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
type Status = "OPEN" | "FUNDED" | "CLOSED";
type Mode = "SOLO" | "COLLECTIF";
type Lots = "FIXED" | "VARIABLE";

type Property = {
  id: string;
  title: string;
  city: string;
  description: string;
  totalPriceMAD: number;
  apr: number; // % annuel cible
  mode: Mode;
  lotType?: Lots;
  images: string[];
  // Financement
  unitsTotal?: number;     // FIXED
  unitPriceMAD?: number;   // prix/lot (FIXED)
  unitsSold?: number;
  fundedMAD?: number;      // VARIABLE
  targetMAD?: number;      // VARIABLE (sinon = totalPriceMAD)
  // Overrides statut
  closed?: boolean;
};

/* ─────────────────────────────────────────────
   Styles CSS (locaux à la page)
────────────────────────────────────────────── */
const css = `
:root{
  --bg:#ffffff; --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
  --red:#e11d2e; --red-700:#be123c; --chip:#fff2f3; --glass:rgba(255,255,255,.78);
}
*{box-sizing:border-box} html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial}
a{text-decoration:none;color:inherit}
button{font-family:inherit}
.wrap{max-width:1160px;margin:0 auto;padding:0 20px}

/* Head */
.head{border-bottom:1px solid var(--line);background:linear-gradient(180deg,#fff, #fff 70%, #fff0 100%)}
.breadcrumbs{display:flex;gap:10px;align-items:center;color:var(--sub);font-size:12px;padding:14px 0}
.titleRow{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:6px 0 14px}
.h1{margin:0;font-size:clamp(24px,3.5vw,36px);font-weight:900;letter-spacing:-.01em}
.badges{display:flex;gap:8px;flex-wrap:wrap}
.badge{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 8px;background:#fff;color:var(--sub);font-weight:800}
.badgeRed{border-color:#fecaca;background:#fff1f2;color:#a71a2b}
.kicker{font-size:12px;color:var(--sub)}

/* Grid body */
.body{display:grid;grid-template-columns:1.15fr .85fr;gap:16px;padding:16px 0 24px}
@media (max-width: 980px){.body{grid-template-columns:1fr}}

.card{border:1px solid var(--line);border-radius:16px;background:#fff;overflow:hidden}
.section{padding:14px 14px 12px}
.h2{margin:0 0 6px;font-size:18px;font-weight:900}
.sub{color:var(--sub);font-size:13px}

/* Gallery */
.gallery{display:grid;grid-template-columns:1fr;gap:8px;padding:8px}
.mainImgWrap{position:relative;border:1px solid var(--line);border-radius:14px;overflow:hidden;height:360px;background:var(--glass);backdrop-filter:saturate(150%) blur(8px)}
.mainImg{width:100%;height:100%;object-fit:cover;transition:transform .25s ease}
.thumbs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.thumb{height:64px;border:1px solid var(--line);border-radius:10px;overflow:hidden;cursor:pointer;opacity:.9}
.thumb:hover{opacity:1}
.thumb>img{width:100%;height:100%;object-fit:cover}

/* Progress + status */
.infobar{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.infItem{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff}
.key{font-size:12px;color:var(--sub);font-weight:800}
.val{font-weight:900}
.progress{margin-top:6px;width:100%;height:10px;border-radius:999px;background:#f1f5f9;overflow:hidden}
.progressBar{height:100%;background:linear-gradient(90deg,#fecaca,#dc2626);width:0%;transition:width .6s cubic-bezier(.22,1,.36,1)}

.banner{border-top:1px dashed var(--line);padding:12px;margin-top:10px;font-size:13px}
.banner.open{background:#fff}
.banner.funded{background:#ecfdf5;border:1px solid #bbf7d0;color:#065f46;border-radius:12px}
.banner.closed{background:#f8fafc;border:1px solid #e5e7eb;color:#475569;border-radius:12px}

/* Tabs + simulate */
.tabs{display:flex;gap:8px;border-bottom:1px solid var(--line);padding:0 12px}
.tab{border:none;background:transparent;padding:12px 10px;font-weight:900;color:var(--sub);cursor:pointer;border-bottom:2px solid transparent}
.tab.active{color:var(--ink);border-bottom-color:var(--red)}
.simGrid{display:grid;gap:10px}
.row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.inputWrap{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff}
.input{border:none;outline:none;background:transparent;font-size:16px;width:100%}
.hint{color:var(--sub);font-size:12px}

/* CTA buttons */
.btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:12px 14px;border-radius:12px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink)}
.btnPrimary{background:var(--red);border-color:var(--red);color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
.btnPrimary:hover{transform:translateY(-1px);background:var(--red-700);border-color:var(--red-700)}
.btnGhost{background:#fff}
.btn:disabled{opacity:.6;cursor:not-allowed}
.rip{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none}
.rip>span{position:absolute;width:12px;height:12px;background:rgba(255,255,255,.75);border-radius:999px;transform:scale(0);opacity:.95}
.rip.show>span{animation:r .6s ease-out forwards}
@keyframes r{to{transform:scale(18);opacity:0}}

/* Sticky action bar */
.stickyBar{position:sticky;bottom:0;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.86);backdrop-filter:saturate(150%) blur(8px);padding:10px;display:flex;align-items:center;justify-content:space-between;gap:12px}

/* Reveal */
.reveal{opacity:0;transform:translateY(8px);transition:opacity .35s ease, transform .35s ease}
.on{opacity:1;transform:translateY(0)}
`;

/* ─────────────────────────────────────────────
   Données mock (remplace par fetch API si tu veux)
────────────────────────────────────────────── */
const DB: Record<string, Property> = {
  "101": {
    id: "101",
    title: "F3 — Casablanca Centre",
    city: "Casablanca",
    description:
      "Appartement F3 lumineux, centre-ville, proche tram. Idéal locatif à forte demande. Rénovation récente, cuisine équipée, balcon.",
    totalPriceMAD: 1000000,
    apr: 9.2,
    mode: "COLLECTIF",
    lotType: "FIXED",
    unitsTotal: 10,
    unitPriceMAD: 100000,
    unitsSold: 6,
    images: [
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
    ],
  },
  "202": {
    id: "202",
    title: "Villa — Rabat Agdal",
    city: "Rabat",
    description:
      "Villa familiale quartier Agdal, jardin privatif, rendement stable via bail longue durée.",
    totalPriceMAD: 3000000,
    apr: 8.0,
    mode: "COLLECTIF",
    lotType: "VARIABLE",
    targetMAD: 3000000,
    fundedMAD: 1320000,
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154154-0c6b3aee3a0f?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
    ],
  },
  "303": {
    id: "303",
    title: "Studio — Marrakech Gueliz",
    city: "Marrakech",
    description:
      "Studio meublé, quartier Gueliz, forte rotation courte durée. Idéal diversification.",
    totalPriceMAD: 680000,
    apr: 10.8,
    mode: "SOLO",
    images: [
      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154154-0c6b3aee3a0f?q=80&w=1600&auto=format&fit=crop",
    ],
    closed: false,
  },
};

/* ─────────────────────────────────────────────
   Hooks UI utilitaires
────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current!;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((x) => x.isIntersecting && el.classList.add("on")),
      { threshold: 0.15 }
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
  const ref = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const el = ref.current!;
    const on = (ev: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (ev.clientX - cx) / r.width;
      const dy = (ev.clientY - cy) / r.height;
      el.style.transform = `scale(1.05) translate(${dx * 10}px, ${dy * 10}px)`;
    };
    const off = () => (el.style.transform = "scale(1.02) translate(0,0)");
    el.addEventListener("mousemove", on);
    el.addEventListener("mouseleave", off);
    return () => {
      el.removeEventListener("mousemove", on);
      el.removeEventListener("mouseleave", off);
    };
  }, []);
  return ref;
}

/* ─────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
const fmtMAD = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " MAD";

/* ─────────────────────────────────────────────
   Page
────────────────────────────────────────────── */
export default function PropertyPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const property = DB[id || "101"] || DB["101"];

  const reveal1 = useReveal();
  const reveal2 = useReveal();
  const reveal3 = useReveal();
  const mainImgRef = useParallax();

  // Auth mock (remplace par ton vrai contexte)
  const isAuthed = typeof window !== "undefined" && !!localStorage.getItem("token");

  // Progress + status
  const { progressPct, remainingMAD, status, availableLots } = useMemo(() => {
    let funded = 0;
    let target = property.totalPriceMAD;
    let availableLots = 0;

    if (property.mode === "COLLECTIF" && property.lotType === "FIXED") {
      const sold = property.unitsSold ?? 0;
      const total = property.unitsTotal ?? 0;
      const unit = property.unitPriceMAD ?? 0;
      funded = unit * sold;
      target  = unit * total;
      availableLots = Math.max(0, total - sold);
    } else if (property.mode === "COLLECTIF" && property.lotType === "VARIABLE") {
      funded = property.fundedMAD ?? 0;
      target = property.targetMAD ?? property.totalPriceMAD;
    } else {
      funded = 0;
      target = property.totalPriceMAD;
    }

    const pct = Math.max(0, Math.min(100, Math.round((funded / Math.max(1, target)) * 100)));
    let st: Status = "OPEN";
    if (property.closed) st = "CLOSED";
    else if (pct >= 100) st = "FUNDED";

    return {
      progressPct: pct,
      remainingMAD: Math.max(0, target - funded),
      status: st,
      availableLots,
    };
  }, [property]);

  // Onglet affiché pour le simulateur
  const [tab, setTab] = useState<"SOLO" | "COLLECTIF">(property.mode === "SOLO" ? "SOLO" : "COLLECTIF");

  // Galerie
  const [mainIdx, setMainIdx] = useState(0);
  const main = property.images[mainIdx] || property.images[0];

  // State simulateur
  const [units, setUnits] = useState(1); // FIXED
  const [amount, setAmount] = useState<number>(property.mode === "SOLO" ? property.totalPriceMAD : 10000);

  // Ajustements lors des changements d’onglet/id
  useEffect(() => {
    if (tab === "SOLO") {
      setAmount(property.totalPriceMAD);
    } else if (property.lotType === "FIXED") {
      setUnits(availableLots > 0 ? 1 : 0);
    } else {
      // VARIABLE : min 1000, max restant
      setAmount((v) => Math.max(1000, Math.min(remainingMAD, v || 1000)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, id, availableLots, remainingMAD]);

  // Simulation affichée
  const sim = useMemo(() => {
    if (tab === "SOLO") {
      const invest = property.totalPriceMAD;
      return {
        invest,
        sharePct: 100,
        yearlyReturn: (invest * property.apr) / 100,
      };
    }
    if (property.lotType === "FIXED") {
      const unitPrice = property.unitPriceMAD || 0;
      const safeUnits = Math.max(0, Math.min(units, availableLots));
      const invest = safeUnits * unitPrice;
      const sharePct = (invest / Math.max(1, property.totalPriceMAD)) * 100;
      return {
        invest,
        sharePct,
        yearlyReturn: (invest * property.apr) / 100,
      };
    } else {
      // VARIABLE
      const invest = Math.max(0, Math.min(amount, remainingMAD));
      const sharePct = (invest / Math.max(1, property.totalPriceMAD)) * 100;
      return {
        invest,
        sharePct,
        yearlyReturn: (invest * property.apr) / 100,
      };
    }
  }, [tab, units, amount, property, remainingMAD, availableLots]);

  // Progress bar anim
  const barRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = barRef.current!;
    requestAnimationFrame(() => {
      el.style.width = `${progressPct}%`;
    });
  }, [progressPct]);

  // CTA Investir → Wallet + modale
  const DEV_BYPASS_AUTH = true;
  const goInvest = (e: React.MouseEvent<HTMLButtonElement>) => {
  const mode =
    tab === "SOLO"
      ? "SOLO"
      : property.lotType === "FIXED"
      ? "COLLECTIVE_FIXED"
      : "COLLECTIVE_VAR";

  const imageUrl = property.images?.[0] || "";   // <— 1ère image
  const propertyTitle = property.title;          // <— titre du bien

  const search = new URLSearchParams({
    propertyId: property.id,
    mode,
    ...(mode === "COLLECTIVE_FIXED"
      ? { units: String(units) }
      : { amount: String(sim.invest) }),
    propertyTitle,                               // <— NEW
    imageUrl,                                    // <— NEW
  }).toString();

  nav(`/invest/checkout?${search}`);
};




  const investDisabled =
    status !== "OPEN" ||
    (tab === "COLLECTIF" && sim.invest <= 0) ||
    (tab === "COLLECTIF" && property.lotType === "FIXED" && availableLots === 0);

  return (
    <div>
      <style>{css}</style>

      {/* Head */}
      <div className="head">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link to="/" className="badge">Accueil</Link>
            <span>›</span>
            <Link to="/properties" className="badge">Biens</Link>
            <span>›</span>
            <span className="badgeRed">#{property.id}</span>
          </div>

          <div className="titleRow">
            <div>
              <div className="kicker">Fiche bien — accès public</div>
              <h1 className="h1">{property.title}</h1>
              <div className="badges" style={{ marginTop: 6 }}>
                <span className="badge">📍 {property.city}</span>
                <span className="badge">APR cible {property.apr}%</span>
                <span className="badgeRed">
                  {property.mode}
                  {property.mode === "COLLECTIF" ? ` • ${property.lotType}` : ""}
                </span>
              </div>
            </div>
            <div className="badges" style={{ alignSelf: "flex-start" }}>
              <span className="badge">Prix total {fmtMAD(property.totalPriceMAD)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="wrap body">
        {/* LEFT — Galerie + Description */}
        <div className="reveal" ref={reveal1 as any}>
          <article className="card">
            <div className="gallery section">
              <div className="mainImgWrap">
                <img ref={mainImgRef as any} className="mainImg" src={main} alt={property.title} style={{ transform: "scale(1.02)" }} />
              </div>
              <div className="thumbs">
                {property.images.map((src, i) => (
                  <button
                    key={i}
                    className="thumb"
                    onClick={() => setMainIdx(i)}
                    title={`Image ${i + 1}`}
                  >
                    <img src={src} alt={`thumb-${i}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="section">
              <h2 className="h2">Description</h2>
              <p className="sub">{property.description}</p>
            </div>
          </article>
        </div>

        {/* RIGHT — Financement, Tabs, Simulateur, Sticky CTA */}
        <div className="reveal" ref={reveal2 as any}>
          <aside className="card">
            <div className="section">
              <h2 className="h2">Financement</h2>

              <div className="infobar">
                <div className="infItem">
                  <div className="key">Progression</div>
                  <div className="val">{progressPct}%</div>
                  <div className="progress"><span className="progressBar" ref={barRef} /></div>
                </div>
                <div className="infItem">
                  <div className="key">Montant restant</div>
                  <div className="val">{fmtMAD(remainingMAD)}</div>
                </div>
              </div>

              {/* Statut */}
              <div className={`banner ${status === "OPEN" ? "open" : status === "FUNDED" ? "funded" : "closed"}`} style={{ marginTop: 10 }}>
                {status === "OPEN" && <>✅ Offre ouverte à la souscription.</>}
                {status === "FUNDED" && <>🟢 Objectif atteint. Souscription clôturée.</>}
                {status === "CLOSED" && <>⛔ Offre fermée par l’administrateur.</>}
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${tab === "SOLO" ? "active" : ""}`}
                onClick={() => setTab("SOLO")}
                disabled={property.mode === "COLLECTIF"}
                title={property.mode === "COLLECTIF" ? "Indisponible pour ce bien" : "Voir achat solo"}
              >
                Achat Solo
              </button>
              <button
                className={`tab ${tab === "COLLECTIF" ? "active" : ""}`}
                onClick={() => setTab("COLLECTIF")}
                disabled={property.mode === "SOLO"}
                title={property.mode === "SOLO" ? "Indisponible pour ce bien" : "Voir achat collectif"}
              >
                Achat Collectif
              </button>
            </div>

            {/* Simulateur */}
            <div className="section simGrid">
              {tab === "SOLO" && (
                <>
                  <div className="row">
                    <div className="key">Montant</div>
                    <div className="val">{fmtMAD(property.totalPriceMAD)}</div>
                  </div>
                  <div className="row">
                    <div className="key">Part du bien</div>
                    <div className="val">100%</div>
                  </div>
                  <div className="row">
                    <div className="key">Rendement annuel estimé</div>
                    <div className="val">{fmtMAD((property.totalPriceMAD * property.apr) / 100)}</div>
                  </div>
                  <div className="hint">* Simulation indicative (hors frais/impôts). Achat global réservé aux utilisateurs connectés.</div>
                </>
              )}

              {tab === "COLLECTIF" && property.lotType === "FIXED" && (
                <>
                  <div className="row">
                    <div className="key">Prix par lot</div>
                    <div className="val">{fmtMAD(property.unitPriceMAD || 0)}</div>
                  </div>
                  <div className="row">
                    <div className="key">Lots disponibles</div>
                    <div className="val">
                      {availableLots} / {property.unitsTotal}
                    </div>
                  </div>

                  <label className="key">Sélectionnez des lots</label>
                  <div className="inputWrap">
                    <input
                      className="input"
                      type="number"
                      min={0}
                      max={availableLots}
                      value={units}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setUnits(Number.isFinite(v) ? Math.max(0, Math.min(availableLots, Math.trunc(v))) : 0);
                      }}
                    />
                    <span>lots</span>
                  </div>

                  <div className="row">
                    <div className="key">Montant simulé</div>
                    <div className="val">{fmtMAD(sim.invest)}</div>
                  </div>
                  <div className="row">
                    <div className="key">Part estimée</div>
                    <div className="val">{sim.sharePct.toFixed(2)}%</div>
                  </div>
                  <div className="row">
                    <div className="key">Rendement annuel</div>
                    <div className="val">{fmtMAD(sim.yearlyReturn)}</div>
                  </div>
                  <div className="hint">* La réservation vérifie la disponibilité (anti-dépassement) et bloque tes lots quelques minutes.</div>
                </>
              )}

              {tab === "COLLECTIF" && property.lotType === "VARIABLE" && (
                <>
                  <div className="row">
                    <div className="key">Montant min. conseillé</div>
                    <div className="val">{fmtMAD(1000)}</div>
                  </div>
                  <label className="key">Saisissez votre montant</label>
                  <div className="inputWrap">
                    <input
                      className="input"
                      type="number"
                      min={0}
                      value={amount}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const capped = Number.isFinite(v) ? Math.max(0, Math.min(remainingMAD, Math.trunc(v))) : 0;
                        setAmount(capped);
                      }}
                    />
                    <span>MAD</span>
                  </div>
                  <div className="row">
                    <div className="key">Montant validé (capé au restant)</div>
                    <div className="val">{fmtMAD(sim.invest)}</div>
                  </div>
                  <div className="row">
                    <div className="key">Part estimée</div>
                    <div className="val">{sim.sharePct.toFixed(2)}%</div>
                  </div>
                  <div className="row">
                    <div className="key">Rendement annuel</div>
                    <div className="val">{fmtMAD(sim.yearlyReturn)}</div>
                  </div>
                  <div className="hint">* Le protocole “anti-dépassement” réserve ton montant pendant le paiement.</div>
                </>
              )}
            </div>

            {/* Sticky CTA */}
            <div className="section">
              <div className="stickyBar">
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div className="key">Simulation</div>
                  <div className="val">{fmtMAD(sim.invest)} • {sim.sharePct.toFixed(2)}%</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" onClick={(e) => ripple(e)}>
                    Simuler encore
                    <div className="rip"><span/></div>
                  </button>
                  <button className="btn btnPrimary" disabled={investDisabled} onClick={goInvest}>
                    {status !== "OPEN" ? "Indisponible" : (isAuthed ? "Investir" : "Se connecter pour investir")}
                    <div className="rip"><span/></div>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Related */}
      <div className="wrap reveal" ref={reveal3 as any} style={{ padding: "0 0 28px" }}>
        <div className="card section" style={{ borderStyle: "dashed" }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <h2 className="h2" style={{ margin: 0 }}>Autres opportunités</h2>
            <Link to="/properties" className="badge">Voir tout</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
            {Object.values(DB)
              .filter((p) => p.id !== property.id)
              .slice(0, 3)
              .map((p) => (
                <Link key={p.id} to={`/properties/${p.id}`} className="card" style={{ overflow: "hidden" }}>
                  <div style={{ height: 120, overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
                    <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div className="section">
                    <div className="row">
                      <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</b>
                      <span className="badge">APR {p.apr}%</span>
                    </div>
                    <div className="sub">📍 {p.city}</div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
