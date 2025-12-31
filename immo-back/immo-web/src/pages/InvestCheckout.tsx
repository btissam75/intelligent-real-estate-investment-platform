// import React, { useEffect, useMemo, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";

// /* ─────────────────────────────────────────────
//    MOCK DB (comme PropertyPage — remplace par fetch API plus tard)
// ────────────────────────────────────────────── */
// type Mode = "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";

// type Property = {
//   id: string;
//   title: string;
//   city: string;
//   description: string;
//   image: string;
//   apr: number;
//   totalPriceMAD: number;
// };

// const DB: Record<string, Property> = {
//   "101": {
//     id: "101",
//     title: "F3 — Casablanca Centre",
//     city: "Casablanca",
//     description:
//       "Appartement F3 lumineux, centre-ville, proche tram. Idéal locatif à forte demande. Rénovation récente, cuisine équipée, balcon.",
//     image:
//       "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
//     apr: 9.2,
//     totalPriceMAD: 1000000,
//   },
//   "202": {
//     id: "202",
//     title: "Villa — Rabat Agdal",
//     city: "Rabat",
//     description:
//       "Villa familiale quartier Agdal, jardin privatif, rendement stable via bail longue durée.",
//     image:
//       "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
//     apr: 8.0,
//     totalPriceMAD: 3000000,
//   },
//   "303": {
//     id: "303",
//     title: "Studio — Marrakech Gueliz",
//     city: "Marrakech",
//     description:
//       "Studio meublé, quartier Gueliz, forte rotation courte durée. Idéal diversification.",
//     image:
//       "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
//     apr: 10.8,
//     totalPriceMAD: 680000,
//   },
// };

// /* ─────────────────────────────────────────────
//    Styles localisés
// ────────────────────────────────────────────── */
// const css = `
// :root{
//   --bg:#fff; --ink:#0b1220; --sub:#6b7280; --line:#e5e7eb;
//   --pri:#e11d2e; --priHi:#be123c; --ok:#10b981; --warn:#f59e0b;
// }
// *{box-sizing:border-box} html,body,#root{height:100%}
// body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit}
// .wrap{max-width:1120px;margin:0 auto;padding:0 18px}
// .h1{margin:0;font-weight:900;font-size:clamp(22px,3.5vw,32px)}
// .h2{margin:0 0 8px;font-weight:900;font-size:18px}
// .grid{display:grid;gap:14px}
// .card{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
// .section{padding:14px}
// .row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
// .sub{color:var(--sub);font-size:13px}
// .kv{display:flex;flex-direction:column}
// .k{font-size:12px;color:var(--sub);font-weight:800}
// .v{font-weight:900}
// .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:#fff;cursor:pointer;font-weight:900}
// .btnPrimary{background:var(--pri);border-color:var(--pri);color:#fff;box-shadow:0 12px 28px rgba(225,29,46,.18)}
// .btnPrimary:hover{transform:translateY(-1px);background:var(--priHi)}
// .badge{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 8px;background:#fff;color:var(--sub);font-weight:800}
// .badgePri{border-color:#fecaca;background:#fff1f2;color:#a71a2b}
// .layout{display:grid;grid-template-columns:1.2fr .8fr;gap:16px}
// @media (max-width: 980px){.layout{grid-template-columns:1fr}}
// .img{width:100%;height:240px;object-fit:cover;border-radius:14px}
// .hr{height:1px;background:var(--line);margin:10px 0}
// .box{border:1px dashed var(--line);border-radius:14px;padding:10px;background:#fff}
// .notes{font-size:12px;color:var(--sub)}
// .payTabs{display:flex;gap:8px;border-bottom:1px solid var(--line);padding:0 10px}
// .tab{padding:8px 10px;border-radius:10px;cursor:pointer;font-weight:800;color:var(--sub)}
// .tab.active{color:var(--pri);background:#fff2f3;border:1px solid #fecaca}
// .inputWrap{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff}
// .input{border:none;outline:none;background:transparent;font-size:16px;width:100%}
// .warn{color:#92400e;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:10px}
// `;

// /* ─────────────────────────────────────────────
//    Helpers
// ────────────────────────────────────────────── */
// const MAD = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " MAD";

// /* ─────────────────────────────────────────────
//    Page
// ────────────────────────────────────────────── */
// export default function InvestCheckout() {
//   const nav = useNavigate();
//   const loc = useLocation();
//   const q = new URLSearchParams(loc.search);

//   // Query params venant de PropertyPage
//   const propertyId = q.get("propertyId") || "101";
//   const mode = (q.get("mode") as Mode) || "COLLECTIVE_VAR";
//   const amountQ = q.get("amount");
//   const unitsQ = q.get("units");

//   // Chargement du bien (mock DB)
//   const property = DB[propertyId] || DB["101"];

//   // Montants/parts choisis
//   const [amount, setAmount] = useState<number>(amountQ ? Number(amountQ) : (mode === "SOLO" ? property.totalPriceMAD : 10000));
//   const [units, setUnits] = useState<number>(unitsQ ? Number(unitsQ) : (mode === "COLLECTIVE_FIXED" ? 1 : 0));

//   // (Simulé) wallet + réseau + auth
//   const [account, setAccount] = useState<string | undefined>(() => localStorage.getItem("evm") || undefined);
//   const [chainId, setChainId] = useState<string | undefined>(() => localStorage.getItem("chainId") || "0xaa36a7"); // sepolia mock
//   const isAuthed = !!localStorage.getItem("token"); // même logique que PropertyPage

//   useEffect(() => {
//     if (!isAuthed) {
//       // petit confort dev: on bypass l'auth si tu veux
//       localStorage.setItem("token", "dev");
//     }
//   }, [isAuthed]);

//   // Calcul parts / rendement
//   const sharePct = useMemo(() => {
//     const invest =
//       mode === "SOLO"
//         ? property.totalPriceMAD
//         : mode === "COLLECTIVE_FIXED"
//         ? (units || 0) * Math.round(property.totalPriceMAD / 10) // demo: prix/lot ~ total/10 (remplace par ton vrai)
//         : (amount || 0);
//     return Math.min(100, (invest / Math.max(1, property.totalPriceMAD)) * 100);
//   }, [mode, units, amount, property]);

//   const yearlyReturnMAD = useMemo(() => {
//     const invest =
//       mode === "SOLO"
//         ? property.totalPriceMAD
//         : mode === "COLLECTIVE_FIXED"
//         ? (units || 0) * Math.round(property.totalPriceMAD / 10)
//         : (amount || 0);
//     return (invest * property.apr) / 100;
//   }, [mode, units, amount, property]);

//   // Gestion méthode de paiement (front-only pour l’instant)
//   const [payMethod, setPayMethod] = useState<"CARD" | "BANK" | "CRYPTO">("CRYPTO");
//   const [tokenSymbol, setTokenSymbol] = useState<"ETH" | "USDC">("ETH");

//   // Préparer le message à signer (ordre d’investissement) → prêt pour MetaMask
//   const orderMessage = useMemo(() => {
//     const nonce = Math.random().toString(36).slice(2);
//     const now = new Date().toISOString();
//     const base = [
//       `Project: ${property.title} (#${property.id})`,
//       `Mode: ${mode}`,
//       mode === "COLLECTIVE_FIXED" ? `Units: ${units}` : `Amount: ${amount} MAD`,
//       `APR Target: ${property.apr}%`,
//       `Timestamp: ${now}`,
//       `Nonce: ${nonce}`,
//     ].join("\n");
//     return base;
//   }, [property, mode, units, amount]);

//   async function connectWallet() {
//     const eth = (window as any).ethereum;
//     if (!eth) {
//       alert("MetaMask non détecté");
//       return;
//     }
//     try {
//       const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
//       setAccount(accs?.[0]);
//       localStorage.setItem("evm", accs?.[0] || "");
//       const cid: string = await eth.request({ method: "eth_chainId" });
//       setChainId(cid);
//       localStorage.setItem("chainId", cid);
//     } catch (e: any) {
//       alert(e?.message || "Connexion refusée");
//     }
//   }

