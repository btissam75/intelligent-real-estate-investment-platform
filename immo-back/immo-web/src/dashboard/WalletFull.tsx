import React, { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

/**
 * WalletFull.tsx — Maquette fonctionnelle (TSX) avec tous les éléments demandés
 * - Header (titre + statut)
 * - Infos principales: ID Wallet, réseau/chain, adresse (copie/QR placeholder)
 * - Devise de référence (EUR/USD/MAD)
 * - Soldes: réel (figure), virtuel, total converti
 * - Points & valeur_point
 * - Actions: Deposit, Withdraw, Transfer (handlers à brancher)
 * - Historique récent (liste)
 *
 * EVM-ready: détection MetaMask + connexion, affichage chainId, account abrégé.
 * Les soldes sont simulés; à brancher avec ethers.js et votre backend immo-api.
 */

// ——————————— Types & modèles ———————————

type RefCurrency = "EUR" | "USD" | "MAD";

type WalletStatus = "active" | "suspended" | "closed";

interface WalletOverview {
  id_wallet: number;
  statut: WalletStatus;
  devise_repere: RefCurrency;
  chain: string;              // Ex: "Sepolia" (affichage)
  chain_id_hex?: string;      // Ex: 0xaa36a7
  address?: string;           // Adresse EVM principale (si connectée)
  solde_figure_raw: string;   // en wei (ou unités brutes)
  solde_virtuel_raw: string;  // en wei (ou unités brutes)
  points: number;
  valeur_point: number;       // dans la devise_repere
}

interface ActivityItem {
  hash: string;
  direction: "+" | "-";
  amountHuman: string;        // ex: "0.150 ETH"
  when: string;               // ex: "Aujourd'hui", "Hier"
}

// ——————————— Helpers ———————————

function shortAddr(addr?: string, n = 4) {
  if (!addr) return "—";
  return `${addr.slice(0, 2 + n)}…${addr.slice(-n)}`;
}

function chainNameFor(chainIdHex?: string) {
  switch (chainIdHex) {
    case "0x1": return "Ethereum Mainnet";
    case "0xaa36a7": return "Sepolia";
    case "0x89": return "Polygon";
    case "0xa": return "Optimism";
    case "0x2105": return "Base";
    default: return chainIdHex ? `Chain ${parseInt(chainIdHex, 16)}` : "—";
  }
}

// formatAmount: convertit des unités brutes (ex: wei) en valeur humaine
function formatAmount(raw: string, decimals: number, precision = 6) {
  const neg = raw.startsWith("-");
  const s = neg ? raw.slice(1) : raw;
  const pad = s.padStart(decimals + 1, "0");
  const int = pad.slice(0, -decimals) || "0";
  const fracFull = pad.slice(-decimals);
  const fracTrim = (fracFull.replace(/0+$/, "").slice(0, precision)) || "0";
  return `${neg ? "-" : ""}${int}${fracTrim === "0" ? "" : "." + fracTrim}`;
}

// taux (demo) contre EUR; sera converti selon devise_repere
const DEMO_RATES_EUR = {
  ETH: 2900, // 1 ETH ≈ 2900 EUR (exemple)
};

function convertRateTo(ref: RefCurrency, baseInEUR: number) {
  if (ref === "EUR") return baseInEUR;
  if (ref === "USD") return baseInEUR * 1.08; // exemple
  return baseInEUR * 10.8; // MAD
}

// ——————————— Composant principal ———————————

export default function WalletFull() {
  // État MetaMask / EVM
  const [hasMM, setHasMM] = useState<boolean>(false);
  const [account, setAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<string | undefined>();

  // Maquette data (remplacer par fetch /wallets/:id/overview)
  const [wallet, setWallet] = useState<WalletOverview>({
    id_wallet: 12,
    statut: "active",
    devise_repere: "EUR",
    chain: "—",
    chain_id_hex: undefined,
    address: undefined,
    solde_figure_raw: "420000000000000000", // 0.42 ETH (18 décimales)
    solde_virtuel_raw: "750000000000000000", // 0.75 ETH
    points: 200,
    valeur_point: 0.05, // 1 point = 0.05 devise_repere (exemple)
  });

  const [activities, setActivities] = useState<ActivityItem[]>([
    { hash: "0xaf...12cd", direction: "+", amountHuman: "+0,150 ETH", when: "Aujourd'hui" },
    { hash: "0xb3...ef45", direction: "-", amountHuman: "−0,200 ETH", when: "Hier" },
    { hash: "0xc7...ab89", direction: "+", amountHuman: "+0,250 ETH", when: "Cette semaine" },
  ]);

  // Taux dynamiques suivant devise repère
  const ethRate = useMemo(
    () => convertRateTo(wallet.devise_repere, DEMO_RATES_EUR.ETH),
    [wallet.devise_repere]
  );

  // Totaux (en devise repère)
  const soldeFigureETH = useMemo(
    () => formatAmount(wallet.solde_figure_raw, 18, 6),
    [wallet.solde_figure_raw]
  );
  const soldeVirtuelETH = useMemo(
    () => formatAmount(wallet.solde_virtuel_raw, 18, 6),
    [wallet.solde_virtuel_raw]
  );

  const totalFiat = useMemo(() => {
    const fig = Number(soldeFigureETH || "0");
    const virt = Number(soldeVirtuelETH || "0");
    return (fig + virt) * ethRate;
  }, [soldeFigureETH, soldeVirtuelETH, ethRate]);

  // Détection MetaMask + sync état
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return alert("MetaMask non détecté.");


    Promise.all([
      eth.request({ method: "eth_accounts" }),
      eth.request({ method: "eth_chainId" }),
    ]).then(([accs, cid]: [string[], string]) => {
      const addr = accs?.[0];
      setAccount(addr);
      setChainId(cid);
      setWallet(w => ({ ...w, address: addr, chain_id_hex: cid, chain: chainNameFor(cid) }));
    }).catch(() => {});

    const handleAccounts = (accs: string[]) => {
      const addr = accs?.[0];
      setAccount(addr);
      setWallet(w => ({ ...w, address: addr }));
    };
    const handleChain = (cid: string) => {
      setChainId(cid);
      setWallet(w => ({ ...w, chain_id_hex: cid, chain: chainNameFor(cid) }));
    };

    eth.on?.("accountsChanged", handleAccounts);
    eth.on?.("chainChanged", handleChain);
    return () => {
      eth.removeListener?.("accountsChanged", handleAccounts);
      eth.removeListener?.("chainChanged", handleChain);
    };
  }, []);

  const onConnect = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return alert("MetaMask non détecté.");
    try {
      const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
      const cid: string = await eth.request({ method: "eth_chainId" });
      setAccount(accs?.[0]);
      setChainId(cid);
      setWallet(w => ({ ...w, address: accs?.[0], chain_id_hex: cid, chain: chainNameFor(cid) }));
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Connexion refusée");
    }
  };

  const changeRefCcy = () => {
    setWallet(w => {
      const order: RefCurrency[] = ["EUR", "USD", "MAD"];
      const i = order.indexOf(w.devise_repere);
      return { ...w, devise_repere: order[(i + 1) % order.length] };
    });
  };

  // Handlers d’actions (à brancher au backend / ethers)
  const onDeposit = () => alert("TODO: ouvrir modal Deposit → sendEth/transferErc20 + notify backend");
  const onWithdraw = () => alert("TODO: ouvrir modal Withdraw");
  const onTransfer = () => alert("TODO: ouvrir modal Transfer (to address)");

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.headerRow}>
          <h1 style={S.title}>Mon Wallet</h1>
          <span style={badgeByStatus(wallet.statut)}>
            {wallet.statut === "active" ? "Actif" : wallet.statut === "suspended" ? "Suspendu" : "Fermé"}
          </span>
        </div>

        {/* Ligne: ID Wallet & Primary account */}
        <div style={S.rowSplit}>
          <div>
            <div style={S.muted}>ID Wallet</div>
            <div style={S.strong}>{wallet.id_wallet}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.muted}>Primary account</div>
            <div style={S.mono}>{shortAddr(wallet.address)}</div>
          </div>
        </div>

        {/* Bloc Adresse principale + Devise repère */}
        <div style={S.section}>
          <div style={S.rowBetween}>
            <div>
              <div style={S.label}>Réseau</div>
              <div style={S.strong}>{wallet.chain}</div>
              {!hasMM && (
                <div style={{ ...S.muted, marginTop: 4 }}>MetaMask non détecté</div>
              )}
            </div>
            <div>
              <div style={S.label}>Devise repère</div>
              <div style={S.selectLike}>
                <span>{wallet.devise_repere}</span>
                <button style={S.caretBtn} onClick={changeRefCcy} title="Changer">▾</button>
              </div>
            </div>
          </div>

          <div style={S.addrRow}>
            <div style={S.addrLeft}>
              <div style={S.addrIcon}>⚙️</div>
              <span style={S.addrText}>{wallet.address || "—"}</span>
            </div>
            <div style={S.addrTools}>
              <button style={S.squareBtn} title="Show QR" disabled>▣</button>
              <button style={S.squareBtn} title="Copy" onClick={() => wallet.address && navigator.clipboard.writeText(wallet.address!)} disabled={!wallet.address}>⧉</button>
            </div>
          </div>

          {!account ? (
            <div style={{ marginTop: 8 }}>
              <button style={S.btnPrimary} onClick={onConnect}>Connect MetaMask</button>
            </div>
          ) : null}
        </div>

        {/* Soldes */}
        <div style={S.section}>
          <div style={S.rowBetween}> 
            <div style={S.label}>Solde réel</div>
            <div style={S.value}>{soldeFigureETH} ETH</div>
          </div>
          <div style={S.rowBetween}> 
            <div style={S.label}>Solde virtuel</div>
            <div style={S.value}>{soldeVirtuelETH} ETH</div>
          </div>
          <div style={S.totalBox}>
            <div style={S.muted}>Total</div>
            <div style={S.totalStrong}>
              {totalFiat.toLocaleString(undefined, { maximumFractionDigits: 2 })} {wallet.devise_repere}
            </div>
          </div>
        </div>

        {/* Points */}
        <div style={S.section}>
          <div style={S.rowBetween}>
            <div style={S.label}>Points</div>
            <div style={S.value}>{wallet.points}</div>
          </div>
          <div style={S.rowBetween}>
            <div style={S.label}>Valeur</div>
            <div style={S.value}>{(wallet.points * wallet.valeur_point).toLocaleString(undefined, { maximumFractionDigits: 2 })} {wallet.devise_repere}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={S.actionsRow}>
          <button style={S.btnGhost} onClick={onDeposit}>Deposit</button>
          <button style={S.btnGhost} onClick={onWithdraw}>Withdraw</button>
          <button style={S.btnGhost} onClick={onTransfer}>Transfer</button>
        </div>

        {/* Historique */}
        <div style={{ ...S.section, marginTop: 12 }}>
          <div style={S.sectionTitle}>Recent Activity</div>
          <div style={{ display: "grid", gap: 6 }}>
            {activities.map((a, i) => (
              <div key={i} style={S.activityRow}>
                <div style={S.mono}>{a.hash}</div>
                <div style={{ ...S.value, color: a.direction === "+" ? "#065f46" : "#b91c1c" }}>{a.amountHuman}</div>
              </div>
            ))}
          </div>
          <div style={S.activityFooter}>
            <span style={S.sectionTitle}>Recent Activity</span>
            <a href="#" style={S.linkMuted}>Aujourd’hui →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ——————————— Styles ———————————

