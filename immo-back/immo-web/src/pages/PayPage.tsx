// // src/pages/PayPage.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// /* ─────────────────────────────────────────────
//    Thème vertical "3 grandes barres"
// ────────────────────────────────────────────── */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Manrope:wght@700;800&display=swap');

// :root{
//   --ink:#081021; --sub:#657082; --line:#e9eef5; --muted:#f7f9fc;
//   --bg:#ffffff; --card:#ffffff;
//   --pri:#e11d2e; --pri-700:#be123c; --pri-fade:#fff1f2;
//   --ring:#ff9aa7; --ring2:#ffd9dd;
//   --ok:#16a34a; --ok-fade:#ecfdf5;
// }

// *{box-sizing:border-box}
// body{font-family:Inter,Manrope,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// .pay{max-width:1280px;margin:34px auto;padding:0 18px}
// .h1{margin:0 0 8px;font:800 32px/1.08 Manrope;letter-spacing:-.015em}
// .sub{color:var(--sub)}

// /* KPI header */
// .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:16px 0 6px}
// @media (max-width:1100px){.kpis{grid-template-columns:repeat(2,1fr)}}
// .kpi{
//   position:relative;background:var(--card);
//   border:1px solid var(--line); border-radius:18px; padding:14px 16px;
//   box-shadow:0 14px 34px rgba(16,24,40,.06);
// }
// .kKey{color:var(--sub);font:600 12px/1 Inter}
// .kVal{font:800 22px/1 Manrope;margin-top:6px}

// /* colonnes verticales : 3 grandes barres */
// .cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:14px}
// @media (max-width:1100px){ .cols{grid-template-columns:1fr} }

// /* grande carte premium */
// .tile{
//   position:relative; display:grid; grid-template-rows:auto 1fr auto; gap:14px;
//   min-height:640px; padding:22px; border:1px solid var(--line); border-radius:24px;
//   background:var(--card); overflow:hidden;
//   box-shadow:0 22px 60px rgba(16,24,40,.08);
//   transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
//   animation:tileIn .4s cubic-bezier(.22,1,.36,1);
// }
// @keyframes tileIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

// /* anneau gradient premium */
// .tile::before{
//   content:""; position:absolute; inset:-1px; border-radius:26px; pointer-events:none;
//   background:linear-gradient(120deg, #fff 0%, #fff 55%, var(--ring2) 80%, var(--ring) 100%);
//   mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
//   -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
//   -webkit-mask-composite: xor; mask-composite: exclude;
//   padding:1px; opacity:.0; transition:opacity .18s ease;
// }
// .tile:hover{transform:translateY(-3px); box-shadow:0 30px 80px rgba(16,24,40,.12)}
// .tile.active{border-color:#fecaca}
// .tile.active::before{opacity:1}

// /* entête carte */
// .tHead{display:flex;align-items:center;gap:14px}
// .logo{
//   width:54px; height:54px; border-radius:16px; display:grid; place-items:center;
//   background:linear-gradient(135deg,var(--pri-fade),#fff); border:1px solid #ffd9dd; font-size:24px;
//   box-shadow:0 14px 28px rgba(225,29,46,.12);
// }
// .tTitle{margin:0;font:800 19px/1.05 Manrope;letter-spacing:.1px}
// .tDesc{color:var(--sub); font-size:13px}

// /* corps carte */
// .tBody{
//   position:relative;border:1px dashed #e7ebf0; background:var(--muted);
//   border-radius:18px; padding:14px; overflow:auto; min-height:360px;
// }
// .hint{color:var(--sub); font-size:12px}
// .row{display:flex; align-items:center; justify-content:space-between; gap:10px}
// .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
// .copy{border:1px solid #e5e7eb;border-radius:10px;padding:8px 10px;background:#fff;cursor:pointer;font-size:12px}

// /* CTA en bas de carte */
// .tFoot{display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px}
// .pill{
//   display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;font-size:12px;
//   border:1px solid #fde2e2;background:#fff5f6;color:#a10f20
// }

// /* boutons */
// .btn{
//   position:relative; overflow:hidden; border-radius:14px; padding:12px 16px; font-weight:800;
//   border:1px solid var(--line); background:#fff; color:var(--ink); cursor:pointer;
//   transition:transform .06s ease, box-shadow .15s ease, background .15s ease, color .15s ease;
// }
// .btn:hover{box-shadow:0 14px 36px rgba(16,24,40,.10)}
// .btn:active{transform:scale(.985)}
// .btnPrimary{border-color:var(--pri); color:#fff; background:linear-gradient(135deg,var(--pri),var(--pri-700)); box-shadow:0 22px 54px rgba(225,29,46,.18)}
// .btnGhost{border-color:#ffd4d9;color:var(--pri); background:#fff}
// .btnSmall{padding:9px 12px;font-weight:700}
// .btn[disabled]{opacity:.6;cursor:not-allowed}
// .rip{position:absolute;inset:auto;width:12px;height:12px;border-radius:9999px;background:rgba(255,255,255,.75);
//   transform:translate(-50%,-50%) scale(0); animation:ripple .6s ease-out forwards}
// @keyframes ripple{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

// /* panneau résumé */
// .side{margin-top:22px}
// .card{border:1px solid var(--line);border-radius:20px;background:#fff;padding:16px 18px;box-shadow:0 18px 44px rgba(16,24,40,.08)}
// .h2{margin:0 0 8px;font:800 18px/1.1 Manrope}
// .alert{margin-top:12px;padding:12px;border-radius:14px}
// .info{background:#f5f8ff;border:1px solid #dfe6ff;color:#1f3af5}
// .ok{background:var(--ok-fade);border:1px solid #bbf7d0;color:#166534}
// .err{background:#fff6f6;border:1px solid #fde2e2;color:#991b1b}
// `;


// /* ── Types & helpers ─────────────────────────────────────── */
// type BankInfo = { iban: string; beneficiary: string; reference: string; amountMAD: number };
// type CryptoInfo = { chain: "sepolia" | "polygon" | "mainnet"; token: "ETH" | "USDC"; address: string; amount: number; memo?: string };

// const fmtMAD = (n:number)=> n.toLocaleString(undefined,{maximumFractionDigits:0})+" MAD";
// const ethToWei = (eth:number)=> BigInt(Math.round(eth*1e18)).toString();
// function ripple(e: React.MouseEvent<HTMLButtonElement>) {
//   const host = e.currentTarget; const r = document.createElement("span");
//   r.className = "rip"; const rect = host.getBoundingClientRect();
//   r.style.left = `${e.clientX-rect.left}px`; r.style.top = `${e.clientY-rect.top}px`;
//   host.appendChild(r); setTimeout(()=>r.remove(), 600);
// }
// function copy(s:string){ navigator.clipboard?.writeText(s); }

// /* ── Page ─────────────────────────────────────────────────── */
// export default function PayPage(){
//   const nav = useNavigate();
//   const q = new URLSearchParams(useLocation().search);
//   const investmentId = q.get("investmentId") || "";

//   const [err,setErr] = useState<string>();
//   const [busy,setBusy] = useState(false);
//   const [method,setMethod] = useState<"card"|"bank"|"crypto"|"">("");
//   const [bank, setBank] = useState<BankInfo | null>(null);
//   const [crypto, setCrypto] = useState<CryptoInfo | null>(null);

//   useEffect(()=>{ if(!investmentId) setErr("Paramètre 'investmentId' manquant."); },[investmentId]);

//   const eip681 = useMemo(()=>{
//     if(!crypto || crypto.token!=="ETH") return undefined;
//     const chainId = crypto.chain==="sepolia"?11155111:crypto.chain==="polygon"?137:1;
//     return `ethereum:${crypto.address}@${chainId}?value=${ethToWei(crypto.amount)}`;
//   },[crypto]);

