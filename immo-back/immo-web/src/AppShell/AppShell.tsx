// // src/AppShell.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

// /** Menu */
// type MenuItem = { path: string; label: string; icon: React.ReactNode; title?: string };
// const MENU: MenuItem[] = [
//   { path: "/dashboard", label: "Dashboard", icon: <span>📊</span> },
//   { path: "/Wallet",          label: "Wallet",    icon: <span>💼</span> },
//   { path: "/offers", label: "Offers", icon: <span>🏷️</span> },

//   { path: "/tokens",    label: "Tokens",    icon: <span>🪙</span> },
//   { path: "/deposit",   label: "Deposit",   icon: <span>➕</span> },
//   { path: "/withdraw",  label: "Withdraw",  icon: <span>⬆</span> },
//   { path: "/transfer",  label: "Transfer",  icon: <span>⇄</span> },
//   { path: "/activity",  label: "Activity",  icon: <span>📜</span> },
//   { path: "/settings",  label: "Settings",  icon: <span>⚙️</span> },
// ];

// export default function AppShell() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // état «sidebar ouverte/compacte» gardé en localStorage
//   const [open, setOpen] = useState<boolean>(() => {
//     const raw = localStorage.getItem("shell_open");
//     return raw ? raw === "1" : true;
//   });
//   useEffect(() => localStorage.setItem("shell_open", open ? "1" : "0"), [open]);

//   // titre courant
//   const title = useMemo(() => {
//     const current = MENU.find((m) => m.path === location.pathname);
//     return current?.label ?? "Invest-Immo";
//   }, [location.pathname]);

//   // ripple léger pour CTA
//   const ripple = (e: React.MouseEvent<HTMLButtonElement>) => {
//     const host = e.currentTarget;
//     const r = document.createElement("span");
//     r.className = "rip";
//     const d = Math.max(host.clientWidth, host.clientHeight);
//     const rect = host.getBoundingClientRect();
//     r.style.width = r.style.height = `${d}px`;
//     r.style.left = `${e.clientX - rect.left - d / 2}px`;
//     r.style.top = `${e.clientY - rect.top - d / 2}px`;
//     host.appendChild(r);
//     setTimeout(() => r.remove(), 550);
//   };

//   return (
//     <>
//       {/* Fonts + thème */}
//       <style>{CSS}</style>

//       <div className="shell">
//         {/* Sidebar */}
//         <aside className={`side ${open ? "open" : "shrink"}`}>
//           <div className="brand">
//             <div className="dot" />
//             {open && <div className="brandName">Invest-Immo</div>}
//             <button
//               className="toggle"
//               onClick={() => setOpen((o) => !o)}
//               aria-label={open ? "Collapse" : "Expand"}
//               title={open ? "Collapse" : "Expand"}
//             >
//               {open ? "«" : "»"}
//             </button>
//           </div>

//           <nav className="nav">
//             {MENU.map((m) => (
//               <NavLink
//                 key={m.path}
//                 to={m.path}
//                 title={open ? undefined : m.label}
//                 className={({ isActive }) =>
//                   `navItem ${isActive ? "active" : ""} ${open ? "" : "compact"}`
//                 }
//               >
//                 <span className="navIcon">{m.icon}</span>
//                 {open && <span className="navLabel">{m.label}</span>}
//                 <span className="activeBar" />
//               </NavLink>
//             ))}
//           </nav>

//           <div className="sideFoot">© {new Date().getFullYear()}</div>
//         </aside>

//         {/* Main */}
//         <main className="main">
//           {/* Topbar */}
//           <header className="top">
//             <div className="crumb">
//               <div className="miniLogo" />
//               <b className="app">Invest-Immo</b>
//               <span className="sep" />
//               <span className="page">{title}</span>
//             </div>

//             <div className="tools">
//               <div className="search">
//                 <span className="loupe">🔎</span>
//                 <input className="input" placeholder="Search…" />
//               </div>

//               <div className="chip">
//                 <span>🌐</span>
//                 <select className="sel" defaultValue="sepolia" aria-label="Network">
//                   <option value="sepolia">Sepolia</option>
//                   <option value="mainnet">Ethereum</option>
//                   <option value="polygon">Polygon</option>
//                 </select>
//               </div>