const S: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc", padding: 16, color: "#0f172a", fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial' },
  card: { width: 380, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, boxShadow: "0 10px 30px rgba(2,6,23,.06)", padding: 16 },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { margin: 0, fontSize: 22, fontWeight: 800 },
  label: { fontSize: 13, color: "#334155" },
  muted: { fontSize: 12, color: "#64748b" },
  strong: { fontWeight: 700 },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },

  rowSplit: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e5e7eb", marginBottom: 8 },
  rowBetween: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },

  section: { borderTop: "1px solid #e5e7eb", paddingTop: 10, marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 6 },

  selectLike: { border: "1px solid #e5e7eb", borderRadius: 10, padding: "6px 10px", display: "inline-flex", alignItems: "center", gap: 8, background: "#fff" },
  caretBtn: { border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#475569" },

  addrRow: { border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  addrLeft: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  addrIcon: { width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", background: "#f1f5f9", fontSize: 12 },
  addrText: { fontSize: 14, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 },
  addrTools: { display: "flex", gap: 6 },
  squareBtn: { width: 32, height: 32, border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14 },

  value: { fontWeight: 700 },
  totalBox: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 8, borderTop: "1px dashed #e5e7eb", paddingTop: 8 },
  totalStrong: { fontWeight: 800, fontSize: 20 },

  actionsRow: { display: "flex", gap: 8, marginTop: 12 },
  btnGhost: { flex: 1, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontWeight: 600 },
  btnPrimary: { border: "1px solid #0ea5e9", background: "#0ea5e9", color: "#fff", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontWeight: 700 },

  activityRow: { display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 10px", background: "#fff" },
  activityFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  linkMuted: { color: "#64748b", textDecoration: "none", fontSize: 12 },
};

function badgeByStatus(st: WalletStatus): CSSProperties {
  const base: CSSProperties = { padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700 };
  if (st === "active") return { ...base, background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" };
  if (st === "suspended") return { ...base, background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" };
  return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
}
