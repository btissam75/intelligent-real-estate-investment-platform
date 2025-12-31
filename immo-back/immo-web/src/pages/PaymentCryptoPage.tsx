// // PaymentCryptoPage.tsx
// import React, { useEffect, useMemo, useState } from "react";

// /** ====== Thème léger (maquette) ====== */
// const CSS = `
// :root{
//   --ink:#111827; --sub:#6b7280; --line:#e5e7eb;
//   --bg:#ffffff; --card:#ffffff;
//   --pri:#e11d2e; --pri-700:#be123c;
// }
// *{box-sizing:border-box}
// body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;background:#f9fafb;color:var(--ink)}
// a{text-decoration:none;color:inherit}
// .wrap{max-width:900px;margin:28px auto;padding:0 18px}
// .h1{margin:0 0 8px;font-size:28px;font-weight:900}
// .sub{color:var(--sub)}
// .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;box-shadow:0 8px 28px rgba(16,24,40,.06)}
// .grid{display:grid;gap:12px}
// .row{display:flex;gap:10px;align-items:center}
// .kv{display:flex;justify-content:space-between;gap:12px;border:1px dashed var(--line);border-radius:12px;padding:12px}
// .kv b{font-weight:900}
// .badge{font-size:12px;border:1px solid var(--line);padding:3px 8px;border-radius:999px;color:var(--sub)}
// .btn{border:1px solid var(--line);background:#fff;border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer}
// .btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff}
// .btn:disabled{opacity:.55;cursor:not-allowed}
// .input, .select{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:12px;outline:none;background:#fff}
// .alert{display:flex;justify-content:space-between;gap:10px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px}
// .hr{height:1px;background:var(--line);margin:8px 0}
// .footer{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
// .link{color:#0ea5e9;font-weight:800}
// .note{font-size:12px;color:var(--sub)}
// `;

// /** ====== Sélecteur de réseau (bascule Mainnet / Sepolia pour la maquette) ====== */
// type ChainPreset = "mainnet" | "sepolia";
// const PRESETS: Record<ChainPreset, {
//   chainId: `0x${string}`; name: string; explorer: string;
//   rpc: string[]; currency: { name:string; symbol:string; decimals:number };
// }> = {
//   mainnet: {
//     chainId: "0x1",
//     name: "Ethereum",
//     explorer: "https://etherscan.io",
//     rpc: ["https://rpc.ankr.com/eth"], // remplace par Infura/Alchemy si besoin
//     currency: { name:"Ether", symbol:"ETH", decimals:18 },
//   },
//   sepolia: {
//     chainId: "0xaa36a7",
//     name: "Sepolia",
//     explorer: "https://sepolia.etherscan.io",
//     rpc: ["https://rpc.ankr.com/eth_sepolia"],
//     currency: { name:"Ether", symbol:"ETH", decimals:18 },
//   }
// };

// /** ====== Petits helpers ====== */
// const getEth = () => (window as any).ethereum as any | undefined;

// const short = (s?:string, n=4) =>
//   s ? `${s.slice(0,2+n)}…${s.slice(-n)}` : "—";

// const ethToWeiHex = (ethStr: string) => {
//   const [i, fRaw=""] = (ethStr || "0").trim().split(".");
//   const dec = 18;
//   const f = fRaw.slice(0,dec).padEnd(dec,"0");
//   const wei = (BigInt(i||"0") * (10n**18n)) + BigInt(f||"0");
//   return "0x" + wei.toString(16);
// };

// const isHexAddress = (a:string) => /^0x[0-9a-fA-F]{40}$/.test(a);

// /** ====== Composant principal ====== */
// export default function PaymentCryptoPage(props:{
//   mode?: ChainPreset;                  // "mainnet" par défaut
//   reference: string;                   // REF commande/pledge
//   amountEth: string;                   // Montant attendu en ETH (string)
//   toAddress: string;                   // Adresse destinataire (ton wallet de réception)
//   ttlSeconds?: number;                 // Optionnel: décompte pour collectif
// }) {
//   const preset: ChainPreset = props.mode ?? "mainnet";
//   const EXPECTED = PRESETS[preset];