//               <button className="cta ghost" onClick={(e) => { ripple(e); navigate("/deposit"); }}>
//                 Deposit
//               </button>
//               <button className="cta ghost" onClick={(e) => { ripple(e); navigate("/transfer"); }}>
//                 Transfer
//               </button>
//               <button className="cta primary" onClick={(e) => { ripple(e); window.print(); }}>
//                 Export
//               </button>
//             </div>
//           </header>

//           {/* Contenu centré */}
//           <div className="content">
//             <div className="container">
//               <Outlet />
//             </div>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }

// /* ————— CSS — Rouge/Gris + Inter/Morena + animations ————— */
// const CSS = `
// /* Polices : Inter (Google) + fallback de Morena (Playfair/Georgia) */
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap');

// :root{
//   --font-title: 'Morena', 'Playfair Display', Georgia, serif;
//   --font-body: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;

//   /* Rouge & Gris */
//   --bg:#f6f7fb; --card:#ffffff; --ink:#1a1a1a; --sub:#6b7280; --line:#e5e7eb;
//   --pri:#dc2626; --pri-2:#b91c1c; --acc:#ef4444;
//   --side:#0f172a; --side-2:#111827; --side-line:#1f2937;
// }

// /* Base */
// *{box-sizing:border-box}
// html,body,#root{height:100%}
// body{margin:0; background:var(--bg); color:var(--ink); font-family:var(--font-body)}

// /* Layout */
// .shell{min-height:100vh; display:grid; grid-template-columns:240px 1fr; background:var(--bg)}
// .side{position:sticky; top:0; height:100vh; display:grid; grid-template-rows:auto 1fr auto; background:var(--side); color:#e5e7eb; transition:width .18s ease}
// .side.open{width:240px}
// .side.shrink{width:72px}
// @media (max-width: 1040px){ .shell{grid-template-columns:72px 1fr} .side{width:72px !important} }

// .brand{display:flex; align-items:center; gap:10px; padding:14px 12px; border-bottom:1px solid var(--side-line)}
// .dot{width:12px; height:12px; border-radius:999px; background:linear-gradient(120deg, var(--pri), var(--acc))}
// .brandName{font-weight:900; letter-spacing:.2px; font-family:var(--font-title)}
// .toggle{margin-left:auto; width:34px; height:34px; border-radius:10px; border:1px solid #334155; background:var(--side-2); color:#cbd5e1; cursor:pointer}

// .nav{padding:10px; display:grid; gap:6px}
// .navItem{position:relative; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; color:#cbd5e1; text-decoration:none; border:1px solid transparent; transition:background .12s ease, color .12s ease}
// .navItem:hover{background:#101827}
// .navItem.active{background:#141c2a; color:#fff; border-color:#2b3547}
// .navItem.compact{justify-content:center}
// .navIcon{width:32px; height:32px; border-radius:10px; display:grid; place-items:center; background:#111827; border:1px solid #334155; font-size:16px}
// .navLabel{font-weight:700}
// .activeBar{position:absolute; left:-10px; top:8px; bottom:8px; width:4px; border-radius:4px; background:linear-gradient(180deg,var(--pri),var(--acc)); opacity:0; transform:translateX(-6px); transition:all .14s ease}
// .navItem.active .activeBar{opacity:1; transform:translateX(0)}

// .sideFoot{padding:12px; border-top:1px solid var(--side-line); font-size:12px; color:#94a3b8}