//   /* actions */
//   async function payByCard(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined); setMethod("card");
//       const r = await fetch("http://localhost:3000/api/payments/card/session",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!r?.ok) throw new Error(r?.error || "card_session_failed");
//       window.location.href = r.url;
//     }catch(e:any){ setErr(e?.message||"Erreur carte"); setMethod(""); } finally{ setBusy(false); }
//   }
//   async function initBank(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined); setMethod("bank");
//       const r = await fetch("http://localhost:3000/api/payments/bank/init",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!r?.ok) throw new Error(r?.error || "bank_init_failed");
//       setBank(r.bank as BankInfo); setCrypto(null);
//     }catch(e:any){ setErr(e?.message||"Erreur virement"); setMethod(""); } finally{ setBusy(false); }
//   }
//   async function initCrypto(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined); setMethod("crypto");
//       const r = await fetch("http://localhost:3000/api/payments/crypto/init",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!r?.ok) throw new Error(r?.error || "crypto_init_failed");
//       setCrypto(r.crypto as CryptoInfo); setBank(null);
//     }catch(e:any){ setErr(e?.message||"Erreur crypto"); setMethod(""); } finally{ setBusy(false); }
//   }

//   return (
//     <div className="pay">
//       <style>{CSS}</style>

//       <h1 className="h1">Paiement investissement</h1>
//       <div className="sub">Choisissez un moyen de paiement. Une fois confirmé, votre <b>NFT</b> est mint automatiquement.</div>
//       {/* KPI rapides */}
// <div className="kpis">
//   <div className="kpi">
//     <div className="kKey">Étape</div>
//     <div className="kVal">2 / 3 · Paiement</div>
//   </div>
//   <div className="kpi">
//     <div className="kKey">Investissement</div>
//     <div className="kVal">#{investmentId.slice(0,8)}</div>
//   </div>
//   <div className="kpi">
//     <div className="kKey">Moyen choisi</div>
//     <div className="kVal">{method ? (method==="card"?"Carte":method==="bank"?"Virement":"Crypto") : "—"}</div>
//   </div>
//   <div className="kpi">
//     <div className="kKey">Statut</div>
//     <div className="kVal">{method ? "En cours" : "En attente"}</div>
//   </div>
// </div>

//       {/* 3 GRANDES CARTES VERTICALES */}
//       <section className="cols">
//         {/* Carte */}
//         <article className={`tile ${method==="card"?"active":""}`}>
//           <header className="tHead">
//             <div className="logo">💳</div>
//             <div>
//               <h3 className="tTitle">Carte (Visa / Mastercard)</h3>
//               <div className="tDesc">Session sécurisée (Stripe/Checkout.com). Capture immédiate.</div>
//             </div>
//           </header>

          

//           <footer className="tFoot">
//             <span className="pill">Investissement # {investmentId}</span>
//             <button className="btn btnPrimary" disabled={busy} onClick={(e)=>{ripple(e); payByCard();}}>
//               Payer par carte
//             </button>
//           </footer>
//         </article>

//         {/* Virement */}
//         <article className={`tile ${method==="bank"?"active":""}`}>
//           <header className="tHead">
//             <div className="logo">🏦</div>
//             <div>
//               <h3 className="tTitle">Virement bancaire</h3>
//               <div className="tDesc">Générez une référence unique + coordonnées IBAN. Confirmation 24–48h ouvrées.</div>
//             </div>
//           </header>

//           <div className="tBody">
//             {!bank ? (
//               <div className="hint">Cliquez “Générer les infos virement” pour obtenir le bénéficiaire, l’IBAN et la référence.</div>
//             ) : (
//               <div style={{display:"grid",gap:10}}>
//                 <div className="row">
//                   <div>
//                     <div className="hint">Bénéficiaire</div>
//                     <div>{bank.beneficiary}</div>
//                   </div>
//                   <button className="copy" onClick={()=>copy(bank.beneficiary)}>Copier</button>
//                 </div>
//                 <div className="row mono">
//                   <div>
//                     <div className="hint">IBAN</div>
//                     <div>{bank.iban}</div>
//                   </div>
//                   <button className="copy" onClick={()=>copy(bank.iban)}>Copier</button>
//                 </div>
//                 <div className="row mono">
//                   <div>
//                     <div className="hint">Référence</div>
//                     <div>{bank.reference}</div>
//                   </div>
//                   <button className="copy" onClick={()=>copy(bank.reference)}>Copier</button>
//                 </div>
//                 <div>
//                   <div className="hint">Montant</div>
//                   <b>{fmtMAD(bank.amountMAD)}</b>
//                 </div>
//                 <div className="hint">⚠️ Indiquez bien la <b>référence</b> dans le libellé du virement.</div>
//               </div>
//             )}
//           </div>

//           <footer className="tFoot">
//             <span className="pill">Investissement # {investmentId}</span>
//             <button className="btn btnGhost" disabled={busy} onClick={(e)=>{ripple(e); initBank();}}>
//               Générer les infos virement
//             </button>
//           </footer>
//         </article>

//         {/* Crypto */}
//         <article className={`tile ${method==="crypto"?"active":""}`}>
//           <header className="tHead">
//             <div className="logo">🪙</div>
//             <div>
//               <h3 className="tTitle">Crypto (ETH / USDC)</h3>
//               <div className="tDesc">Adresse de dépôt ou “Pay with wallet” (EIP-681). Confirmation après 1-2 blocs.</div>
//             </div>
//           </header>

//           <div className="tBody">
//             {!crypto ? (
//               <div className="hint">Cliquez “Obtenir l’adresse” pour recevoir l’adresse/QR et le montant exact.</div>
//             ) : (
//               <div style={{display:"grid",gap:10}}>
//                 <div className="row">
//                   <div><div className="hint">Réseau</div><div>{crypto.chain}</div></div>
//                   <div><div className="hint">Token</div><div>{crypto.token}</div></div>
//                 </div>
//                 <div className="row mono">
//                   <div>
//                     <div className="hint">Adresse</div>
//                     <div>{crypto.address}</div>
//                   </div>
//                   <button className="copy" onClick={()=>copy(crypto.address)}>Copier</button>
//                 </div>
//                 <div className="row">
//                   <div><div className="hint">Montant</div><b>{crypto.amount} {crypto.token}</b></div>
//                   {crypto.memo && <div><div className="hint">Memo</div><div className="mono">{crypto.memo}</div></div>}
//                 </div>
//                 {eip681 && (
//                   <a className="btn btnPrimary btnSmall" href={eip681}>Pay with wallet (EIP-681)</a>
//                 )}
//                 <div className="hint">Nous vous notifions dès validation on-chain.</div>
//               </div>
//             )}
//           </div>

//           <footer className="tFoot">
//             <span className="pill">Investissement # {investmentId}</span>
//             <button className="btn btnGhost" disabled={busy} onClick={(e)=>{ripple(e); initCrypto();}}>
//               Obtenir l’adresse de dépôt
//             </button>
//           </footer>
//         </article>
//       </section>

//       {/* résumé/statuts */}
//       <div className="side">
//         <div className="card">
//           <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
//             <h3 className="h2">Résumé</h3>
//             <button className="btn btnSmall" onClick={()=>nav(-1)}>← Retour</button>
//           </div>
//           <div className="info alert">Après confirmation, vous recevrez votre <b>attestation PDF</b> et le <b>NFT</b> apparaîtra dans “Mes NFTs”.</div>
//           {method==="bank" && <div className="ok alert" style={{marginTop:8}}>Mode sélectionné : <b>Virement bancaire</b>. Vous pouvez effectuer le virement dès maintenant.</div>}
//           {method==="crypto" && <div className="ok alert" style={{marginTop:8}}>Mode sélectionné : <b>Crypto</b>. Envoyez le montant indiqué à l’adresse fournie.</div>}
//           {err && <div className="err alert" style={{marginTop:8}}>{err}</div>}
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/PayPage.tsx
// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// /* ---------- Thème & animations (rouge/blanc) ---------- */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
// :root{
//   --ink:#111827; --sub:#6b7280; --line:#eceff3;
//   --bg:#ffffff; --card:#ffffff;
//   --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2;
// }
// *{box-sizing:border-box}
// body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit}

// /* Wrap */
// .pay-wrap{max-width:1180px;margin:22px auto 40px;padding:0 18px}

// /* HERO ------------------------------------------------- */
// .hero{
//   position:relative; overflow:hidden;
//   border:1px solid var(--line); border-radius:18px; padding:28px 20px;
//   background:
//     radial-gradient(1200px 260px at -10% -30%, rgba(225,17,39,.10), #fff0),
//     radial-gradient(900px 260px at 110% -20%, rgba(190,18,60,.12), #fff0),
//     #fff;
// }
// .hero-title{margin:0;font-size:38px;line-height:1.05;letter-spacing:-.02em;font-weight:800}
// .hero-sub{margin-top:8px;color:var(--sub)}
// .hero-cta{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
// .cta{
//   position:relative;overflow:hidden;border-radius:12px; padding:10px 14px;
//   font-weight:800; cursor:pointer; border:1px solid #fecaca; color:var(--pri);
//   background:#fff;
// }
// .cta.primary{background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;border-color:transparent}
// .cta .rip{position:absolute;inset:auto;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.7);
//   transform:translate(-50%,-50%) scale(0);animation:rip .6s ease-out forwards}
// @keyframes rip{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

