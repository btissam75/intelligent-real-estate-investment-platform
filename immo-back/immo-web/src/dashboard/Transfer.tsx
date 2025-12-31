// src/Transfer.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ───────────────────────── Palette rouge/gris + animations ───────────────────────── */
const css = `
:root{
  --bg:#f7f8fb; --card:#fff; --ink:#1a1a1a; --sub:#6b7280; --line:#e5e7eb;
  --pri:#dc2626; --pri-2:#b91c1c; --acc:#ef4444; --ok:#059669; --warn:#d97706;
}
.page{display:grid; gap:14px;}
.fade{animation:fade .28s ease-out both}
.lift{transition:transform .15s ease, box-shadow .15s ease}
.lift:hover{transform:translateY(-2px); box-shadow:0 12px 26px rgba(220,38,38,.07)}
.ripple{position:relative; overflow:hidden}
.ripple:after{content:""; position:absolute; border-radius:9999px; transform:scale(0);
  background:rgba(255,255,255,.55); inset:auto; width:10px;height:10px; opacity:.9}
.ripple:active:after{animation:rip .55s ease-out forwards}
.skel{display:inline-block; border-radius:8px; background:linear-gradient(90deg,#f3f4f6 0,#e5e7eb 40%,#f3f4f6 80%); background-size:200% 100%;
  animation:sk 1.1s linear infinite; min-height:1.1em}
@keyframes rip{to{transform:scale(22); opacity:0}}
@keyframes fade{from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)}}
@keyframes sk{from{background-position:200% 0} to{background-position:-200% 0}}
/* inputs */
.input{border:1px solid var(--line); background:var(--card); border-radius:12px; padding:10px 12px; outline:none; width:100%;
  font-size:14px; color:var(--ink); transition:border-color .15s ease, box-shadow .15s ease}
.input:focus{border-color:#fecaca; box-shadow:0 0 0 3px rgba(220,38,38,.15)}
.select{appearance:none; background:var(--card) url('data:image/svg+xml;utf8,<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M4 6l4 4 4-4" fill="none" stroke="%23677789" stroke-width="2" stroke-linecap="round"/></svg>') no-repeat right .6rem center/16px;
  border:1px solid var(--line); border-radius:12px; padding:10px 34px 10px 12px; font-size:14px; color:var(--ink)}
.label{font-size:12px; color:var(--sub); margin-bottom:6px; font-weight:700; text-transform:uppercase; letter-spacing:.04em}
.badge{display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:12px; border:1px solid #fecaca; background:linear-gradient(135deg,#fef2f2,#fee2e2); color:var(--pri); font-weight:800}
.btn{border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:12px; padding:10px 14px; font-weight:800; cursor:pointer}
.btn-pri{border:1px solid var(--pri); background:linear-gradient(135deg,var(--pri),var(--acc)); color:#fff}
.btn-ghost{border:1px solid var(--pri); color:var(--pri); background:transparent}
.card{border:1px solid var(--line); background:var(--card); border-radius:16px; padding:14px}
.kpis{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px}
.kpi{border:1px dashed #fecaca; background:linear-gradient(135deg,#fef2f2,#fff); border-radius:12px; padding:10px}
.kpi .v{font-weight:900; color:var(--pri)}
.grid{display:grid; grid-template-columns:1.2fr .8fr; gap:14px}
@media(max-width: 920px){ .grid{grid-template-columns:1fr} .kpis{grid-template-columns:1fr} }
`;

/* ───────────────────────── Types & petits helpers ───────────────────────── */
type Net = { id: string; name: string; chainId: string };
type Asset = "ETH" | "USDC" | "DAI";

const NETS: Net[] = [
  { id: "mainnet", name: "Ethereum", chainId: "0x1" },
  { id: "sepolia", name: "Sepolia",  chainId: "0xaa36a7" },
];

const GAS_ETH = 0.00042; // mock gas pour UI
const RATE_EUR: Record<Asset, number> = { ETH: 2900, USDC: 0.92, DAI: 0.92 };