// /* Main/topbar */
// .main{display:grid; grid-template-rows:64px 1fr}
// .top{position:sticky; top:0; z-index:1; display:flex; align-items:center; gap:12px;
//   padding:10px 16px; border-bottom:1px solid #fde2e2;
//   background:linear-gradient(180deg, #fff, #fff9f9)}
// .crumb{display:flex; align-items:center; gap:10px; min-width:0}
// .miniLogo{width:10px; height:10px; border-radius:999px; background:linear-gradient(120deg, var(--pri), var(--acc))}
// .app{color:#1b1b1b; font-family:var(--font-title); letter-spacing:.2px}
// .sep{width:2px; height:18px; background:#fca5a5; border-radius:2px; opacity:.6}
// .page{font-weight:900; color:#9a1c1c; font-family:var(--font-title)}
// .tools{margin-left:auto; display:flex; gap:8px; align-items:center}
// .search{display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #fecaca; border-radius:12px; padding:8px 10px; min-width:260px}
// .search .input{border:none; outline:none; flex:1; background:transparent; font-size:14px; color:#1f2937; font-family:var(--font-body)}
// .chip{display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #fecaca; border-radius:12px; padding:8px 10px}
// .sel{border:none; outline:none; background:transparent; color:#1f2937; font-weight:800; font-family:var(--font-body)}

// /* CTA buttons */
// .cta{position:relative; overflow:hidden; border-radius:12px; padding:9px 12px; font-weight:900; cursor:pointer; transition:transform .05s ease; font-family:var(--font-body)}
// .cta:active{transform:scale(.98)}
// .cta.primary{border:1px solid var(--pri); color:#fff; background:linear-gradient(135deg, var(--pri), var(--acc))}
// .cta.ghost{border:1px solid var(--pri); color:var(--pri); background:transparent}
// .cta .rip{position:absolute; pointer-events:none; border-radius:9999px; transform:scale(0); background:rgba(255,255,255,.6); animation:ripple .55s ease-out forwards}
// @keyframes ripple{to{transform:scale(20); opacity:0}}

// /* Content */
// .content{padding:16px; display:grid; justify-items:center; overflow:auto}
// .container{width:100%; max-width:1200px}

// /* Accessibilité : focus visibles */
// button:focus-visible, select:focus-visible, input:focus-visible{outline:2px solid #fecaca; outline-offset:2px; border-radius:10px}
// `;
// src/AppShell.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

/* ---------------- Menu ---------------- */
type IconName =
  | "chart" | "wallet" | "tag" | "token" | "plus"
  | "arrowUp" | "swap" | "doc" | "gear" | "collapse" | "expand" | "search" | "globe";

type MenuItem = { path: string; label: string; icon: IconName; title?: string };

const MENU: MenuItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: "chart" },
  { path: "/wallet",    label: "Wallet",    icon: "wallet" },
  { path: "/offers",    label: "Offers",    icon: "tag" },
  { path: "/tokens",    label: "Tokens",    icon: "token" },
  { path: "/deposit",   label: "Deposit",   icon: "plus" },
  { path: "/withdraw",  label: "Withdraw",  icon: "arrowUp" },
  { path: "/transfer",  label: "Transfer",  icon: "swap" },
  { path: "/activity",  label: "Activity",  icon: "doc" },
  { path: "/settings",  label: "Settings",  icon: "gear" },
];

/* ---------------- Shell ---------------- */
export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState<boolean>(() => {
    const raw = localStorage.getItem("shell_open");
    return raw ? raw === "1" : true;
  });
  // rehausse l'ombre de la sidebar quand la page est scrollée