// /* GRID ------------------------------------------------- */
// .grid{
//   margin-top:18px;
//   display:grid; grid-template-columns:repeat(3,1fr); gap:16px;
// }
// @media (max-width: 1080px){ .grid{grid-template-columns:1fr} }

// /* CARD (verticale, grande) ----------------------------- */
// .card{
//   position:relative; display:flex; flex-direction:column;
//   min-height:560px;
//   border:1px solid var(--line); border-radius:18px; background:var(--card);
//   padding:18px; transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;
//   box-shadow:0 14px 40px rgba(16,24,40,.04);
// }
// .card:hover{transform:translateY(-2px); box-shadow:0 18px 52px rgba(16,24,40,.08); border-color:#ffd4d9}
// .card-head{display:flex; gap:12px; align-items:center; margin-bottom:12px}
// .ic{
//   width:42px;height:42px;border-radius:12px; display:grid; place-items:center;
//   background:var(--pri-soft); color:var(--pri); font-size:18px; font-weight:900;
//   border:1px solid #ffd4d9;
// }
// .h3{margin:0;font-weight:900;font-size:18px;letter-spacing:-.01em}
// .kicker{color:var(--sub);font-size:12px}
// .note{margin:8px 0 12px;color:var(--sub);font-size:13px}

// /* zone contenu (shimmer) */
// .panel{
//   flex:1; border:1px dashed #f1f5f9; border-radius:14px; background:#fafafa; padding:12px;
//   background-image: linear-gradient(90deg,#fafafa 0%, #f5f5f5 40%, #fafafa 80%);
//   background-size: 300% 100%;
//   animation: shimmer 2.5s ease-in-out infinite;
// }
// @keyframes shimmer{ 0%{background-position:0 0} 100%{background-position:-300% 0} }

// /* Footer d'action */
// .card-foot{display:flex;align-items:center;justify-content:space-between; gap:10px; margin-top:12px}
// .badge{border:1px solid #ffd4d9;background:#fff; color:var(--pri); padding:6px 10px; border-radius:999px; font-weight:800; font-size:12px}
// .btn{
//   position:relative;overflow:hidden;border-radius:12px;padding:11px 14px;font-weight:800;cursor:pointer;
//   border:1px solid var(--line); background:#fff; color:var(--ink);
// }
// .btn.primary{border-color:var(--pri); background:linear-gradient(135deg,var(--pri),var(--pri-700)); color:#fff}
// .btn.ghost{border-color:#fecaca; color:var(--pri); background:#fff}
// .btn .rip{position:absolute;inset:auto;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);
//   transform:translate(-50%,-50%) scale(0);animation:rip .6s ease-out forwards}

// /* Résumé ------------------------------------------------ */
// .sum{
//   margin-top:18px; border:1px solid var(--line); border-radius:18px; padding:14px; background:#fff;
//   box-shadow:0 14px 40px rgba(16,24,40,.04);
// }
// .sum-h{margin:0 0 8px; font-size:16px; font-weight:900}
// .sum-note{color:var(--sub); font-size:13px};
// /* Bottom band (rouge/blanc) */
// .band{
//   position:relative; overflow:hidden; margin-top:18px;
//   border:1px solid #fecaca; border-radius:18px;
//   background:
//     radial-gradient(900px 220px at 0% 0%, rgba(225,17,46,.10), #fff0),
//     radial-gradient(900px 220px at 100% 0%, rgba(190,18,60,.10), #fff0),
//     linear-gradient(180deg,#fff,#fff5f6 55%, #ffe9ec 100%);
//   box-shadow:0 14px 40px rgba(16,24,40,.05);
// }
// .band-inner{padding:28px 20px; max-width:1100px; margin:0 auto}
// .band-title{
//   margin:0 0 6px; font-size:28px; line-height:1.12; letter-spacing:-.01em; font-weight:900;
//   color:#9a1c1c;
// }
// .band-sub{color:var(--ink); opacity:.86}
// .band-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:14px}
// @media (max-width: 980px){ .band-grid{grid-template-columns:1fr} }
// .band-card{
//   border:1px solid #ffd4d9; background:#fff; border-radius:14px; padding:14px;
//   display:flex; gap:10px; align-items:flex-start; transition:transform .15s ease, box-shadow .15s ease;
// }
// .band-card:hover{transform:translateY(-2px); box-shadow:0 12px 30px rgba(225,29,46,.08)}
// .band-ic{
//   width:36px;height:36px;border-radius:10px;display:grid;place-items:center;
//   background:#fff1f2; color:var(--pri); border:1px solid #ffd4d9; font-weight:900
// }
// .band-h{margin:0 0 4px; font-weight:800}
// .band-p{margin:0; color:var(--sub); font-size:13px}

// `;

// /* ---------- Types & Helpers ---------- */
// type BankInfo = { iban: string; beneficiary: string; reference: string; amountMAD: number };
// type CryptoInfo = { chain: "sepolia" | "polygon" | "mainnet"; token: "ETH" | "USDC"; address: string; amount: number; memo?: string };

// const ripple = (e: React.MouseEvent<HTMLElement>) => {
//   const host = e.currentTarget as HTMLElement;
//   const span = document.createElement("span");
//   span.className = "rip";
//   const r = host.getBoundingClientRect();
//   span.style.left = `${e.clientX - r.left}px`;
//   span.style.top  = `${e.clientY - r.top}px`;
//   host.appendChild(span);
//   setTimeout(()=> span.remove(), 600);
// };

// /* ===================================================== */
// export default function PayPage(){
//   const q = new URLSearchParams(useLocation().search);
//   const investmentId = q.get("investmentId") || "";
//   const nav = useNavigate();

//   const [err,setErr] = useState<string>();
//   const [bank, setBank] = useState<BankInfo | null>(null);
//   const [crypto, setCrypto] = useState<CryptoInfo | null>(null);
//   const [busy, setBusy] = useState(false);

//   useEffect(()=>{
//     if(!investmentId) setErr("investmentId manquant");
//   },[investmentId]);

//   async function payByCard(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined);
//       const res = await fetch("http://localhost:3000/api/payments/card/session",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!res?.ok) throw new Error(res?.error || "card_session_failed");
//       window.location.href = res.url; // redirection fournisseur
//     }catch(e:any){ setErr(e?.message||"Erreur carte"); }
//     finally{ setBusy(false); }
//   }

//   async function initBank(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined);
//       const res = await fetch("http://localhost:3000/api/payments/bank/init",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!res?.ok) throw new Error(res?.error || "bank_init_failed");
//       setBank(res.bank as BankInfo);
//     }catch(e:any){ setErr(e?.message||"Erreur virement"); }
//     finally{ setBusy(false); }
//   }

//   async function initCrypto(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined);
//       const res = await fetch("http://localhost:3000/api/payments/crypto/init",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!res?.ok) throw new Error(res?.error || "crypto_init_failed");
//       setCrypto(res.crypto as CryptoInfo);
//     }catch(e:any){ setErr(e?.message||"Erreur crypto"); }
//     finally{ setBusy(false); }
//   }

//   return (
//     <div className="pay-wrap">
//       <style>{CSS}</style>

//       {/* HERO */}
//       <section className="hero">
//         <h1 className="hero-title">Paiement investissement</h1>
//         <div className="hero-sub">
//           Choisissez un moyen de paiement. Dès que les fonds sont confirmés, votre NFT est mint automatiquement.
//         </div>
//         <div className="hero-cta">
//           <button className="cta" onClick={(e)=>{ripple(e); nav(-1);}}>← Retour</button>
//           <button className="cta primary" onClick={(e)=>ripple(e)}>Aide & FAQ</button>
//         </div>
//       </section>

//       {/* 3 GRANDES BARRES VERTICALES */}
//       <section className="grid">
//         {/* Carte */}
//         <article className="card">
//           <header className="card-head">
//             <div className="ic">💳</div>
//             <div>
//               <div className="h3">Carte (Visa / Mastercard)</div>
//               <div className="kicker">Session sécurisée (Stripe/Checkout.com). Capture immédiate.</div>
//             </div>
//           </header>