//   async function signOrder() {
//     const eth = (window as any).ethereum;
//     if (!eth || !account) {
//       alert("Connecte d'abord MetaMask.");
//       return;
//     }
//     try {
//       // ICI: personal_sign (simple). Plus tard → SIWE + backend verify.
//       const sig = await eth.request({
//         method: "personal_sign",
//         params: [orderMessage, account],
//       });
//       // Front-only demo : on “valide” et on part sur la page de paiement selon le choix
//       if (payMethod === "CRYPTO") {
//         // Dans un flux réel : on ouvrirait un sendTransaction ou on affiche l’adresse de dépôt.
//         alert(`Ordre signé ✅\nSignature: ${sig}\n\nProchaines étapes: paiement ${tokenSymbol} on-chain (à implémenter).`);
//       } else if (payMethod === "CARD") {
//         alert("Redirection vers page de paiement (Stripe) — à implémenter.");
//       } else {
//         alert("Affichage instructions RIB/IBAN — à implémenter.");
//       }
//     } catch (e: any) {
//       alert(e?.message || "Signature refusée");
//     }
//   }

//   return (
//     <div>
//       <style>{css}</style>
//       <div className="wrap" style={{ padding: "16px 0 26px" }}>
//         {/* Breadcrumbs */}
//         <div className="row" style={{ marginBottom: 8 }}>
//           <div className="row" style={{ gap: 8 }}>
//             <Link to="/" className="badge">Accueil</Link>
//             <span>›</span>
//             <Link to={`/properties/${property.id}`} className="badge">#{property.id}</Link>
//             <span>›</span>
//             <span className="badgePri">Récap investissement</span>
//           </div>
//           <Link to={`/properties/${property.id}`} className="badge">Retour au bien</Link>
//         </div>

//         <h1 className="h1">Confirmer l’investissement</h1>

//         <div className="layout" style={{ marginTop: 12 }}>
//           {/* LEFT : Détails bien + choix */}
//           <div className="grid">
//             <div className="card section">
//               <div className="row">
//                 <div className="kv">
//                   <div className="k">Bien</div>
//                   <div className="v">{property.title}</div>
//                 </div>
//                 <span className="badge">📍 {property.city}</span>
//               </div>
//               <img className="img" src={property.image} alt={property.title} />
//               <div className="hr" />
//               <p className="sub">{property.description}</p>
//               <div className="row">
//                 <span className="badge">APR cible {property.apr}%</span>
//                 <span className="badge">Prix total {MAD(property.totalPriceMAD)}</span>
//               </div>
//             </div>

//             <div className="card section">
//               <h2 className="h2">Votre sélection</h2>
//               <div className="row">
//                 <div className="kv">
//                   <div className="k">Mode</div>
//                   <div className="v">
//                     {mode === "SOLO" ? "Achat solo" : mode === "COLLECTIVE_FIXED" ? "Achat collectif (lots fixes)" : "Achat collectif (montant variable)"}
//                   </div>
//                 </div>
//               </div>

//               {mode === "COLLECTIVE_FIXED" && (
//                 <div className="row">
//                   <div className="kv" style={{ width: "100%" }}>
//                     <div className="k">Lots</div>
//                     <div className="inputWrap">
//                       <input
//                         className="input"
//                         type="number"
//                         min={0}
//                         value={units}
//                         onChange={(e) => setUnits(Math.max(0, Math.trunc(Number(e.target.value) || 0)))}
//                       />
//                       <span>lots</span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {mode !== "COLLECTIVE_FIXED" && (
//                 <div className="row">
//                   <div className="kv" style={{ width: "100%" }}>
//                     <div className="k">Montant</div>
//                     <div className="inputWrap">
//                       <input
//                         className="input"
//                         type="number"
//                         min={0}
//                         value={amount}
//                         onChange={(e) => setAmount(Math.max(0, Math.trunc(Number(e.target.value) || 0)))}
//                       />
//                       <span>MAD</span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="box" style={{ marginTop: 8 }}>
//                 <div className="row">
//                   <div className="kv">
//                     <div className="k">Part estimée</div>
//                     <div className="v">{sharePct.toFixed(2)}%</div>
//                   </div>
//                   <div className="kv">
//                     <div className="k">Rendement annuel (~)</div>
//                     <div className="v">{MAD(yearlyReturnMAD)}</div>
//                   </div>
//                 </div>
//                 <div className="notes" style={{ marginTop: 8 }}>
//                   * Simulation indicative (hors frais/impôts). Ces chiffres seront repris dans votre attestation PDF et les métadonnées NFT.
//                 </div>
//               </div>
//             </div>

//             <div className="card section">
//               <h2 className="h2">Méthode de paiement</h2>
//               <div className="payTabs" style={{ marginTop: 6 }}>
//                 {(["CRYPTO", "CARD", "BANK"] as const).map((m) => (
//                   <div
//                     key={m}
//                     className={`tab ${payMethod === m ? "active" : ""}`}
//                     onClick={() => setPayMethod(m)}
//                   >
//                     {m === "CRYPTO" ? "Crypto (ETH/USDC)" : m === "CARD" ? "Carte" : "Virement"}
//                   </div>
//                 ))}
//               </div>

//               {payMethod === "CRYPTO" && (
//                 <div className="grid" style={{ marginTop: 10 }}>
//                   <div className="row">
//                     <div className="kv">
//                       <div className="k">Token</div>
//                       <div className="v">
//                         <select value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value as "ETH" | "USDC")}>
//                           <option value="ETH">ETH</option>
//                           <option value="USDC">USDC</option>
//                         </select>
//                       </div>
//                     </div>
//                     <span className="badge">Réseau: {chainId === "0x1" ? "Ethereum" : chainId === "0xaa36a7" ? "Sepolia" : chainId || "?"}</span>
//                   </div>
//                   <div className="warn">
//                     Plus tard : on proposera soit « Pay with wallet » (sendTransaction), soit une **adresse de dépôt** à scanner + vérification on-chain côté backend.
//                   </div>
//                 </div>
//               )}

//               {payMethod === "CARD" && (
//                 <div className="grid" style={{ marginTop: 10 }}>
//                   <div className="warn">
//                     Plus tard : on redirigera vers Stripe Checkout. Au succès, le webhook marquera l’investissement “funds_received”.
//                   </div>
//                 </div>
//               )}

//               {payMethod === "BANK" && (
//                 <div className="grid" style={{ marginTop: 10 }}>
//                   <div className="warn">
//                     Plus tard : on affichera le RIB/IBAN. À réception du virement, un admin confirmera le paiement.
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RIGHT : Récap & signature */}
//           <div className="grid">
//             <div className="card section">
//               <h2 className="h2">Récapitulatif</h2>
//               <div className="row">
//                 <div className="kv">
//                   <div className="k">Bien</div>
//                   <div className="v">{property.title}</div>
//                 </div>
//                 <img src={property.image} alt="" style={{ width: 86, height: 62, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
//               </div>
//               <div className="hr" />
//               <div className="grid">
//                 <div className="row">
//                   <span className="k">Ville</span>
//                   <span className="v">{property.city}</span>
//                 </div>
//                 <div className="row">
//                   <span className="k">APR cible</span>
//                   <span className="v">{property.apr}%</span>
//                 </div>
//                 <div className="row">
//                   <span className="k">Prix total</span>
//                   <span className="v">{MAD(property.totalPriceMAD)}</span>
//                 </div>
//                 <div className="row">
//                   <span className="k">Mode</span>
//                   <span className="v">
//                     {mode === "SOLO" ? "Achat solo" : mode === "COLLECTIVE_FIXED" ? "Collectif (lots)" : "Collectif (montant)"}
//                   </span>
//                 </div>
//                 {mode === "COLLECTIVE_FIXED" && (
//                   <div className="row">
//                     <span className="k">Lots</span>
//                     <span className="v">{units}</span>
//                   </div>
//                 )}
//                 {mode !== "COLLECTIVE_FIXED" && (
//                   <div className="row">
//                     <span className="k">Montant</span>
//                     <span className="v">{MAD(amount)}</span>
//                   </div>
//                 )}
//                 <div className="row">
//                   <span className="k">Part estimée</span>
//                   <span className="v">{sharePct.toFixed(2)}%</span>
//                 </div>
//                 <div className="row">
//                   <span className="k">Rendement annuel (~)</span>
//                   <span className="v">{MAD(yearlyReturnMAD)}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="card section">
//               <h2 className="h2">Wallet & signature</h2>
//               <div className="grid">
//                 <div className="row">
//                   <span className="k">Adresse</span>
//                   <span className="v">{account ? account : "—"}</span>
//                 </div>
//                 <div className="row">
//                   <button className="btn" onClick={connectWallet}>
//                     {account ? "Changer d’adresse" : "Connecter MetaMask"}
//                   </button>
//                   <span className="badge">{chainId === "0x1" ? "Ethereum" : chainId === "0xaa36a7" ? "Sepolia" : (chainId || "—")}</span>
//                 </div>
//                 <div className="box">
//                   <div className="k">Message à signer</div>
//                   <pre className="sub" style={{ whiteSpace: "pre-wrap" }}>{orderMessage}</pre>
//                 </div>
//                 <button className="btn btnPrimary" onClick={signOrder} disabled={!account}>
//                   Signer l’ordre dans MetaMask
//                 </button>
//                 <div className="notes">
//                   * La signature prouve que tu acceptes l’ordre. Après réception des fonds, le backend mint le NFT d’attestation et l’ajoute à ton wallet.
//                 </div>
//               </div>
//             </div>

