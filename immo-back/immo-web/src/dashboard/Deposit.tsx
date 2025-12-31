// src/pages/Deposit.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { erc20Abi, encodeFunctionData, parseUnits } from "viem";
import QRCode from "qrcode";

/* ============================== Réseau & const ============================== */
const EXPECTED_CHAIN = { chainId: "0xaa36a7", name: "Sepolia" } as const;
const EXPLORER = "https://sepolia.etherscan.io";
const DEV_FALLBACK = String(import.meta.env.VITE_DEV_FALLBACK || "").toLowerCase() === "true";

/* =============================== .env addresses ============================= */
const ENV_DEP = {
  ETH:  (import.meta.env.VITE_DEP_ETH  ?? "") as string,
  USDC: (import.meta.env.VITE_DEP_USDC ?? "") as string,
  DAI:  (import.meta.env.VITE_DEP_DAI  ?? "") as string,
};
const TOKEN_ADDR: Record<"USDC"|"DAI", string> = {
  USDC: (import.meta.env.VITE_TOKEN_USDC ?? "") as string,
  DAI:  (import.meta.env.VITE_TOKEN_DAI  ?? "") as string,
};
const TOKEN_DECIMALS: Record<"USDC"|"DAI", number> = { USDC: 6, DAI: 18 };

/* ================================== Styles ================================= */
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