//   // État Web3/UI
//   const [hasMM, setHasMM]     = useState(false);
//   const [account, setAccount] = useState<string|undefined>();
//   const [chainId, setChainId] = useState<string|undefined>();
//   const [status, setStatus]   = useState<string>("");

//   // Compte à rebours (optionnel)
//   const [ttl, setTtl] = useState<number|undefined>(props.ttlSeconds);

//   useEffect(()=>{
//     if(typeof ttl === "number"){
//       const id = setInterval(()=> setTtl(t => (typeof t==="number" && t>0)? t-1 : t), 1000);
//       return ()=>clearInterval(id);
//     }
//   },[ttl]);

//   // Boot MetaMask
//   useEffect(()=>{
//     const eth = getEth();
//     setHasMM(!!eth);
//     if(!eth) return;

//     (async()=>{
//       try{
//         const [accs, cid] = await Promise.all([
//           eth.request({ method:"eth_accounts" }),
//           eth.request({ method:"eth_chainId" }),
//         ]);
//         setAccount(accs?.[0]);
//         setChainId(cid);
//       }catch{}
//     })();

//     const onA = (a:string[]) => setAccount(a?.[0]);
//     const onC = (c:string)  => setChainId(c);
//     eth.on?.("accountsChanged", onA);
//     eth.on?.("chainChanged",   onC);
//     return ()=>{
//       eth.removeListener?.("accountsChanged", onA);
//       eth.removeListener?.("chainChanged",   onC);
//     };
//   },[]);

//   const wrongChain = hasMM && chainId && chainId !== EXPECTED.chainId;

//   /** Connexion + bascule réseau */
//   const connect = async ()=>{
//     const eth = getEth();
//     if(!eth){ window.open("https://metamask.io/download/","_blank"); return; }
//     const accs:string[] = await eth.request({ method: "eth_requestAccounts" });
//     setAccount(accs?.[0]);
//     const cid:string = await eth.request({ method: "eth_chainId" });
//     setChainId(cid);
//   };

//   const ensureChain = async ()=>{
//     const eth = getEth(); if(!eth) return;
//     const cid = await eth.request({ method:"eth_chainId" });
//     if(cid !== EXPECTED.chainId){
//       try{
//         await eth.request({ method:"wallet_switchEthereumChain", params:[{ chainId: EXPECTED.chainId }]});
//         setChainId(EXPECTED.chainId);
//       }catch(e:any){
//         if(e?.code===4902){
//           await eth.request({ method:"wallet_addEthereumChain", params:[{
//             chainId: EXPECTED.chainId,
//             chainName: EXPECTED.name,
//             rpcUrls: EXPECTED.rpc,
//             nativeCurrency: EXPECTED.currency,
//             blockExplorerUrls: [EXPECTED.explorer]
//           }]});
//         }else{ throw e; }
//       }
//     }
//   };

//   /** Envoi (maquette) — en vrai tu gardes ça ou tu passes par ton API d’INIT avant/ après */
//   const send = async ()=>{
//     try{
//       if(!hasMM) { setStatus("MetaMask non détecté."); return; }
//       if(!account){ await connect(); }
//       await ensureChain();

//       // Validations simples
//       if(!props.amountEth || Number(props.amountEth) <= 0){ setStatus("Montant invalide."); return; }
//       if(!isHexAddress(props.toAddress)){ setStatus("Adresse de réception invalide."); return; }

//       setStatus("Signature / envoi en cours…");
//       const eth = getEth()!;
//       const txDraft:any = {
//         from: account,
//         to: props.toAddress,
//         value: ethToWeiHex(props.amountEth),
//       };

//       // Pré-check gas (facultatif mais utile)
//       const gas = await eth.request({ method:"eth_estimateGas", params:[txDraft] });
//       txDraft.gas = gas;

//       // Envoi
//       const txHash:string = await eth.request({ method:"eth_sendTransaction", params:[txDraft] });
//       setStatus(`✅ Transaction envoyée : ${txHash.slice(0,10)}…`);