//             <div className="card section">
//               <div className="row">
//                 <Link to={`/properties/${property.id}`} className="btn">← Modifier mon choix</Link>
//                 <button className="btn btnPrimary" onClick={() => nav(`/wallet?nfts=1`)}>
//                   Voir mes titres (NFTs)
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer note */}
//         <div className="wrap" style={{ marginTop: 12 }}>
//           <div className="notes">
//             Quand tu brancheras le backend : <br/>
//             1) `POST /api/investments` avec (propertyId, mode, amount/units, address, signature). <br/>
//             2) En cas de paiement CRYPTO : `sendTransaction` ou dépôt → `GET /api/payments/onchain/confirm?txHash=...`. <br/>
//             3) Backend : upload des métadonnées + PDF sur IPFS, puis `mintTo(userAddress, tokenUri)`. <br/>
//             4) Front : confirmation + NFT visible dans Wallet.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useMemo, useState } from "react";
// import { useLocation } from "react-router-dom";

// export default function InvestCheckout(){
//   const loc = useLocation();
//   const q = new URLSearchParams(loc.search);
//   const propertyId = q.get("propertyId") || "101";
//   const mode = (q.get("mode") as "SOLO"|"COLLECTIVE_FIXED"|"COLLECTIVE_VAR") || "COLLECTIVE_VAR";
//   const amountQ = q.get("amount"); const unitsQ = q.get("units");

//   const [account,setAccount] = useState<string>();
//   const [orderSig,setOrderSig] = useState<string>();
//   const [investmentId,setInvestmentId] = useState<string>();
//   const [payment,setPayment] = useState<any>();

//   const amount = amountQ ? Number(amountQ) : undefined;
//   const units = unitsQ ? Number(unitsQ) : undefined;

//   const orderMessage = useMemo(()=>{
//     const nonce = Math.random().toString(36).slice(2);
//     return [
//       `property: ${propertyId}`,
//       `mode: ${mode}`,
//       amount ? `amount: ${amount} MAD` : `units: ${units||0}`,
//       `nonce: ${nonce}`
//     ].join("\n");
//   },[propertyId, mode, amount, units]);

//   async function connectAndSiwe(){
//     const eth = (window as any).ethereum;
//     if(!eth) return alert("MetaMask manquant");
//     const [addr] = await eth.request({ method:"eth_requestAccounts" });
//     setAccount(addr);
//     // 1) récupérer nonce backend
//     const n = await fetch("http://localhost:3000/auth/nonce",{ credentials:"include" }).then(r=>r.json());
//     const siweMessage =
// `domain: ${window.location.host}
// address: ${addr}
// statement: Login
// nonce: ${n.nonce}
// issuedAt: ${new Date().toISOString()}`;
//     const sig = await eth.request({ method:"personal_sign", params:[siweMessage, addr] });
//     const ok = await fetch("http://localhost:3000/auth/verify",{
//       method:"POST", credentials:"include",
//       headers:{ "Content-Type":"application/json" },
//       body: JSON.stringify({ address: addr, message: siweMessage, signature: sig })
//     }).then(r=>r.json());
//     if(!ok?.ok) throw new Error("SIWE failed");
//     alert("Connecté ✓");
//   }

//   async function signOrderAndCreateInvestment(){
//     const eth = (window as any).ethereum;
//     if(!eth || !account) return alert("Connecte d'abord");

//     // 2) signer l’ordre
//     const sig = await eth.request({ method:"personal_sign", params:[orderMessage, account] });
//     setOrderSig(sig);

//     // 3) créer l’investissement
//     const res = await fetch("http://localhost:3000/api/investments",{
//       method:"POST", credentials:"include",
//       headers:{ "Content-Type":"application/json" },
//       body: JSON.stringify({
//         propertyId, mode, amountMAD: amount, units, orderMessage, signature: sig
//       })
//     }).then(r=>r.json());

//     if(!res?.ok) return alert("Erreur création investissement");
//     setInvestmentId(res.investment.id);
//     setPayment(res.payment);
//     alert(`Invest créé (#${res.investment.id}). Choisis un paiement ou confirme côté admin.`);
//   }

//   return (
//     <div style={{maxWidth:820, margin:"20px auto", padding:"0 16px"}}>
//       <h1>Checkout investissement</h1>
//       <p>Bien: <b>{propertyId}</b></p>
//       <p>Mode: <b>{mode}</b></p>
//       {amount && <p>Montant: <b>{amount} MAD</b></p>}
//       {units && <p>Lots: <b>{units}</b></p>}

//       <hr/>
//       <p>Adresse: {account || "—"}</p>
//       <button onClick={connectAndSiwe}>1) Connecter & SIWE</button>

//       <hr/>
//       <pre>{orderMessage}</pre>
//       <button onClick={signOrderAndCreateInvestment} disabled={!account}>2) Signer l’ordre & créer l’investissement</button>

//       {investmentId && (
//         <>
//           <hr/>
//           <h3>Paiement</h3>
//           <pre>{JSON.stringify(payment,null,2)}</pre>

//           <div style={{display:"flex", gap:8}}>
//             <button onClick={async()=>{
//               const ok = await fetch("http://localhost:3000/api/payments/confirm",{
//                 method:"POST", credentials:"include",
//                 headers:{ "Content-Type":"application/json" },
//                 body: JSON.stringify({ investmentId })
//               }).then(r=>r.json());
//               alert("funds_received ✓ (bank/mock)");
//             }}>3A) Confirmer (bank/mock)</button>

//             <button onClick={async()=>{
//               const ok = await fetch(`http://localhost:3000/api/payments/onchain/confirm?investmentId=${investmentId}&txHash=0xmock`,{
//                 credentials:"include"
//               }).then(r=>r.json());
//               alert("funds_received ✓ (onchain/mock)");
//             }}>3B) Confirmer (on-chain/mock)</button>
//           </div>

//           <div style={{marginTop:10}}>
//             <button onClick={async()=>{
//               const ok = await fetch(`http://localhost:3000/api/nft/mint?investmentId=${investmentId}`,{
//                 method:"POST", credentials:"include"
//               }).then(r=>r.json());
//               alert(`NFT minté ✓ tokenId=${ok.tokenId}`);
//             }}>4) Mint NFT (admin/cron)</button>
//           </div>
//         </>
//       )}
//     </div>
//   );
//}
// immo-web/src/pages/InvestCheckout.tsx
//[[[[[[[[[[[[[[[[[hna]]]]]]]]]]]]]]]]]
// import React, { useMemo, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// function truncateMiddle(str?: string, keep = 6) {
//   if (!str) return "—";
//   return str.length <= keep * 2 + 3 ? str : `${str.slice(0, keep)}…${str.slice(-keep)}`;
// }

// export default function InvestCheckout() {
//   const nav = useNavigate();
//   const loc = useLocation();
//   const q = new URLSearchParams(loc.search);

//   // --- Params reçus depuis PropertyPage ---
//   const propertyId = q.get("propertyId") || "101";
//   const mode = (q.get("mode") as "SOLO"|"COLLECTIVE_FIXED"|"COLLECTIVE_VAR") || "COLLECTIVE_FIXED";
//   const amountQ = q.get("amount");
//   const unitsQ  = q.get("units");
//   const amount  = amountQ ? Number(amountQ) : undefined;
//   const units   = unitsQ ? Number(unitsQ) : 1;

