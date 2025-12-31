// src/pages/Withdraw.tsx
// Page "Retirer" — même design que Deposit, avec 2 parcours : Crypto & Fiat
// - Crypto : l’utilisateur saisit une adresse de réception (son wallet). Le backend fera l’envoi on-chain.
// - Fiat   : l’utilisateur saisit ses coordonnées bancaires (IBAN/BIC). Le backend lance un virement.
// Intégrations :
//   POST /api/withdrawals/crypto  { asset, amount, to, network, twofa? }
//   POST /api/withdrawals/fiat    { currency, amount, beneficiary, iban, bic, reference, reason, twofa? }
//   GET  /api/withdrawals/me      → liste des demandes récentes (facultatif)

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ----------------------------- Réseau (Sepolia) ---------------------------- */
const EXPECTED_CHAIN = { chainId: "0xaa36a7", name: "Sepolia" } as const;
const EXPLORER = "https://sepolia.etherscan.io";

/* --------------------------------- STYLES --------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;800&family=Inter:wght@400;600;800;900&display=swap');
:root{
  --ink:#0b1220; --sub:#6b7280; --line:#eceff3; --bg:#ffffff; --card:#ffffff;
  --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2;
  --zone-blue:#eff6ff;   --zone-blue-line:#dbeafe;
  --zone-green:#ecfdf5;  --zone-green-line:#d1fae5;
  --zone-orange:#fff7ed; --zone-orange-line:#ffedd5;
  --zone-purple:#f5f3ff; --zone-purple-line:#e9d5ff;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:
  radial-gradient(1200px 600px at -10% -10%, #fff5f6, #ffffff 38%), var(--bg);
  font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:var(--ink)}
.container{max-width:1160px;margin:0 auto;padding:28px}

.header{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.h1{margin:0;font-family:Sora,Inter,sans-serif;font-weight:800;font-size:28px;letter-spacing:-.01em}
.pills{display:flex;gap:10px;flex-wrap:wrap}
.pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;font-weight:800;color:var(--ink)}

.btn{position:relative;overflow:hidden;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink);box-shadow:0 6px 18px rgba(16,24,40,.06)}
.btnPrimary{border-color:transparent;background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 36px rgba(225,29,46,.25)}
.btnGhost{border:1px solid #fecaca;color:var(--pri);background:#fff}
.btn[disabled]{opacity:.55;cursor:not-allowed}

.grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-top:14px}
@media (max-width: 980px){ .grid{grid-template-columns:1fr} }

.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:0 14px 34px rgba(16,24,40,.07)}
.cardTitle{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.small{color:var(--sub);font-size:12px}
.row{display:flex;gap:12px;align-items:center}
.input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line);font-weight:700}
.select{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:#fff;font-weight:700}
.help{font-size:12px;color:var(--sub);margin-top:6px}
.hr{height:1px;background:var(--line);margin:12px 0}
.kv{display:flex;justify-content:space-between;margin:8px 0}
.k{color:var(--sub)}
.v{font-weight:900}

.zoneBlue{background:var(--zone-blue);border:1px solid var(--zone-blue-line)}
.zoneGreen{background:var(--zone-green);border:1px solid var(--zone-green-line)}
.zoneOrange{background:var(--zone-orange);border:1px solid var(--zone-orange-line)}
.zonePurple{background:var(--zone-purple);border:1px solid var(--zone-purple-line)}

.toast{position:fixed;left:50%;top:24px;transform:translateX(-50%);background:#0b1220;color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.18);font-weight:800;z-index:9999}
.toast.error{background:#be123c}
`;

/* --------------------------------- Utils ---------------------------------- */
const short = (a?: string, n = 4) => (a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "—");
const isHexAddr = (a?: string) => /^0x[a-fA-F0-9]{40}$/.test(a || "");
function getEthOptional() {
  const anyWin = window as any;
  return anyWin.ethereum?.providers?.find((p:any)=>p.isMetaMask) || anyWin.ethereum || null;
}
function getEth() { const p = getEthOptional(); if (!p) throw new Error("MetaMask introuvable"); return p; }