useEffect(() => {
  const side = document.querySelector<HTMLElement>('.side');
  if (!side) return;

  let raf = 0;
  let mx = 0.5, my = 0.1;        // position halo (0..1)
  let tmx = mx, tmy = my;        // cibles pour easing
  let elev = 0;                  // pour faire “respirer” le dégradé

  // halo suit la souris avec easing
  const onMove = (e: MouseEvent) => {
    const r = side.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width;
    tmy = (e.clientY - r.top) / r.height;
  };

  // léger shift du milieu du dégradé selon le scroll (0→+6%)
  const onScroll = () => {
    const y = Math.min(1, Math.max(0, window.scrollY / 400));
    elev = y * 6; // % ajouté à la bande “Mid”
    side.style.setProperty('--elev', `${elev}%`);
  };

  // boucle d’animation
  const loop = () => {
    // easing expo
    mx += (tmx - mx) * 0.08;
    my += (tmy - my) * 0.08;

    side.style.setProperty('--mx', `${(mx * 100).toFixed(2)}%`);
    side.style.setProperty('--my', `${(my * 100).toFixed(2)}%`);

    raf = requestAnimationFrame(loop);
  };

  // init + listeners
  onScroll();
  loop();
  side.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    cancelAnimationFrame(raf);
    side.removeEventListener('pointermove', onMove);
    window.removeEventListener('scroll', onScroll);
  };
}, []);

  const title = useMemo(() => {
    const current = MENU.find((m) => m.path.toLowerCase() === location.pathname.toLowerCase());
    return current?.label ?? "Invest-Immo";
  }, [location.pathname]);

  const ripple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const host = e.currentTarget;
    const r = document.createElement("span");
    r.className = "rip";
    const d = Math.max(host.clientWidth, host.clientHeight);
    const rect = host.getBoundingClientRect();
    r.style.width = r.style.height = `${d}px`;
    r.style.left = `${e.clientX - rect.left - d / 2}px`;
    r.style.top = `${e.clientY - rect.top - d / 2}px`;
    host.appendChild(r);
    setTimeout(() => r.remove(), 520);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* Sidebar */}
        <aside className={`side ${open ? "open" : "shrink"}`}>
          <div className="brand">
            <div className="logo">
              <span className="dot" />
            </div>
            {open && <div className="brandName">Invest-Immo</div>}
            <button
              className="toggle"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Réduire" : "Déployer"}
              title={open ? "Réduire" : "Déployer"}
            >
              <Icon name={open ? "collapse" : "expand"} />
            </button>
          </div>

          <nav className="nav" aria-label="Navigation principale">
            {MENU.map((m) => (
              <NavLink
                key={m.path}
                to={m.path}
                title={open ? undefined : m.label}
                className={({ isActive }) =>
                  `navItem ${isActive ? "active" : ""} ${open ? "" : "compact"}`
                }
                data-tooltip={!open ? m.label : undefined}
              >
                <span className="navIcon"><Icon name={m.icon} /></span>
                {open && <span className="navLabel">{m.label}</span>}
                <span className="activeBar" />
              </NavLink>
            ))}
          </nav>

          <div className="sideFoot">© {new Date().getFullYear()}</div>
        </aside>

        {/* Main */}
        <main className="main">
          <header className="top" role="banner">
            <div className="crumb" aria-label="Fil d’ariane">
              <div className="miniLogo" />
              <b className="app">Invest-Immo</b>
              <span className="sep" />
              <span className="page">{title}</span>
            </div>

            <div className="tools">
              <label className="search" aria-label="Recherche">
                <Icon name="search" />
                <input className="input" placeholder="Search…" />
              </label>

              <div className="chip" role="group" aria-label="Réseau">
                <Icon name="globe" />
                <select className="sel" defaultValue="sepolia" aria-label="Network">
                  <option value="sepolia">Sepolia</option>
                  <option value="mainnet">Ethereum</option>
                  <option value="polygon">Polygon</option>
                </select>
              </div>

              <button className="cta ghost" onClick={(e) => { ripple(e); navigate("/deposit"); }}>
                Deposit
              </button>
              <button className="cta ghost" onClick={(e) => { ripple(e); navigate("/transfer"); }}>
                Transfer
              </button>
              <button className="cta primary" onClick={(e) => { ripple(e); window.print(); }}>
                Export
              </button>
            </div>
          </header>

          <div className="content">
            <div className="container">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

