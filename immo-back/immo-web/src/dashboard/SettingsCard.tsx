// src/pages/Settings.tsx
// Page Paramètres complète pour la plateforme (profil, sécurité/2FA, moyens de paiement, wallets,
// notifications, API keys & webhooks, préférences, KYC, sessions & appareils).
// Design cohérent avec Deposit/Withdraw (mêmes couleurs/UX, toasts, cartes, recap latéral).

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// API base configurable (Vite: VITE_API_URL). Fallback: 5174 si localhost
const API_BASE = (typeof window !== "undefined" && (window as any).API_BASE)
  || (import.meta as any).env?.VITE_API_URL
  || (typeof window !== "undefined" && window.location.origin.includes("localhost") ? "http://localhost:5174" : "");

/* ------------------------------ Styles communs ------------------------------ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;800&family=Inter:wght@400;600;800;900&display=swap');
:root{ --ink:#0b1220; --sub:#6b7280; --line:#eceff3; --bg:#ffffff; --card:#ffffff; --pri:#e11d2e; --pri-700:#be123c; --zone-blue:#eff6ff; --zone-blue-line:#dbeafe; --zone-green:#ecfdf5; --zone-green-line:#d1fae5; --zone-orange:#fff7ed; --zone-orange-line:#ffedd5; --zone-purple:#f5f3ff; --zone-purple-line:#e9d5ff }
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:radial-gradient(1200px 600px at -10% -10%, #fff5f6, #ffffff 38%), var(--bg);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:var(--ink)}
.container{max-width:1160px;margin:0 auto;padding:28px}
.header{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.h1{margin:0;font-family:Sora,Inter,sans-serif;font-weight:800;font-size:28px;letter-spacing:-.01em}
.pills{display:flex;gap:10px;flex-wrap:wrap}
.pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;font-weight:800;color:var(--ink)}
.btn{position:relative;overflow:hidden;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink);box-shadow:0 6px 18px rgba(16,24,40,.06)}
.btnPrimary{border-color:transparent;background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 36px rgba(225,29,46,.25)}
.btnGhost{border:1px solid #fecaca;color:var(--pri);background:#fff}
.btn[disabled]{opacity:.55;cursor:not-allowed}
.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:16px;margin-top:14px}
@media (max-width: 980px){ .grid{grid-template-columns:1fr} }
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:0 14px 34px rgba(16,24,40,.07)}
.cardTitle{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.small{color:var(--sub);font-size:12px}
.row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.col{display:grid;gap:10px}
.input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line);font-weight:700}
.select{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:#fff;font-weight:700}
.textarea{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line);font-weight:700;min-height:84px}
.hr{height:1px;background:var(--line);margin:12px 0}
.kv{display:flex;justify-content:space-between;margin:6px 0}
.k{color:var(--sub)} .v{font-weight:900}
.zoneBlue{background:var(--zone-blue);border:1px solid var(--zone-blue-line)}
.zoneGreen{background:var(--zone-green);border:1px solid var(--zone-green-line)}
.zoneOrange{background:var(--zone-orange);border:1px solid var(--zone-orange-line)}
.zonePurple{background:var(--zone-purple);border:1px solid var(--zone-purple-line)}
.badge{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 8px}
.qr{width:160px;height:160px;border-radius:12px;border:1px solid var(--line);background:#fff;display:grid;place-items:center}
.toast{position:fixed;left:50%;top:24px;transform:translateX(-50%);background:#0b1220;color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.18);font-weight:800;z-index:9999}
.toast.error{background:#be123c}
`;

/* --------------------------------- Helpers -------------------------------- */
const short = (a?: string, n = 4) => (a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "—");
// Génère une clé base32-ish courte pour démo (fallback au besoin)
const genSecret = () => {
  try {
    const g = (window.crypto || (window as any).msCrypto);
    if (g?.getRandomValues) {
      return [...g.getRandomValues(new Uint8Array(10))]
        .map((b)=> ("0"+b.toString(16)).slice(-2)).join("").toUpperCase();
    }
  } catch {}
  // fallback non-crypto (dev uniquement)
  return Array.from({length:10},()=>Math.floor(Math.random()*256))
    .map((b)=> ("0"+b.toString(16)).slice(-2)).join("").toUpperCase();
};