//           <div className="panel" aria-hidden="true" />

//           <footer className="card-foot">
//             <span className="badge">Investissement #{investmentId}</span>
//             <button className="btn primary" disabled={busy}
//               onClick={(e)=>{ripple(e); payByCard();}}>
//               Payer par carte
//             </button>
//           </footer>
//         </article>

//         {/* Virement */}
//         <article className="card">
//           <header className="card-head">
//             <div className="ic">🏦</div>
//             <div>
//               <div className="h3">Virement bancaire</div>
//               <div className="kicker">Génère une référence unique + IBAN (J+1/2 ouvrés).</div>
//             </div>
//           </header>

//           <div className="panel">
//             {bank ? (
//               <div style={{fontSize:14,lineHeight:1.5}}>
//                 <div><b>Bénéficiaire :</b> {bank.beneficiary}</div>
//                 <div><b>IBAN :</b> {bank.iban}</div>
//                 <div><b>Référence :</b> {bank.reference}</div>
//                 <div><b>Montant :</b> {bank.amountMAD} MAD</div>
//                 <div style={{color:"var(--sub)",fontSize:12,marginTop:8}}>
//                   ⚠️ Indiquez bien la <b>référence</b> dans le libellé du virement.
//                 </div>
//               </div>
//             ) : (
//               <div className="note">Cliquez pour générer les informations de virement (IBAN + référence).</div>
//             )}
//           </div>

//           <footer className="card-foot">
//             <span className="badge">Investissement #{investmentId}</span>
//             <button className="btn ghost" disabled={busy}
//               onClick={(e)=>{ripple(e); initBank();}}>
//               Générer les infos virement
//             </button>
//           </footer>
//         </article>

//         {/* Crypto */}
//         <article className="card">
//           <header className="card-head">
//             <div className="ic">🪙</div>
//             <div>
//               <div className="h3">Crypto (ETH / USDC)</div>
//               <div className="kicker">Adresse de dépôt ou “Pay with wallet”. Validation 1–2 blocs.</div>
//             </div>
//           </header>

//           <div className="panel">
//             {crypto ? (
//               <div style={{fontSize:14,lineHeight:1.5}}>
//                 <div><b>Réseau :</b> {crypto.chain}</div>
//                 <div><b>Token :</b> {crypto.token}</div>
//                 <div style={{wordBreak:"break-all"}}><b>Adresse :</b> {crypto.address}</div>
//                 <div><b>Montant :</b> {crypto.amount} {crypto.token}</div>
//                 {crypto.memo && <div><b>Memo :</b> {crypto.memo}</div>}
//                 <div style={{color:"var(--sub)",fontSize:12,marginTop:8}}>
//                   Nous vous notifierons dès que la transaction est validée on-chain.
//                 </div>
//               </div>
//             ) : (
//               <div className="note">Cliquez pour obtenir l’adresse de dépôt (ou déclencher “Pay with wallet”).</div>
//             )}
//           </div>

//           <footer className="card-foot">
//             <span className="badge">Investissement #{investmentId}</span>
//             <button className="btn ghost" disabled={busy}
//               onClick={(e)=>{ripple(e); initCrypto();}}>
//               Obtenir l’adresse de dépôt
//             </button>
//           </footer>
//         </article>
//       </section>

//       {/* Résumé */}
//       <section className="sum">
//         <h3 className="sum-h">Résumé</h3>
//         {err ? (
//           <div style={{border:"1px solid #fde2e2",background:"#fff6f6",color:"#991b1b",padding:10,borderRadius:12}}>
//             {err}
//           </div>
//         ) : (
//           <>
//             <div className="sum-note">
//               Après confirmation, vous recevrez votre <b>attestation PDF</b> et le <b>NFT</b> apparaîtra dans “Mes NFTs”.
//             </div>
//             {(bank || crypto) && (
//               <div style={{marginTop:10, border: "1px solid #d1fae5", background:"#ecfdf5", color:"#065f46", padding:10, borderRadius:12}}>
//                 Mode sélectionné : <b>{bank ? "Virement bancaire" : "Crypto"}</b>.
//               </div>
//             )}
//           </>
//         )}
//       </section>
//      {/* Bande d’info bas de page */}
// <section className="band">
//   <div className="band-inner">
//     <h3 className="band-title">Vous n’avez pas besoin que le vendeur accepte la crypto</h3>
//     <p className="band-sub">
//       Vous réglez en crypto, mais le vendeur reçoit des dirhams/€/$ côté escrow.
//       Nous gérons la conversion via desk OTC, puis virement bancaire sécurisé à l’entité bénéficiaire.
//     </p>

//     <div className="band-grid">
//       <div className="band-card">
//         <div className="band-ic">🔁</div>
//         <div>
//           <h4 className="band-h">Conversion instantanée</h4>
//           <p className="band-p">ETH/USDC sont convertis en fiat au meilleur prix via partenaires régulés.</p>
//         </div>
//       </div>

//       <div className="band-card">
//         <div className="band-ic">🛡️</div>
//         <div>
//           <h4 className="band-h">Escrow & conformité</h4>
//           <p className="band-p">Contrôles KYC/AML et séquestre avant décaissement vers le vendeur.</p>
//         </div>
//       </div>

//       <div className="band-card">
//         <div className="band-ic">📄</div>
//         <div>
//           <h4 className="band-h">Attestation & NFT</h4>
//           <p className="band-p">PDF signé + NFT émis à votre adresse dès confirmation des fonds.</p>
//         </div>
//       </div>
//     </div>
//   </div>
// </section>

//     </div>
    
//   );
// }
// src/pages/PayPage.tsx
// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// /* =========================================================
//    Thème : blanc/rouge + titres avec police dédiée
//    - Corps : Inter
//    - Titres (uniques) : "Sora" (sans-serif moderne & pro)
// ========================================================= */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Sora:wght@600;700;800&display=swap');

// :root{
//   --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
//   --bg:#ffffff; --card:#ffffff;
//   --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2;
//   --ok-bg:#ecfdf5; --ok-bd:#bbf7d0; --ok-ink:#065f46;
// }
// *{box-sizing:border-box}
// body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit}
// b,strong{font-weight:800}

// /* Conteneur */
// .pay-wrap{max-width:1200px;margin:24px auto 40px;padding:0 18px}

// /* Above: chips (état / id / mode choisi) */
// .kpis{display:grid;grid-template-columns:1.2fr .9fr .9fr;gap:10px;margin-bottom:12px}
// .kpi{border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:#fff;
//      display:flex;align-items:center;gap:10px;box-shadow:0 10px 28px rgba(16,24,40,.04)}
// .kpi .dot{width:10px;height:10px;border-radius:999px;background:linear-gradient(120deg,var(--pri),#ff7b8c)}
// .kpi .lab{color:var(--sub);font-size:12px}
// .kpi .val{font-family:Sora,Inter,system-ui,sans-serif;font-weight:800;letter-spacing:.1px}

// /* HERO */
// .hero{
//   position:relative; overflow:hidden;
//   border:1px solid var(--line); border-radius:18px; padding:26px 20px;
//   background:
//     radial-gradient(1200px 260px at -10% -30%, rgba(225,17,39,.10), #fff0),
//     radial-gradient(900px 260px at 110% -20%, rgba(190,18,60,.12), #fff0),
//     #fff;
//   box-shadow:0 14px 40px rgba(16,24,40,.05)
// }
// .hero-title{margin:0;font-size:36px;line-height:1.05;letter-spacing:-.02em;font-weight:800;
//   font-family:Sora,Inter,system-ui,sans-serif}
// .hero-sub{margin-top:8px;color:var(--sub)}
// .hero-cta{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
// .cta{
//   position:relative;overflow:hidden;border-radius:12px; padding:10px 14px;
//   font-weight:800; cursor:pointer; border:1px solid #fecaca; color:var(--pri);
//   background:#fff
// }
// .cta.primary{background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;border-color:transparent}
// .cta .rip{position:absolute;inset:auto;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.7);
//   transform:translate(-50%,-50%) scale(0);animation:rip .6s ease-out forwards}
// @keyframes rip{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

// /* GRID cartes */
// .grid{margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
// @media (max-width: 1080px){ .grid{grid-template-columns:1fr} }