// IBAN utils (basique + mod-97)
function normalizeIban(iban: string){return (iban||"").replace(/\s+/g,'').toUpperCase();}
function isIbanValid(iban: string){
  const v = normalizeIban(iban);
  if(!/^([A-Z]{2}[0-9]{2}[A-Z0-9]{1,30})$/.test(v)) return false;
  const shifted = v.slice(4) + v.slice(0,4);
  const mapped = shifted.replace(/[A-Z]/g, c => String(c.charCodeAt(0)-55));
  // mod 97 avec grand entier par tranches
  let rem = 0; for(let i=0;i<mapped.length;i+=7){ rem = Number(String(rem) + mapped.slice(i,i+7)) % 97; }
  return rem === 1;
}

/* ================================ Component =============================== */
export default function Withdraw() {
  // Connexion
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const wrongChain = chainId && chainId !== EXPECTED_CHAIN.chainId;

  // Tabs
  const [tab, setTab] = useState<"crypto"|"fiat">("crypto");

  // Crypto form
  const [asset, setAsset] = useState<"ETH"|"USDC"|"DAI">("ETH");
  const [amount, setAmount] = useState<string>("");
  const [dest, setDest] = useState<string>("");
  const [twofa, setTwofa] = useState<string>("");

  // Fiat form
  const [ccy, setCcy] = useState<"EUR"|"USD"|"MAD">("EUR");
  const [fAmount, setFAmount] = useState<string>("");
  const [benef, setBenef] = useState<string>("");
  const [iban, setIban] = useState<string>("");
  const [bic, setBic] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [reason, setReason] = useState<string>("Retrait utilisateur");
  const [agree, setAgree] = useState<boolean>(false);

  // Historique (optionnel)
  const [recent, setRecent] = useState<any[]>([]);

  // Estimations frais (mock)
  const cryptoFees = useMemo(() => ({
    ETH: { fixed: 0.00021, pct: 0.0 },
    USDC:{ fixed: 0.35/1000, pct: 0.001 }, // 0.00035 USDC + 0.1%
    DAI: { fixed: 0.0004, pct: 0.0015 },
  }), []);
  const fiatFees = useMemo(() => ({
    EUR: { fixed: 1.0, pct: 0.005 }, // 1€ + 0.5%
    USD: { fixed: 1.5, pct: 0.006 },
    MAD: { fixed: 5.0, pct: 0.006 },
  }), []);

  const netCrypto = useMemo(() => {
    const q = Number(amount||"0"); if (!q || Number.isNaN(q)) return 0;
    const f = cryptoFees[asset]; return Math.max(q - (f.fixed + q*f.pct), 0);
  }, [amount, asset, cryptoFees]);

  const netFiat = useMemo(() => {
    const q = Number(fAmount||"0"); if (!q || Number.isNaN(q)) return 0;
    const f = fiatFees[ccy]; return Math.max(q - (f.fixed + q*f.pct), 0);
  }, [fAmount, ccy, fiatFees]);

  /* ------------------------------- MetaMask init ------------------------------ */
  useEffect(() => {
    const eth = getEthOptional(); if (!eth) return;
    (async () => {
      try {
        const [cid, accs] = await Promise.all([
          eth.request({ method: "eth_chainId" }),
          eth.request({ method: "eth_accounts" }),
        ]);
        setChainId(cid);
        setAddress(accs?.[0] ? (accs[0] as `0x${string}`) : null);
      } catch {}
    })();
    const onAccounts = (accs: string[]) => setAddress(accs?.[0] ? (accs[0] as `0x${string}`) : null);
    const onChain = (cid: string) => setChainId(cid);
    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = async () => {
    const eth = getEth();
    const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
    setAddress(accs?.[0] ? (accs[0] as `0x${string}`) : null);
    setChainId(await eth.request({ method: "eth_chainId" }));
  };

  const ensureChain = async () => {
    const eth = getEth();
    const cid = await eth.request({ method: "eth_chainId" });
    if (cid !== EXPECTED_CHAIN.chainId) {
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params:[{ chainId: EXPECTED_CHAIN.chainId }]});
        setChainId(EXPECTED_CHAIN.chainId);
      } catch (e:any) {
        if (e?.code === 4902) {
          await eth.request({ method:"wallet_addEthereumChain", params:[{
            chainId: EXPECTED_CHAIN.chainId, chainName: "Sepolia",
            rpcUrls:["https://rpc.ankr.com/eth_sepolia"],
            nativeCurrency:{ name:"Ether", symbol:"ETH", decimals:18 },
            blockExplorerUrls:[EXPLORER]
          }]});
          setChainId(EXPECTED_CHAIN.chainId);
        } else { throw e; }
      }
    }
  };

  /* --------------------------------- Actions -------------------------------- */
  const canSubmitCrypto = isHexAddr(dest) && /^\d*\.?\d+$/.test(amount) && Number(amount)>0 && !!twofa && !wrongChain;
  const canSubmitFiat   = isIbanValid(iban) && /^\d*\.?\d+$/.test(fAmount) && Number(fAmount)>0 && !!benef && !!bic && agree && !!twofa;

  async function submitCrypto() {
    try {
      await ensureChain();
    } catch {}
    if (!isHexAddr(dest)) return showToast("Adresse de destination invalide", "error");
    const r = await fetch("http://localhost:3001/api/withdrawals/crypto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset, amount, to: dest, network: "sepolia", twofa })
    });
    if (!r.ok) return showToast("Échec de la demande de retrait", "error");
    const d = await r.json();
    showToast("Demande de retrait crypto enregistrée ✅");
    setRecent(x=>[{ id:d.id, kind:"crypto", asset, amount, to: dest, ts: new Date().toISOString(), status:"PENDING" }, ...x].slice(0,5));
    setTwofa("");
  }

  async function submitFiat() {
    if (!isIbanValid(iban)) return showToast("IBAN invalide", "error");
    const r = await fetch("http://localhost:3001/api/withdrawals/fiat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: ccy, amount: fAmount, beneficiary: benef, iban, bic, reference, reason, twofa })
    });
    if (!r.ok) return showToast("Échec de la demande de virement", "error");
    const d = await r.json();
    showToast("Demande de retrait fiat enregistrée ✅");
    setRecent(x=>[{ id:d.id, kind:"fiat", currency: ccy, amount: fAmount, iban: normalizeIban(iban), ts: new Date().toISOString(), status:"PENDING" }, ...x].slice(0,5));
    setTwofa("");
  }

  /* ---------------------------------- JSX ---------------------------------- */
  return (
    <div className="container">
      <style>{CSS}</style>

      {/* HEADER */}
      <div className="header">
        <h1 className="h1">Retirer</h1>
        <div className="pills" style={{gap:10,display:"flex",alignItems:"center"}}>
          {address ? (
            <span className="pill">{short(address)} • {chainId==="0xaa36a7"?"Sepolia": chainId?`Chain ${parseInt(chainId,16)}`:"—"}</span>
          ) : (
            <button className="btn btnPrimary" onClick={connect}>Connecter MetaMask</button>
          )}
        </div>
      </div>

      {wrongChain && (
        <div className="card" style={{borderColor:"#fde68a", background:"#fffbeb", color:"#92400e", marginTop:12}}>
          <div className="row" style={{justifyContent:"space-between", width:"100%"}}>
            <div>Réseau détecté : <b>{chainId}</b> — attendu : <b>{EXPECTED_CHAIN.name}</b></div>
            <button className="btn btnGhost" onClick={ensureChain}>Basculer vers {EXPECTED_CHAIN.name}</button>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="row" style={{gap:8, marginTop:12}}>
        <button className={`btn ${tab==="crypto"?"btnPrimary":""}`} onClick={()=>setTab("crypto")}>Crypto</button>
        <button className={`btn ${tab==="fiat"?"btnPrimary":""}`}   onClick={()=>setTab("fiat")}>Fiat</button>
      </div>

      <div className="grid">
        {/* Col principale */}
        <div style={{display:"grid", gap:16}}>
          {tab==="crypto" ? (
            <div className="card zoneBlue">
              <div className="cardTitle">
                <b style={{fontFamily:"Sora"}}>Retrait crypto</b>
                <span className="small">EVM — Sepolia</span>
              </div>

              <div className="row" style={{gap:12, flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <label className="small">Actif</label>
                  <select className="select" value={asset} onChange={e=>setAsset(e.target.value as any)}>
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label className="small">Montant</label>
                  <input className="input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/>
                </div>
                <div style={{flexBasis:"100%"}}/>
                <div style={{flex:1}}>
                  <label className="small">Adresse de destination</label>
                  <input className="input" value={dest} onChange={e=>setDest(e.target.value)} placeholder="0x…"/>
                  <div className="help">Cette adresse doit être <b>à vous</b> et sur <b>Sepolia</b>. Les envois vers une mauvaise chaîne sont perdus.</div>
                </div>
                <div style={{display:"grid", gap:8}}>
                  <button className="btn" onClick={()=> address && setDest(address)} disabled={!address}>Coller mon adresse MetaMask</button>
                </div>
              </div>

              <div className="hr"/>
              <div className="row" style={{gap:16, alignItems:"stretch"}}>
                <div className="card" style={{flex:1}}>
                  <div className="kv"><span className="k">Frais fixes</span><span className="v">{cryptoFees[asset].fixed} {asset}</span></div>
                  <div className="kv"><span className="k">Frais %</span><span className="v">{(cryptoFees[asset].pct*100).toFixed(2)}%</span></div>
                  <div className="kv"><span className="k">Net estimé</span><span className="v">{netCrypto.toLocaleString(undefined,{maximumFractionDigits:6})} {asset}</span></div>
                </div>
                <div className="card" style={{flex:1}}>
                  <div className="small">Authentification (2FA)</div>
                  <input className="input" value={twofa} onChange={e=>setTwofa(e.target.value)} placeholder="Code 2FA"/>
                  <div className="help">Requis pour confirmer le retrait.</div>
                </div>
              </div>

              <div className="hr"/>
              <div className="row" style={{justifyContent:"flex-end", gap:8}}>
                <button className="btn btnPrimary" onClick={submitCrypto} disabled={!canSubmitCrypto}>Confirmer le retrait</button>
              </div>
            </div>
          ) : (
            <div className="card zoneGreen">
              <div className="cardTitle">
                <b style={{fontFamily:"Sora"}}>Retrait fiat</b>
                <span className="small">EUR / USD / MAD</span>
              </div>

              <div className="row" style={{gap:12}}>
                <div style={{flex:1}}>
                  <label className="small">Devise</label>
                  <select className="select" value={ccy} onChange={e=>setCcy(e.target.value as any)}>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="MAD">MAD</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label className="small">Montant</label>
                  <input className="input" value={fAmount} onChange={e=>setFAmount(e.target.value)} placeholder="0.00"/>
                </div>
              </div>

              <div className="hr"/>
              <div className="card" style={{borderColor:"#e5e7eb"}}>
                <div className="cardTitle"><b>Coordonnées bancaires</b></div>
                <div className="row" style={{gap:12, flexWrap:"wrap"}}>
                  <input className="input" style={{flex:"1 1 240px"}} placeholder="Bénéficiaire (Nom complet)" value={benef} onChange={e=>setBenef(e.target.value)} />
                  <input className="input" style={{flex:"2 1 320px"}} placeholder="IBAN" value={iban} onChange={e=>setIban(e.target.value)} />
                  <input className="input" style={{flex:"1 1 160px"}} placeholder="BIC" value={bic} onChange={e=>setBic(e.target.value)} />
                  <input className="input" style={{flex:"2 1 320px"}} placeholder="Référence (optionnel)" value={reference} onChange={e=>setReference(e.target.value)} />
                  <input className="input" style={{flex:"2 1 320px"}} placeholder="Motif (ex. Retrait utilisateur)" value={reason} onChange={e=>setReason(e.target.value)} />
                </div>
                <div className="row" style={{gap:12, marginTop:8, alignItems:"center"}}>
                  <label className="small" style={{display:"flex", gap:8, alignItems:"center"}}>
                    <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
                    Je suis titulaire du compte et les informations sont exactes.
                  </label>
                  <div style={{flex:1}}/>
                  <div className="small" style={{color: isIbanValid(iban)?"#16a34a":"#b91c1c"}}>
                    IBAN {iban? (isIbanValid(iban)?"valide":"invalide") : "—"}
                  </div>
                </div>
              </div>

              <div className="hr"/>
              <div className="row" style={{gap:16, alignItems:"stretch"}}>
                <div className="card" style={{flex:1}}>
                  <div className="kv"><span className="k">Frais fixes</span><span className="v">{fiatFees[ccy].fixed.toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</span></div>
                  <div className="kv"><span className="k">Frais %</span><span className="v">{(fiatFees[ccy].pct*100).toFixed(2)}%</span></div>
                  <div className="kv"><span className="k">Net estimé</span><span className="v">{netFiat.toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</span></div>
                </div>
                <div className="card" style={{flex:1}}>
                  <div className="small">Authentification (2FA)</div>
                  <input className="input" value={twofa} onChange={e=>setTwofa(e.target.value)} placeholder="Code 2FA"/>
                  <div className="help">Requis pour confirmer le retrait.</div>
                </div>
              </div>

              <div className="hr"/>
              <div className="row" style={{justifyContent:"flex-end", gap:8}}>
                <button className="btn btnPrimary" onClick={submitFiat} disabled={!canSubmitFiat}>Confirmer le virement</button>
              </div>

              <div className="small" style={{marginTop:6}}>Délai : 24–48h ouvrées selon la banque.</div>
            </div>
          )}
        </div>

        {/* Col latérale : Récap & Historique */}
        <div style={{display:"grid", gap:16}}>
          <div className="card zoneOrange">
            <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Récapitulatif</b></div>
            {tab==="crypto" ? (
              <>
                <div className="kv"><span className="k">Actif</span><span className="v">{asset}</span></div>
                <div className="kv"><span className="k">Montant</span><span className="v">{amount||"0.00"} {asset}</span></div>
                <div className="kv"><span className="k">Adresse</span><span className="v" title={dest}>{dest? short(dest,6):"—"}</span></div>
                <div className="kv"><span className="k">Net ~</span><span className="v">{netCrypto.toLocaleString(undefined,{maximumFractionDigits:6})} {asset}</span></div>
                <div className="hr"/>
                <button className="btn btnPrimary" onClick={submitCrypto} disabled={!canSubmitCrypto}>Continuer</button>
              </>
            ) : (
              <>
                <div className="kv"><span className="k">Devise</span><span className="v">{ccy}</span></div>
                <div className="kv"><span className="k">Montant</span><span className="v">{Number(fAmount||0).toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</span></div>
                <div className="kv"><span className="k">Bénéficiaire</span><span className="v" title={benef}>{benef||"—"}</span></div>
                <div className="kv"><span className="k">IBAN</span><span className="v" title={iban}>{iban? iban.replace(/(.{4})/g,'$1 ').trim():"—"}</span></div>
                <div className="kv"><span className="k">Net ~</span><span className="v">{netFiat.toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</span></div>
                <div className="hr"/>
                <button className="btn btnPrimary" onClick={submitFiat} disabled={!canSubmitFiat}>Continuer</button>
              </>
            )}
          </div>

          <div className="card zoneBlue">
            <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Aide retrait</b></div>
            <ul className="small" style={{margin:0, paddingLeft:16,lineHeight:1.7}}>
              <li>Crypto : vérifie l’<b>adresse</b> et le <b>réseau</b> (Sepolia).</li>
              <li>Les frais réseau peuvent varier, le net est indicatif.</li>
              <li>Fiat : IBAN <b>valide</b>, BIC et identité requis.</li>
              <li>2FA : protège tes retraits, ne partage jamais ton code.</li>
            </ul>
          </div>

          <div className="card">
            <div className="cardTitle"><b>Demandes récentes</b><span className="small">(local)</span></div>
            {recent.length===0 ? (
              <div className="small">Aucune demande pour l’instant.</div>
            ) : (
              <div className="small" style={{display:"grid", gap:8}}>
                {recent.map((r:any)=> (
                  <div key={r.id} className="row" style={{justifyContent:"space-between"}}>
                    <span>#{r.id} • {r.kind==="crypto"? `${r.amount} ${r.asset} → ${short(r.to,6)}` : `${r.amount} ${r.currency} → ${r.iban?.slice(0,6)}…`} </span>
                    <span style={{fontWeight:800}}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Toast minimaliste ---------------------------- */
function showToast(text: string, kind: "ok"|"error" = "ok") {
  const el = document.createElement("div");
  el.className = `toast ${kind==="error" ? "error" : ""}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 1800);
  setTimeout(() => { el.remove(); }, 2200);
}