export default function Settings(){
  // Tabs
  type Tab = "profile"|"security"|"payments"|"wallets"|"notifications"|"api"|"webhooks"|"kyc"|"preferences"|"sessions";
  const [tab, setTab] = useState<Tab>("profile");

  // Profile
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("FR");
  const [tz, setTz] = useState("Africa/Casablanca");

  // Security
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [twofaSecret, setTwofaSecret] = useState<string>("");
  const [twofaCode, setTwofaCode] = useState("");
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  // Payments (bank + cards)
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [cardLast4, setCardLast4] = useState<string | null>(null);

  // Wallets
  const [mmAccount, setMmAccount] = useState<string | null>(null);
  const [mmNetwork, setMmNetwork] = useState<string | null>(null);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifPush, setNotifPush] = useState(true);

  // API keys
  const [apiKeys, setApiKeys] = useState<{id:string; label:string; last4:string; createdAt:string}[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Webhooks
  const [whUrl, setWhUrl] = useState("");
  const [whSecret, setWhSecret] = useState<string>("");
  const [whEvents, setWhEvents] = useState({ deposit:true, withdraw:true, kyc:false, webhookPing:true });

  // KYC
  const [kycStatus, setKycStatus] = useState<"none"|"pending"|"verified"|"rejected">("none");
  const [kycFirst, setKycFirst] = useState("");
  const [kycLast, setKycLast] = useState("");
  const [kycDocId, setKycDocId] = useState("");

  // Preferences
  const [theme, setTheme] = useState<"light"|"dark">("light");
  const [lang, setLang] = useState<"fr"|"en">("fr");
  const [currency, setCurrency] = useState<"EUR"|"USD"|"MAD">("EUR");
  const [beta, setBeta] = useState(true);

  // Sessions
  const [sessions, setSessions] = useState<{id:string; agent:string; ip:string; lastSeen:string}[]>([]);

  /* ------------------------------- MetaMask init ------------------------------ */
  useEffect(() => {
    const eth = (window as any).ethereum; if (!eth) return;
    (async () => {
      try {
        const accs: string[] = await eth.request({ method: "eth_accounts" });
        setMmAccount(accs?.[0] || null);
        const cid: string = await eth.request({ method: "eth_chainId" });
        setMmNetwork(cid || null);
      } catch {}
    })();
    const onAcc = (accs: string[])=> setMmAccount(accs?.[0] || null);
    const onChain = (cid: string)=> setMmNetwork(cid || null);
    eth.on?.("accountsChanged", onAcc); eth.on?.("chainChanged", onChain);
    return ()=>{ eth.removeListener?.("accountsChanged", onAcc); eth.removeListener?.("chainChanged", onChain); };
  }, []);

  const connectMM = async () => {
    const eth = (window as any).ethereum; if (!eth) { window.open("https://metamask.io/download/", "_blank"); return; }
    const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
    setMmAccount(accs?.[0] || null);
    setMmNetwork(await eth.request({ method: "eth_chainId" }));
  };

  /* ------------------------------ 2FA: QR dyn. ------------------------------- */
  useEffect(() => {
    if (!twofaSecret || !qrRef.current) return;
    const issuer = encodeURIComponent("Reinv Capital");
    const label = encodeURIComponent(email || "user");
    const url = `otpauth://totp/${label}?secret=${twofaSecret}&issuer=${issuer}&digits=6&period=30`;
    QRCode.toCanvas(qrRef.current, url, { width: 180, margin: 1 }, (err) => { if (err) console.error(err); });
  }, [twofaSecret, email]);

  /* -------------------------------- Actions --------------------------------- */
  const saveProfile = async () => {
    const r = await fetch(`${API_BASE}/api/settings/profile`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ fullName, email, phone, country, tz }) });
    if (!r.ok) return toast("Échec sauvegarde profil", true); toast("Profil mis à jour ✅");
  };

  const changePass = async () => {
    if (newPass.length < 8 || newPass !== confirmPass) return toast("Mot de passe invalide", true);
    const r = await fetch(`${API_BASE}/api/settings/security/password`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ newPass }) });
    if (!r.ok) return toast("Échec mise à jour mot de passe", true); setNewPass(""); setConfirmPass(""); toast("Mot de passe changé ✅");
  };

  const start2FA = async () => {
    // En prod: récupère le secret du backend. Ici: mock côté client (démo)
    const secret = genSecret(); setTwofaSecret(secret);
  };

  const enable2FA = async () => {
    if (!twofaSecret || !twofaCode) return toast("Scanne le QR et saisis le code", true);
    const r = await fetch(`${API_BASE}/api/settings/security/2fa/enable`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ code: twofaCode, secret: twofaSecret }) });
    if (!r.ok) return toast("Code 2FA invalide", true); setTwofaEnabled(true); setTwofaCode(""); toast("2FA activée ✅");
  };

  const disable2FA = async () => {
    const r = await fetch(`${API_BASE}/api/settings/security/2fa/disable`, { method:"POST" });
    if (!r.ok) return toast("Échec désactivation 2FA", true); setTwofaEnabled(false); setTwofaSecret(""); setTwofaCode(""); toast("2FA désactivée ✅");
  };

  const saveBank = async () => {
    const r = await fetch(`${API_BASE}/api/settings/payments/bank`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ iban, bic }) });
    if (!r.ok) return toast("Échec sauvegarde IBAN", true); toast("Coordonnées bancaires enregistrées ✅");
  };

  const attachCard = async () => {
    // En prod: ouvrir Stripe Elements → on reçoit last4
    setCardLast4("4242"); toast("Carte ajoutée (test) ✅");
  };

  const revokeCard = async () => { setCardLast4(null); toast("Carte supprimée ✅"); };

  const createKey = async () => {
    if (!newKeyLabel.trim()) return toast("Nom de clé requis", true);
    const r = await fetch(`${API_BASE}/api/settings/keys`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ label: newKeyLabel }) });
    const d = await r.json(); if (!r.ok) return toast(d?.error||"Échec création clé", true);
    setApiKeys([{ id:d.id, label:newKeyLabel, last4:d.last4, createdAt:new Date().toISOString() }, ...apiKeys]);
    setCreatedKey(d.plaintext); setNewKeyLabel("");
  };

  const revokeKey = async (id: string) => {
    const r = await fetch(`${API_BASE}/api/settings/keys/${id}`, { method:"DELETE" });
    if (!r.ok) return toast("Échec révocation", true);
    setApiKeys(apiKeys.filter(k=>k.id!==id)); toast("Clé révoquée ✅");
  };

  const saveWebhook = async () => {
    const r = await fetch(`${API_BASE}/api/settings/webhook`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ url: whUrl, secret: whSecret, events: whEvents }) });
    if (!r.ok) return toast("Échec sauvegarde webhook", true); toast("Webhook enregistré ✅");
  };

  const pingWebhook = async () => {
    const r = await fetch(`${API_BASE}/api/settings/webhook/ping`, { method:"POST" });
    if (!r.ok) return toast("Ping webhook KO", true); toast("Ping webhook envoyé ✅");
  };

  const connectMetaMask = () => connectMM();

  const fetchSessions = async () => {
    const r = await fetch(`${API_BASE}/api/settings/sessions`);
    if (r.ok) setSessions(await r.json());
  };

  const revokeSession = async (id:string) => {
    const r = await fetch(`${API_BASE}/api/settings/sessions/${id}`, { method:"DELETE" });
    if (!r.ok) return toast("Impossible de fermer la session", true);
    setSessions(sessions.filter(s=>s.id!==id)); toast("Session fermée ✅");
  };

  /* ---------------------------------- UI ----------------------------------- */
  return (
    <div className="container">
      <style>{CSS}</style>

      <div className="header">
        <h1 className="h1">Paramètres</h1>
        <div className="pills">
          <button className={`pill ${tab==='profile'?'btnPrimary':''}`} onClick={()=>setTab('profile')}>Profil</button>
          <button className={`pill ${tab==='security'?'btnPrimary':''}`} onClick={()=>setTab('security')}>Sécurité</button>
          <button className={`pill ${tab==='payments'?'btnPrimary':''}`} onClick={()=>setTab('payments')}>Paiements</button>
          <button className={`pill ${tab==='wallets'?'btnPrimary':''}`} onClick={()=>setTab('wallets')}>Wallets</button>
          <button className={`pill ${tab==='notifications'?'btnPrimary':''}`} onClick={()=>setTab('notifications')}>Notifications</button>
          <button className={`pill ${tab==='api'?'btnPrimary':''}`} onClick={()=>setTab('api')}>API Keys</button>
          <button className={`pill ${tab==='webhooks'?'btnPrimary':''}`} onClick={()=>setTab('webhooks')}>Webhooks</button>
          <button className={`pill ${tab==='kyc'?'btnPrimary':''}`} onClick={()=>setTab('kyc')}>KYC</button>
          <button className={`pill ${tab==='preferences'?'btnPrimary':''}`} onClick={()=>setTab('preferences')}>Préférences</button>
          <button className={`pill ${tab==='sessions'?'btnPrimary':''}`} onClick={()=>{ setTab('sessions'); fetchSessions(); }}>Sessions</button>
        </div>
      </div>

      <div className="grid">
        <div className="col">
          {tab==='profile' && (
            <div className="card zoneBlue">
              <div className="cardTitle"><b>Profil</b><span className="small">Identité & contact</span></div>
              <div className="row">
                <input className="input" placeholder="Nom complet" value={fullName} onChange={e=>setFullName(e.target.value)} />
                <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                <input className="input" placeholder="Téléphone" value={phone} onChange={e=>setPhone(e.target.value)} />
                <select className="select" value={country} onChange={e=>setCountry(e.target.value)}>
                  <option value="FR">France</option><option value="MA">Maroc</option><option value="US">USA</option><option value="GB">UK</option>
                </select>
                <select className="select" value={tz} onChange={e=>setTz(e.target.value)}>
                  <option>Africa/Casablanca</option><option>Europe/Paris</option><option>UTC</option>
                </select>
              </div>
              <div className="hr"/>
              <button className="btn btnPrimary" onClick={saveProfile}>Sauvegarder</button>
            </div>
          )}

          {tab==='security' && (
            <div className="col">
              <div className="card zoneGreen">
                <div className="cardTitle"><b>Mot de passe</b></div>
                <div className="row">
                  <input className="input" placeholder="Nouveau mot de passe" type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} />
                  <input className="input" placeholder="Confirmer" type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} />
                </div>
                <div className="hr"/>
                <button className="btn btnPrimary" onClick={changePass}>Changer</button>
              </div>

              <div className="card zonePurple">
                <div className="cardTitle"><b>2FA (TOTP)</b>{twofaEnabled ? <span className="badge">Activée</span> : <span className="badge">Désactivée</span>}</div>
                {!twofaEnabled ? (
                  <div className="col">
                    <div className="small">Étapes : 1) Générer le QR 2) Scanner dans Google Authenticator 3) Saisir le code.</div>
                    <div className="row" style={{alignItems:'flex-start'}}>
                      <div className="qr"><canvas ref={qrRef} width={180} height={180}/></div>
                      <div className="col" style={{minWidth:220}}>
                        <button className="btn" onClick={start2FA}>Générer QR</button>
                        <input className="input" placeholder="Code à 6 chiffres" value={twofaCode} onChange={e=>setTwofaCode(e.target.value)} />
                        <button className="btn btnPrimary" onClick={enable2FA} disabled={!twofaSecret || !twofaCode}>Activer 2FA</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="row" style={{justifyContent:'space-between'}}>
                    <div className="small">La 2FA protège l’accès et les retraits.</div>
                    <button className="btn btnGhost" onClick={disable2FA}>Désactiver</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab==='payments' && (
            <div className="col">
              <div className="card zoneOrange">
                <div className="cardTitle"><b>Coordonnées bancaires</b></div>
                <div className="row">
                  <input className="input" placeholder="IBAN" value={iban} onChange={e=>setIban(e.target.value)} />
                  <input className="input" placeholder="BIC" value={bic} onChange={e=>setBic(e.target.value)} />
                </div>
                <div className="hr"/>
                <button className="btn btnPrimary" onClick={saveBank}>Enregistrer IBAN</button>
              </div>

              <div className="card zoneBlue">
                <div className="cardTitle"><b>Carte bancaire</b>{cardLast4 ? <span className="badge">•••• {cardLast4}</span> : <span className="badge">Aucune</span>}</div>
                <div className="row">
                  {!cardLast4 ? (
                    <button className="btn btnPrimary" onClick={attachCard}>Ajouter une carte (mock)</button>
                  ) : (
                    <button className="btn btnGhost" onClick={revokeCard}>Supprimer la carte</button>
                  )}
                </div>
                <div className="small">En prod : utiliser Stripe Elements pour tokeniser la carte.</div>
              </div>
            </div>
          )}

          {tab==='wallets' && (
            <div className="card zoneGreen">
              <div className="cardTitle"><b>Wallets connectés</b></div>
              <div className="row" style={{justifyContent:'space-between'}}>
                <div>
                  <div className="kv"><span className="k">MetaMask</span><span className="v">{mmAccount? short(mmAccount,6) : '—'}</span></div>
                  <div className="kv"><span className="k">Réseau</span><span className="v">{mmNetwork || '—'}</span></div>
                </div>
                <button className="btn btnPrimary" onClick={connectMetaMask}>{mmAccount? 'Reconnecter' : 'Connecter'} MetaMask</button>
              </div>
              <div className="hr"/>
              <div className="small">Tu pourras autoriser ce wallet à signer des retraits, ou recevoir les notifications on-chain.</div>
            </div>
          )}

          {tab==='notifications' && (
            <div className="card zonePurple">
              <div className="cardTitle"><b>Notifications</b></div>
              <label className="small" style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={notifEmail} onChange={e=>setNotifEmail(e.target.checked)} /> Email
              </label>
              <label className="small" style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={notifSms} onChange={e=>setNotifSms(e.target.checked)} /> SMS
              </label>
              <label className="small" style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={notifPush} onChange={e=>setNotifPush(e.target.checked)} /> Push
              </label>
              <div className="hr"/>
              <button className="btn btnPrimary" onClick={async()=>{
                const r = await fetch(`${API_BASE}/api/settings/notifications`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email:notifEmail, sms:notifSms, push:notifPush }) });
                if (!r.ok) return toast("Échec sauvegarde notifications", true); toast("Préférences enregistrées ✅");
              }}>Sauvegarder</button>
            </div>
          )}

          {tab==='api' && (
            <div className="card zoneBlue">
              <div className="cardTitle"><b>Clés API</b></div>
              <div className="row">
                <input className="input" placeholder="Nom de la clé (ex. backoffice)" value={newKeyLabel} onChange={e=>setNewKeyLabel(e.target.value)} />
                <button className="btn btnPrimary" onClick={createKey}>Créer</button>
              </div>
              {createdKey && (
                <div className="card" style={{marginTop:10,borderColor:'#fecaca'}}>
                  <div className="small">Copie ta clé maintenant, elle ne sera plus affichée :</div>
                  <div className="row" style={{justifyContent:'space-between'}}>
                    <code style={{fontWeight:900}}>{createdKey}</code>
                    <button className="btn" onClick={()=> navigator.clipboard.writeText(createdKey)}>Copier</button>
                  </div>
                </div>
              )}
              <div className="hr"/>
              <div className="col">
                {apiKeys.length===0 ? <div className="small">Aucune clé.</div> : apiKeys.map(k=> (
                  <div key={k.id} className="row" style={{justifyContent:'space-between'}}>
                    <div>• {k.label} — <span className="small">••••{k.last4}</span></div>
                    <button className="btn btnGhost" onClick={()=>revokeKey(k.id)}>Révoquer</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='webhooks' && (
            <div className="card zoneOrange">
              <div className="cardTitle"><b>Webhooks</b></div>
              <input className="input" placeholder="URL (https://...)" value={whUrl} onChange={e=>setWhUrl(e.target.value)} />
              <input className="input" placeholder="Secret (facultatif)" value={whSecret} onChange={e=>setWhSecret(e.target.value)} />
              <div className="row">
                <label className="small"><input type="checkbox" checked={whEvents.deposit} onChange={e=>setWhEvents({...whEvents, deposit:e.target.checked})}/> Dépôt confirmé</label>
                <label className="small"><input type="checkbox" checked={whEvents.withdraw} onChange={e=>setWhEvents({...whEvents, withdraw:e.target.checked})}/> Retrait confirmé</label>
                <label className="small"><input type="checkbox" checked={whEvents.kyc} onChange={e=>setWhEvents({...whEvents, kyc:e.target.checked})}/> KYC mis à jour</label>
                <label className="small"><input type="checkbox" checked={whEvents.webhookPing} onChange={e=>setWhEvents({...whEvents, webhookPing:e.target.checked})}/> Ping</label>
              </div>
              <div className="hr"/>
              <div className="row" style={{justifyContent:'flex-end',gap:8}}>
                <button className="btn" onClick={pingWebhook}>Envoyer ping</button>
                <button className="btn btnPrimary" onClick={saveWebhook}>Enregistrer</button>
              </div>
            </div>
          )}

          {tab==='kyc' && (
            <div className="card zoneGreen">
              <div className="cardTitle"><b>KYC / Vérification</b><span className="badge">{kycStatus.toUpperCase()}</span></div>
              <div className="row">
                <input className="input" placeholder="Prénom" value={kycFirst} onChange={e=>setKycFirst(e.target.value)} />
                <input className="input" placeholder="Nom" value={kycLast} onChange={e=>setKycLast(e.target.value)} />
                <input className="input" placeholder="N° de document" value={kycDocId} onChange={e=>setKycDocId(e.target.value)} />
              </div>
              <div className="small">En prod, intégrer Onfido/Stripe Identity : upload face+doc, liveness.</div>
              <div className="hr"/>
              <button className="btn btnPrimary" onClick={async()=>{
                const r = await fetch(`${API_BASE}/api/settings/kyc`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ first:kycFirst, last:kycLast, doc:kycDocId }) });
                if (!r.ok) return toast("Échec soumission KYC", true); setKycStatus("pending"); toast("KYC soumis ✅");
              }}>Soumettre</button>
            </div>
          )}

          {tab==='preferences' && (
            <div className="card zonePurple">
              <div className="cardTitle"><b>Préférences</b></div>
              <div className="row">
                <label className="small">Thème
                  <select className="select" value={theme} onChange={e=>setTheme(e.target.value as any)}>
                    <option value="light">Clair</option><option value="dark">Sombre</option>
                  </select>
                </label>
                <label className="small">Langue
                  <select className="select" value={lang} onChange={e=>setLang(e.target.value as any)}>
                    <option value="fr">Français</option><option value="en">English</option>
                  </select>
                </label>
                <label className="small">Devise par défaut
                  <select className="select" value={currency} onChange={e=>setCurrency(e.target.value as any)}>
                    <option>EUR</option><option>USD</option><option>MAD</option>
                  </select>
                </label>
                <label className="small" style={{display:'flex',alignItems:'center',gap:8}}>
                  <input type="checkbox" checked={beta} onChange={e=>setBeta(e.target.checked)} /> Activer les features bêta
                </label>
              </div>
              <div className="hr"/>
              <button className="btn btnPrimary" onClick={async()=>{
                const r = await fetch(`${API_BASE}/api/settings/preferences`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ theme, lang, currency, beta }) });
                if (!r.ok) return toast("Échec sauvegarde préférences", true); toast("Préférences mises à jour ✅");
              }}>Sauvegarder</button>
            </div>
          )}

          {tab==='sessions' && (
            <div className="card">
              <div className="cardTitle"><b>Sessions & appareils</b></div>
              <div className="small">Appareils connectés à ton compte.</div>
              <div className="hr"/>
              {sessions.length===0 ? <div className="small">Aucune session active.</div> : (
                <div className="col">
                  {sessions.map(s=> (
                    <div key={s.id} className="row" style={{justifyContent:'space-between'}}>
                      <div>• {s.agent} — {s.ip} — <span className="small">dernière activité {new Date(s.lastSeen).toLocaleString()}</span></div>
                      <button className="btn btnGhost" onClick={()=>revokeSession(s.id)}>Déconnecter</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Récap latéral */}
        <div className="col">
          <div className="card zoneOrange">
            <div className="cardTitle"><b>Raccourcis</b></div>
            <div className="row" style={{gap:8}}>
              <button className="btn" onClick={()=>setTab('security')}>Activer 2FA</button>
              <button className="btn" onClick={()=>setTab('payments')}>Ajouter IBAN</button>
              <button className="btn" onClick={()=>setTab('api')}>Créer clé API</button>
              <button className="btn" onClick={()=>setTab('webhooks')}>Configurer webhook</button>
            </div>
          </div>

          <div className="card zoneBlue">
            <div className="cardTitle"><b>État du compte</b></div>
            <div className="kv"><span className="k">KYC</span><span className="v">{kycStatus.toUpperCase()}</span></div>
            <div className="kv"><span className="k">2FA</span><span className="v">{twofaEnabled? 'ON':'OFF'}</span></div>
            <div className="kv"><span className="k">Wallet</span><span className="v">{mmAccount? short(mmAccount,6) : '—'}</span></div>
            <div className="kv"><span className="k">Carte</span><span className="v">{cardLast4? `•••• ${cardLast4}`:'—'}</span></div>
          </div>

          <div className="card zonePurple">
            <div className="cardTitle"><b>Aide</b></div>
            <ul className="small" style={{margin:0, paddingLeft:16,lineHeight:1.7}}>
              <li>Active la 2FA pour sécuriser retraits & connexion.</li>
              <li>Ajoute un IBAN pour les retraits fiat.</li>
              <li>Les clés API sont secrètes : stocke-les en lieu sûr.</li>
              <li>Le webhook permet d’être notifié en temps réel.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Toast minimaliste ---------------------------- */
function toast(text: string, error = false){
  const el = document.createElement('div');
  el.className = 'toast' + (error? ' error':'');
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; }, 1800);
  setTimeout(()=> el.remove(), 2200);
}