//   // NEW: pour l’affichage + pour pousser au backend
//   const propertyTitle = q.get("propertyTitle") || undefined;
//   const imageUrl = q.get("imageUrl") || undefined;

//   const [account,setAccount]             = useState<string>();
//   const [isSiwe,setIsSiwe]               = useState(false);
//   const [orderSig,setOrderSig]           = useState<string>();
//   const [investmentId,setInvestmentId]   = useState<string>();
//   const [payment,setPayment]             = useState<any>();
//   const [busy,setBusy]                   = useState(false);
//   const [info,setInfo]                   = useState<string>();
//   const [err,setErr]                     = useState<string>();

//   const orderMessage = useMemo(()=>{
//     const nonce = Math.random().toString(36).slice(2);
//     return [
//       `property: ${propertyId}`,
//       `mode: ${mode}`,
//       amount ? `amount: ${amount} MAD` : `units: ${units}`,
//       `nonce: ${nonce}`
//     ].join("\n");
//   },[propertyId, mode, amount, units]);

//   async function connectAndSiwe(){
//     try{
//       setErr(undefined); setInfo(undefined); setBusy(true);
//       const eth = (window as any).ethereum;
//       if(!eth) throw new Error("MetaMask manquant");
//       const [addr] = await eth.request({ method:"eth_requestAccounts" });
//       setAccount(addr);

//       const n = await fetch("http://localhost:3000/auth/nonce",{ credentials:"include" }).then(r=>r.json());
//       const siweMessage =
// `domain: ${window.location.host}
// address: ${addr}
// statement: Login
// nonce: ${n.nonce}
// issuedAt: ${new Date().toISOString()}`;
//       const sig = await eth.request({ method:"personal_sign", params:[siweMessage, addr] });
//       const ok = await fetch("http://localhost:3000/auth/verify",{
//         method:"POST", credentials:"include",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify({ address: addr, message: siweMessage, signature: sig })
//       }).then(r=>r.json());
//       if(!ok?.ok) throw new Error("SIWE failed");
//       setIsSiwe(true);
//       setInfo("Connecté & lié (SIWE) ✓");
//     }catch(e:any){ setErr(e?.message||"Erreur SIWE"); }
//     finally{ setBusy(false); }
//   }

//   async function signOrderAndCreateInvestment(){
//     try{
//       setErr(undefined); setInfo(undefined); setBusy(true);
//       const eth = (window as any).ethereum;
//       if(!eth || !account) throw new Error("Connecte d'abord");
//       const sig = await eth.request({ method:"personal_sign", params:[orderMessage, account] });
//       setOrderSig(sig);

//       // IMPORTANT: on envoie aussi propertyTitle + imageUrl
//       const res = await fetch("http://localhost:3000/api/investments",{
//         method:"POST", credentials:"include",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify({
//           propertyId, mode,
//           amountMAD: amount, units,
//           orderMessage, signature: sig,
//           propertyTitle,      // ← NEW
//           imageUrl            // ← NEW
//         })
//       }).then(r=>r.json());

//       if(!res?.ok) throw new Error(res?.error || "Erreur création investissement");
//       setInvestmentId(res.investment.id);
//       setPayment(res.payment);
//       setInfo(`Investissement #${res.investment.id} créé.`);
//     }catch(e:any){ setErr(e?.message||"Erreur investissement"); }
//     finally{ setBusy(false); }
//   }

//   async function confirmBank(){
//     if(!investmentId) return;
//     setBusy(true); setErr(undefined); setInfo(undefined);
//     try{
//       await fetch("http://localhost:3000/api/payments/confirm",{
//         method:"POST", credentials:"include",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       setInfo("funds_received ✓ (bank/mock)");
//     }catch(e:any){ setErr(e?.message||"Erreur paiement"); }
//     finally{ setBusy(false); }
//   }

//   async function confirmOnchain(){
//     if(!investmentId) return;
//     setBusy(true); setErr(undefined); setInfo(undefined);
//     try{
//       await fetch(`http://localhost:3000/api/payments/onchain/confirm?investmentId=${investmentId}&txHash=0xmock`,{
//         credentials:"include"
//       }).then(r=>r.json());
//       setInfo("funds_received ✓ (on-chain/mock)");
//     }catch(e:any){ setErr(e?.message||"Erreur paiement on-chain"); }
//     finally{ setBusy(false); }
//   }

//   async function adminMint(){
//     if(!investmentId) return;
//     setBusy(true); setErr(undefined); setInfo(undefined);
//     try{
//       const ok = await fetch(`http://localhost:3000/api/nft/mint?investmentId=${investmentId}`,{
//         method:"POST", credentials:"include"
//       }).then(r=>r.json());
//       setInfo(`NFT minté ✓ tokenId=${ok.tokenId}`);
//       setTimeout(()=> nav("/tokens"), 500);
//     }catch(e:any){ setErr(e?.message||"Erreur mint"); }
//     finally{ setBusy(false); }
//   }

//   return (
//     <div style={{maxWidth:860, margin:"24px auto", padding:"0 16px"}}>
//       <h1 style={{fontSize:28, fontWeight:800, marginBottom:6}}>Checkout investissement</h1>
//       <div style={{color:"#6b7280", marginBottom:16}}>
//         Vérifie les détails, connecte & signe, puis crée l’investissement.
//       </div>

//       <div style={{border:"1px solid #e5e7eb", borderRadius:12, padding:16}}>
//         {/* Aperçu du bien */}
//         <div style={{display:"grid", gridTemplateColumns:"96px 1fr", gap:12, alignItems:"center", marginBottom:12}}>
//           <div style={{width:96, height:72, borderRadius:8, overflow:"hidden", border:"1px solid #e5e7eb", background:"#f8fafc"}}>
//             {imageUrl
//               ? <img src={imageUrl} alt={propertyTitle||propertyId} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
//               : <div style={{display:"grid",placeItems:"center",height:"100%", color:"#94a3b8", fontSize:12}}>Aperçu</div>}
//           </div>
//           <div>
//             <div style={{fontSize:12, color:"#6b7280"}}>Bien</div>
//             <div style={{fontWeight:700}}>{propertyTitle || `#${propertyId}`}</div>
//           </div>
//         </div>

//         <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12}}>
//           <Info label="ID"    value={propertyId}/>
//           <Info label="Mode"  value={mode}/>
//           {amount!==undefined && <Info label="Montant" value={`${amount} MAD`}/>}
//           {units!==undefined  && <Info label="Lots"    value={String(units)}/>}
//         </div>

//         <hr style={{margin:"16px 0"}}/>

//         <div>
//           <Label>Liaison & adresse</Label>
//           <div style={{display:"flex", gap:8, alignItems:"center"}}>
//             <Badge>{truncateMiddle(account)}</Badge>
//             {!isSiwe ? (
//               <button onClick={connectAndSiwe} disabled={busy} className="btn">1) Connecter & SIWE</button>
//             ) : (
//               <span className="badge">Lié ✓</span>
//             )}
//           </div>
//         </div>

//         <hr style={{margin:"16px 0"}}/>

//         <div>
//           <Label>Résumé de l’ordre</Label>
//           <pre style={{background:"#f9fafb", padding:12, borderRadius:8, whiteSpace:"pre-wrap"}}>{orderMessage}</pre>
//           <button onClick={signOrderAndCreateInvestment} disabled={!account || !isSiwe || busy} className="btn btnPrimary">
//             2) Signer l’ordre & créer l’investissement
//           </button>
//         </div>

//         {investmentId && (
//           <>
//             <hr style={{margin:"16px 0"}}/>
//             <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
//               <div className="badge">Investissement #{investmentId}</div>
//               <button onClick={confirmBank}    disabled={busy} className="btn btnSmall">3A) Confirmer (bank/mock)</button>
//               <button onClick={confirmOnchain} disabled={busy} className="btn btnSmall">3B) Confirmer (on-chain/mock)</button>
//               <button onClick={adminMint}      disabled={busy} className="btn btnPrimary">4) Mint NFT (admin/cron)</button>
//               <a href="/tokens" className="btn btnGhost">Voir mes NFTs</a>
//             </div>
//             {payment && (
//               <div style={{marginTop:12}}>
//                 <Label>Paiement (dev/mock)</Label>
//                 <pre style={{background:"#f9fafb", padding:12, borderRadius:8}}>{JSON.stringify(payment,null,2)}</pre>
//               </div>
//             )}
//           </>
//         )}