/* ---------------- Icônes SVG ---------------- */
function Icon({ name }: { name: IconName }) {
  switch (name) {
    case "chart":
      return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M4 19h16v2H2V3h2v16zm4-2H6V9h2v8zm4 0h-2V5h2v12zm4 0h-2v-6h2v6z"/></svg>;
    case "wallet":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 7a3 3 0 0 1 3-3h12v2H6a1 1 0 0 0-1 1v1h13a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2V7zm18 6a1 1 0 0 0-1-1h-3v3h3a1 1 0 0 0 1-1z"/></svg>;
    case "tag":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 7.5 12.5 16a2 2 0 0 1-2.83 0L3 9.33V3h6.33L18.5 9.83A2 2 0 0 1 21 7.5zM7 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>;
    case "token":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2 2 7l10 5 10-5-10-5zm0 7L2 14l10 5 10-5-10-5z"/></svg>;
    case "plus":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>;
    case "arrowUp":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 3 5 10h5v8h4v-8h5L12 3z"/></svg>;
    case "swap":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 7h11l-3-3 1.4-1.4L22.8 7l-6.4 4.4L15 10l3-2H7V7zm10 10H6l3 3-1.4 1.4L1.2 17l6.4-4.4L9 14l-3 2h11v1z"/></svg>;
    case "doc":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5z"/></svg>;
    case "gear":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm9 4a7.9 7.9 0 0 0-.2-1.8l2-1.5-2-3.4-2.4 1a8 8 0 0 0-3.1-1.8l-.5-2.6H9.2l-.5 2.6a8 8 0 0 0-3.1 1.8l-2.4-1-2 3.4 2 1.5A7.9 7.9 0 0 0 3 12c0 .6.1 1.2.2 1.8l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 3.1 1.8l.5 2.6h5.6l.5-2.6a8 8 0 0 0 3.1-1.8l2.4 1 2-3.4-2-1.5c.1-.6.2-1.2.2-1.8z"/></svg>;
    case "collapse":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 12 4 8h8L8 12zm8 0 4 4H12l4-4z"/></svg>;
    case "expand":
      return <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 12l4 4H4l4-4zm8 0-4-4h8l-4 4z"/></svg>;
    case "search":
      return <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8L20 22l2-2-6.5-6.5zM6.5 11A4.5 4.5 0 1 1 11 15.5 4.5 4.5 0 0 1 6.5 11z"/></svg>;
    case "globe":
      return <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2a8 8 0 0 1 7.5 5H12V4zM4.5 9A8 8 0 0 1 12 4v5H4.5zM12 20a8 8 0 0 1-7.5-5H12v5zm0-7H4.5a8 8 0 0 1 0-2H12v2zm0 0h7.5a8 8 0 0 1 0 2H12v-2z"/></svg>;
    default:
      return null;
  }
}

/* ---------------- CSS : Thème blanc + rouge ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

:root{
  --font-title: 'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  --font-body:  'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;

  /* Palette claire : tout blanc + accents rouges */
  --bg:#ffffff;            /* fond global blanc */
  --card:#ffffff;          /* cartes blanches */
  --ink:#141414;           /* texte principal */
  --sub:#6b7280;           /* texte secondaire discret */
  --line:#f3f4f6;          /* traits très légers */
  --pri:#e11d2e;           /* rouge principal */
  --pri-2:#be123c;         /* rouge foncé (hover) */
  --acc:#fb7185;           /* rose/rouge d'accent */

  /* Sidebar claire */
  --side:#ffffff;
  --side-2:#ffffff;
  --side-line:#f3f4f6;
}

*{box-sizing:border-box}
html,body,#root{height:100%}
body{
  margin:0; background:var(--bg); color:var(--ink);
  font-family:var(--font-body);
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
}

.shell{min-height:100vh; display:grid; grid-template-columns:240px 1fr; background:var(--bg)}

/* Sidebar (blanc, bordures légères, accents rouges) */
.side{
  position:sticky; top:0; height:100vh;
  display:grid; grid-template-rows:auto 1fr auto;
  background:var(--side); color:var(--ink);
  border-right:1px solid var(--side-line);
  transition:width .18s ease;
}
.side.open{width:240px}
.side.shrink{width:76px}
@media (max-width:1040px){ .shell{grid-template-columns:76px 1fr} .side{width:76px !important} }

.brand{display:flex; align-items:center; gap:10px; padding:14px 12px; border-bottom:1px solid var(--side-line)}
.logo{position:relative; width:24px; height:24px; display:grid; place-items:center}
.dot{width:12px; height:12px; border-radius:999px; background:linear-gradient(120deg, var(--pri), var(--acc)); box-shadow:0 0 0 3px rgba(225,29,46,.12)}
.brandName{font-weight:800; letter-spacing:.2px; font-family:var(--font-title)}
.toggle{
  margin-left:auto; width:34px; height:34px; border-radius:10px;
  border:1px solid var(--line); background:#fff; color:var(--pri);
  cursor:pointer; display:grid; place-items:center;
}