.rip{position:absolute;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);transform:translate(-50%,-50%) scale(0);animation:r .6s ease-out forwards}
@keyframes r{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

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

/* Zones colorées */
.zoneBlue{background:var(--zone-blue);border:1px solid var(--zone-blue-line)}
.zoneGreen{background:var(--zone-green);border:1px solid var(--zone-green-line)}
.zoneOrange{background:var(--zone-orange);border:1px solid var(--zone-orange-line)}
.zonePurple{background:var(--zone-purple);border:1px solid var(--zone-purple-line)}

/* QR */
.qr{width:160px;height:160px;border-radius:12px;border:1px solid var(--line);background:#fff;display:grid;place-items:center}
canvas{image-rendering: pixelated}

/* Toast */
.toast{position:fixed;left:50%;top:24px;transform:translateX(-50%);background:#0b1220;color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.18);font-weight:800;z-index:9999}
.toast.error{background:#be123c}
`;

/* ================================= Helpers ================================= */
const short = (a?: string, n = 4) => (a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "—");
const toHex = (v: bigint) => "0x" + v.toString(16);
const isHexAddr = (a?: string) => /^0x[a-fA-F0-9]{40}$/.test(a || "");
function getEthOptional() {
  const anyWin = window as any;
  return anyWin.ethereum?.providers?.find((p:any)=>p.isMetaMask) || anyWin.ethereum || null;
}
function getEth() { const p = getEthOptional(); if (!p) throw new Error("MetaMask introuvable"); return p; }

/* ============== QR builders: EIP-681 (crypto) & EPC SEPA (fiat) ============== */
// ETH: ethereum:<addr>?value=<wei>
// ERC20: ethereum:<token>/transfer?address=<to>&uint256=<amount>
function buildEip681({
  asset, amount, depAddr, tokenAddr
}: { asset: "ETH"|"USDC"|"DAI"; amount: string; depAddr: string; tokenAddr?: string }) {
  if (!isHexAddr(depAddr)) return "ethereum:";
  const hasAmount = !!amount && Number(amount) > 0;
  if (asset === "ETH") {
    if (hasAmount) {
      const wei = parseUnits(amount, 18).toString();
      return `ethereum:${depAddr}?value=${wei}`;
    }
    return `ethereum:${depAddr}`;
  } else {
    if (!isHexAddr(tokenAddr)) return `ethereum:${depAddr}`;
    if (hasAmount) {
      const dec = TOKEN_DECIMALS[asset];
      const amt = parseUnits(amount, dec).toString();
      return `ethereum:${tokenAddr}/transfer?address=${depAddr}&uint256=${amt}`;
    }
    return `ethereum:${tokenAddr}/transfer?address=${depAddr}`;
  }
}

/** EPC QR (SEPA) – format texte:
 * BCD\n001\n1\nSCT\n<BIC>\n<NAME>\n<IBAN>\n<EUR<amt>>\n\n\n<Remittance>
 * Réf: EPC069-12 (implémentation simplifiée)
 */
function buildEpcSepa({
  name, iban, bic, amount, reference, currency
}: { name: string; iban: string; bic: string; amount: string; reference: string; currency: "EUR"|"USD"|"MAD" }) {
  // SEPA = EUR uniquement ; pour USD/MAD on encode quand même un texte fallback
  const amt = Number(amount || "0");
  const amtStr = amt > 0 ? amt.toFixed(2) : "";
  if (currency === "EUR") {
    const safeName = (name || "").slice(0, 70);
    const safeRef = (reference || "").slice(0, 140);
    const lines = [
      "BCD", "001", "1", "SCT",
      (bic || "").toUpperCase(),
      safeName,
      iban.replace(/\s+/g,"").toUpperCase(),
      amtStr ? `EUR${amtStr}` : "",
      "", "", // optional fields
      safeRef
    ];
    return lines.join("\n");
  } else {
    // Fallback texte générique si hors EUR
    return `PAYMENT\nNAME:${name}\nIBAN:${iban}\nBIC:${bic}\nAMOUNT:${currency} ${amtStr}\nREF:${reference}`;
  }
}

/* ================================ Composant ================================ */
export default function Deposit() {
  /* ---- Connexion & réseau ---- */
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const wrongChain = chainId && chainId !== EXPECTED_CHAIN.chainId;

  /* ---- Onglets & états communs ---- */
  const [tab, setTab] = useState<"crypto"|"fiat">("crypto");
  const [amount, setAmount] = useState<string>("");
  const [ccy, setCcy] = useState<"EUR"|"USD"|"MAD">("EUR");
  const [lastTxHash, setLastTxHash] = useState<string|null>(null);

  /* ---- Crypto ---- */
  const [asset, setAsset] = useState<"ETH"|"USDC"|"DAI">("ETH");

  /* ---- Fiat ---- */
  const [method, setMethod] = useState<"bank"|"card">("bank");
  // Billing
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("FR");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [zip, setZip] = useState("");
  const [agreeTos, setAgreeTos] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  // Bank
  const refCode = useMemo(()=> address ? (address.slice(0,6)+"..."+address.slice(-4)) : "", [address]);
  const [receiptFile, setReceiptFile] = useState<File|null>(null);
  // Card mock
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [useBillingAsCardAddr, setUseBillingAsCardAddr] = useState(true);

  /* ---- QR canvas ---- */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* ---- Prix mock pour estimation ---- */
  const rates = useMemo(() => {
    const baseEUR = { ETH: 2900, USDC: 0.92, DAI: 0.92 };
    const fx = ccy === "EUR" ? 1 : ccy === "USD" ? 1.08 : 10.8;
    return { ETH: baseEUR.ETH * fx, USDC: baseEUR.USDC * fx, DAI: baseEUR.DAI * fx };
  }, [ccy]);

  const estFiat = useMemo(() => {
    const qty = Number(amount || "0");
    if (!qty || Number.isNaN(qty)) return 0;
    if (tab === "crypto") return (rates as any)[asset] * qty;
    return qty; // en fiat on montre juste le montant en devise
  }, [tab, asset, amount, rates]);

  /* ---- Init MetaMask ---- */
  useEffect(() => {
    const eth = getEthOptional();
    if (!eth) return;
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
        await eth.request({ method: "wallet_switchEthereumChain", params:[{ chainId: EXPECTED_CHAIN.chainId }]} );
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

  async function ensureAccount(): Promise<`0x${string}`> {
    const eth = getEth();
    const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
    if (!accs?.[0]) throw new Error("Aucun compte MetaMask");
    return accs[0] as `0x${string}`;
  }

  /* ---- Adresses de dépôt effectives ---- */
  const depETH = useMemo(() => {
    if (isHexAddr(ENV_DEP.ETH)) return ENV_DEP.ETH;
    if (DEV_FALLBACK && isHexAddr(address || "")) return address as string; // DEV only
    return "";
  }, [address]);

  const depAddr = asset === "ETH"
    ? depETH
    : (isHexAddr(ENV_DEP[asset]) ? ENV_DEP[asset] : "");

  const tokenAddr = asset === "ETH" ? "" : (isHexAddr(TOKEN_ADDR[asset]) ? TOKEN_ADDR[asset] : "");

  /* ---- Validations ---- */
  const amtOkCrypto = /^\d*\.?\d+$/.test(amount) && Number(amount) > 0;
  const depositOk = isHexAddr(depAddr);
  const tokenOk = asset === "ETH" ? true : isHexAddr(tokenAddr);
  const canSend = !!address && !wrongChain && depositOk && tokenOk && amtOkCrypto;

  const amtOkFiat = /^\d*\.?\d+$/.test(amount) && Number(amount) > 0;
  const baseBillingOk = !!fullName && /\S+@\S+\.\S+/.test(email) && phone.length>=6 && !!addressLine && !!city && !!zip && agreeTos && isOwner;
  const bankOk = baseBillingOk && !!refCode && amtOkFiat;
  const cardOk = baseBillingOk && amtOkFiat && cardName &&
                 /^\d{12,19}$/.test(cardNumber.replace(/\s/g,"")) &&
                 /^\d{2}\/\d{2}$/.test(exp) &&
                 /^\d{3,4}$/.test(cvc);

  /* ---- QR dynamique (crypto OU fiat) ---- */
  useEffect(() => {
    let payload = "";
    if (tab === "crypto") {
      payload = buildEip681({ asset, amount, depAddr, tokenAddr });
    } else {
      // QR SEPA uniquement en EUR et méthode "bank"
      const name = "Reinv Capital";
      const iban = "FR76 3000 4000 5000 6000 7000 189";
      const bic  = "BNPAFRPPXXX";
      const ref  = refCode || "—";
      payload = buildEpcSepa({ name, iban, bic, amount, reference: ref, currency: ccy });
    }
    QRCode.toCanvas(canvasRef.current, payload || " ", { width: 220, margin: 1 }, (err) => err && console.error(err));
  }, [tab, asset, amount, depAddr, tokenAddr, ccy, method, refCode]);

  /* ---- Envoi on-chain ---- */
  async function sendEth(amountStr: string) {
    const from = await ensureAccount();
    if (!depositOk) throw new Error("Adresse de dépôt ETH invalide");
    const wei = parseUnits(amountStr || "0", 18);
    if (wei <= 0n) throw new Error("Montant invalide");
    const eth = getEth();
    const txHash = await eth.request({
      method: "eth_sendTransaction",
      params: [{ from, to: depAddr, value: toHex(wei) }]
    });
    setLastTxHash(txHash as string);
    showToast("Transaction ETH envoyée ✅");
    return txHash as string;
  }

  async function sendErc20(symbol: "USDC"|"DAI", amountStr: string) {
    const from = await ensureAccount();
    if (!tokenOk) throw new Error(`Contrat ${symbol} invalide`);
    if (!depositOk) throw new Error(`Adresse de dépôt ${symbol} invalide`);
    const decimals = TOKEN_DECIMALS[symbol];
    const amountWei = parseUnits(amountStr || "0", decimals);
    if (amountWei <= 0n) throw new Error("Montant invalide");
    const data = encodeFunctionData({ abi: erc20Abi, functionName: "transfer", args: [depAddr as `0x${string}`, amountWei] });
    const eth = getEth();
    const txHash = await eth.request({ method: "eth_sendTransaction", params: [{ from, to: tokenAddr, data }] });
    setLastTxHash(txHash as string);
    showToast(`Transaction ${symbol} envoyée ✅`);
    return txHash as string;
  }

  async function handleSend() {
    try {
      await ensureChain();
      if (!amtOkCrypto) throw new Error("Montant invalide");
      if (!depositOk) throw new Error("Adresse de dépôt invalide");
      if (asset !== "ETH" && !tokenOk) throw new Error("Contrat token invalide");
      if (asset === "ETH") await sendEth(amount);
      else await sendErc20(asset as "USDC"|"DAI", amount);
    } catch (e:any) {
      showToast(e?.code === 4001 ? "Transaction annulée" : (e?.message || "Échec de l’envoi"), "error");
    }
  }

  /* ---- Fiat submits ---- */
  async function submitBank() {
    try {
      const form = new FormData();
      form.append("mode", "fiat");
      form.append("method", "bank");
      form.append("currency", ccy);
      form.append("amount", amount);
      form.append("fullName", fullName);
      form.append("email", email);
      form.append("phone", phone);
      form.append("country", country);
      form.append("city", city);
      form.append("address", addressLine);
      form.append("zip", zip);
      form.append("reference", refCode || "");
      if (receiptFile) form.append("receipt", receiptFile);
      const res = await fetch("/api/fiat/bank-deposit", { method:"POST", body: form });
      if (!res.ok) throw new Error("Échec de la demande de dépôt");
      showToast("Demande de virement enregistrée ✅");
    } catch (e:any) {
      showToast(e?.message || "Erreur virement", "error");
    }
  }

  async function submitCardMock() {
    try {
      const res = await fetch("/api/fiat/card-mock", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          mode:"fiat", method:"card", currency: ccy, amount,
          fullName, email, phone, country, city, address: addressLine, zip,
          cardName, cardLast4: cardNumber.slice(-4),
        })
      });
      if (!res.ok) throw new Error("Paiement carte refusé");
      showToast("Paiement carte simulé ✅");
    } catch (e:any) {
      showToast(e?.message || "Erreur paiement carte", "error");
    }
  }

  /* --------------------------------- UI --------------------------------- */
  return (
    <div className="container">
      <style>{CSS}</style>

      {/* HEADER */}
      <div className="header">
        <h1 className="h1">Déposer</h1>
        <div className="pills" style={{gap:10,display:"flex",alignItems:"center"}}>
          <button className="pill" onClick={()=>setCcy(ccy==="EUR"?"USD":ccy==="USD"?"MAD":"EUR")}>{ccy} ▾</button>
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
                <b style={{fontFamily:"Sora"}}>Déposer en crypto</b>
                <span className="small">EVM — Sepolia</span>
              </div>

              <div className="row" style={{gap:12}}>
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
                  <input className="input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" />
                  {!amtOkCrypto && amount !== "" && <div className="small" style={{color:"#be123c"}}>Montant invalide</div>}
                </div>
              </div>

              <div className="help">Envoi uniquement sur <b>Sepolia</b>. Les dépôts sur un mauvais réseau peuvent être perdus.</div>
              <div className="hr" />

              <div className="row" style={{alignItems:"stretch"}}>
                <div style={{flex:1}}>
                  <div className="small">Adresse de dépôt</div>
                  <div className="row" style={{gap:10, alignItems:"center", marginTop:6}}>
                    <div className="input" style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                      <span className="small" style={{fontWeight:800, color: depositOk ? undefined : "#be123c"}}>
                        {depositOk ? `${depAddr.slice(0,10)}…${depAddr.slice(-6)}` : "Adresse invalide (.env)"}
                      </span>
                      <button className="btn btnGhost" onClick={()=>depositOk && navigator.clipboard.writeText(depAddr)} disabled={!depositOk}>Copier</button>
                    </div>
                  </div>

                  <div className="kv"><span className="k">Estimation</span><span className="v">{estFiat.toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</span></div>
                  <div className="kv"><span className="k">Actif</span><span className="v">{asset}</span></div>
                  <div className="kv"><span className="k">Réseau</span><span className="v">Sepolia (EVM)</span></div>
                </div>

                <div className="qr"><canvas ref={canvasRef} width={220} height={220}/></div>
              </div>

              <div className="hr" />
              {lastTxHash && (
                <div className="small" style={{marginBottom:8}}>
                  Dernière transaction :{" "}
                  <a href={`${EXPLORER}/tx/${lastTxHash}`} target="_blank" rel="noreferrer" style={{fontWeight:800}}>
                    {short(lastTxHash, 6)}
                  </a>
                </div>
              )}
              <div className="row" style={{justifyContent:"space-between", gap:8, flexWrap:"wrap"}}>
                <span className="small">Délai indicatif : 1–3 min après confirmation on-chain.</span>
                <div className="row" style={{gap:8}}>
                  <button className="btn" onClick={handleSend} disabled={!canSend}>Envoyer via MetaMask</button>
                  <button className="btn btnPrimary" onClick={async ()=>{
                    try{
                      const res = await fetch("/api/deposits/notify", {
                        method:"POST", headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({ mode:"crypto", asset, amount, from: address, txHash: lastTxHash || undefined }),
                      });
                      if(!res.ok) throw new Error("Serveur indisponible");
                      showToast("Notification envoyée ✅");
                    } catch(e:any){ showToast(e?.message || "Impossible de notifier", "error"); }
                  }} disabled={!amtOkCrypto || !depositOk}>J’ai envoyé le dépôt</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card zoneGreen">
              <div className="cardTitle">
                <b style={{fontFamily:"Sora"}}>Déposer en fiat</b>
                <span className="small">EUR / USD / MAD</span>
              </div>

              {/* Méthode & montant */}
              <div className="row" style={{gap:12}}>
                <div className="pill" style={{cursor:"pointer", background: method==="bank" ? "#fff" : "#f8fafc"}} onClick={()=>setMethod("bank")}>Virement bancaire</div>
                <div className="pill" style={{cursor:"pointer", background: method==="card" ? "#fff" : "#f8fafc"}} onClick={()=>setMethod("card")}>Carte / Onramp</div>
                <div style={{flex:1}}/>
                <div className="small" style={{fontWeight:700}}>EUR / USD / MAD</div>
              </div>

              <div className="row" style={{gap:12, marginTop:12}}>
                <div style={{flex:1}}>
                  <label className="small">Devise</label>
                  <select className="select" value={ccy} onChange={e=>setCcy(e.target.value as any)}>
                    <option value="EUR">EUR</option><option value="USD">USD</option><option value="MAD">MAD</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label className="small">Montant</label>
                  <input className="input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>

              {/* Billing */}
              <div className="hr" />
              <div className="card" style={{borderColor:"#e5e7eb"}}>
                <div className="cardTitle"><b>Informations de facturation</b></div>
                <div className="row" style={{gap:12, flexWrap:"wrap"}}>
                  <input className="input" style={{flex:"1 1 240px"}} placeholder="Nom complet" value={fullName} onChange={e=>setFullName(e.target.value)} />
                  <input className="input" style={{flex:"1 1 240px"}} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                  <input className="input" style={{flex:"1 1 160px"}} placeholder="Téléphone" value={phone} onChange={e=>setPhone(e.target.value)} />
                  <select className="select" style={{flex:"0 0 140px"}} value={country} onChange={e=>setCountry(e.target.value)}>
                    <option value="FR">France</option><option value="ES">España</option><option value="MA">Maroc</option><option value="US">USA</option>
                  </select>
                  <input className="input" style={{flex:"1 1 200px"}} placeholder="Ville" value={city} onChange={e=>setCity(e.target.value)} />
                  <input className="input" style={{flex:"2 1 260px"}} placeholder="Adresse" value={addressLine} onChange={e=>setAddressLine(e.target.value)} />
                  <input className="input" style={{flex:"0 0 120px"}} placeholder="Code postal" value={zip} onChange={e=>setZip(e.target.value)} />
                </div>
              </div>

              {method==="bank" ? (
                <>
                  <div className="hr" />
                  <div className="row" style={{gap:16, alignItems:"stretch"}}>
                    <div className="card zoneOrange" style={{flex:1}}>
                      <div className="cardTitle"><b>Virement bancaire (SEPA)</b></div>
                      <div className="kv"><span className="k">Titulaire</span><span className="v">Reinv Capital</span></div>
                      <div className="kv"><span className="k">IBAN</span><span className="v">FR76 3000 4000 5000 6000 7000 189</span></div>
                      <div className="kv"><span className="k">BIC</span><span className="v">BNPAFRPPXXX</span></div>
                      <div className="kv"><span className="k">Référence</span><span className="v">{refCode || "—"}</span></div>
                      <div className="help">Mets <b>exactement</b> cette référence dans le libellé du virement.</div>
                      <div className="row" style={{justifyContent:"space-between", marginTop:8}}>
                        <button className="btn btnGhost" onClick={()=>navigator.clipboard.writeText("FR76 3000 4000 5000 6000 7000 189")}>Copier IBAN</button>
                        <input type="file" onChange={e=>setReceiptFile(e.target.files?.[0] || null)} />
                      </div>
                    </div>

                    <div className="card zonePurple" style={{flex:1}}>
                      <div className="cardTitle"><b>Confirmation</b><span className="small">Délai 24–48h</span></div>
                      <label className="small" style={{display:"flex", gap:8, alignItems:"center"}}>
                        <input type="checkbox" checked={agreeTos} onChange={e=>setAgreeTos(e.target.checked)} />
                        J’accepte les CGU et la Politique de confidentialité.
                      </label>
                      <label className="small" style={{display:"flex", gap:8, alignItems:"center", marginTop:6}}>
                        <input type="checkbox" checked={isOwner} onChange={e=>setIsOwner(e.target.checked)} />
                        Je certifie être le titulaire du compte bancaire utilisé.
                      </label>
                      <div className="row" style={{justifyContent:"flex-end", marginTop:12}}>
                        <button className="btn btnPrimary" disabled={!bankOk} onClick={submitBank}>
                          Enregistrer mon virement
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="small" style={{marginTop:6}}>Délai virement : 24–48h ouvrées.</div>
                </>
              ) : (
                <>
                  <div className="hr" />
                  <div className="row" style={{gap:16, alignItems:"stretch"}}>
                    <div className="card zonePurple" style={{flex:1}}>
                      <div className="cardTitle"><b>Paiement par carte</b><span className="small">3-D Secure requis en prod</span></div>
                      <input className="input" placeholder="Nom sur la carte" value={cardName} onChange={e=>setCardName(e.target.value)} />
                      <div className="row" style={{gap:8, marginTop:8}}>
                        <input className="input" placeholder="Numéro de carte" value={cardNumber} onChange={e=>setCardNumber(e.target.value.replace(/[^\d]/g,""))} />
                      </div>
                      <div className="row" style={{gap:8, marginTop:8}}>
                        <input className="input" placeholder="MM/AA" value={exp} onChange={e=>setExp(e.target.value)} />
                        <input className="input" placeholder="CVC" value={cvc} onChange={e=>setCvc(e.target.value.replace(/[^\d]/g,""))} />
                      </div>
                      <label className="small" style={{display:"flex", gap:8, alignItems:"center", marginTop:8}}>
                        <input type="checkbox" checked={useBillingAsCardAddr} onChange={e=>setUseBillingAsCardAddr(e.target.checked)} />
                        Utiliser l’adresse de facturation ci-dessus
                      </label>
                      <label className="small" style={{display:"flex", gap:8, alignItems:"center", marginTop:8}}>
                        <input type="checkbox" checked={agreeTos} onChange={e=>setAgreeTos(e.target.checked)} />
                        J’accepte les CGU et la Politique de confidentialité.
                      </label>
                      <label className="small" style={{display:"flex", gap:8, alignItems:"center", marginTop:6}}>
                        <input type="checkbox" checked={isOwner} onChange={e=>setIsOwner(e.target.checked)} />
                        Je certifie être le titulaire du moyen de paiement.
                      </label>
                      <div className="row" style={{justifyContent:"flex-end", marginTop:10}}>
                        <button className="btn btnPrimary" disabled={!cardOk} onClick={submitCardMock}>
                          Payer {Number(amount||0).toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}
                        </button>
                      </div>
                    </div>

                    <div className="card zoneOrange" style={{flex:1}}>
                      <div className="cardTitle"><b>Conseils sécurité</b></div>
                      <ul className="small" style={{margin:0, paddingLeft:16, lineHeight:1.7}}>
                        <li>En production, **tokenise** les cartes via Stripe/Mollie/Adyen (3-D Secure).</li>
                        <li>Ne fais jamais transiter le PAN/CVC par ton serveur.</li>
                        <li>Conserve les logs de consentement et les reçus.</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Col latérale : Récap & Aide */}
        <div style={{display:"grid", gap:16}}>
          <div className="card zoneOrange">
            <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Récapitulatif</b></div>
            <div className="kv"><span className="k">Mode</span><span className="v">{tab==="crypto"?"Crypto":"Fiat"}</span></div>
            {tab==="crypto" ? (
              <>
                <div className="kv"><span className="k">Actif</span><span className="v">{asset}</span></div>
                <div className="kv"><span className="k">Montant</span><span className="v">{amount||"0.00"} {asset}</span></div>
                <div className="kv"><span className="k">Estimation</span><span className="v">{estFiat.toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</span></div>
                <div className="kv"><span className="k">Réseau</span><span className="v">Sepolia</span></div>
                {lastTxHash && (
                  <div className="kv">
                    <span className="k">Tx</span>
                    <span className="v"><a href={`${EXPLORER}/tx/${lastTxHash}`} target="_blank" rel="noreferrer">{short(lastTxHash,6)}</a></span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="kv"><span className="k">Devise</span><span className="v">{ccy}</span></div>
                <div className="kv"><span className="k">Montant</span><span className="v">{Number(amount||0).toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</span></div>
                <div className="kv"><span className="k">Méthode</span><span className="v">{method==="bank"?"Virement":"Carte"}</span></div>
              </>
            )}
            <div className="hr" />
            <button className="btn btnPrimary">Continuer</button>
          </div>

          <div className="card zoneBlue">
            <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Aide dépôt</b></div>
            <ul className="small" style={{margin:0, paddingLeft:16,lineHeight:1.7}}>
              <li>En crypto, n’envoie que sur <b>Sepolia</b> (testnet).</li>
              <li>USDC/DAI : gas payé en <b>ETH</b>.</li>
              <li>Fiat : mets <b>la référence</b> (ton adresse abrégée) dans le libellé.</li>
  <li>Besoin d’aide ? “Réglages” → Support.</li>
  <li>{/* Placeholder: Card/Onramp mock removed in this build. Implement or import a FiatCardPayment component to restore this block. */}Carte / Onramp (mock) disponible en production.</li>

</ul>
          </div>

          {/* QR toujours visible et DYNAMIQUE */}
          <div className="card">
            <div className="cardTitle"><b>QR {tab==="crypto" ? "crypto (EIP-681)" : "virement (EPC SEPA)"}</b></div>
            <div className="qr"><canvas ref={canvasRef} width={220} height={220}/></div>
            <div className="small" style={{marginTop:6}}>
              {tab==="crypto"
                ? "Scanne avec un wallet mobile (Trust, Rainbow, Metamask Mobile…)."
                : (ccy==="EUR" ? "Scanne avec ton app bancaire compatible SEPA QR." : "QR texte informatif (USD/MAD).")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Toast -------------------------------- */
function showToast(text: string, kind: "ok"|"error" = "ok") {
  const el = document.createElement("div");
  el.className = `toast ${kind==="error" ? "error" : ""}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 1800);
  setTimeout(() => { el.remove(); }, 2200);
}