//         {(info || err) && (
//           <div style={{
//             marginTop:12, padding:12, borderRadius:8,
//             background: err ? "#fff6f6" : "#f5f7ff",
//             border: `1px solid ${err ? "#fde2e2" : "#dfe3ff"}`, color: err ? "#991b1b" : "#1f3af5"
//           }}>
//             {err || info}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function Label({children}:{children:React.ReactNode}) {
//   return <div style={{fontSize:12, color:"#6b7280", marginBottom:4}}>{children}</div>;
// }
// function Info({label,value}:{label:string; value:string}) {
//   return (
//     <div>
//       <Label>{label}</Label>
//       <div style={{fontWeight:600}}>{value}</div>
//     </div>
//   );
// }
// function Badge({children}:{children:React.ReactNode}) {
//   return <span style={{border:"1px solid #e5e7eb", padding:"4px 8px", borderRadius:8, fontSize:12}}>{children}</span>;
// }
//[[[[[[[[[[[[[[[hna2]]]]]]]]]]]]]]]
// src/pages/InvestCheckout.tsx
// import React, { useMemo, useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// /* ── Thème & animations (blanc/rouge) ───────────────────────────────── */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
// :root{
//   --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
//   --bg:#ffffff; --card:#ffffff;
//   --pri:#e11d2e; --pri-700:#be123c; --pri-fade:#fff1f2;
// }
// *{box-sizing:border-box} body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// .ck-wrap{max-width: 1160px; margin: 28px auto; padding: 0 16px}
// @media (min-width: 1440px){
// .ck-wrap{max-width: 1320px}
// }
// .ck-title{margin:0 0 6px; font-weight:800; font-size:28px; letter-spacing:-.01em}
// .ck-sub{color:var(--sub); margin-bottom:16px}

// /* Steps */
// .ck-steps{display:flex; gap:10px; align-items:center; margin:8px 0 14px}
// .ck-step{display:flex; align-items:center; gap:8px}
// .ck-dot{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;
//   background:var(--pri-fade); color:var(--pri); font-weight:800; font-size:12px;
//   border:1px solid #ffd4d9; box-shadow:0 6px 16px rgba(225,29,46,.06)}
// .ck-step.done .ck-dot{background:linear-gradient(135deg,var(--pri),var(--pri-700)); color:#fff; border-color:transparent}
// .ck-bar{flex:1;height:4px;background:#f1f5f9;border-radius:999px;position:relative;overflow:hidden}
// .ck-bar>span{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#fecaca,#dc2626);width:0%}
// /* Card */
// .ck-card{border:1px solid var(--line); border-radius:16px; background:var(--card); padding:16px;
//   box-shadow:0 12px 34px rgba(16,24,40,.04); transition: box-shadow .2s ease, transform .2s ease}
// .ck-card:hover{transform:translateY(-1px); box-shadow:0 16px 44px rgba(16,24,40,.06)}

// /* Preview */
// .ck-prev{display:grid; grid-template-columns:96px 1fr; gap:12px; align-items:center; margin-bottom:12px}
// .ck-thumb{width:96px; height:72px; border-radius:10px; overflow:hidden; border:1px solid var(--line); background:#f8fafc}
// .ck-thumb>img{width:100%; height:100%; object-fit:cover; display:block}
// .ck-k{font-size:12px; color:var(--sub)}
// .ck-v{font-weight:800}

// /* Info grid */
// .ck-grid{display:grid; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); gap:12px}
// .ck-info .ck-v{padding:8px 12px; border:1px solid var(--line); border-radius:12px; background:#fff}

// /* Code block */
// .ck-code{background:#f9fafb; padding:12px; border-radius:10px; white-space:pre-wrap; border:1px solid #edf0f3}

// /* Badges & chips */
// .badge{border:1px solid var(--line); padding:4px 8px; border-radius:10px; font-size:12px}
// .chip-ok{border-color:#c7f8d9;background:#ecfdf5;color:#166534}
// .chip-warn{border-color:#ffe3e6;background:#fff5f6;color:#a10f20}

// /* Buttons */
// .btn{position:relative; overflow:hidden; border-radius:12px; padding:11px 14px; font-weight:800; cursor:pointer;
//   border:1px solid var(--line); background:#fff; color:var(--ink); transition:transform .06s ease, box-shadow .15s ease}
// .btnSmall{padding:8px 10px; font-weight:700}
// .btn:active{transform:scale(.98)}
// .btnPrimary{border-color:var(--pri); background:linear-gradient(135deg,var(--pri),var(--pri-700)); color:#fff; box-shadow:0 12px 34px rgba(225,29,46,.15)}
// .btnGhost{border-color:#ffd4d9; color:var(--pri); background:#fff}
// .btn[disabled]{opacity:.6; cursor:not-allowed}
// .btn .rip{position:absolute; inset:auto; width:12px; height:12px; border-radius:9999px; background:rgba(255,255,255,.75);
//   transform:translate(-50%,-50%) scale(0); animation:ripple .6s ease-out forwards}
// @keyframes ripple{to{transform:translate(-50%,-50%) scale(22); opacity:0}}

// /* Row actions */
// .ck-actions{display:flex; gap:8px; align-items:center; flex-wrap:wrap}

// /* Alerts */
// .alert{margin-top:12px; padding:12px; border-radius:12px}
// .alert.ok{background:#f5f8ff; border:1px solid #dfe6ff; color:#1f3af5}
// .alert.err{background:#fff6f6; border:1px solid #fde2e2; color:#991b1b}

// /* Loader (busy) */
// .spinner{width:16px;height:16px;border-radius:9999px;border:2px solid #fff;border-right-color:transparent;display:inline-block;margin-left:8px; animation:s .6s linear infinite}
// @keyframes s{to{transform:rotate(360deg)}}

// /* Confetti (succès mint) */
// .confetti{position:fixed;inset:0;pointer-events:none}
// .confetti i{position:absolute; width:8px;height:12px;background:linear-gradient(180deg,#fff,#ffd4d9); border-radius:2px;
//   animation:drop 900ms ease-in forwards}
// @keyframes drop{0%{transform:translateY(-20vh) rotate(0)} 100%{transform:translate(var(--x,0), 100vh) rotate(340deg); opacity:0}}
// `;

// /* ── helpers ───────────────────────────────────────────────────────── */
// function truncateMiddle(str?: string, keep = 6) {
//   if (!str) return "—";
//   return str.length <= keep * 2 + 3 ? str : `${str.slice(0, keep)}…${str.slice(-keep)}`;
// }
// function ripple(e: React.MouseEvent<HTMLButtonElement>) {
//   const btn = e.currentTarget as HTMLButtonElement;
//   const r = document.createElement("span");
//   r.className = "rip";
//   const rect = btn.getBoundingClientRect();
//   r.style.left = `${e.clientX - rect.left}px`;
//   r.style.top = `${e.clientY - rect.top}px`;
//   btn.appendChild(r);
//   setTimeout(() => r.remove(), 600);
// }

// /* ── Component ─────────────────────────────────────────────────────── */
// export default function InvestCheckout() {
//   const nav = useNavigate();
//   const loc = useLocation();
//   const q = new URLSearchParams(loc.search);

//   // Params reçus
//   const propertyId = q.get("propertyId") || "101";
//   const mode = (q.get("mode") as "SOLO"|"COLLECTIVE_FIXED"|"COLLECTIVE_VAR") || "COLLECTIVE_FIXED";
//   const amountQ = q.get("amount");
//   const unitsQ  = q.get("units");
//   const amount  = amountQ ? Number(amountQ) : undefined;
//   const units   = unitsQ ? Number(unitsQ) : 1;
//   const propertyTitle = q.get("propertyTitle") || undefined;
//   const imageUrl = q.get("imageUrl") || undefined;

//   // State
//   const [account,setAccount]             = useState<string>();
//   const [isSiwe,setIsSiwe]               = useState(false);
//   const [orderSig,setOrderSig]           = useState<string>();
//   const [investmentId,setInvestmentId]   = useState<string>();
//   const [payment,setPayment]             = useState<any>();
//   const [busy,setBusy]                   = useState(false);
//   const [info,setInfo]                   = useState<string>();
//   const [err,setErr]                     = useState<string>();
//   const barRef = useRef<HTMLSpanElement|null>(null);