function toWei(amountEth: string) {
  // naïf pour UI (évite bigint libs ici)
  const [i, f = ""] = amountEth.split(".");
  const frac = (f + "0".repeat(18)).slice(0, 18);
  return "0x" + BigInt(i + frac).toString(16);
}
function eur(v: number) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/* ───────────────────────── Mini toast ───────────────────────── */
function useToast() {
  const [msg, setMsg] = useState<string>();
  const [tone, setTone] = useState<"ok" | "warn">("ok");
  const show = (m: string, t: "ok" | "warn" = "ok") => {
    setTone(t);
    setMsg(m);
    setTimeout(() => setMsg(undefined), 1600);
  };
  const el = msg ? (
    <div
      className="fade"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 50,
        padding: "10px 14px",
        borderRadius: 12,
        background: "#fff",
        border: `1px solid ${tone === "ok" ? "#bbf7d0" : "#fde68a"}`,
        color: tone === "ok" ? "#065f46" : "#92400e",
        boxShadow: "0 10px 26px rgba(0,0,0,.08)",
      }}
    >
      {msg}
    </div>
  ) : null;
  return { show, el };
}

/* ───────────────────────── Page Transfer ───────────────────────── */
export default function Transfer() {
  const nav = useNavigate();
  const toast = useToast();

  const [asset, setAsset] = useState<Asset>("ETH");
  const [net, setNet] = useState<Net>(NETS[1]); // Sepolia par défaut (sécurité)
  const [from, setFrom] = useState<string | undefined>(); // compte MetaMask
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const [hasMM, setHasMM] = useState(false);
  const [chainId, setChainId] = useState<string | undefined>();

  // MetaMask detection
  useEffect(() => {
    const eth = (window as any).ethereum;
    setHasMM(Boolean(eth));
    if (!eth) return;
    Promise.all([eth.request({ method: "eth_accounts" }), eth.request({ method: "eth_chainId" })])
      .then(([accs, cid]: [string[], string]) => {
        setFrom(accs?.[0]);
        setChainId(cid);
      })
      .catch(() => {});
    const onA = (a: string[]) => setFrom(a?.[0]);
    const onC = (c: string) => setChainId(c);
    eth.on?.("accountsChanged", onA);
    eth.on?.("chainChanged", onC);
    return () => {
      eth.removeListener?.("accountsChanged", onA);
      eth.removeListener?.("chainChanged", onC);
    };
  }, []);

  // KPIs dérivés
  const feeEth = GAS_ETH; // maquette
  const totalEth = useMemo(() => (Number(amount || "0") || 0) + (asset === "ETH" ? feeEth : 0), [amount, asset]);
  const sendEur = useMemo(() => (Number(amount || "0") || 0) * RATE_EUR[asset], [amount, asset]);
  const feeEur = feeEth * RATE_EUR["ETH"];

  // Validation ultra simple
  const validTo = /^0x[a-fA-F0-9]{40}$/.test(to.trim());
  const validAmt = Number(amount) > 0;

  const needSwitch = hasMM && chainId && chainId.toLowerCase() !== net.chainId.toLowerCase();

  const connect = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return toast.show("MetaMask non détecté", "warn");
    try {
      const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
      setFrom(accs?.[0]);
      const cid: string = await eth.request({ method: "eth_chainId" });
      setChainId(cid);
      toast.show("Connecté à MetaMask");
    } catch (e: any) {
      toast.show(e?.message ?? "Connexion refusée", "warn");
    }
  };

  const switchNetwork = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: net.chainId }] });
      setChainId(net.chainId);
      toast.show(`Réseau: ${net.name}`);
    } catch (e: any) {
      toast.show(e?.message ?? "Impossible de changer de réseau", "warn");
    }
  };

  // Envoi (ETH natif uniquement ici pour l’exemple)
  const reviewAndSend = async () => {
    if (!hasMM) return toast.show("MetaMask non détecté", "warn");
    if (!from) return toast.show("Connecte MetaMask d'abord", "warn");
    if (!validTo) return toast.show("Adresse de destination invalide", "warn");
    if (!validAmt) return toast.show("Montant invalide", "warn");
    if (needSwitch) return toast.show("Change le réseau avant d'envoyer", "warn");

    if (asset !== "ETH") {
      // Pour ERC-20 tu feras un eth_call vers contract.transfer(to, amount)
      return toast.show("Démo : l’envoi ERC-20 sera branché plus tard", "warn");
    }

    const eth = (window as any).ethereum;

    try {
      const txParams = {
        from,
        to,
        value: toWei(amount),
      };
      // Ouvre MetaMask :
      const txHash: string = await eth.request({ method: "eth_sendTransaction", params: [txParams] });
      toast.show("Transaction envoyée !");
      console.log("TX:", txHash);
    } catch (e: any) {
      toast.show(e?.message ?? "Transaction refusée", "warn");
    }
  };

  return (
    <>
      <style>{css}</style>
      {toast.el}

      {/* Breadcrumb/Top tiny bar */}
      <div className="fade" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="badge">Transfer</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {hasMM ? (
            <button className="btn btn-ghost ripple" onClick={connect}>Compte {from ? from.slice(0, 6) + "…" + from.slice(-4) : "—"}</button>
          ) : (
            <button className="btn btn-pri ripple" onClick={connect}>Connect MetaMask</button>
          )}
          <button className="btn" onClick={() => nav("/deposit")}>Deposit</button>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid">
        {/* Formulaire */}
        <div className="card lift fade">
          <div className="label">Asset</div>
          <select className="select" value={asset} onChange={(e) => setAsset(e.target.value as Asset)}>
            <option>ETH</option>
            <option>USDC</option>
            <option>DAI</option>
          </select>

          <div style={{ height: 10 }} />

          <div className="label">Network</div>
          <select className="select" value={net.id} onChange={(e) => setNet(NETS.find(n => n.id === e.target.value)!)} >
            {NETS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>

          <div style={{ height: 10 }} />

          <div className="label">From (auto)</div>
          <input className="input" value={from || "—"} readOnly />

          <div style={{ height: 10 }} />

          <div className="label">To (EVM address)</div>
          <input className="input" placeholder="0x…" value={to} onChange={(e) => setTo(e.target.value)} />

          <div style={{ height: 10 }} />

          <div className="label">Amount ({asset})</div>
          <input
            className="input"
            placeholder="0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div style={{ height: 10 }} />

          <div className="label">Memo (optionnel)</div>
          <input className="input" placeholder="Note (non incluse on-chain pour ETH)" value={memo} onChange={(e) => setMemo(e.target.value)} />

          {/* KPIs */}
          <div style={{ height: 14 }} />
          <div className="kpis">
            <div className="kpi">
              <div className="label">You send</div>
              <div className="v">{Number(amount || 0).toFixed(2)} {asset}</div>
              <div style={{ fontSize: 12, color: "var(--sub)" }}>{eur(sendEur)} EUR</div>
            </div>
            <div className="kpi">
              <div className="label">Estimated fee</div>
              <div className="v">{asset === "ETH" ? GAS_ETH.toFixed(6) : "~ ERC-20 fee" } ETH</div>
              <div style={{ fontSize: 12, color: "var(--sub)" }}>~{eur(feeEur)} EUR</div>
            </div>
            <div className="kpi">
              <div className="label">Total (est.)</div>
              <div className="v">{asset === "ETH" ? totalEth.toFixed(6) + " ETH" : `${amount || 0} ${asset}`}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn ripple" onClick={() => { setAmount(""); setTo(""); setMemo(""); }}>Clear</button>
            <button
              className={`btn btn-pri ripple`}
              onClick={reviewAndSend}
              disabled={!validTo || !validAmt || (hasMM && needSwitch)}
              title={!validTo ? "Adresse invalide" : !validAmt ? "Montant invalide" : needSwitch ? "Changer de réseau" : "Envoyer"}
            >
              Review & Send
            </button>
            {needSwitch && (
              <button className="btn ripple" onClick={switchNetwork}>Switch → {net.name}</button>
            )}
          </div>
        </div>

        {/* Conseils */}
        <aside className="card lift fade">
          <div style={{ fontWeight: 900, color: "var(--ink)", marginBottom: 6 }}>Conseils</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink)" }}>
            <li>Vérifie le <b>réseau</b> dans MetaMask avant d’envoyer.</li>
            <li>Pour les tokens ERC-20, confirme l’<b>adresse du contrat</b>.</li>
            <li>Teste d’abord un <b>petit montant</b> si l’adresse est nouvelle.</li>
            <li>Le champ <b>“Memo”</b> n’est pas inclus on-chain pour les transferts ETH simples.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}
