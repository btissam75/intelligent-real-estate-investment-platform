// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPublicClient, http, erc20Abi } from "viem";
import { sepolia } from "viem/chains";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend, LineChart, Line
} from "recharts";

/* ----------------------------- VIEM (Sepolia) ----------------------------- */
const EXPECTED_CHAIN = { chainId: "0xaa36a7", name: "Sepolia" } as const;
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://rpc.ankr.com/eth_sepolia"),
});

/* ---------------------------- TES TOKENS ERC-20 --------------------------- */
type Erc20Def = { symbol: "USDC" | "DAI"; name: string; address: `0x${string}`; decimals: number; logo?: string };
const TOKENS: Erc20Def[] = [
  { symbol: "USDC", name: "USD Coin", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", decimals: 6,  logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
  { symbol: "DAI",  name: "Dai",       address: "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa", decimals: 18, logo: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png" },
];

/* ------------------------------- (optionnel) ------------------------------ */
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean | undefined;
      providers?: any[] | undefined;
      request: (args: { method: string; params?: unknown[] | undefined }) => Promise<any>;
      on?: (ev: string, cb: (...a: any[]) => void) => void;
      removeListener?: (ev: string, cb: (...a: any[]) => void) => void;
    } | undefined;
  }
}

/* --------------------------------- STYLES --------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;800&family=Inter:wght@400;600;800;900&display=swap');
:root{
  --ink:#0b1220; --sub:#6b7280; --line:#eceff3; --bg:#ffffff; --card:#ffffff;
  --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2; /* Rouge ImmoTitle */
  /* Zones colorées (pastel cohérentes avec thème clair) */
  --zone-blue:#eff6ff;   --zone-blue-line:#dbeafe;
  --zone-green:#ecfdf5;  --zone-green-line:#d1fae5;
  --zone-purple:#f5f3ff; --zone-purple-line:#e9d5ff;
  --zone-orange:#fff7ed; --zone-orange-line:#ffedd5;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:radial-gradient(1200px 600px at -10% -10%, #fff5f6, #ffffff 38%), var(--bg);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:var(--ink)}
.container{max-width:1640px;margin:0 auto;padding:28px}

/* Header */
.header{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.h1{margin:0;font-family:Sora,Inter,sans-serif;font-weight:800;font-size:30px;letter-spacing:-.01em}
.pills{display:flex;gap:10px;flex-wrap:wrap}
.pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;font-weight:800;color:var(--ink)}
.btn{position:relative;overflow:hidden;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink);box-shadow:0 6px 18px rgba(16,24,40,.06)}
.btnPrimary{border-color:transparent;background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 36px rgba(225,29,46,.25)}
.btnGhost{border:1px solid #fecaca;color:var(--pri);background:#fff}
.rip{position:absolute;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);transform:translate(-50%,-50%) scale(0);animation:r .6s ease-out forwards}
@keyframes r{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

/* KPI strip */
.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin:16px 0}
@media (max-width:1400px){ .kpis{grid-template-columns:repeat(3,1fr)}}
@media (max-width:880px){ .kpis{grid-template-columns:repeat(2,1fr)}}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:0 10px 24px rgba(16,24,40,.06)}
.k{color:var(--sub);font-size:12px}
.v{font-weight:900;font-size:22px}

/* Grille */
.grid{display:grid;grid-template-columns:1.6fr 1.2fr 1fr;gap:16px}
@media (max-width:1400px){ .grid{grid-template-columns:1.2fr 1fr}}
@media (max-width:1000px){ .grid{grid-template-columns:1fr}}