//       // 👉 Optionnel: notifier ton backend
//       // await fetch("/api/payments/onchain/init", { method:"POST", headers:{ "Content-Type":"application/json" },
//       //   body: JSON.stringify({ reference: props.reference, txHash, amount: props.amountEth, chainId: EXPECTED.chainId })
//       // });

//     }catch(e:any){
//       console.error(e);
//       if(e?.code===4001) setStatus("❌ Signature refusée.");
//       else if(e?.code===-32000 && /insufficient funds/i.test(e?.message||"")) setStatus("❌ Fonds insuffisants.");
//       else setStatus("❌ Erreur: " + (e?.message || e?.code || "inconnue"));
//     }
//   };

//   /** Affichages dérivés */
//   const ttlText = useMemo(()=>{
//     if(typeof ttl!=="number") return undefined;
//     const m = Math.floor(ttl/60), s = ttl%60;
//     return `${m}:${String(s).padStart(2,"0")}`;
//   },[ttl]);

//   return (
//     <div className="wrap">
//       <style>{CSS}</style>

//       <h1 className="h1">Paiement crypto (MetaMask)</h1>
//       <div className="sub">Référence <b>{props.reference}</b> • Réseau attendu : <b>{EXPECTED.name}</b></div>

//       {wrongChain && (
//         <div className="alert" style={{marginTop:12}}>
//           <div>Réseau détecté: <b>{chainId}</b> — passez sur <b>{EXPECTED.name}</b>.</div>
//           <button className="btn" onClick={ensureChain}>Basculer</button>
//         </div>
//       )}

//       <div className="grid" style={{marginTop:12}}>
//         {/* Récap montant + destinataire */}
//         <div className="card">
//           <div className="row" style={{justifyContent:"space-between"}}>
//             <div className="row">
//               <span className="badge">{EXPECTED.currency.symbol}</span>
//               <b style={{fontSize:22}}>{props.amountEth} {EXPECTED.currency.symbol}</b>
//             </div>
//             {typeof ttlText === "string" && <span className="badge">Expire dans {ttlText}</span>}
//           </div>
//           <div className="kv" style={{marginTop:12}}>
//             <span className="sub">Adresse de réception</span>
//             <b title={props.toAddress}>{short(props.toAddress,6)}</b>
//           </div>
//           <div className="note" style={{marginTop:8}}>
//             * Envoyez exactement ce montant à cette adresse. Les frais réseau s’ajoutent côté MetaMask.
//           </div>
//         </div>

//         {/* Bloc MetaMask */}
//         <div className="card">
//           <div className="row" style={{justifyContent:"space-between"}}>
//             <div className="row">
//               <span className="badge">MetaMask</span>
//               <div className="sub">Compte: <b>{account ? short(account,6) : "—"}</b></div>
//             </div>
//             {!account ? (
//               <button className="btn" onClick={connect}>Connecter</button>
//             ) : (
//               <button className="btn" onClick={ensureChain}>Vérifier réseau</button>
//             )}
//           </div>

//           <div className="hr" />

//           <div className="footer">
//             <button className="btn btnPrimary"
//               onClick={send}
              
//             >
//               Envoyer {props.amountEth} {EXPECTED.currency.symbol}
//             </button>
//             <span className="note">Réseau : {EXPECTED.name}</span>
//           </div>

//           {status && <div className="sub" style={{marginTop:10}}>{status}</div>}
//         </div>

//         {/* Aide / Backup */}
//         <div className="card">
//           <div className="row" style={{justifyContent:"space-between"}}>
//             <div className="sub">Besoin d’aide ?</div>
//             <a className="link" href={EXPECTED.explorer} target="_blank" rel="noreferrer">
//               Ouvrir l’explorer
//             </a>
//           </div>
//           <div className="note" style={{marginTop:8}}>
//             Après envoi, la confirmation peut prendre quelques blocs. La page s’actualisera une fois
//             la transaction confirmée par notre back-office.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/PaymentCryptoPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import QRCode from "react-qr-code";
// @ts-ignore
import toast, { Toaster } from "react-hot-toast";

