import React, { useEffect, useMemo, useState } from "react";

/* Types */
type Erc20 = { address: string; symbol: string; name?: string; decimals: number; pinned?: boolean; };
type Row = Erc20 & { balanceWei: string };

/* Utils EVM */
const strip0x = (s: string) => (s.startsWith("0x") ? s.slice(2) : s);
const add0x = (s: string) => (s.startsWith("0x") ? s : "0x" + s);
const zpad32 = (hex: string) => hex.padStart(64, "0");
const encAddr = (addr: string) => zpad32(strip0x(addr).toLowerCase());

const SIG = { balanceOf: "70a08231", decimals: "313ce567", symbol: "95d89b41", name: "06fdde03" };

async function ethCall(to: string, data: string) {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("MetaMask non détecté");
  return await eth.request({ method: "eth_call", params: [{ to, data: add0x(data) }, "latest"] });
}
function decodeUint(hex: string) { return parseInt(strip0x(hex).slice(-64), 16); }
function decodeString(hex: string): string {
  const h = strip0x(hex);
  if (h.length === 64) {
    const bytes = h.match(/.{2}/g)?.map((b) => parseInt(b, 16)) || [];
    return String.fromCharCode(...bytes).replace(/\u0000+$/, "");
  }
  return "";
}
function hexToBigInt(hex: string) { try { return BigInt(hex); } catch { return 0n; } }
function formatUnits(raw: bigint, decimals: number, precision = 6) {
  const s = raw.toString().padStart(decimals + 1, "0");
  const int = s.slice(0, -decimals) || "0";
  const frac = s.slice(-decimals).replace(/0+$/, "").slice(0, precision);
  return frac ? `${int}.${frac}` : int;
}

/* Defaults */
const DEFAULTS: Erc20[] = [
  { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", name: "USD Coin", decimals: 6, pinned: true },
  { address: "0x6b175474e89094c44da98b954eedeac495271d0f", symbol: "DAI", name: "Dai Stablecoin", decimals: 18, pinned: true },
];
const LS_KEY = "tokens_v1";

/* Component */
export default function Tokens() {
  const [account, setAccount] = useState<string>();
  const [rows, setRows] = useState<Row[]>([]);
  const [addrInput, setAddrInput] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    const stored: Erc20[] = raw ? JSON.parse(raw) : [];
    const merged = [...DEFAULTS, ...stored];
    setRows(merged.map((t) => ({ ...t, balanceWei: "0x0" })));
  }, []);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    eth.request({ method: "eth_accounts" }).then((accs: string[]) => setAccount(accs?.[0]));
  }, []);

  const refresh = async () => {
    if (!account) return alert("Connect MetaMask d’abord");
    const updated: Row[] = [];
    for (const r of rows) {
      try {
        const data = SIG.balanceOf + encAddr(account);
        const out = await ethCall(r.address, data);
        updated.push({ ...r, balanceWei: out });
      } catch {
        updated.push({ ...r, balanceWei: "0x0" });
      }
    }
    setRows(updated);
  };

  const addToken = async () => {
    const addr = addrInput.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return alert("Adresse invalide");
    try {
      const dec = await ethCall(addr, SIG.decimals);
      const sym = await ethCall(addr, SIG.symbol);
      const nm  = await ethCall(addr, SIG.name);
      const tok: Erc20 = {
        address: addr,
        decimals: dec === "0x" ? 18 : decodeUint(dec),
        symbol: decodeString(sym) || "TKN",
        name: decodeString(nm),
      };
      if (rows.some((r) => r.address.toLowerCase() === addr.toLowerCase())) return alert("Déjà présent");
      const next = [...rows, { ...tok, balanceWei: "0x0" }];
      setRows(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next.filter((t) => !t.pinned)));
      setAddrInput("");
    } catch (e: any) {
      alert(e?.message ?? "Erreur lecture token");
    }
  };

  const remove = (addr: string) => {
    const tok = rows.find((r) => r.address === addr);
    if (tok?.pinned) return alert("Impossible de supprimer un token par défaut");
    const next = rows.filter((r) => r.address !== addr);
    setRows(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next.filter((t) => !t.pinned)));
  };

  const pretty = useMemo(() => rows.map((r) => ({
    ...r,
    human: formatUnits(hexToBigInt(r.balanceWei), r.decimals, 6),
  })), [rows]);

  return (
    <div style={sx.page}>
      <div style={sx.card}>
        <div style={sx.header}>
          <h2 style={sx.title}>🪙 Tokens</h2>
          <button style={sx.btn} onClick={refresh}>Refresh</button>
        </div>

        <div style={sx.addBox}>
          <input
            placeholder="Adresse ERC-20 (0x…)"
            value={addrInput}
            onChange={(e) => setAddrInput(e.target.value)}
            style={sx.input}
          />
          <button style={sx.btnPrimary} onClick={addToken}>Add</button>
        </div>

        <div style={sx.table}>
          <div style={sx.thead}>
            <span>Name</span><span>Symbol</span><span>Decimals</span>
            <span>Balance</span><span>Address</span><span></span>
          </div>
          {pretty.map((r) => (
            <div key={r.address} style={sx.row}>
              <span>{r.name || "—"}</span>
              <b>{r.symbol}</b>
              <span>{r.decimals}</span>
              <span>{r.human}</span>
              <code>{r.address.slice(0, 6)}…{r.address.slice(-4)}</code>
              <button style={sx.btnGhost} onClick={() => remove(r.address)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Styles */
const sx: Record<string, React.CSSProperties> = {
  page: { display: "flex", justifyContent: "center", padding: 16, background: "#f8fafc", fontFamily: "Inter, sans-serif" },
  card: { width: "100%", maxWidth: 720, background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #e5e7eb", boxShadow: "0 6px 18px rgba(0,0,0,0.04)", display: "grid", gap: 16 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { margin: 0, fontWeight: 800, fontSize: 20, color: "#1e3a8a" },
  btn: { border: "1px solid #2563eb", background: "#fff", color: "#2563eb", borderRadius: 8, padding: "6px 12px", fontWeight: 600, cursor: "pointer" },
  btnPrimary: { border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "6px 12px", fontWeight: 700, cursor: "pointer" },
  btnGhost: { border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", borderRadius: 8, padding: "4px 8px", fontWeight: 600, cursor: "pointer" },
  addBox: { display: "flex", gap: 8 },
  input: { flex: 1, border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 10px", fontSize: 14 },
  table: { display: "grid", gap: 8 },
  thead: { display: "grid", gridTemplateColumns: "1fr 100px 80px 120px 1fr 80px", fontSize: 12, fontWeight: 700, color: "#475569", padding: "4px 6px" },
  row: { display: "grid", gridTemplateColumns: "1fr 100px 80px 120px 1fr 80px", alignItems: "center", padding: "8px 6px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 },
};