//   // Steps progress (0..3)
//   const step = !isSiwe ? 0 : !orderSig ? 1 : !investmentId ? 2 : 3;
//   useEffect(() => {
//     const pcts = [0, 33, 66, 100];
//     if (barRef.current) barRef.current.style.width = `${pcts[step]}%`;
//   }, [step]);

//   // Order message
//   const orderMessage = useMemo(()=>{
//     const nonce = Math.random().toString(36).slice(2);
//     return [
//       `property: ${propertyId}`,
//       `mode: ${mode}`,
//       amount ? `amount: ${amount} MAD` : `units: ${units}`,
//       `nonce: ${nonce}`
//     ].join("\n");
//   },[propertyId, mode, amount, units]);

//   async function connectAndSiwe(){
//     try{
//       setErr(undefined); setInfo(undefined); setBusy(true);
//       const eth = (window as any).ethereum;
//       if(!eth) throw new Error("MetaMask manquant");
//       const [addr] = await eth.request({ method:"eth_requestAccounts" });
//       setAccount(addr);

//       const n = await fetch("http://localhost:3000/auth/nonce",{ credentials:"include" }).then(r=>r.json());
//       const siweMessage =
// `domain: ${window.location.host}
// address: ${addr}
// statement: Login
// nonce: ${n.nonce}
// issuedAt: ${new Date().toISOString()}`;
//       const sig = await eth.request({ method:"personal_sign", params:[siweMessage, addr] });
//       const ok = await fetch("http://localhost:3000/auth/verify",{
//         method:"POST", credentials:"include",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify({ address: addr, message: siweMessage, signature: sig })
//       }).then(r=>r.json());
//       if(!ok?.ok) throw new Error("SIWE failed");
//       setIsSiwe(true);
//       setInfo("Connecté & lié (SIWE) ✓");
//     }catch(e:any){ setErr(e?.message||"Erreur SIWE"); }
//     finally{ setBusy(false); }
//   }

//   async function signOrderAndCreateInvestment(){
//     try{
//       setErr(undefined); setInfo(undefined); setBusy(true);
//       const eth = (window as any).ethereum;
//       if(!eth || !account) throw new Error("Connecte d'abord");
//       const sig = await eth.request({ method:"personal_sign", params:[orderMessage, account] });
//       setOrderSig(sig);

//       const res = await fetch("http://localhost:3000/api/investments",{
//         method:"POST", credentials:"include",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify({
//           propertyId, mode,
//           amountMAD: amount, units,
//           orderMessage, signature: sig,
//           propertyTitle, imageUrl
//         })
//       }).then(r=>r.json());

//       if(!res?.ok) throw new Error(res?.error || "Erreur création investissement");
//       setInvestmentId(res.investment.id);
//       setPayment(res.payment);
//       setInfo(`Investissement #${res.investment.id} créé.`);
//     }catch(e:any){ setErr(e?.message||"Erreur investissement"); }
//     finally{ setBusy(false); }
//   }

//   async function confirmBank(){
//     if(!investmentId) return;
//     setBusy(true); setErr(undefined); setInfo(undefined);
//     try{
//       await fetch("http://localhost:3000/api/payments/confirm",{
//         method:"POST", credentials:"include",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify({ investmentId })
//       }).then(r=>r.json());
//       setInfo("funds_received ✓ (bank/mock)");
//     }catch(e:any){ setErr(e?.message||"Erreur paiement"); }
//     finally{ setBusy(false); }
//   }

//   async function confirmOnchain(){
//     if(!investmentId) return;
//     setBusy(true); setErr(undefined); setInfo(undefined);
//     try{
//       await fetch(`http://localhost:3000/api/payments/onchain/confirm?investmentId=${investmentId}&txHash=0xmock`,{
//         credentials:"include"
//       }).then(r=>r.json());
//       setInfo("funds_received ✓ (on-chain/mock)");
//     }catch(e:any){ setErr(e?.message||"Erreur paiement on-chain"); }
//     finally{ setBusy(false); }
//   }

//   function popConfetti(){
//     const root = document.createElement('div');
//     root.className = 'confetti';
//     document.body.appendChild(root);
//     const N = 40;
//     for(let i=0;i<N;i++){
//       const p = document.createElement('i');
//       p.style.left = `${Math.random()*100}vw`;
//       p.style.setProperty('--x', `${(Math.random()*2-1)*40}vw`);
//       p.style.background = Math.random()<.5
//         ? 'linear-gradient(180deg,#fff,#ffd4d9)'
//         : 'linear-gradient(180deg,#ffe4e6,#fecaca)';
//       root.appendChild(p);
//       setTimeout(()=>p.remove(), 1000);
//     }
//     setTimeout(()=>root.remove(), 1100);
//   }

//   async function adminMint(){
//     if(!investmentId) return;
//     setBusy(true); setErr(undefined); setInfo(undefined);
//     try{
//       const ok = await fetch(`http://localhost:3000/api/nft/mint?investmentId=${investmentId}`,{
//         method:"POST", credentials:"include"
//       }).then(r=>r.json());
//       setInfo(`NFT minté ✓ tokenId=${ok.tokenId}`);
//       popConfetti();
//       setTimeout(()=> nav("/tokens"), 600);
//     }catch(e:any){ setErr(e?.message||"Erreur mint"); }
//     finally{ setBusy(false); }
//   }

//   return (
//     <div className="ck-wrap">
//       <style>{CSS}</style>

//       <h1 className="ck-title">Checkout investissement</h1>
//       <div className="ck-sub">Vérifie les détails, connecte & signe, puis crée l’investissement.</div>

//       {/* Steps */}
//       <div className="ck-steps">
//         <div className={`ck-step ${isSiwe ? "done" : ""}`}><span className="ck-dot">1</span><b>Liaison</b></div>
//         <div className="ck-bar"><span ref={barRef}/></div>
//         <div className={`ck-step ${orderSig ? "done" : ""}`}><span className="ck-dot">2</span><b>Signature</b></div>
//         <div className="ck-bar"><span/></div>
//         <div className={`ck-step ${investmentId ? "done" : ""}`}><span className="ck-dot">3</span><b>Investissement</b></div>
//       </div>

//       <div className="ck-card">
//         {/* Aperçu du bien */}
//         <div className="ck-prev">
//           <div className="ck-thumb">
//             {imageUrl
//               ? <img src={imageUrl} alt={propertyTitle||propertyId}/>
//               : <div style={{display:"grid",placeItems:"center",height:"100%", color:"#94a3b8", fontSize:12}}>Aperçu</div>}
//           </div>
//           <div>
//             <div className="ck-k">Bien</div>
//             <div className="ck-v">{propertyTitle || `#${propertyId}`}</div>
//           </div>
//         </div>

//         {/* Infos */}
//         <div className="ck-grid ck-info">
//           <div><div className="ck-k">ID</div><div className="ck-v">{propertyId}</div></div>
//           <div><div className="ck-k">Mode</div><div className="ck-v">{mode}</div></div>
//           {amount!==undefined && <div><div className="ck-k">Montant</div><div className="ck-v">{amount} MAD</div></div>}
//           {units!==undefined  && <div><div className="ck-k">Lots</div><div className="ck-v">{units}</div></div>}
//         </div>

//         <hr style={{margin:"16px 0"}}/>

//         {/* Connexion & SIWE */}
//         <div>
//           <div className="ck-k">Liaison & adresse</div>
//           <div className="ck-actions">
//             <span className="badge">{truncateMiddle(account)}</span>
//             {!isSiwe ? (
//               <button className="btn btnGhost"
//                 onClick={(e)=>{ripple(e); connectAndSiwe();}}
//                 disabled={busy}>
//                 1) Connecter & SIWE {busy && <span className="spinner" />}
//               </button>
//             ) : (
//               <span className="badge chip-ok">Lié ✓</span>
//             )}
//           </div>
//         </div>

//         <hr style={{margin:"16px 0"}}/>

//         {/* Ordre */}
//         <div>
//           <div className="ck-k">Résumé de l’ordre</div>
//           <pre className="ck-code">{orderMessage}</pre>
//           <button
//             className="btn btnPrimary"
//             onClick={(e)=>{ripple(e); signOrderAndCreateInvestment();}}
//             disabled={!account || !isSiwe || busy}
//           >
//             2) Signer l’ordre & créer l’investissement
//             {busy && <span className="spinner" />}
//           </button>
//         </div>