/**
 * Page de paiement crypto complète (MetaMask)
 * - Montant / Gas / GasLimit / GasPrice (optionnels)
 * - Estimation gas (eth_estimateGas)
 * - Solde / réseau / compte
 * - TTL (optionnel)
 * - Nom du destinataire (alias local) + affichage immédiat
 * - QR / copier / lien explorer
 * - Preview de confirmation avant envoi
 */

/* ----------------- style (maquette légère) ----------------- */
const CSS = `
:root{
  --ink:#111827; --sub:#6b7280; --line:#e5e7eb;
  --bg:#ffffff; --card:#ffffff;
  --pri:#e11d2e; --pri-700:#be123c;
}
*{box-sizing:border-box}
body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;background:#f9fafb;color:var(--ink)}
.wrap{max-width:980px;margin:28px auto;padding:0 18px}
.h1{margin:0 0 8px;font-size:28px;font-weight:900}
.sub{color:var(--sub)}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;box-shadow:0 8px 28px rgba(16,24,40,.04)}
.grid{display:grid;gap:12px}
.row{display:flex;gap:10px;align-items:center}
.kv{display:flex;justify-content:space-between;gap:12px;border:1px dashed var(--line);border-radius:10px;padding:10px}
.kv b{font-weight:900}
.badge{font-size:12px;border:1px solid var(--line);padding:4px 8px;border-radius:999px;color:var(--sub)}
.btn{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer}
.btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff}
.input, .select{width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;outline:none;background:#fff}
.alert{display:flex;justify-content:space-between;gap:10px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:10px}
.small{font-size:12px;color:var(--sub)}
.title{font-weight:800;margin-bottom:6px}
.footer{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}
.note{font-size:12px;color:var(--sub)}
`;

/* ----------------- presets réseau ----------------- */
type ChainPreset = "hardhat" | "sepolia" | "mainnet";

type ChainConf = {
  chainId: `0x${string}`;
  name: string;
  explorer: string;
  rpc: string[];
  currency: { name: string; symbol: string; decimals: number };
};