// /* Carte verticale (grand format) */
// .card{
//   position:relative; display:flex; flex-direction:column; min-height:600px;
//   border:1px solid var(--line); border-radius:18px; background:var(--card);
//   padding:18px; transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;
//   box-shadow:0 16px 44px rgba(16,24,40,.05)
// }
// .card:hover{transform:translateY(-2px); box-shadow:0 22px 60px rgba(16,24,40,.08); border-color:#ffd4d9}
// .card-head{display:flex; gap:12px; align-items:center; margin-bottom:12px}
// .ic{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;
//   background:var(--pri-soft); color:var(--pri); font-size:18px; font-weight:900; border:1px solid #ffd4d9}
// .h3{margin:0;font-weight:800;font-size:18px;letter-spacing:-.01em;font-family:Sora,Inter,sans-serif}
// .kicker{color:var(--sub);font-size:12px}

// /* zone contenu (shimmer) */
// .panel{
//   flex:1;border:1px dashed #f1f5f9;border-radius:14px;background:#fafafa;padding:12px;
//   background-image: linear-gradient(90deg,#fafafa 0%, #f5f5f5 40%, #fafafa 80%);
//   background-size: 300% 100%; animation: shimmer 2.5s ease-in-out infinite
// }
// @keyframes shimmer{ 0%{background-position:0 0} 100%{background-position:-300% 0} }

// /* Footer carte */
// .card-foot{display:flex;align-items:center;justify-content:space-between; gap:10px; margin-top:12px}
// .badge{border:1px solid #ffd4d9;background:#fff;color:var(--pri);padding:6px 10px;border-radius:999px;font-weight:800;font-size:12px}
// .btn{position:relative;overflow:hidden;border-radius:12px;padding:11px 14px;font-weight:800;cursor:pointer;
//   border:1px solid var(--line); background:#fff; color:var(--ink)}
// .btn.primary{border-color:var(--pri); background:linear-gradient(135deg,var(--pri),var(--pri-700)); color:#fff}
// .btn.ghost{border-color:#fecaca; color:var(--pri); background:#fff}
// .btn .rip{position:absolute;inset:auto;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);
//   transform:translate(-50%,-50%) scale(0);animation:rip .6s ease-out forwards}

// /* Résumé */
// .sum{margin-top:16px;border:1px solid var(--line);border-radius:18px;padding:14px;background:#fff;box-shadow:0 14px 40px rgba(16,24,40,.04)}
// .sum-h{margin:0 0 8px;font-size:16px;font-weight:900;font-family:Sora,Inter,sans-serif}
// .sum-note{color:var(--sub);font-size:13px}

// /* Bande d’info bas */
// .band{position:relative;overflow:hidden;margin-top:16px;border:1px solid #fecaca;border-radius:18px;
//   background:radial-gradient(900px 220px at 0% 0%, rgba(225,17,46,.10), #fff0),
//              radial-gradient(900px 220px at 100% 0%, rgba(190,18,60,.10), #fff0),
//              linear-gradient(180deg,#fff,#fff6f7 55%, #ffe9ec 100%);
//   box-shadow:0 14px 40px rgba(16,24,40,.05)}
// .band-inner{padding:26px 20px; max-width:1100px; margin:0 auto}
// .band-title{margin:0 0 6px;font-size:26px;line-height:1.12;letter-spacing:-.01em;font-weight:800;color:#9a1c1c;font-family:Sora,Inter,sans-serif}
// .band-sub{color:var(--ink);opacity:.86}
// .band-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}
// @media (max-width: 980px){ .band-grid{grid-template-columns:1fr} }
// .band-card{border:1px solid #ffd4d9;background:#fff;border-radius:14px;padding:14px;display:flex;gap:10px;align-items:flex-start;
//   transition:transform .15s ease, box-shadow .15s ease}
// .band-card:hover{transform:translateY(-2px); box-shadow:0 12px 30px rgba(225,29,46,.10)}
// .band-ic{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:#fff1f2;color:var(--pri);
//   border:1px solid #ffd4d9;font-weight:900}
// .band-h{margin:0 0 4px;font-weight:800}
// .band-p{margin:0;color:var(--sub);font-size:13px}

// /* Toast/alert */
// .alert{margin-top:10px;padding:10px;border-radius:12px}
// .alert.err{background:#fff6f6;border:1px solid #fde2e2;color:#991b1b}
// .alert.ok{background:var(--ok-bg);border:1px solid var(--ok-bd);color:var(--ok-ink)}
// `;

// /* ------------------- Types & helpers ------------------ */
// type BankInfo = { iban: string; beneficiary: string; reference: string; amountMAD: number };
// type CryptoInfo = {
//   chain: "sepolia" | "polygon" | "mainnet";
//   token: "ETH" | "USDC";
//   address: string;
//   amount: number;
//   memo?: string;
//   chainIdHex?: string;       // ex "0xaa36a7"
//   tokenAddress?: string;     // si USDC on-chain
// };

// const ripple = (e: React.MouseEvent<HTMLElement>) => {
//   const host = e.currentTarget as HTMLElement;
//   const span = document.createElement("span");
//   span.className = "rip";
//   const r = host.getBoundingClientRect();
//   span.style.left = `${e.clientX - r.left}px`;
//   span.style.top  = `${e.clientY - r.top}px`;
//   host.appendChild(span);
//   setTimeout(()=> span.remove(), 600);
// };

// async function copy(text: string){
//   try{
//     await navigator.clipboard.writeText(text);
//   }catch{}
// }

// /* ============================= Component ============================= */
// export default function PayPage(){
//   const q = new URLSearchParams(useLocation().search);
//   const investmentId = q.get("investmentId") || "";
//   const nav = useNavigate();

//   const [err,setErr] = useState<string>();
//   const [bank, setBank] = useState<BankInfo | null>(null);
//   const [crypto, setCrypto] = useState<CryptoInfo | null>(null);
//   const [busy, setBusy] = useState(false);
//   const [mode, setMode] = useState<"—"|"Carte"|"Virement"|"Crypto">("—");

//   useEffect(()=>{
//     if(!investmentId) setErr("investmentId manquant");
//   },[investmentId]);

//   /* --------- Actions paiement --------- */
//   async function payByCard(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined);
//       const res = await fetch("http://localhost:3000/api/payments/card/session",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!res?.ok) throw new Error(res?.error || "card_session_failed");
//       setMode("Carte");
//       window.location.href = res.url; // redirection fournisseur
//     }catch(e:any){ setErr(e?.message||"Erreur carte"); }
//     finally{ setBusy(false); }
//   }

//   async function initBank(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined);
//       const res = await fetch("http://localhost:3000/api/payments/bank/init",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!res?.ok) throw new Error(res?.error || "bank_init_failed");
//       setBank(res.bank as BankInfo);
//       setMode("Virement");
//     }catch(e:any){ setErr(e?.message||"Erreur virement"); }
//     finally{ setBusy(false); }
//   }

//   async function initCrypto(){
//     if(!investmentId) return;
//     try{
//       setBusy(true); setErr(undefined);
//       const res = await fetch("http://localhost:3000/api/payments/crypto/init",{
//         method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       if(!res?.ok) throw new Error(res?.error || "crypto_init_failed");
//       setCrypto(res.crypto as CryptoInfo);
//       setMode("Crypto");
//     }catch(e:any){ setErr(e?.message||"Erreur crypto"); }
//     finally{ setBusy(false); }
//   }

//   /* Ouvrir le Wallet en “intent pay” si l’utilisateur préfère payer depuis la page wallet */
//   function openWalletPay(){
//     if(!investmentId) return;
//     const token = crypto?.token || "ETH";
//     const amount = String(crypto?.amount ?? 0);
//     const chainIdHex = crypto?.chainIdHex || "0xaa36a7";  // défaut Sepolia
//     const to = crypto?.address;                            // si déjà connue

//     const qs = new URLSearchParams({
//       intent:"pay",
//       investmentId,
//       method:"crypto",
//       token,
//       amount,
//       chainId: chainIdHex,
//       ...(to ? { to } : {})
//     }).toString();

//     nav(`/wallet?${qs}`);
//   }

//   /* ------------------------------ rendu ------------------------------ */
//   return (
//     <div className="pay-wrap">
//       <style>{CSS}</style>