//         {/* Actions après création */}
//         {investmentId && (
//           <>
//             <hr style={{margin:"16px 0"}}/>
//             <div className="ck-actions">
//               <span className="badge">Investissement #{investmentId}</span>
//               <button className="btn btnSmall btnGhost" onClick={(e)=>{ripple(e); confirmBank();}} disabled={busy}>3A) Confirmer (bank/mock)</button>
//               <button className="btn btnSmall btnGhost" onClick={(e)=>{ripple(e); confirmOnchain();}} disabled={busy}>3B) Confirmer (on-chain/mock)</button>
//               <button className="btn btnPrimary" onClick={(e)=>{ripple(e); adminMint();}} disabled={busy}>4) Mint NFT (admin/cron)</button>
//               <a href="/tokens" className="btn btnGhost btnSmall" onMouseDown={ripple}>Voir mes NFTs</a>
//             </div>

//             {payment && (
//               <div style={{marginTop:12}}>
//                 <div className="ck-k">Paiement (dev/mock)</div>
//                 <pre className="ck-code">{JSON.stringify(payment,null,2)}</pre>
//               </div>
//             )}
//           </>
//         )}

//         {(info || err) && (
//           <div className={`alert ${err ? "err" : "ok"}`}>{err || info}</div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* ── Thème & animations (blanc/rouge) ───────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
:root{
  --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
  --bg:#ffffff; --card:#ffffff;
  --pri:#e11d2e; --pri-700:#be123c; --pri-fade:#fff1f2;
}
*{box-sizing:border-box} body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
.ck-wrap{max-width:1160px;margin:28px auto;padding:0 16px}
@media (min-width:1440px){.ck-wrap{max-width:1320px}}
.ck-title{margin:0 0 6px;font-weight:800;font-size:28px;letter-spacing:-.01em}
.ck-sub{color:var(--sub);margin-bottom:16px}