.nav{padding:10px; display:grid; gap:6px}
.navItem{
  position:relative; display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:12px; color:#334155; text-decoration:none;
  border:1px solid transparent; transition:background .12s ease, color .12s ease, border-color .12s ease;
}
.navItem:hover{background:#fff0f0; border-color:#ffe4e6}
.navItem.active{background:#fff; color:#111827; border-color:#fecaca; box-shadow:0 6px 18px rgba(225,29,46,.06)}
.navItem.compact{justify-content:center}
.navIcon{
  width:32px; height:32px; border-radius:10px; display:grid; place-items:center;
  background:#fff; border:1px solid var(--line); color:var(--pri);
}
.navLabel{font-weight:700}
.activeBar{
  position:absolute; left:-10px; top:8px; bottom:8px; width:4px; border-radius:4px;
  background:linear-gradient(180deg,var(--pri),var(--acc)); opacity:0; transform:translateX(-6px); transition:all .14s ease
}
.navItem.active .activeBar{opacity:1; transform:translateX(0)}
.navItem[data-tooltip]:hover::after{
  content: attr(data-tooltip);
  position: absolute; left: 56px; top: 50%; transform: translateY(-50%);
  background:#fff; color:#111827; padding:6px 8px; border-radius:8px; font-size:12px; white-space:nowrap; border:1px solid var(--line);
}

.sideFoot{padding:12px; border-top:1px solid var(--side-line); font-size:12px; color:#64748b}

/* Main/topbar (clair) */
.main{display:grid; grid-template-rows:64px 1fr}
.top{
  position:sticky; top:0; z-index:5; display:flex; align-items:center; gap:12px;
  padding:10px 16px; border-bottom:1px solid #ffe4e6;
  background:linear-gradient(180deg, #fff, #fff);
}
.crumb{display:flex; align-items:center; gap:10px; min-width:0}
.miniLogo{width:10px; height:10px; border-radius:999px; background:linear-gradient(120deg, var(--pri), var(--acc))}
.app{color:#1b1b1b; font-family:var(--font-title); letter-spacing:.2px}
.sep{width:2px; height:18px; background:#fecaca; border-radius:2px; opacity:.8}
.page{font-weight:800; color:var(--pri); font-family:var(--font-title)}
.tools{margin-left:auto; display:flex; gap:8px; align-items:center}

.search{
  display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #fecaca;
  border-radius:12px; padding:8px 10px; min-width:260px;
}
.search svg{opacity:.8; color:var(--pri)}
.search .input{border:none; outline:none; flex:1; background:transparent; font-size:14px; color:#111827; font-family:var(--font-body)}

.chip{
  display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #fecaca;
  border-radius:12px; padding:8px 10px
}
.sel{border:none; outline:none; background:transparent; color:#111827; font-weight:800; font-family:var(--font-body)}

/* Buttons (rouge/white) */
.cta{
  position:relative; overflow:hidden; border-radius:12px; padding:9px 12px; font-weight:900; cursor:pointer;
  transition:transform .05s ease; font-family:var(--font-body)
}
.cta:active{transform:scale(.98)}
.cta.primary{
  border:1px solid var(--pri); color:#fff; background:linear-gradient(135deg, var(--pri), var(--pri-2));
  box-shadow:0 10px 24px rgba(225,29,46,.18)
}
.cta.primary:hover{filter:brightness(1.02)}
.cta.ghost{
  border:1px solid var(--pri); color:var(--pri); background:#fff;
}
.cta.ghost:hover{background:#fff0f0}
.cta .rip{position:absolute; pointer-events:none; border-radius:9999px; transform:scale(0); background:rgba(255,255,255,.55); animation:ripple .52s ease-out forwards}
@keyframes ripple{to{transform:scale(20); opacity:0}}

/* Content */
.content{padding:16px; display:grid; justify-items:center; overflow:auto; background:#fff}
.container{width:100%; max-width:1200px}

/* Focus visible */
button:focus-visible, select:focus-visible, input:focus-visible{
  outline:2px solid #fecaca; outline-offset:2px; border-radius:10px
}
`;