//       {/* Chips top (étape / id / mode) */}
//       <div className="kpis">
//         <div className="kpi">
//           <span className="dot" />
//           <div>
//             <div className="lab">Étape</div>
//             <div className="val">2 / 3 · Paiement</div>
//           </div>
//         </div>
//         <div className="kpi">
//           <span className="dot" />
//           <div>
//             <div className="lab">Investissement</div>
//             <div className="val">#{investmentId || "—"}</div>
//           </div>
//         </div>
//         <div className="kpi">
//           <span className="dot" />
//           <div>
//             <div className="lab">Mode sélectionné</div>
//             <div className="val">{mode}</div>
//           </div>
//         </div>
//       </div>

//       {/* HERO */}
//       <section className="hero">
//         <h1 className="hero-title">Paiement investissement</h1>
//         <div className="hero-sub">
//           Choisissez un moyen de paiement. Une fois les fonds confirmés, votre <b>NFT</b> est mint automatiquement.
//         </div>
//         <div className="hero-cta">
//           <button className="cta" onClick={(e)=>{ripple(e); nav(-1);}}>← Retour</button>
//           <button className="cta primary" onClick={(e)=>ripple(e)}>Aide & FAQ</button>
//         </div>
//       </section>

//       {/* 3 GRANDES CARTES VERTICALES */}
//       <section className="grid">
//         {/* CARTE */}
//         <article className="card">
//           <header className="card-head">
//             <div className="ic">💳</div>
//             <div>
//               <div className="h3">Carte (Visa / Mastercard)</div>
//               <div className="kicker">Session sécurisée (Stripe/Checkout.com). Capture immédiate.</div>
//             </div>
//           </header>

//           <div className="panel" aria-hidden="true" />

//           <footer className="card-foot">
//             <span className="badge">Investissement #{investmentId || "—"}</span>
//             <button className="btn primary" disabled={busy}
//               onClick={(e)=>{ripple(e); payByCard();}}>
//               Payer par carte
//             </button>
//           </footer>
//         </article>

//         {/* VIREMENT */}
//         <article className="card">
//           <header className="card-head">
//             <div className="ic">🏦</div>
//             <div>
//               <div className="h3">Virement bancaire</div>
//               <div className="kicker">Génère une référence unique + IBAN (J+1/2 ouvrés).</div>
//             </div>
//           </header>

//           <div className="panel">
//             {bank ? (
//               <div style={{fontSize:14,lineHeight:1.55}}>
//                 <div><b>Bénéficiaire :</b> {bank.beneficiary}</div>
//                 <div><b>IBAN :</b> {bank.iban} <button className="btn ghost" onClick={()=>copy(bank.iban)} style={{padding:"4px 8px",marginLeft:6}}>Copier</button></div>
//                 <div><b>Référence :</b> {bank.reference} <button className="btn ghost" onClick={()=>copy(bank.reference)} style={{padding:"4px 8px",marginLeft:6}}>Copier</button></div>
//                 <div><b>Montant :</b> {bank.amountMAD.toLocaleString()} MAD</div>
//                 <div style={{color:"var(--sub)",fontSize:12,marginTop:8}}>
//                   ⚠️ Indiquez bien la <b>référence</b> dans le libellé du virement.
//                 </div>
//               </div>
//             ) : (
//               <div className="kicker" style={{fontSize:13}}>Cliquez pour générer les informations de virement (IBAN + référence).</div>
//             )}
//           </div>

//           <footer className="card-foot">
//             <span className="badge">Investissement #{investmentId || "—"}</span>
//             <button className="btn ghost" disabled={busy}
//               onClick={(e)=>{ripple(e); initBank();}}>
//               Générer les infos virement
//             </button>
//           </footer>
//         </article>

//         {/* CRYPTO */}
//         <article className="card">
//           <header className="card-head">
//             <div className="ic">🪙</div>
//             <div>
//               <div className="h3">Crypto (ETH / USDC)</div>
//               <div className="kicker">Adresse de dépôt ou “Pay with wallet”. Validation 1–2 blocs.</div>
//             </div>
//           </header>

//           <div className="panel">
//             {crypto ? (
//               <div style={{fontSize:14,lineHeight:1.55}}>
//                 <div><b>Réseau :</b> {crypto.chain}</div>
//                 <div><b>Token :</b> {crypto.token}</div>
//                 <div style={{wordBreak:"break-all"}}>
//                   <b>Adresse :</b> {crypto.address}
//                   <button className="btn ghost" onClick={()=>copy(crypto.address)} style={{padding:"4px 8px",marginLeft:6}}>Copier</button>
//                 </div>
//                 <div><b>Montant :</b> {crypto.amount} {crypto.token}</div>
//                 {crypto.memo && <div><b>Memo :</b> {crypto.memo}</div>}
//                 <div style={{color:"var(--sub)",fontSize:12,marginTop:8}}>
//                   Nous vous notifierons dès que la transaction est validée on-chain.
//                 </div>

//                 {/* CTA “Payer avec mon wallet” (ouverture /wallet?intent=pay=...) */}
//                 <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
//                   <button className="btn primary" onClick={(e)=>{ripple(e); openWalletPay();}}>
//                     Ouvrir mon Wallet (intent “pay”)
//                   </button>
//                   <a
//                     className="btn"
//                     onMouseDown={ripple}
//                     href={`ethereum:${crypto.address}${
//                       crypto.token === "ETH"
//                         ? `?value=${BigInt(Math.round(crypto.amount * 1e18)).toString(10)}`
//                         : ""
//                     }`}
//                     target="_blank" rel="noreferrer"
//                   >
//                     Lien direct (EIP-681)
//                   </a>
//                 </div>
//               </div>
//             ) : (
//               <div className="kicker" style={{fontSize:13}}>Cliquez pour obtenir l’adresse de dépôt (ou déclencher “Pay with wallet”).</div>
//             )}
//           </div>

//           <footer className="card-foot">
//             <span className="badge">Investissement #{investmentId || "—"}</span>
//             <button className="btn ghost" disabled={busy}
//               onClick={(e)=>{ripple(e); initCrypto();}}>
//               Obtenir l’adresse de dépôt
//             </button>
//           </footer>
//         </article>
//       </section>

//       {/* Résumé */}
//       <section className="sum">
//         <h3 className="sum-h">Résumé</h3>
//         {err ? (
//           <div className="alert err">{err}</div>
//         ) : (
//           <>
//             <div className="sum-note">
//               Après confirmation, vous recevrez votre <b>attestation PDF</b> et le <b>NFT</b> apparaîtra dans “Mes NFTs”.
//             </div>
//             {mode !== "—" && (
//               <div className="alert ok" style={{marginTop:8}}>
//                 Mode sélectionné : <b>{mode}</b>.
//               </div>
//             )}
//           </>
//         )}
//       </section>

//       {/* Bande d’info bas */}
//       <section className="band">
//         <div className="band-inner">
//           <h3 className="band-title">Vous n’avez pas besoin que le vendeur accepte la crypto</h3>
//           <p className="band-sub">
//             Vous payez en crypto, le vendeur reçoit en fiat côté escrow. Nous gérons la conversion via desk OTC,
//             puis virement bancaire sécurisé à l’entité bénéficiaire.
//           </p>

//           <div className="band-grid">
//             <div className="band-card">
//               <div className="band-ic">🔁</div>
//               <div>
//                 <h4 className="band-h">Conversion instantanée</h4>
//                 <p className="band-p">ETH/USDC convertis au meilleur prix via partenaires régulés.</p>
//               </div>
//             </div>
//             <div className="band-card">
//               <div className="band-ic">🛡️</div>
//               <div>
//                 <h4 className="band-h">Escrow & conformité</h4>
//                 <p className="band-p">Contrôles KYC/AML et séquestre avant décaissement.</p>
//               </div>
//             </div>
//             <div className="band-card">
//               <div className="band-ic">📄</div>
//               <div>
//                 <h4 className="band-h">Attestation & NFT</h4>
//                 <p className="band-p">PDF signé + NFT émis à votre adresse dès validation.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* Illustrations */
import IlluCard from "../assets/pay-card.svg";
import IlluBank from "../assets/pay-bank.png";
import IlluCrypto from "../assets/pay-crypto.png";