/* Steps */
.ck-steps{display:flex;gap:10px;align-items:center;margin:8px 0 14px}
.ck-step{display:flex;align-items:center;gap:8px;white-space:nowrap}
.ck-dot{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;
  background:var(--pri-fade);color:var(--pri);font-weight:800;font-size:12px;
  border:1px solid #ffd4d9;box-shadow:0 6px 16px rgba(225,29,46,.06)}
.ck-step.done .ck-dot{background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;border-color:transparent}
.ck-bar{flex:1;height:4px;background:#f1f5f9;border-radius:999px;position:relative;overflow:hidden;min-width:80px}
.ck-bar>span{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#fecaca,#dc2626);width:0%;transition:width .5s ease}

/* Card */
.ck-card{border:1px solid var(--line);border-radius:16px;background:var(--card);padding:16px;
  box-shadow:0 12px 34px rgba(16,24,40,.04);transition:box-shadow .2s ease, transform .2s ease}
.ck-card:hover{transform:translateY(-1px);box-shadow:0 16px 44px rgba(16,24,40,.06)}

/* Preview */
.ck-prev{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center;margin-bottom:12px}
.ck-thumb{width:96px;height:72px;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:#f8fafc}
.ck-thumb>img{width:100%;height:100%;object-fit:cover;display:block}
.ck-k{font-size:12px;color:var(--sub)}
.ck-v{font-weight:800}

/* Info grid */
.ck-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.ck-info .ck-v{padding:8px 12px;border:1px solid var(--line);border-radius:12px;background:#fff}

/* Code block */
.ck-code{background:#f9fafb;padding:12px;border-radius:10px;white-space:pre-wrap;border:1px solid #edf0f3}

/* Badges & chips */
.badge{border:1px solid var(--line);padding:4px 8px;border-radius:10px;font-size:12px}
.chip-ok{border-color:#c7f8d9;background:#ecfdf5;color:#166534}

/* Buttons */
.btn{position:relative;overflow:hidden;border-radius:12px;padding:11px 14px;font-weight:800;cursor:pointer;
  border:1px solid var(--line);background:#fff;color:var(--ink);transition:transform .06s ease, box-shadow .15s ease}
.btnSmall{padding:8px 10px;font-weight:700}
.btn:active{transform:scale(.98)}
.btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 12px 34px rgba(225,29,46,.15)}
.btnGhost{border-color:#ffd4d9;color:var(--pri);background:#fff}
.btn[disabled]{opacity:.6;cursor:not-allowed}
.btn .rip{position:absolute;inset:auto;width:12px;height:12px;border-radius:9999px;background:rgba(255,255,255,.75);
  transform:translate(-50%,-50%) scale(0);animation:ripple .6s ease-out forwards}
@keyframes ripple{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

/* Alerts */
.alert{margin-top:12px;padding:12px;border-radius:12px}
.alert.ok{background:#f5f8ff;border:1px solid #dfe6ff;color:#1f3af5}
.alert.err{background:#fff6f6;border:1px solid #fde2e2;color:#991b1b}

/* Loader */
.spinner{width:16px;height:16px;border-radius:9999px;border:2px solid currentColor;border-right-color:transparent;display:inline-block;margin-left:8px;animation:s .6s linear infinite}
@keyframes s{to{transform:rotate(360deg)}}

/* Confetti */
.confetti{position:fixed;inset:0;pointer-events:none}
.confetti i{position:absolute;width:8px;height:12px;background:linear-gradient(180deg,#fff,#ffd4d9);border-radius:2px;animation:drop 900ms ease-in forwards}
@keyframes drop{0%{transform:translateY(-20vh) rotate(0)}100%{transform:translate(var(--x,0),100vh) rotate(340deg);opacity:0}}
`;

/* ── helpers ───────────────────────────────────────────────────────── */
function truncateMiddle(str?: string, keep = 6) {
  if (!str) return "—";
  return str.length <= keep * 2 + 3 ? str : `${str.slice(0, keep)}…${str.slice(-keep)}`;
}
function ripple(e: React.MouseEvent<HTMLElement>) {
  const btn = e.currentTarget as HTMLElement;
  const r = document.createElement("span");
  r.className = "rip";
  const rect = btn.getBoundingClientRect();
  r.style.left = `${e.clientX - rect.left}px`;
  r.style.top = `${e.clientY - rect.top}px`;
  btn.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function InvestCheckout() {
  const nav = useNavigate();
  const loc = useLocation();
  const q = new URLSearchParams(loc.search);

  // Params
  const propertyId = q.get("propertyId") || "101";
  const mode = (q.get("mode") as "SOLO"|"COLLECTIVE_FIXED"|"COLLECTIVE_VAR") || "COLLECTIVE_FIXED";
  const amountQ = q.get("amount");
  const unitsQ  = q.get("units");
  const amount  = amountQ ? Number(amountQ) : undefined;
  const units   = unitsQ ? Number(unitsQ) : 1;
  const propertyTitle = q.get("propertyTitle") || undefined;
  const imageUrl = q.get("imageUrl") || undefined;

  // State
  const [account,setAccount]             = useState<string>();
  const [isSiwe,setIsSiwe]               = useState(false);
  const [orderSig,setOrderSig]           = useState<string>();
  const [investmentId,setInvestmentId]   = useState<string>();
  const [payment,setPayment]             = useState<any>();
  const [busy,setBusy]                   = useState(false);
  const [info,setInfo]                   = useState<string>();
  const [err,setErr]                     = useState<string>();

  // step bars
  const bar1Ref = useRef<HTMLSpanElement|null>(null);
  const bar2Ref = useRef<HTMLSpanElement|null>(null);
  useEffect(() => {
    if (bar1Ref.current) bar1Ref.current.style.width = isSiwe ? "100%" : "0%";
    if (bar2Ref.current) bar2Ref.current.style.width = orderSig ? "100%" : "0%";
  }, [isSiwe, orderSig]);

  // Order message
  const orderMessage = useMemo(()=>{
    const nonce = Math.random().toString(36).slice(2);
    return [
      `property: ${propertyId}`,
      `mode: ${mode}`,
      amount ? `amount: ${amount} MAD` : `units: ${units}`,
      `nonce: ${nonce}`
    ].join("\n");
  },[propertyId, mode, amount, units]);

  async function connectAndSiwe(){
    try{
      setErr(undefined); setInfo(undefined); setBusy(true);
      const eth = (window as any).ethereum;
      if(!eth) throw new Error("MetaMask manquant");
      const [addr] = await eth.request({ method:"eth_requestAccounts" });
      setAccount(addr);

      const n = await fetch("http://localhost:3000/auth/nonce",{ credentials:"include" }).then(r=>r.json());
      const siweMessage =
`domain: ${window.location.host}
address: ${addr}
statement: Login
nonce: ${n.nonce}
issuedAt: ${new Date().toISOString()}`;
      const sig = await eth.request({ method:"personal_sign", params:[siweMessage, addr] });
      const ok = await fetch("http://localhost:3000/auth/verify",{
        method:"POST", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ address: addr, message: siweMessage, signature: sig })
      }).then(r=>r.json());
      if(!ok?.ok) throw new Error("SIWE failed");
      setIsSiwe(true);
      setInfo("Connecté & lié (SIWE) ✓");
    }catch(e:any){ setErr(e?.message||"Erreur SIWE"); }
    finally{ setBusy(false); }
  }

  async function signOrderAndCreateInvestment(){
    try{
      setErr(undefined); setInfo(undefined); setBusy(true);
      const eth = (window as any).ethereum;
      if(!eth || !account) throw new Error("Connecte d'abord");
      const sig = await eth.request({ method:"personal_sign", params:[orderMessage, account] });
      setOrderSig(sig);

      const res = await fetch("http://localhost:3000/api/investments",{
        method:"POST", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          propertyId, mode,
          amountMAD: amount, units,
          orderMessage, signature: sig,
          propertyTitle, imageUrl
        })
      }).then(r=>r.json());

      if(!res?.ok) throw new Error(res?.error || "Erreur création investissement");
      setInvestmentId(res.investment.id);
      setPayment(res.payment);
      setInfo(`Investissement #${res.investment.id} créé.`);
    }catch(e:any){ setErr(e?.message||"Erreur investissement"); }
    finally{ setBusy(false); }
  }

  async function confirmBank(){
    if(!investmentId) return;
    setBusy(true); setErr(undefined); setInfo(undefined);
    try{
      await fetch("http://localhost:3000/api/payments/confirm",{
        method:"POST", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ investmentId })
      }).then(r=>r.json());
      setInfo("funds_received ✓ (bank/mock)");
    }catch(e:any){ setErr(e?.message||"Erreur paiement"); }
    finally{ setBusy(false); }
  }

  async function confirmOnchain(){
    if(!investmentId) return;
    setBusy(true); setErr(undefined); setInfo(undefined);
    try{
      await fetch(`http://localhost:3000/api/payments/onchain/confirm?investmentId=${investmentId}&txHash=0xmock`,{
        credentials:"include"
      }).then(r=>r.json());
      setInfo("funds_received ✓ (on-chain/mock)");
    }catch(e:any){ setErr(e?.message||"Erreur paiement on-chain"); }
    finally{ setBusy(false); }
  }

  function popConfetti(){
    const root = document.createElement('div');
    root.className = 'confetti';
    document.body.appendChild(root);
    const N = 40;
    for(let i=0;i<N;i++){
      const p = document.createElement('i');
      p.style.left = `${Math.random()*100}vw`;
      p.style.setProperty('--x', `${(Math.random()*2-1)*40}vw`);
      p.style.background = Math.random()<.5
        ? 'linear-gradient(180deg,#fff,#ffd4d9)'
        : 'linear-gradient(180deg,#ffe4e6,#fecaca)';
      root.appendChild(p);
      setTimeout(()=>p.remove(), 1000);
    }
    setTimeout(()=>root.remove(), 1100);
  }

  async function adminMint(){
    if(!investmentId) return;
    setBusy(true); setErr(undefined); setInfo(undefined);
    try{
      const ok = await fetch(`http://localhost:3000/api/nft/mint?investmentId=${investmentId}`,{
        method:"POST", credentials:"include"
      }).then(r=>r.json());
      setInfo(`NFT minté ✓ tokenId=${ok.tokenId}`);
      popConfetti();
      setTimeout(()=> nav("/tokens"), 600);
    }catch(e:any){ setErr(e?.message||"Erreur mint"); }
    finally{ setBusy(false); }
  }

  return (
    <div className="ck-wrap">
      <style>{CSS}</style>

      <h1 className="ck-title">Checkout investissement</h1>
      <div className="ck-sub">Vérifie les détails, connecte & signe, puis crée l’investissement.</div>

      {/* Steps */}
      <div className="ck-steps">
        <div className={`ck-step ${isSiwe ? "done" : ""}`}><span className="ck-dot">1</span><b>Liaison</b></div>
        <div className="ck-bar"><span ref={bar1Ref}/></div>
        <div className={`ck-step ${orderSig ? "done" : ""}`}><span className="ck-dot">2</span><b>Signature</b></div>
        <div className="ck-bar"><span ref={bar2Ref}/></div>
        <div className={`ck-step ${investmentId ? "done" : ""}`}><span className="ck-dot">3</span><b>Investissement</b></div>
      </div>

      <div className="ck-card">
        {/* Aperçu du bien */}
        <div className="ck-prev">
          <div className="ck-thumb">
            {imageUrl
              ? <img src={imageUrl} alt={propertyTitle||propertyId}/>
              : <div style={{display:"grid",placeItems:"center",height:"100%",color:"#94a3b8",fontSize:12}}>Aperçu</div>}
          </div>
          <div>
            <div className="ck-k">Bien</div>
            <div className="ck-v">{propertyTitle || `#${propertyId}`}</div>
          </div>
        </div>

        {/* Infos */}
        <div className="ck-grid ck-info">
          <div><div className="ck-k">ID</div><div className="ck-v">{propertyId}</div></div>
          <div><div className="ck-k">Mode</div><div className="ck-v">{mode}</div></div>
          {amount!==undefined && <div><div className="ck-k">Montant</div><div className="ck-v">{amount} MAD</div></div>}
          {units!==undefined  && <div><div className="ck-k">Lots</div><div className="ck-v">{units}</div></div>}
        </div>

        <hr style={{margin:"16px 0"}}/>

        {/* Connexion & SIWE */}
        <div>
          <div className="ck-k">Liaison & adresse</div>
          <div className="ck-actions" style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <span className="badge">{truncateMiddle(account)}</span>
            {!isSiwe ? (
              <button
                className="btn btnGhost"
                onClick={(e)=>{ripple(e); connectAndSiwe();}}
                disabled={busy}
              >
                1) Connecter & SIWE {busy && <span className="spinner" style={{color:"var(--pri)"}}/>}
              </button>
            ) : (
              <span className="badge chip-ok">Lié ✓</span>
            )}
          </div>
        </div>

        <hr style={{margin:"16px 0"}}/>

        {/* Ordre */}
        <div>
          <div className="ck-k">Résumé de l’ordre</div>
          <pre className="ck-code">{orderMessage}</pre>
          <button
            className="btn btnPrimary"
            onClick={(e)=>{ripple(e); signOrderAndCreateInvestment();}}
            disabled={!account || !isSiwe || busy}
          >
            2) Signer l’ordre & créer l’investissement
            {busy && <span className="spinner" style={{color:"#fff"}}/>}
          </button>
        </div>

        {/* Actions après création */}
        {investmentId && (
          <>
            <hr style={{margin:"16px 0"}}/>
            <div className="ck-actions" style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <span className="badge">Investissement #{investmentId}</span>
              <button className="btn btnSmall btnGhost" onClick={(e)=>{ripple(e); confirmBank();}} disabled={busy}>3A) Confirmer (bank/mock)</button>
              <button className="btn btnSmall btnGhost" onClick={(e)=>{ripple(e); confirmOnchain();}} disabled={busy}>3B) Confirmer (on-chain/mock)</button>
              <button className="btn btnPrimary" onClick={(e)=>{ripple(e); adminMint();}} disabled={busy}>4) Mint NFT (admin/cron)</button>
              <a href="/tokens" className="btn btnGhost btnSmall" onMouseDown={ripple}>Voir mes NFTs</a>
            </div>

            {payment && (
              <div style={{marginTop:12}}>
                <div className="ck-k">Paiement (dev/mock)</div>
                <pre className="ck-code">{JSON.stringify(payment,null,2)}</pre>
              </div>
            )}
          </>
        )}

        {(info || err) && (
          <div className={`alert ${err ? "err" : "ok"}`}>{err || info}</div>
        )}
      </div>
    </div>
  );
}