const PRESETS: Record<ChainPreset, ChainConf> = {
  hardhat: {
    chainId: "0x7A69", // 31337
    name: "Hardhat Localhost",
    explorer: "http://localhost:8545",        // optionnel
    rpc: ["http://127.0.0.1:8545"],
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  sepolia: {
    chainId: "0xaa36a7",
    name: "Sepolia",
    explorer: "https://sepolia.etherscan.io",
    rpc: ["https://rpc.ankr.com/eth_sepolia"],
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  mainnet: {
    chainId: "0x1",
    name: "Ethereum",
    explorer: "https://etherscan.io",
    rpc: ["https://rpc.ankr.com/eth"],
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
};

/* ----------------- helpers ----------------- */
const getEth = () => (window as any).ethereum as any | undefined;
const short = (s?: string, n = 6) => (s ? `${s.slice(0, 2 + n)}…${s.slice(-n)}` : "—");
const isHexAddress = (a: string) => /^0x[0-9a-fA-F]{40}$/.test(a);
const nowSec = () => Math.floor(Date.now() / 1000);
const ethToWeiHex = (ethStr: string) => {
  const [i, fRaw = ""] = (ethStr || "0").trim().split(".");
  const dec = 18;
  const f = (fRaw.slice(0, dec) + "0".repeat(dec)).slice(0, dec);
  const wei = BigInt(i || "0") * 10n ** 18n + BigInt(f || "0");
  return "0x" + wei.toString(16);
};

/* ----------------- component ----------------- */
export default function PaymentCryptoPage(props: {
  mode?: ChainPreset;
  reference: string;
  amountEth: string;
  toAddress: string;
  ttlSeconds?: number;
}) {
  const preset = props.mode ?? "hardhat";
  const EXPECTED = PRESETS[preset];

  /* -------- web3/ui state -------- */
  const [hasMM, setHasMM] = useState<boolean>(false);
  const [account, setAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<string | undefined>();
  const [balanceEth, setBalanceEth] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<"idle" | "sign" | "sent" | "confirm" | "done" | "error">("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [estimatedGas, setEstimatedGas] = useState<number | undefined>();

  /* -------- TTL -------- */
  const [remaining, setRemaining] = useState<number | undefined>(props.ttlSeconds);
  useEffect(() => {
    if (typeof remaining !== "number") return;
    const id = setInterval(() => setRemaining(v => (typeof v === "number" && v > 0 ? v - 1 : v)), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  /* -------- destinataire + alias -------- */
  const [recipientAddr, setRecipientAddr] = useState<string>(props.toAddress);
  const [recipientName, setRecipientName] = useState<string>("");
  const [appliedRecipientName, setAppliedRecipientName] = useState<string | undefined>();

  /* -------- paramètres TX + dérivés -------- */
  const [customAmount, setCustomAmount] = useState<string>(props.amountEth);
  const [gasPriceGwei, setGasPriceGwei] = useState<number>(45);
  const [gasLimit, setGasLimit] = useState<number>(21000);
  const gasFeeEth = useMemo(() => (gasPriceGwei * gasLimit) / 1e9, [gasPriceGwei, gasLimit]);
  const totalEth = useMemo(() => Number(customAmount || "0") + gasFeeEth, [customAmount, gasFeeEth]);

  const wrongChain = hasMM && chainId && chainId !== EXPECTED.chainId;
  const enough = balanceEth !== null && Number(balanceEth) >= Number(totalEth) + 0.00001;

  /* -------- boot MetaMask -------- */
  useEffect(() => {
    const e = getEth();
    setHasMM(!!e);
    if (!e) return;

    (async () => {
      try {
        const [accs, cid] = await Promise.all([
          e.request({ method: "eth_accounts" }),
          e.request({ method: "eth_chainId" }),
        ]);
        setAccount(accs?.[0]);
        setChainId(cid);
        if (accs?.[0]) await refreshBalance(accs[0]);
      } catch {}
    })();

    const onA = (a: string[]) => setAccount(a?.[0]);
    const onC = (c: string) => setChainId(c);
    e.on?.("accountsChanged", onA);
    e.on?.("chainChanged", onC);
    return () => {
      e.removeListener?.("accountsChanged", onA);
      e.removeListener?.("chainChanged", onC);
    };
  }, []);

  /* -------- actions web3 -------- */
  const connect = async () => {
    const e = getEth();
    if (!e) {
      setStatus("MetaMask non détecté");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    const accs: string[] = await e.request({ method: "eth_requestAccounts" });
    setAccount(accs?.[0]);
    const cid: string = await e.request({ method: "eth_chainId" });
    setChainId(cid);
    await refreshBalance(accs?.[0]);
  };

  const ensureChain = async () => {
    const e = getEth();
    if (!e) return;
    const cid: string = await e.request({ method: "eth_chainId" });
    if (cid !== EXPECTED.chainId) {
      try {
        await e.request({ method: "wallet_switchEthereumChain", params: [{ chainId: EXPECTED.chainId }] });
        setChainId(EXPECTED.chainId);
        setStatus("Réseau basculé vers " + EXPECTED.name);
      } catch (err: any) {
        if (err?.code === 4902) {
          await e.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: EXPECTED.chainId,
              chainName: EXPECTED.name,
              rpcUrls: EXPECTED.rpc,
              nativeCurrency: EXPECTED.currency,
              blockExplorerUrls: [EXPECTED.explorer],
            }],
          });
          setChainId(EXPECTED.chainId);
        } else {
          setStatus("Erreur réseau: " + (err?.message || err));
          throw err;
        }
      }
    }
  };

  const refreshBalance = async (addr?: string) => {
    const e = getEth(); if (!e) return;
    const target = addr || account; if (!target) return;
    const balHex: string = await e.request({ method: "eth_getBalance", params: [target, "latest"] });
    const bal = Number(BigInt(balHex)) / Number(10n ** 18n);
    setBalanceEth(Math.round(bal * 100000) / 100000);
  };

  const disconnect = () => { setAccount(undefined); setBalanceEth(null); setStatus("Déconnecté"); };

  /* -------- alias destinataire -------- */
  const applyRecipientName = () => {
    if (!recipientName.trim()) { setStatus("Nom invalide"); return; }
    setAppliedRecipientName(recipientName.trim());
    setStatus("Nom associé");
  };
  const clearRecipientName = () => {
    setRecipientName("");
    setAppliedRecipientName(undefined);
    setStatus("Nom retiré");
  };

  /* -------- estimation gas -------- */
  const tryEstimateGas = async () => {
    const e = getEth(); if (!e) { setStatus("MetaMask absent"); return; }
    if (!account) { setStatus("Connecte ton wallet pour estimer le gas"); return; }
    if (!isHexAddress(recipientAddr)) { setStatus("Adresse destinataire invalide"); return; }
    try {
      const draft: any = { from: account, to: recipientAddr, value: ethToWeiHex(customAmount) };
      const g = await e.request({ method: "eth_estimateGas", params: [draft] });
      const gNum = typeof g === "string" ? parseInt(g, 16) : Number(g);
      setEstimatedGas(gNum);
      setGasLimit(Math.max(21000, gNum || 21000));
      setStatus("Estimation gas OK");
    } catch (err: any) {
      setEstimatedGas(undefined);
      setStatus("Estimation impossible: " + (err?.message || err?.code || ""));
    }
  };

  /* -------- envoi TX -------- */
  const sendTx = async () => {
    try {
      const e = getEth(); if (!e) { setStatus("MetaMask non détecté"); return; }
      if (!account) { setStatus("Connecte ton wallet"); return; }
      if (wrongChain) { await ensureChain(); return; }
      if (!isHexAddress(recipientAddr)) { setStatus("Adresse destinataire invalide"); return; }
      if (!customAmount || Number(customAmount) <= 0) { setStatus("Montant invalide"); return; }
      if (remaining !== undefined && remaining <= 0) { setStatus("Réservation expirée"); return; }
      if (!enough) { setStatus("Fonds insuffisants"); return; }

      const preview =
        `Envoyer ${customAmount} ${EXPECTED.currency.symbol} (+ gas ~ ${gasFeeEth.toFixed(6)})\n` +
        `Vers: ${appliedRecipientName ? appliedRecipientName + " • " : ""}${recipientAddr}\n\nConfirmer ?`;
      if (!window.confirm(preview)) { setStatus("Envoi annulé"); return; }

      setProgress("sign");
      setStatus("Demande signature…");

      const tx: any = {
        from: account,
        to: recipientAddr,
        value: ethToWeiHex(customAmount),
      };
      if (gasLimit) tx.gas = "0x" + BigInt(gasLimit).toString(16);
      if (gasPriceGwei) tx.gasPrice = "0x" + BigInt(Math.round(gasPriceGwei * 1e9)).toString(16);

      const hash: string = await e.request({ method: "eth_sendTransaction", params: [tx] });
      setTxHash(hash);
      setProgress("sent");
      setStatus("Transaction envoyée: " + short(hash, 8));
      toast?.success?.("Transaction envoyée");

      // Poll simple (démo) jusqu’à confirmation on-chain
      setProgress("confirm");
      let tries = 0;
      const iv = setInterval(async () => {
        tries++;
        try {
          const rec = await e.request({ method: "eth_getTransactionReceipt", params: [hash] });
          if (rec && rec.blockNumber) {
            clearInterval(iv);
            setProgress("done");
            setStatus("Transaction confirmée on-chain");
            toast?.success?.("Paiement confirmé !");
          } else if (tries > 40) {
            clearInterval(iv);
            setProgress("error");
            setStatus("Timeout confirmation (vérifie l’explorer).");
          }
        } catch {}
      }, 3000);
    } catch (err: any) {
      setProgress("error");
      if (err?.code === 4001) setStatus("Signature refusée");
      else if (/insufficient funds/i.test(err?.message || "")) setStatus("Fonds insuffisants");
      else setStatus("Erreur: " + (err?.message || err));
    }
  };

  /* -------- util -------- */
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setStatus("Copié"); }
    catch { setStatus("Impossible de copier"); }
  };

  /* -------- render -------- */
  return (
    <div className="wrap">
      <style>{CSS}</style>
      <Toaster />

      <h1 className="h1">Paiement crypto (MetaMask)</h1>
      <div className="sub">Réf : <b>{props.reference}</b> • Réseau attendu : <b>{EXPECTED.name}</b></div>

      {wrongChain && (
        <div className="alert" style={{ marginTop: 12 }}>
          <div>Réseau détecté : <b>{chainId}</b> — bascule sur <b>{EXPECTED.name}</b>.</div>
          <div><button className="btn" onClick={ensureChain}>Basculer</button></div>
        </div>
      )}

      <div style={{ height: 12 }} />

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        {/* LEFT - récap + paramètres */}
        <div>
          <div className="card">
            <div className="title">Montant & destinataire</div>

            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 160px" }}>
              <div>
                <label className="small">Montant (ETH)</label>
                <input
                  className="input"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <div>
                <label className="small">Expire (TTL)</label>
                <div className="kv">
                  <span className="small">Temps restant</span>
                  <b>
                    {remaining === undefined
                      ? "—"
                      : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
                  </b>
                </div>
              </div>
            </div>

            <div style={{ height: 8 }} />

            <div>
              <label className="small">Adresse destinataire</label>
              <input
                className="input"
                value={recipientAddr}
                onChange={e => setRecipientAddr(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                <button className="btn" onClick={() => copy(recipientAddr)}>Copier adresse</button>
                <a
                  className="btn"
                  href={`${EXPECTED.explorer}/address/${recipientAddr}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explorer
                </a>
                <div style={{ marginLeft: "auto" }} className="small">
                  Valide: {isHexAddress(recipientAddr) ? "✅" : "❌"}
                </div>
              </div>
            </div>

            <div style={{ height: 10 }} />

            <div>
              <label className="small">Nom du destinataire (optionnel)</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input
                  className="input"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="Ex: Jean Dupont / Compte vendeur"
                />
                <button className="btn" onClick={applyRecipientName}>Associer</button>
                <button className="btn" onClick={clearRecipientName}>Effacer</button>
              </div>
              {appliedRecipientName && (
                <div style={{ marginTop: 8 }} className="small">
                  Nom appliqué : <b>{appliedRecipientName}</b>
                </div>
              )}
            </div>

            <div style={{ height: 12 }} />

            <div className="title">Frais & paramètres avancés</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label className="small">Gas price (Gwei)</label>
                <input
                  className="input"
                  value={String(gasPriceGwei)}
                  onChange={e =>
                    setGasPriceGwei(Math.max(1, Number(e.target.value.replace(/[^0-9.]/g, "")) || 1))
                  }
                />
              </div>
              <div>
                <label className="small">Gas limit</label>
                <input
                  className="input"
                  value={String(gasLimit)}
                  onChange={e =>
                    setGasLimit(Math.max(21000, Number(e.target.value.replace(/[^0-9]/g, "")) || 21000))
                  }
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
              <button className="btn" onClick={tryEstimateGas}>Estimer gas</button>
              <div className="small">Estimation: {estimatedGas ? `${estimatedGas} gas` : "—"}</div>
              <div style={{ marginLeft: "auto" }} className="small">
                Frais estimés: <b>{gasFeeEth.toFixed(6)} {EXPECTED.currency.symbol}</b>
              </div>
            </div>

            <div style={{ height: 8 }} />

            <div className="kv" style={{ marginTop: 10 }}>
              <div className="small">TOTAL à envoyer (approx)</div>
              <div><b>{totalEth.toFixed(6)} {EXPECTED.currency.symbol}</b></div>
            </div>

            <div style={{ height: 8 }} />

            <div className="note">
              * Les frais précis seront indiqués dans MetaMask au moment de la signature.
              Vérifie toujours l'adresse et le montant avant de signer.
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="card">
            <div className="title">QR / Données utilitaires</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ background: "#fff", padding: 8, borderRadius: 8 }}>
                <QRCode value={`ethereum:${recipientAddr}?value=${ethToWeiHex(customAmount)}`} size={120} />
              </div>
              <div>
                <div className="small">Lien EIP-681</div>
                <div className="kv" style={{ marginTop: 6 }}>
                  <span className="small">
                    {`ethereum:${recipientAddr}?value=${ethToWeiHex(customAmount)}`.slice(0, 48)}…
                  </span>
                  <button
                    className="btn"
                    onClick={() => copy(`ethereum:${recipientAddr}?value=${ethToWeiHex(customAmount)}`)}
                  >
                    Copier
                  </button>
                </div>
                <div style={{ marginTop: 8 }} className="small">Référence: <b>{props.reference}</b></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - wallet & actions */}
        <div>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="small">Mon Wallet</div>
                <div style={{ fontWeight: 800 }}>{account ? short(account) : "—"}</div>
                <div className="small">Réseau: {chainId ?? "—"} ({EXPECTED.name})</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {!account ? (
                  <button className="btn btnPrimary" onClick={connect}>Connecter MetaMask</button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" onClick={() => refreshBalance()}>🔄 Solde</button>
                    <button className="btn" onClick={disconnect}>Déconnecter</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ height: 8 }} />

            <div className="kv">
              <span className="small">Solde</span>
              <b>{balanceEth === null ? "—" : `${balanceEth} ${EXPECTED.currency.symbol}`}</b>
            </div>

            <div style={{ height: 8 }} />

            <div className="kv">
              <span className="small">Statut</span>
              <b>
                {progress === "idle" ? "En attente" :
                 progress === "sign" ? "Attente signature" :
                 progress === "sent" ? "Envoyée" :
                 progress === "confirm" ? "Confirmations…" :
                 progress === "done" ? "Confirmée" :
                 "Erreur"}
              </b>
            </div>

            <div style={{ height: 10 }} />

            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              <button
                className="btn btnPrimary"
                onClick={sendTx}
                disabled={!hasMM || !account || !!wrongChain || !isHexAddress(recipientAddr) || Number(customAmount) <= 0}
              >
                Finaliser & Envoyer
              </button>

              <button
                className="btn"
                onClick={() => {
                  setStatus("Aperçu : " + (appliedRecipientName ?? recipientAddr));
                  window.alert(`Aperçu
To: ${appliedRecipientName ?? recipientAddr}
Amount: ${customAmount} ${EXPECTED.currency.symbol}
Gas est.: ${gasFeeEth.toFixed(6)} ${EXPECTED.currency.symbol}`);
                }}
              >
                Aperçu
              </button>

              <button
                className="btn"
                onClick={() => { setCustomAmount(props.amountEth); setGasPriceGwei(45); setGasLimit(21000); setStatus("Paramètres réinitialisés"); }}
              >
                Réinitialiser
              </button>
            </div>

            {txHash && (
              <div style={{ marginTop: 10 }}>
                <div className="small">TX</div>
                <a className="link" href={`${EXPECTED.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer">
                  {short(txHash, 8)}
                </a>
              </div>
            )}

            {status && <div style={{ marginTop: 10 }} className="small">{status}</div>}
            {!enough && balanceEth !== null && (
              <div style={{ marginTop: 8 }} className="alert">Votre solde est insuffisant pour couvrir le montant + fees.</div>
            )}
          </div>

          <div style={{ height: 12 }} />

          <div className="card">
            <div className="title">Aide rapide</div>
            <div className="small">
              • Si ton compte est vide → utilise un faucet Sepolia (ou transfère depuis Hardhat si comptes préfinancés).<br/>
              • Les frais réels apparaissent dans MetaMask au moment de la signature.<br/>
              • Vérifie l’adresse et le réseau avant d’envoyer.
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />
      <div className="note">⚠️ Transactions irréversibles — vérifie toujours l'adresse et le montant.</div>
    </div>
  );
}