/* =========================================================
   Thème : blanc/rouge + titres Sora
========================================================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Sora:wght@600;700;800&display=swap');

:root{
  --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
  --bg:#ffffff; --card:#ffffff;
  --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2;
  --ok-bg:#ecfdf5; --ok-bd:#bbf7d0; --ok-ink:#065f46;
}
*{box-sizing:border-box}
body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
a{text-decoration:none;color:inherit}
b,strong{font-weight:800}

.pay-wrap{max-width:1200px;margin:24px auto 40px;padding:0 18px}
.kpis{display:grid;grid-template-columns:1.2fr .9fr .9fr;gap:10px;margin-bottom:12px}
.kpi{border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:#fff;
     display:flex;align-items:center;gap:10px;box-shadow:0 10px 28px rgba(16,24,40,.04)}
.kpi .dot{width:10px;height:10px;border-radius:999px;background:linear-gradient(120deg,var(--pri),#ff7b8c)}
.kpi .lab{color:var(--sub);font-size:12px}
.kpi .val{font-family:Sora,Inter,system-ui,sans-serif;font-weight:800;letter-spacing:.1px}

.hero{
  border:1px solid var(--line); border-radius:18px; padding:26px 20px;
  background:radial-gradient(1200px 260px at -10% -30%, rgba(225,17,39,.10), #fff0),
             radial-gradient(900px 260px at 110% -20%, rgba(190,18,60,.12), #fff0),
             #fff;
  box-shadow:0 14px 40px rgba(16,24,40,.05)
}
.hero-title{font-size:36px;font-weight:800;font-family:Sora,sans-serif;margin:0}
.hero-sub{margin-top:8px;color:var(--sub)}
.hero-cta{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
.cta{border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer;border:1px solid #fecaca;color:var(--pri);background:#fff}
.cta.primary{background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;border-color:transparent}

.grid{margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.card{display:flex;flex-direction:column;min-height:600px;border:1px solid var(--line);border-radius:18px;background:#fff;padding:18px;box-shadow:0 16px 44px rgba(16,24,40,.05)}
.card-head{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.ic{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:var(--pri-soft);color:var(--pri);font-size:18px;font-weight:900;border:1px solid #ffd4d9}
.h3{margin:0;font-weight:800;font-size:18px;font-family:Sora,sans-serif}
.kicker{color:var(--sub);font-size:12px}

.panel{
  flex:1;border:1px dashed #f1f5f9;border-radius:14px;background:#fafafa;padding:12px;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
}
/* bloc illustration */
.panelIllu{
  width:100%; max-width:440px; aspect-ratio: 4 / 3; 
  display:grid; place-items:center; border-radius:12px;
  background:
    radial-gradient(100% 70% at 0% 0%, rgba(225,29,46,.06), #fff0),
    radial-gradient(120% 75% at 100% 0%, rgba(190,18,60,.06), #fff0),
    #fff;
  border:1px solid #f4d4d9;
  box-shadow:0 10px 28px rgba(16,24,40,.05) inset;
}
.panelIllu img{
  width:78%; height:auto; object-fit:contain;
  filter: drop-shadow(0 8px 20px rgba(16,24,40,.12));
}

.card-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}
.badge{border:1px solid #ffd4d9;background:#fff;color:var(--pri);padding:6px 10px;border-radius:999px;font-weight:800;font-size:12px}
.btn{border-radius:12px;padding:11px 14px;font-weight:800;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink)}
.btn.primary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff}
.btn.ghost{border-color:#fecaca;color:var(--pri);background:#fff}

.sum{margin-top:16px;border:1px solid var(--line);border-radius:18px;padding:14px;background:#fff;box-shadow:0 14px 40px rgba(16,24,40,.04)}
.sum-h{margin:0 0 8px;font-size:16px;font-weight:900;font-family:Sora,sans-serif}
.alert{margin-top:10px;padding:10px;border-radius:12px}
.alert.err{background:#fff6f6;border:1px solid #fde2e2;color:#991b1b}
.alert.ok{background:var(--ok-bg);border:1px solid var(--ok-bd);color:var(--ok-ink)}
.band{margin-top:16px;border:1px solid #fecaca;border-radius:18px;background:linear-gradient(180deg,#fff,#fff6f7 55%, #ffe9ec 100%);box-shadow:0 14px 40px rgba(16,24,40,.05)}
.band-inner{padding:26px 20px;max-width:1100px;margin:0 auto}
.band-title{font-size:26px;font-weight:800;color:#9a1c1c;font-family:Sora,sans-serif;margin:0 0 6px}
.band-sub{color:var(--ink);opacity:.86}
.band-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}
.band-card{border:1px solid #ffd4d9;background:#fff;border-radius:14px;padding:14px;display:flex;gap:10px;align-items:flex-start}
.band-ic{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:#fff1f2;color:var(--pri);border:1px solid #ffd4d9;font-weight:900}
.band-h{margin:0 0 4px;font-weight:800}
.band-p{margin:0;color:var(--sub);font-size:13px}
`;

/* Types */
type BankInfo = { iban: string; beneficiary: string; reference: string; amountMAD: number };
type CryptoInfo = {
  chain: "sepolia" | "polygon" | "mainnet";
  token: "ETH" | "USDC";
  address: string;
  amount: number;
  memo?: string;
  chainIdHex?: string;
  tokenAddress?: string;
};

/* utils */
function ripple(e: React.MouseEvent<HTMLElement>) {
  const host = e.currentTarget as HTMLElement;
  const span = document.createElement("span");
  span.className = "rip";
  const r = host.getBoundingClientRect();
  span.style.position = "absolute";
  span.style.width = "12px"; span.style.height = "12px"; span.style.borderRadius = "999px";
  span.style.background = "rgba(255,255,255,.75)";
  span.style.left = `${e.clientX - r.left}px`;
  span.style.top = `${e.clientY - r.top}px`;
  span.style.transform = "translate(-50%,-50%) scale(0)";
  span.style.animation = "rip .6s ease-out forwards";
  host.appendChild(span);
  setTimeout(() => span.remove(), 600);
}
async function copy(text: string) { try { await navigator.clipboard.writeText(text); } catch {} }
function ethToWeiDecimalString(amount: number | string) {
  const s = String(amount);
  const [i, fRaw = ""] = s.split(".");
  const f = (fRaw + "0".repeat(18)).slice(0, 18);
  const wei = BigInt(i || "0") * (10n ** 18n) + BigInt(f || "0");
  return wei.toString(10);
}
// ajoute cette fonction au composant
// now accepts the attestation URL (and optional filename hint / api base) instead of relying on an external `status`.
async function downloadAttestation(attestationUrl?: string, filenameHint?: string, apiBase = "") {
  if (!attestationUrl) throw new Error("URL attestation manquante");
  const raw = attestationUrl.trim();
  const url = /^https?:\/\//i.test(raw) ? raw : `${apiBase}${raw.startsWith("/") ? "" : "/"}${raw}`;

  const resp = await fetch(url, { credentials: "include" });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  // try to infer filename from Content-Disposition header
  const dispo = resp.headers.get("Content-Disposition") || "";
  const nameMatch = dispo.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  const fallbackName = filenameHint ? filenameHint : `attestation.pdf`;
  const filename = nameMatch ? decodeURIComponent(nameMatch[1]) : fallbackName;

  const blob = await resp.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

/* ============================= Component ============================= */
export default function PayPage() {
  const q = new URLSearchParams(useLocation().search);
  const investmentId = q.get("investmentId") || "";
  const nav = useNavigate();

  const [err, setErr] = useState<string>();
  const [bank, setBank] = useState<BankInfo | null>(null);
  const [crypto, setCrypto] = useState<CryptoInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"—" | "Carte" | "Virement" | "Crypto">("—");

  useEffect(() => { if (!investmentId) setErr("investmentId manquant"); else setErr(undefined); }, [investmentId]);

  async function payByCard() {
    if (!investmentId) return;
    try {
      setBusy(true); setErr(undefined);
      const r = await fetch("http://localhost:3000/api/payments/card/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ investmentId })
      });
      const res = await r.json();
      if (!r.ok || !res?.url) throw new Error(res?.error || "Erreur carte");
      setMode("Carte");
      window.location.href = res.url;
    } catch (e: any) { setErr(e?.message || "Erreur carte"); }
    finally { setBusy(false); }
  }

  async function initBank() {
    if (!investmentId) return;
    try {
      setBusy(true); setErr(undefined);
      const r = await fetch("http://localhost:3000/api/payments/bank/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ investmentId })
      });
      const res = await r.json();
      if (!r.ok || !res?.bank) throw new Error(res?.error || "Erreur virement");
      setBank(res.bank as BankInfo);
      setMode("Virement");
    } catch (e: any) { setErr(e?.message || "Erreur virement"); }
    finally { setBusy(false); }
  }

  async function initCrypto() {
    if (!investmentId) return;
    try {
      setBusy(true); setErr(undefined);
      const r = await fetch("http://localhost:3000/api/payments/crypto/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ investmentId })
      });
      const res = await r.json();
      if (!r.ok || !res?.crypto) throw new Error(res?.error || "Erreur crypto");
      setCrypto(res.crypto as CryptoInfo);
      setMode("Crypto");
    } catch (e: any) { setErr(e?.message || "Erreur crypto"); }
    finally { setBusy(false); }
  }

  function openWalletPay() {
    if (!investmentId) return;
    const token = crypto?.token || "ETH";
    const amount = String(crypto?.amount ?? 0);
    const chainIdHex = crypto?.chainIdHex || "0xaa36a7";
    const to = crypto?.address;
    const qs = new URLSearchParams({
      intent: "pay", investmentId, method: "crypto", token, amount, chainId: chainIdHex, ...(to ? { to } : {})
    }).toString();
    nav(`/wallet?${qs}`);
  }

  return (
    <div className="pay-wrap">
      <style>{CSS}</style>

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi"><span className="dot" /><div><div className="lab">Étape</div><div className="val">2 / 3 · Paiement</div></div></div>
        <div className="kpi"><span className="dot" /><div><div className="lab">Investissement</div><div className="val">#{investmentId || "—"}</div></div></div>
        <div className="kpi"><span className="dot" /><div><div className="lab">Mode sélectionné</div><div className="val">{mode}</div></div></div>
      </div>

      {/* HERO */}
      <section className="hero">
        <h1 className="hero-title">Paiement investissement</h1>
        <div className="hero-sub">Choisissez un moyen de paiement. Une fois les fonds confirmés, votre <b>NFT</b> est mint automatiquement.</div>
        <div className="hero-cta">
          <button className="cta" onClick={(e)=>{ripple(e); nav(-1);}}>← Retour</button>
          <button className="cta primary" onClick={ripple}>Aide & FAQ</button>
        </div>
      </section>

      {/* 3 CARTES */}
      <section className="grid">
        {/* Carte */}
        <article className="card">
          <header className="card-head">
            <div className="ic">💳</div>
            <div>
              <div className="h3">Carte (Visa / Mastercard)</div>
              <div className="kicker">Session sécurisée (Stripe/Checkout). Capture immédiate.</div>
            </div>
          </header>
          <div className="panel">
            <figure className="panelIllu" aria-hidden="true">
              <img src={IlluCard} alt="" loading="lazy" />
            </figure>
          </div>
          <footer className="card-foot">
            <span className="badge">#{investmentId || "—"}</span>
            <button className="btn primary" disabled={busy} onClick={(e)=>{ripple(e); payByCard();}}>Payer par carte</button>
          </footer>
        </article>

        {/* Virement */}
        <article className="card">
          <header className="card-head">
            <div className="ic">🏦</div>
            <div>
              <div className="h3">Virement bancaire</div>
              <div className="kicker">Génère une référence unique + IBAN (J+1/2 ouvrés).</div>
            </div>
          </header>
          <div className="panel">
            {bank ? (
              <div style={{fontSize:14, lineHeight:1.55}}>
                <div><b>Bénéficiaire :</b> {bank.beneficiary}</div>
                <div><b>IBAN :</b> {bank.iban} <button className="btn ghost" onClick={()=>copy(bank.iban)} style={{padding:"4px 8px",marginLeft:6}}>Copier</button></div>
                <div><b>Référence :</b> {bank.reference} <button className="btn ghost" onClick={()=>copy(bank.reference)} style={{padding:"4px 8px",marginLeft:6}}>Copier</button></div>
                <div><b>Montant :</b> {bank.amountMAD.toLocaleString()} MAD</div>
                <div style={{color:"var(--sub)",fontSize:12,marginTop:8}}>⚠️ Indiquez bien la <b>référence</b> dans le libellé du virement.</div>
              </div>
            ) : (
              <figure className="panelIllu" aria-label="Illustration virement bancaire">
                <img src={IlluBank} alt="" loading="lazy" />
              </figure>
            )}
          </div>
          <footer className="card-foot">
            <span className="badge">#{investmentId || "—"}</span>
            <button className="btn ghost" disabled={busy} onClick={(e)=>{ripple(e); initBank();}}>Générer les infos virement</button>
          </footer>
        </article>

        {/* Crypto */}
        <article className="card">
          <header className="card-head">
            <div className="ic">🪙</div>
            <div>
              <div className="h3">Crypto (ETH / USDC)</div>
              <div className="kicker">Adresse de dépôt ou “Pay with wallet”. Validation 1–2 blocs.</div>
            </div>
          </header>
          <div className="panel">
            {crypto ? (
              <div style={{fontSize:14, lineHeight:1.55}}>
                <div><b>Réseau :</b> {crypto.chain}</div>
                <div><b>Token :</b> {crypto.token}</div>
                <div style={{wordBreak:"break-all"}}>
                  <b>Adresse :</b> {crypto.address}
                  <button className="btn ghost" onClick={()=>copy(crypto.address)} style={{padding:"4px 8px",marginLeft:6}}>Copier</button>
                </div>
                <div><b>Montant :</b> {crypto.amount} {crypto.token}</div>
                {crypto.memo && <div><b>Memo :</b> {crypto.memo}</div>}
                <div style={{color:"var(--sub)",fontSize:12,marginTop:8}}>Nous vous notifierons dès que la transaction est validée on-chain.</div>

                <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button className="btn primary" onClick={(e)=>{ripple(e); openWalletPay();}}>Ouvrir mon Wallet (intent “pay”)</button>
                  <a
                    className="btn"
                    onMouseDown={ripple}
                    href={
                      "ethereum:" +
                      crypto.address +
                      (crypto.token === "ETH" ? ("?value=" + ethToWeiDecimalString(crypto.amount)) : "")
                    }
                    target="_blank" rel="noreferrer"
                  >
                    Lien direct (EIP-681)
                  </a>
                </div>
              </div>
            ) : (
              <figure className="panelIllu" aria-label="Illustration paiement crypto">
                <img src={IlluCrypto} alt="" loading="lazy" />
              </figure>
            )}
          </div>
          <footer className="card-foot">
            <span className="badge">#{investmentId || "—"}</span>
            <button className="btn ghost" disabled={busy} onClick={(e)=>{ripple(e); initCrypto();}}>Obtenir l’adresse de dépôt</button>
          </footer>
        </article>
      </section>

      {/* Résumé */}
      <section className="sum">
        <h3 className="sum-h">Résumé</h3>
        {err ? (
          <div className="alert err">{err}</div>
        ) : (
          <>
            <div className="sum-note">
              Après confirmation, vous recevrez votre <b>attestation PDF</b> et le <b>NFT</b> apparaîtra dans “Mes NFTs”.
            </div>
            {mode !== "—" && <div className="alert ok" style={{marginTop:8}}>Mode sélectionné : <b>{mode}</b>.</div>}
          </>
        )}
      </section>

      {/* Bande d’info bas */}
      <section className="band">
        <div className="band-inner">
          <h3 className="band-title">Vous n’avez pas besoin que le vendeur accepte la crypto</h3>
          <p className="band-sub">Vous payez en crypto, le vendeur reçoit en fiat côté escrow. Conversion via desk OTC puis virement sécurisé.</p>
          <div className="band-grid">
            <div className="band-card"><div className="band-ic">🔁</div><div><h4 className="band-h">Conversion instantanée</h4><p className="band-p">ETH/USDC convertis via partenaires régulés.</p></div></div>
            <div className="band-card"><div className="band-ic">🛡️</div><div><h4 className="band-h">Escrow & conformité</h4><p className="band-p">KYC/AML + séquestre avant décaissement.</p></div></div>
            <div className="band-card"><div className="band-ic">📄</div><div><h4 className="band-h">Attestation & NFT</h4><p className="band-p">PDF signé + NFT à la confirmation.</p></div></div>
          </div>
        </div>
      </section>
    </div>
  );
}