/* Cards */
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:0 14px 34px rgba(16,24,40,.07)}
.cardTitle{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.small{color:var(--sub);font-size:12px}
.row{display:flex;gap:12px;align-items:center}
.list{display:grid;gap:8px}
.item{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff}
.logo{width:40px;height:40px;border-radius:12px;overflow:hidden;border:1px solid var(--line);display:grid;place-items:center;background:#f8fafc}
.logo img{width:100%;height:100%;object-fit:cover}
.badge{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);color:#475569;background:#fff}

/* Zones colorées */
.zoneBlue{background:var(--zone-blue);border:1px solid var(--zone-blue-line)}
.zoneGreen{background:var(--zone-green);border:1px solid var(--zone-green-line)}
.zonePurple{background:var(--zone-purple);border:1px solid var(--zone-purple-line)}
.zoneOrange{background:var(--zone-orange);border:1px solid var(--zone-orange-line)}

/* Alert */
.alert{display:flex;gap:10px;align-items:center;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px;margin-top:12px}
`;

/* --------------------------------- Utils ---------------------------------- */
const short = (a?: string, n = 4) => (a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "—");
const ripple = (e: React.MouseEvent<HTMLElement>)=>{
  const host=e.currentTarget as HTMLElement; const r=document.createElement("i"); r.className="rip";
  const rect = host.getBoundingClientRect(); r.style.left=`${e.clientX-rect.left}px`; r.style.top=`${e.clientY-rect.top}px`;
  host.appendChild(r); setTimeout(()=>r.remove(),600);
};

async function getEthBalance(addr: `0x${string}`) {
  const wei = await publicClient.getBalance({ address: addr });
  return Number(wei) / 1e18;
}
async function getErc20Balance(addr: `0x${string}`, t: Erc20Def) {
  const raw = await publicClient.readContract({
    address: t.address, abi: erc20Abi, functionName: "balanceOf", args: [addr],
  });
  return Number(raw) / 10 ** t.decimals;
}

/* ================================ Component =============================== */
export default function Dashboard() {
  const nav = useNavigate();

  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const wrongChain = chainId && chainId !== EXPECTED_CHAIN.chainId;

  // Finaliser dropdown
  const [showFinalize, setShowFinalize] = useState(false);
  const finalizeRef = useRef<HTMLDivElement|null>(null);
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!finalizeRef.current) return;
      if (!finalizeRef.current.contains(e.target as Node)) setShowFinalize(false);
    };
    document.addEventListener("click", onClickOutside);
    return ()=>document.removeEventListener("click", onClickOutside);
  }, []);
  // Exemples: unités en attente (mock)
  const pendingUnits = [
    { propertyId:"204", title:"Studio — Gauthier", investmentId:"d1i0lfia13n", thumb:"https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop", units:1 },
  ];

  // Soldes dynamiques
  const [eth, setEth] = useState(0);
  const [erc20, setErc20] = useState<{ symbol: "USDC"|"DAI"; amount: number; logo?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Autres infos dynamiques (simples)
  const [kycApproved] = useState(true);
  const [linked] = useState(3);
  const [nfts, setNfts] = useState<{ title: string; tokenId: string; contract: string; image?: string }[]>([]);
  const [activity, setActivity] = useState<{ date: string; type: string; ref: string; amount?: string }[]>([]);

  // Période & FX
  const [period, setPeriod] = useState<"M"|"Y">("M");
  const [ccy, setCcy] = useState<"EUR" | "USD" | "MAD">("EUR");
  const rates = useMemo(() => {
    const baseEUR = { ETH: 2900, USDC: 0.92, DAI: 0.92 };
    const fx = ccy === "EUR" ? 1 : ccy === "USD" ? 1.08 : 10.8;
    return Object.fromEntries(Object.entries(baseEUR).map(([k, v]) => [k, v * fx])) as Record<"ETH"|"USDC"|"DAI", number>;
  }, [ccy]);

  const allocation = useMemo(() => {
    const rows = [
      { label: "ETH", value: eth * rates.ETH },
      ...erc20.map(t => ({ label: t.symbol, value: t.amount * (rates as any)[t.symbol] })),
    ].filter(x => x.value > 0.0001);
    const total = rows.reduce((s, r) => s + r.value, 0);
    return { rows, total };
  }, [eth, erc20, rates]);

  // Widget Objectif rendement (%)
  const [targetPct] = useState<number>(72); // % réalisé (mock)
  const gaugeBg = `conic-gradient(${targetPct<=100? "#22c55e":"#e11d2e"} ${Math.min(targetPct,100)}%, #e5e7eb 0)`;

  // MetaMask bootstrap
  useEffect(() => {
    const ethProv = window.ethereum;
    if (!ethProv) return;
    (async () => {
      try {
        const [cid, accs] = await Promise.all([
          ethProv.request({ method: "eth_chainId" }),
          ethProv.request({ method: "eth_accounts" }),
        ]);
        setChainId(cid);
        setAddress(accs?.[0] ? (accs[0] as `0x${string}`) : null);
      } catch {}
    })();
    const onAccounts = (accs: string[]) => setAddress(accs?.[0] ? (accs[0] as `0x${string}`) : null);
    const onChain = (cid: string) => setChainId(cid);
    ethProv.on?.("accountsChanged", onAccounts);
    ethProv.on?.("chainChanged", onChain);
    return () => {
      ethProv.removeListener?.("accountsChanged", onAccounts);
      ethProv.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = async () => {
    const ethProv = window.ethereum;
    if (!ethProv) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    const accs: string[] = await ethProv.request({ method: "eth_requestAccounts" });
    setAddress(accs?.[0] ? (accs[0] as `0x${string}`) : null);
    const cid = await ethProv.request({ method: "eth_chainId" });
    setChainId(cid);
  };

  // Fetch des données
  useEffect(() => {
    if (!address || wrongChain) return;
    (async () => {
      setLoading(true);
      try {
        const [ethBal, ...erc20Bals] = await Promise.all([
          getEthBalance(address),
          ...TOKENS.map(t => getErc20Balance(address, t)),
        ]);
        setEth(ethBal);
        setErc20(TOKENS.map((t, i) => ({ symbol: t.symbol, amount: erc20Bals[i], logo: t.logo })));

        setNfts([
          { title: "F3 – Casablanca Centre", tokenId: "101", contract: "0xNFTabc...", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop" },
          { title: "Studio – Gauthier",       tokenId: "204", contract: "0xNFTdef...", image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=600&auto=format&fit=crop" },
        ]);
        setActivity([
          { date: "2025-10-07", type: "Achat d’unités", ref: "INV-204", amount: "1 u." },
          { date: "2025-10-05", type: "Revenu mensuel", ref: "LOC-101", amount: "+45 USDC" },
          { date: "2025-10-01", type: "Mint NFT",       ref: "NFT-101" },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [address, wrongChain]);

  // Séries graphiques
  const monthlyYield = useMemo(() => {
    const base = Math.max(20, Math.min(450, Math.round((allocation.total || 800) / 90)));
    const M = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
    const months = M.map((m, i) => ({ m, v: Math.round(base * (0.85 + Math.sin(i/2.1)*0.18 + Math.random()*0.1)) }));
    if (period === "M") return months.slice(0, 6);
    return months; // annuel
  }, [allocation.total, period]);

  const perfSeries = useMemo(() => {
    // Petite série “Perf. portefeuille” (ligne rouge) à titre décoratif
    const N = period === "M" ? 6 : 12;
    return Array.from({length:N}, (_,i)=>({
      m: i+1,
      p: 100 + Math.round(Math.sin(i/1.8)*4 + Math.random()*3),
    }));
  }, [period]);

  /* --------------------------------- RENDER -------------------------------- */
  return (
  <div className="container">
    <style>{CSS}</style>

    {/* HEADER */}
    <div className="header">
      <h1 className="h1">Dashboard</h1>
      <div className="pills" style={{ position:"relative", gap:10, display:"flex", alignItems:"center" }}>
        <button className="pill" onClick={()=>setCcy(ccy==="EUR"?"USD":ccy==="USD"?"MAD":"EUR")}>{ccy} ▾</button>

        {/* Sélecteur de période */}
        <span className="pill" style={{display:"inline-flex",gap:6}}>
          <button className="btnGhost" onClick={(e)=>{ripple(e);setPeriod("M");}} disabled={period==="M"}>Mensuel</button>
          <button className="btnGhost" onClick={(e)=>{ripple(e);setPeriod("Y");}} disabled={period==="Y"}>Annuel</button>
        </span>

        {/* Finaliser dropdown si unités en attente */}
        {pendingUnits.length>0 && (
          <div ref={finalizeRef} style={{ position:"relative" }}>
            
            {showFinalize && (
              <div style={{ position:"absolute", top:"110%", right:0, border:"1px solid var(--line)", background:"#fff", borderRadius:12, boxShadow:"0 18px 42px rgba(16,24,40,.12)", minWidth:280, padding:8, zIndex:1000 }}>
                <div style={{ padding:"6px 10px", fontSize:12, color:"var(--sub)" }}>Sélectionne un investissement à finaliser</div>
                {pendingUnits.map(u=>(
                  <div key={u.propertyId}
                    onClick={()=>{ nav(`/payment/crypto/${u.investmentId}`); setShowFinalize(false); }}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, cursor:"pointer" }}
                    onMouseDown={(e)=>e.preventDefault()}>
                    <div style={{ width:40, height:28, borderRadius:8, overflow:"hidden", border:"1px solid #eef2f7", background:"#f8fafc", flex:"0 0 auto" }}>
                      <img src={u.thumb} alt="thumb" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight:900, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.title}</div>
                      <div className="small">En attente • {u.units} u.</div>
                    </div>
                    <div className="pill" style={{ fontWeight:900 }}>Payer</div>
                  </div>
                ))}
                <div style={{ height:6 }}/>
                <button className="btnGhost" style={{ width:"100%" }} onClick={(e)=>{ripple(e);setShowFinalize(false);}}>Fermer</button>
              </div>
            )}
          </div>
        )}

        {/* Connexion MetaMask */}
        {address ? (
          <span className="pill">{short(address)} • {chainId === "0xaa36a7" ? "Sepolia" : `Chain ${parseInt(chainId||"0x0",16)}`}</span>
        ) : (
          <button className="btnPrimary" onClick={connect}>Connecter MetaMask</button>
        )}
      </div>
    </div>

    {wrongChain && (
      <div className="alert">
        <div>Réseau détecté : <b>{chainId}</b> — attendu : <b>{EXPECTED_CHAIN.name}</b></div>
        <div className="small">Bascule sur Sepolia depuis MetaMask.</div>
      </div>
    )}

    {/* KPIs */}
    <div className="kpis">
      <div className="kpi"><div className="k">KYC</div><div className="v">{kycApproved ? "Approved" : "Pending"}</div><div className="small">{kycApproved ? "✔ Vérifié" : "À vérifier"}</div></div>
      <div className="kpi"><div className="k">Adresses liées</div><div className="v">{linked}</div><div className="small">portefeuilles</div></div>
      <div className="kpi"><div className="k">Réseau</div><div className="v">Sepolia</div><div className="small">Testnet</div></div>
      <div className="kpi"><div className="k">Valeur portefeuille</div><div className="v">{allocation.total.toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</div><div className="small">ETH + ERC-20</div></div>
      <div className="kpi"><div className="k">NFTs</div><div className="v">{nfts.length}</div><div className="small">Tokenisés</div></div>
    </div>

    {/* GRID */}
    <div className="grid">
      {/* Col 1 : Répartition + Revenus (BLEU & ORANGE) */}
      <div style={{display:"grid", gap:16}}>
        <div className="card zoneBlue">
          <div className="cardTitle">
            <b style={{fontFamily:"Sora"}}>Répartition du portefeuille</b>
            <span className="badge">Par valeur ({ccy})</span>
          </div>
          <div style={{width:"100%", height:260}}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={allocation.rows} dataKey="value" nameKey="label" innerRadius={60} outerRadius={95}>
                  {allocation.rows.map((_, i) => <Cell key={i} fill={["#2563eb","#60a5fa","#93c5fd","#1e3a8a"][i % 4]} />)}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="list" style={{marginTop:8}}>
            <div className="item">
              <div className="logo"><img src="data:image/png;base64,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" alt="ETH" /></div>
              <div style={{flex:1}}>
                <div className="row" style={{justifyContent:"space-between"}}>
                  <b>ETH</b><span className="badge">EVM</span>
                </div>
                <div className="small">{eth.toFixed(6)} • {(eth * (rates.ETH||0)).toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}</div>
              </div>
            </div>
            {erc20.map((t, i) => (
              <div className="item" key={t.symbol+i}>
                <div className="logo">{t.logo ? <img src={t.logo} alt={t.symbol}/> : t.symbol}</div>
                <div style={{flex:1}}>
                  <div className="row" style={{justifyContent:"space-between"}}>
                    <b>{t.symbol}</b><span className="badge">EVM</span>
                  </div>
                  <div className="small">
                    {t.amount.toFixed(6)} • {(t.amount * (rates as any)[t.symbol]).toLocaleString(undefined,{maximumFractionDigits:2})} {ccy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card zoneOrange">
          <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Revenus {period==="M"?"(6 mois)":"(12 mois)"} estimés</b><span className="small">Locatifs & exploitation</span></div>
          <div style={{width:"100%", height:260}}>
            <ResponsiveContainer>
              <AreaChart data={monthlyYield}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d2e" stopOpacity={0.75}/>
                    <stop offset="100%" stopColor="#e11d2e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6"/>
                <XAxis dataKey="m" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RTooltip />
                <Area dataKey="v" stroke="#be123c" fill="url(#g1)" strokeWidth={3}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Col 2 : Allocation verte + Bar tokens (BLEU pour le bar) */}
      <div style={{display:"grid", gap:16}}>
        <div className="card zoneGreen">
          <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Allocation cible (demo)</b><span className="small">ETH / USDC / DAI / SOL</span></div>
          <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
            <div style={{width:170, height:170}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie dataKey="value" innerRadius={50} outerRadius={75}
                    data={[
                      { name:"ETH", value: 1 },
                      { name:"USDC", value: 15.23 },
                      { name:"DAI", value: 501.234 },
                      { name:"SOL", value: 0.3456 },
                    ]}>
                    <Cell fill="#10b981"/><Cell fill="#34d399"/><Cell fill="#86efac"/><Cell fill="#bbf7d0"/>
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{flex:1, paddingLeft:10}}>
              {[
                { name:"ETH", v:1, color:"#10b981" },
                { name:"USDC", v:15.23, color:"#34d399" },
                { name:"DAI", v:501.234, color:"#86efac" },
                { name:"SOL", v:0.3456, color:"#bbf7d0" },
              ].map((t,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid #e6f7ef":"none"}}>
                  <div className="row">
                    <div style={{width:10,height:10,borderRadius:"50%",background:t.color}}/>
                    <b>{t.name}</b>
                  </div>
                  <b>{t.v}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Était blanche → passe en BLEU (cohérent avec thème financier) */}
        <div className="card zoneBlue">
          <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Solde par token</b><span className="small">{ccy}</span></div>
          <div style={{width:"100%", height:220}}>
            <ResponsiveContainer>
              <BarChart
                data={[
                  { name:"ETH", value: eth*(rates.ETH||0) },
                  ...erc20.map(t=>({ name:t.symbol, value: t.amount*(rates as any)[t.symbol] })),
                ]}>
                <CartesianGrid strokeDasharray="4 4" stroke="#eef2f7"/>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Legend />
                <RTooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Col 3 : Objectif (VIOLET) + Perf (ORANGE) + Activité (VERT) + NFTs (VIOLET) */}
      <div style={{display:"grid", gap:16}}>
        {/* Objectif de rendement */}
        <div className="card zonePurple" style={{textAlign:"center"}}>
          <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Objectif de rendement</b><span className="small">Progrès annuel</span></div>
          <div style={{display:"grid", placeItems:"center"}}>
            <div style={{
              width:140, height:140, borderRadius:"50%",
              background:gaugeBg, display:"grid", placeItems:"center",
              boxShadow:"inset 0 0 0 8px #ffffffa6"
            }}>
              <div style={{
                width:96, height:96, borderRadius:"50%", background:"#fff",
                display:"grid", placeItems:"center", border:"2px solid var(--zone-purple-line)"
              }}>
                <div>
                  <div style={{fontFamily:"Sora", fontSize:26, fontWeight:800, color:"var(--ink)", lineHeight:1}}>{Math.min(targetPct, 150)}%</div>
                  <div className="small" style={{marginTop:4,color:"#7c3aed"}}>objectif</div>
                </div>
              </div>
            </div>
          </div>
          <div className="row" style={{justifyContent:"space-between", marginTop:10}}>
            <span className="small">Cible: 8% net/an</span>
            <b style={{color:"#7c3aed"}}>En bonne voie</b>
          </div>
        </div>

        {/* Performance portefeuille → ORANGE */}
        <div className="card zoneOrange">
          <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Performance portefeuille</b><span className="small">Indexé = 100</span></div>
          <div style={{width:"100%", height:180}}>
            <ResponsiveContainer>
              <LineChart data={perfSeries}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6"/>
                <XAxis dataKey="m" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RTooltip />
                <Line type="monotone" dataKey="p" stroke="#be123c" strokeWidth={3} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activité récente → VERT */}
        <div className="card zoneGreen">
          <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Activité récente</b></div>
          <div className="list">
            {activity.map((a,i)=>(
              <div className="item" key={i} style={{justifyContent:"space-between"}}>
                <div>
                  <div><b>{a.type}</b> <span className="small">• {a.ref}</span></div>
                  <div className="small">{a.date}</div>
                </div>
                <div><b>{a.amount || "—"}</b></div>
              </div>
            ))}
            {activity.length===0 && <div className="small">Aucune activité.</div>}
          </div>
        </div>

        {/* NFTs → VIOLET */}
        <div className="card zonePurple">
          <div className="cardTitle"><b style={{fontFamily:"Sora"}}>Mes biens (NFTs)</b></div>
          <div className="list">
            {nfts.map((n,i)=>(
              <div className="item" key={n.tokenId+i}>
                <div className="logo">{n.image ? <img src={n.image} alt={n.title}/> : "NFT"}</div>
                <div style={{flex:1}}>
                  <div className="row" style={{justifyContent:"space-between"}}>
                    <b style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.title}</b>
                    <span className="badge">#{n.tokenId}</span>
                  </div>
                  <div className="small">{short(n.contract)}</div>
                </div>
                <a className="pill" href={`https://sepolia.etherscan.io/token/${n.contract}`} target="_blank" rel="noreferrer">Explorer</a>
              </div>
            ))}
            {nfts.length===0 && <div className="small">Aucun NFT pour le moment.</div>}
          </div>
        </div>
      </div>
    </div>

    {loading && <div className="small" style={{marginTop:10}}>Chargement…</div>}
  </div>
);
}
