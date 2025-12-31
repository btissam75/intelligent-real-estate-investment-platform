// // src/Tokens.tsx
// import React, { useEffect, useMemo, useState } from "react";

// /**
//  * Tokens.tsx — Improved Tokens manager
//  *
//  * Features:
//  * - Load default + persisted tokens (localStorage)
//  * - Detect MetaMask account & chain
//  * - eth_call-based metadata read (symbol/decimals/name) with robust decoding
//  * - Refresh balances (all / single)
//  * - Add custom ERC-20 by contract address
//  * - Remove token (protected for pinned tokens)
//  * - UI: loading states, error messages, copy address, responsive layout
//  */

// /* ---------------------- Types ---------------------- */
// type Erc20 = {
//   address: string;
//   symbol: string;
//   name?: string;
//   decimals: number;
//   pinned?: boolean;
// };

// type Row = Erc20 & {
//   balanceWei: string; // hex "0x..."
//   loading?: boolean;
//   error?: string | null;
// };

// /* ---------------------- Low-level EVM helpers ---------------------- */
// const strip0x = (s = "") => (s.startsWith("0x") ? s.slice(2) : s);
// const add0x = (s = "") => (s.startsWith("0x") ? s : "0x" + s);
// const zpad32 = (hex: string) => hex.padStart(64, "0");
// const encAddr = (addr: string) => zpad32(strip0x(addr).toLowerCase());

// const SIG = {
//   balanceOf: "70a08231", // balanceOf(address)
//   decimals: "313ce567", // decimals()
//   symbol: "95d89b41", // symbol()
//   name: "06fdde03", // name()
// };

// async function ethCall(to: string, data: string) {
//   const eth = (window as any).ethereum;
//   if (!eth) throw new Error("MetaMask non détecté");
//   // request eth_call (latest)
//   return await eth.request({ method: "eth_call", params: [{ to, data: add0x(data) }, "latest"] });
// }

// /* decode helpers robustes */

// function decodeUint(hex?: string) {
//   if (!hex) return 0;
//   const h = strip0x(hex);
//   // read last 64 hex-digits
//   const last = h.slice(-64) || "0";
//   return parseInt(last, 16);
// }

// /**
//  * Decode strings returned by contracts.
//  * Handles:
//  *  - fixed bytes32 (64 hex chars)
//  *  - dynamic string (offset / length / data)
//  *
//  * Note: Some contracts return symbol as bytes32, others as string -> we try both.
//  */
// function decodeString(hex?: string): string {
//   if (!hex) return "";
//   const h = strip0x(hex);
//   if (!h) return "";
//   // if it's exactly 64 hex chars, it's a bytes32
//   if (h.length === 64) {
//     try {
//       const bytes = h.match(/.{1,2}/g) || [];
//       const arr = bytes.map((b) => parseInt(b, 16));
//       return String.fromCharCode(...arr).replace(/\u0000+$/g, "").trim();
//     } catch {
//       return "";
//     }
//   }
//   // try dynamic: the returned hex may be the standard ABI: offset(32) | len(32) | data
//   try {
//     // first 32 bytes: offset (ignore), second 32 bytes: length
//     const lenHex = h.slice(64, 128);
//     const len = parseInt(lenHex, 16);
//     const data = h.slice(128, 128 + len * 2);
//     const bytes = data.match(/.{1,2}/g) || [];
//     const arr = bytes.map((b) => parseInt(b, 16));
//     return String.fromCharCode(...arr);
//   } catch {
//     return "";
//   }
// }

// function hexToBigInt(hex: string) {
//   try {
//     if (!hex) return 0n;
//     return BigInt(hex.toString());
//   } catch {
//     return 0n;
//   }
// }

// function formatUnits(raw: bigint, decimals: number, precision = 6) {
//   const neg = raw < 0n;
//   const s = (neg ? -raw : raw).toString();
//   const pad = s.padStart(decimals + 1, "0");
//   const int = pad.slice(0, -decimals) || "0";
//   let frac = pad.slice(-decimals).replace(/0+$/, "");
//   if (!frac) return `${neg ? "-" : ""}${int}`;
//   frac = frac.slice(0, precision);
//   return `${neg ? "-" : ""}${int}.${frac}`;
// }

// /* ---------------------- Defaults & storage ---------------------- */
// const DEFAULT_TOKENS: Erc20[] = [
//   {
//     address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//     symbol: "USDC",
//     name: "USD Coin",
//     decimals: 6,
//     pinned: true,
//   },
//   {
//     address: "0x6b175474e89094c44da98b954eedeac495271d0f",
//     symbol: "DAI",
//     name: "Dai Stablecoin",
//     decimals: 18,
//     pinned: true,
//   },
// ];

// const LS_KEY = "immo_tokens_v2";

// /* ---------------------- Component ---------------------- */
// export default function Tokens() {
//   const [account, setAccount] = useState<string | undefined>();
//   const [chainId, setChainId] = useState<string | undefined>();
//   const [rows, setRows] = useState<Row[]>([]);
//   const [addrInput, setAddrInput] = useState("");
//   const [globalLoading, setGlobalLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   /* load persisted tokens + defaults */
//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem(LS_KEY);
//       const stored: Erc20[] = raw ? JSON.parse(raw) : [];
//       const map = new Map<string, Erc20>();
//       // keep defaults first (pinned), then stored (avoid dup)
//       [...DEFAULT_TOKENS, ...stored].forEach((t) => map.set(t.address.toLowerCase(), t));
//       const arr = Array.from(map.values());
//       setRows(arr.map((t) => ({ ...t, balanceWei: "0x0", loading: false, error: null })));
//     } catch (e) {
//       console.error("load tokens", e);
//       setRows(DEFAULT_TOKENS.map((t) => ({ ...t, balanceWei: "0x0", loading: false, error: null })));
//     }
//   }, []);

//   /* detect metamask account & chain */
//   useEffect(() => {
//     const eth = (window as any).ethereum;
//     if (!eth) return;
//     // initial fetch
//     Promise.allSettled([eth.request({ method: "eth_accounts" }), eth.request({ method: "eth_chainId" })]).then(
//       (res) => {
//         const accs = res[0].status === "fulfilled" ? (res[0].value as string[]) : [];
//         const cid = res[1].status === "fulfilled" ? (res[1].value as string) : undefined;
//         setAccount(accs?.[0]);
//         setChainId(cid);
//       }
//     );
//     // listeners
//     const onA = (accs: string[]) => setAccount(accs?.[0]);
//     const onC = (cid: string) => setChainId(cid);
//     eth.on?.("accountsChanged", onA);
//     eth.on?.("chainChanged", onC);
//     return () => {
//       eth.removeListener?.("accountsChanged", onA);
//       eth.removeListener?.("chainChanged", onC);
//     };
//   }, []);

//   /* utility: persist (excluding pinned defaults) */
//   const persist = (list: Row[]) => {
//     const toPersist = list
//       .filter((r) => !r.pinned)
//       .map((r) => ({ address: r.address, symbol: r.symbol, name: r.name, decimals: r.decimals }));
//     localStorage.setItem(LS_KEY, JSON.stringify(toPersist));
//   };

//   /* refresh all balances sequentially (safe) */
//   const refreshAll = async () => {
//     if (!account) {
//       alert("Connecte MetaMask dans Wallet d'abord.");
//       return;
//     }
//     setGlobalLoading(true);
//     setError(null);
//     const next: Row[] = [];
//     for (const r of rows) {
//       // set loading flag for this row
//       setRows((prev) => prev.map((p) => (p.address === r.address ? { ...p, loading: true, error: null } : p)));
//       try {
//         const out = await ethCall(r.address, SIG.balanceOf + encAddr(account));
//         next.push({ ...r, balanceWei: out || "0x0", loading: false, error: null });
//       } catch (e: any) {
//         console.warn("refresh token", r.address, e);
//         next.push({ ...r, balanceWei: "0x0", loading: false, error: String(e?.message || "read failed") });
//       }
//     }
//     setRows(next);
//     persist(next);
//     setGlobalLoading(false);
//   };

//   /* refresh single token */
//   const refreshOne = async (addr: string) => {
//     if (!account) {
//       alert("Connecte MetaMask dans Wallet d'abord.");
//       return;
//     }
//     setRows((prev) => prev.map((p) => (p.address === addr ? { ...p, loading: true, error: null } : p)));
//     try {
//       const r = rows.find((x) => x.address.toLowerCase() === addr.toLowerCase());
//       if (!r) throw new Error("Token introuvable");
//       const out = await ethCall(r.address, SIG.balanceOf + encAddr(account));
//       setRows((prev) => prev.map((p) => (p.address === addr ? { ...p, balanceWei: out || "0x0", loading: false, error: null } : p)));
//     } catch (e: any) {
//       setRows((prev) => prev.map((p) => (p.address === addr ? { ...p, loading: false, error: String(e?.message || "read failed") } : p)));
//     }
//   };

//   /* add token by address: read metadata (decimals, symbol, name) */
//   const addToken = async () => {
//     const addr = addrInput.trim();
//     if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
//       alert("Adresse ERC-20 invalide (doit commencer par 0x...).");
//       return;
//     }
//     if (rows.some((r) => r.address.toLowerCase() === addr.toLowerCase())) {
//       alert("Token déjà présent.");
//       return;
//     }
//     try {
//       // optimistic entry
//       const placeholder: Row = { address: addr, symbol: "TKN", name: undefined, decimals: 18, pinned: false, balanceWei: "0x0", loading: true, error: null };
//       setRows((prev) => [...prev, placeholder]);
//       // fetch metadata
//       const [decHex, symHex, nameHex] = await Promise.all([ethCall(addr, SIG.decimals), ethCall(addr, SIG.symbol), ethCall(addr, SIG.name).catch(() => "0x")]);
//       const decimals = decHex === "0x" ? 18 : decodeUint(decHex);
//       let symbol = decodeString(symHex) || "";
//       if (!symbol) {
//         // fallback: some tokens return symbol as bytes32 that decodeString handles; but if empty, show short address
//         symbol = `TKN`;
//       }
//       const name = decodeString(nameHex) || undefined;
//       const newRow: Row = { address: addr, symbol, name, decimals, pinned: false, balanceWei: "0x0", loading: false, error: null };
//       setRows((prev) => {
//         const next = prev.map((p) => (p.address === addr ? newRow : p));
//         persist(next);
//         return next;
//       });
//       setAddrInput("");
//       // try fetching balance if account present
//       if (account) {
//         await refreshOne(addr);
//       }
//     } catch (e: any) {
//       // rollback placeholder
//       setRows((prev) => prev.filter((p) => p.address !== addr));
//       alert("Impossible de lire les métadonnées du token: " + (e?.message || ""));
//     }
//   };

//   /* remove token */
//   const removeToken = (addr: string) => {
//     const t = rows.find((r) => r.address.toLowerCase() === addr.toLowerCase());
//     if (!t) return;
//     if (t.pinned) return alert("Impossible de supprimer un token par défaut.");
//     const next = rows.filter((r) => r.address.toLowerCase() !== addr.toLowerCase());
//     setRows(next);
//     persist(next);
//   };

//   /* derived pretty rows (human balance) */
//   const pretty = useMemo(
//     () =>
//       rows.map((r) => {
//         const bn = hexToBigInt(r.balanceWei || "0x0");
//         const human = formatUnits(bn, r.decimals, 6);
//         return { ...r, human };
//       }),
//     [rows]
//   );

//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <div style={styles.header}>
//           <div>
//             <h3 style={styles.title}>Tokens</h3>
//             <div style={styles.subtitle}>Gère tes ERC-20 — ajoute un contrat, consulte les soldes.</div>
//           </div>
//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <button style={styles.smallBtn} onClick={() => { setError(null); refreshAll(); }} disabled={globalLoading}>
//               {globalLoading ? "Refreshing…" : "Refresh all"}
//             </button>
//           </div>
//         </div>

//         <div style={styles.addRow}>
//           <input
//             value={addrInput}
//             onChange={(e) => setAddrInput(e.target.value)}
//             placeholder="Adresse de contrat ERC-20 (0x…)"
//             style={styles.input}
//           />
//           <button style={styles.primary} onClick={addToken}>
//             Add token
//           </button>
//         </div>

//         {error && <div style={styles.error}>{error}</div>}

//         <div style={styles.table}>
//           <div style={styles.thead}>
//             <div style={{ gridColumn: "1 / span 1" }}>Name</div>
//             <div>Symbol</div>
//             <div>Decimals</div>
//             <div>Balance</div>
//             <div>Address</div>
//             <div style={{ textAlign: "right" }}>Actions</div>
//           </div>

//           {pretty.length === 0 && <div style={styles.empty}>Aucun token. Ajoute une adresse de contrat pour commencer.</div>}

//           {pretty.map((r) => (
//             <div key={r.address} style={styles.row}>
//               <div>
//                 <div style={{ fontWeight: 800 }}>{r.name || "—"}</div>
//                 <div style={{ fontSize: 12, color: "#64748b" }}>{r.symbol}</div>
//               </div>
//               <div style={{ fontWeight: 800, textAlign: "center" }}>{r.symbol}</div>
//               <div style={{ textAlign: "center" }}>{r.decimals}</div>
//               <div style={{ textAlign: "right", fontWeight: 800 }}>
//                 {r.loading ? <span style={styles.skel} /> : r.human}
//                 <div style={{ fontSize: 12, color: "#64748b" }}>{r.loading ? "" : `${r.human === "0" ? "0" : ""}`}</div>
//               </div>
//               <div style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", color: "#334155" }}>
//                 {r.address.slice(0, 8)}…{r.address.slice(-6)}
//               </div>
//               <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
//                 <button
//                   style={styles.btnGhost}
//                   onClick={() => {
//                     navigator.clipboard.writeText(r.address);
//                     setError("Address copied to clipboard");
//                     setTimeout(() => setError(null), 1200);
//                   }}
//                   title="Copy address"
//                 >
//                   Copy
//                 </button>

//                 <button style={styles.btnGhost} onClick={() => refreshOne(r.address)} disabled={r.loading} title="Refresh balance">
//                   {r.loading ? "…" : "Refresh"}
//                 </button>

//                 <button
//                   style={{ ...styles.btnGhost, opacity: r.pinned ? 0.5 : 1 }}
//                   onClick={() => removeToken(r.address)}
//                   disabled={r.pinned}
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div style={styles.footer}>
//           <small style={{ color: "#64748b" }}>Tokens par défaut (pinned) ne peuvent pas être supprimés.</small>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------------------- Basic inline styles ---------------------- */
// const styles: Record<string, React.CSSProperties> = {
//   container: {
//     width: "100%",
//     display: "flex",
//     justifyContent: "center",
//     padding: 20,
//     background: "transparent",
//     fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
//   },
//   card: {
//     width: "100%",
//     maxWidth: 960,
//     borderRadius: 14,
//     background: "#fff",
//     padding: 18,
//     border: "1px solid #e6eef9",
//     boxShadow: "0 8px 24px rgba(2,6,23,0.06)",
//     display: "grid",
//     gap: 12,
//   },
//   header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
//   title: { margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" },
//   subtitle: { fontSize: 12, color: "#64748b" },

//   addRow: { display: "flex", gap: 8, alignItems: "center" },
//   input: { flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e6eef9", fontSize: 14 },
//   primary: {
//     padding: "10px 14px",
//     borderRadius: 10,
//     background: "linear-gradient(90deg,#2563eb,#06b6d4)",
//     border: "none",
//     color: "#fff",
//     fontWeight: 800,
//     cursor: "pointer",
//   },
//   smallBtn: {
//     padding: "8px 10px",
//     borderRadius: 8,
//     border: "1px solid #cfe8ff",
//     background: "#f0f9ff",
//     cursor: "pointer",
//     fontWeight: 700,
//   },

//   table: { display: "grid", gap: 8, marginTop: 6 },
//   thead: {
//     display: "grid",
//     gridTemplateColumns: "1fr 100px 80px 140px 1fr 220px",
//     gap: 8,
//     padding: "8px 6px",
//     fontSize: 12,
//     fontWeight: 800,
//     color: "#475569",
//     borderBottom: "1px solid #eef6ff",
//   },
//   row: {
//     display: "grid",
//     gridTemplateColumns: "1fr 100px 80px 140px 1fr 220px",
//     alignItems: "center",
//     gap: 8,
//     padding: "10px 6px",
//     borderRadius: 10,
//     border: "1px solid #f1f5f9",
//     background: "#fff",
//   },

//   btnGhost: {
//     padding: "8px 10px",
//     borderRadius: 8,
//     border: "1px solid #e6eef9",
//     background: "#fafcff",
//     cursor: "pointer",
//     fontWeight: 700,
//   },

//   empty: { padding: 16, color: "#64748b", textAlign: "center" },
//   footer: { marginTop: 6 },

//   error: { color: "#b91c1c", background: "#fff5f5", padding: 8, borderRadius: 8, border: "1px solid #fecaca" },
//   skel: {
//     display: "inline-block",
//     width: 72,
//     height: 14,
//     borderRadius: 8,
//     background: "linear-gradient(90deg,#eef2f7 0%,#e7ebf2 40%,#eef2f7 80%)",
//     backgroundSize: "200% 100%",
//     animation: "sk 1.1s linear infinite",
//   },
// };

// /* small keyframes injection for skeleton */
// const styleEl = document.createElement("style");
// styleEl.innerHTML = `@keyframes sk{ from{background-position:200% 0} to{background-position:-200% 0}}`;
// document.head.appendChild(styleEl);
// import React, { useEffect, useMemo, useState } from "react";

// type Owned = { tokenId: string; tokenUri: string };
// type Created = {
//   investmentId: string;
//   status: "created" | "funds_received" | "minted";
//   tokenId?: string;
//   meta?: any;
// };

// function decodeDataUriJson(uri: string) {
//   if (uri?.startsWith("data:application/json;base64,")) {
//     try {
//       return JSON.parse(atob(uri.slice("data:application/json;base64,".length)));
//     } catch {
//       return null;
//     }
//   }
//   return null;
// }
// function ipfsToHttp(url?: string) {
//   if (!url) return undefined;
//   return url.startsWith("ipfs://")
//     ? `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`
//     : url;
// }
// function truncateMiddle(str?: string, keep = 6) {
//   if (!str) return "—";
//   return str.length <= keep * 2 + 3
//     ? str
//     : `${str.slice(0, keep)}…${str.slice(-keep)}`;
// }

// export default function TokensPage() {
//   // address peut être undefined si l'utilisateur n'est pas lié (SIWE)
//   const [address, setAddress] = useState<string | undefined>(undefined);
//   const [owned, setOwned] = useState<Owned[]>([]);
//   const [created, setCreated] = useState<Created[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState<string | undefined>(undefined);
//   const [q, setQ] = useState("");
//   const [tab, setTab] = useState<"all" | "owned" | "created">("all");

//   async function load() {
//     try {
//       setErr(undefined);
//       setLoading(true);

//       // 1) Qui suis-je ?
//       const me = await fetch("http://localhost:3000/auth/me", {
//         credentials: "include",
//       }).then((r) => r.json());

//       const addr: string | undefined = me?.address || undefined;
//       setAddress(addr);

//       if (!addr) {
//         // pas d'adresse liée => on n'appelle pas les endpoints suivants
//         setOwned([]);
//         setCreated([]);
//         return;
//       }

//       // 2) NFTs possédés
//       const o = await fetch(
//         `http://localhost:3000/api/nft/owned?owner=${addr ?? ""}`,
//         { credentials: "include" }
//       ).then((r) => r.json());
//       if (!o?.ok) throw new Error(o?.error || "owned_failed");
//       setOwned(o.items || []);

//       // 3) NFTs créés/pending (optionnel si la route existe)
//       try {
//         const c = await fetch(
//           `http://localhost:3000/api/nft/created?owner=${addr ?? ""}`,
//           { credentials: "include" }
//         ).then((r) => r.json());
//         if (c?.ok) setCreated(c.items || []);
//         else setCreated([]);
//       } catch {
//         setCreated([]); // ignore si la route n'existe pas
//       }
//     } catch (e: any) {
//       setErr(e?.message || "Erreur chargement");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   const displayOwned = useMemo(
//     () =>
//       owned.map((it) => {
//         const meta = decodeDataUriJson(it.tokenUri);
//         return {
//           kind: "owned" as const,
//           id: it.tokenId,
//           name: meta?.name || `Token #${it.tokenId}`,
//           desc: meta?.description,
//           img: ipfsToHttp(meta?.image),
//         };
//       }),
//     [owned]
//   );

//   const displayCreated = useMemo(
//     () =>
//       created.map((c) => ({
//         kind: "created" as const,
//         id: c.investmentId,
//         name: c.tokenId
//           ? `Token #${c.tokenId}`
//           : `Investment #${c.investmentId}`,
//         desc:
//           c.status === "minted"
//             ? "Minté"
//             : c.status === "funds_received"
//             ? "Paiement confirmé, en attente de mint"
//             : "Créé, en attente de paiement",
//         img: ipfsToHttp(c?.meta?.image),
//       })),
//     [created]
//   );

//   const all = useMemo(() => {
//     let arr = [...displayOwned, ...displayCreated];
//     const qq = q.trim().toLowerCase();
//     if (qq)
//       arr = arr.filter((x) =>
//         `${x.name} ${x.desc ?? ""} ${x.id}`.toLowerCase().includes(qq)
//       );
//     if (tab === "owned") arr = arr.filter((x) => x.kind === "owned");
//     if (tab === "created") arr = arr.filter((x) => x.kind === "created");
//     return arr;
//   }, [displayOwned, displayCreated, q, tab]);

//   return (
//     <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
//       <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Mes NFTs</h1>
//       <div style={{ color: "#6b7280", marginBottom: 16 }}>
//         Titres possédés (on-chain) et créations en cours.
//       </div>

//       <div
//         style={{
//           display: "flex",
//           gap: 8,
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 12,
//         }}
//       >
//         <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//           <span className="badge">Adresse: {truncateMiddle(address)}</span>
//           <select
//             value={tab}
//             onChange={(e) => setTab(e.target.value as any)}
//             className="select"
//           >
//             <option value="all">Tous</option>
//             <option value="owned">Possédés</option>
//             <option value="created">Créés</option>
//           </select>
//         </div>
//         <div style={{ display: "flex", gap: 8 }}>
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Rechercher un titre…"
//             className="input"
//           />
//           <button onClick={load} className="btn btnSmall" disabled={loading}>
//             {loading ? "Actualisation…" : "Actualiser"}
//           </button>
//         </div>
//       </div>

//       {!address && (
//         <div
//           style={{
//             border: "1px solid #fde2e2",
//             background: "#fff6f6",
//             color: "#991b1b",
//             padding: 12,
//             borderRadius: 10,
//             marginBottom: 12,
//           }}
//         >
//           Connecte & signe (SIWE) depuis le checkout pour afficher tes titres.
//         </div>
//       )}

//       {address && err && (
//         <div
//           style={{
//             border: "1px solid #fde2e2",
//             background: "#fff6f6",
//             color: "#991b1b",
//             padding: 12,
//             borderRadius: 10,
//             marginBottom: 12,
//           }}
//         >
//           {err}
//         </div>
//       )}

//       {address && loading && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
//             gap: 12,
//           }}
//         >
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div
//               key={i}
//               style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}
//             >
//               <div style={{ height: 160, background: "#f3f4f6" }} />
//               <div style={{ padding: 12 }}>
//                 <div
//                   style={{
//                     height: 14,
//                     background: "#f3f4f6",
//                     width: "60%",
//                     marginBottom: 8,
//                   }}
//                 />
//                 <div style={{ height: 10, background: "#f3f4f6", width: "35%" }} />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {address && !loading && all.length === 0 && (
//         <div
//           style={{
//             border: "1px dashed #e5e7eb",
//             background: "#fafafa",
//             color: "#6b7280",
//             padding: 16,
//             borderRadius: 10,
//           }}
//         >
//           Aucun titre pour l’instant. Après paiement confirmé et mint, tes NFTs
//           apparaîtront ici.
//         </div>
//       )}

//       {address && !loading && all.length > 0 && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
//             gap: 12,
//           }}
//         >
//           {all.map((x) => (
//             <div
//               key={`${x.kind}-${x.id}`}
//               style={{
//                 border: "1px solid #eee",
//                 borderRadius: 12,
//                 overflow: "hidden",
//                 background: "#fff",
//               }}
//             >
//               <div style={{ aspectRatio: "4 / 3", background: "#f3f4f6" }}>
//                 {x.img ? (
//                   <img
//                     src={x.img}
//                     alt={x.name}
//                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                   />
//                 ) : (
//                   <div
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       color: "#9ca3af",
//                       fontSize: 12,
//                     }}
//                   >
//                     Pas d’image
//                   </div>
//                 )}
//               </div>
//               <div style={{ padding: 12 }}>
//                 <div style={{ fontWeight: 700 }}>{x.name}</div>
//                 {x.desc && (
//                   <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
//                     {x.desc}
//                   </div>
//                 )}
//                 <div
//                   style={{
//                     display: "flex",
//                     gap: 8,
//                     justifyContent: "flex-end",
//                     marginTop: 10,
//                   }}
//                 >
//                   <a href="/checkout" className="btn btnSmall btnGhost">
//                     Investir
//                   </a>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
//[[[[[[[[[[[[[[[[[[[[[[[[[[[[[mn hna]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
// import React, { useEffect, useMemo, useState } from "react";

// /* ─────────────────────────────────────────────
//    Thème (même base que PropertyPage)
// ────────────────────────────────────────────── */
// const css = `
// :root{
//   --bg:#ffffff; --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
//   --red:#e11d2e; --red-700:#be123c;
// }
// *{box-sizing:border-box}
// body{background:var(--bg);color:var(--ink)}
// a{text-decoration:none;color:inherit}
// .wrap{max-width:1160px;margin:0 auto;padding:0 20px}
// .h1{margin:0 0 6px;font-size:clamp(22px,3vw,28px);font-weight:900;letter-spacing:-.01em}
// .badge{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 8px;background:#fff;color:var(--sub);font-weight:800}
// .select,.input{border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;background:#fff}
// .btn{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff;font-weight:900;cursor:pointer}
// .btnSmall{padding:8px 10px;font-size:13px}
// .btnGhost{background:#fff}
// .btnPrimary{background:var(--red);border-color:var(--red);color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
// .btnPrimary:hover{transform:translateY(-1px);background:var(--red-700);border-color:var(--red-700)}
// .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
// .card{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
// .ghost{background:#fafafa;border:1px dashed #e5e7eb;color:#6b7280}
// .err{border:1px solid #fde2e2;background:#fff6f6;color:#991b1b}
// `;

// /* ─────────────────────────────────────────────
//    Types
// ────────────────────────────────────────────── */
// type Owned = { tokenId: string; tokenUri: string };
// type Created = {
//   investmentId: string;
//   status: "created" | "funds_received" | "minted";
//   tokenId?: string;
//   meta?: {
//     propertyId?: string;
//     mode?: "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";
//     units?: number;
//     amountMAD?: number;
//     title?: string;
//     imageUrl?: string; // ⚠️ c'est celui-ci qu'on veut afficher
//   };
// };

// /* ─────────────────────────────────────────────
//    Helpers
// ────────────────────────────────────────────── */
// function decodeDataUriJson(uri: string) {
//   if (uri?.startsWith("data:application/json;base64,")) {
//     try {
//       return JSON.parse(atob(uri.slice("data:application/json;base64,".length)));
//     } catch {
//       return null;
//     }
//   }
//   return null;
// }
// function ipfsToHttp(url?: string) {
//   if (!url) return undefined;
//   return url.startsWith("ipfs://")
//     ? `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`
//     : url;
// }
// function truncateMiddle(str?: string, keep = 6) {
//   if (!str) return "—";
//   return str.length <= keep * 2 + 3 ? str : `${str.slice(0, keep)}…${str.slice(-keep)}`;
// }

// /* ─────────────────────────────────────────────
//    Page
// ────────────────────────────────────────────── */
// export default function TokensPage() {
//   const [address, setAddress] = useState<string | undefined>(undefined);
//   const [owned, setOwned] = useState<Owned[]>([]);
//   const [created, setCreated] = useState<Created[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState<string | undefined>(undefined);
//   const [q, setQ] = useState("");
//   const [tab, setTab] = useState<"all" | "owned" | "created">("all");

//   async function load() {
//     try {
//       setErr(undefined);
//       setLoading(true);

//       // 1) Qui suis-je ? (adresse SIWE)
//       const me = await fetch("http://localhost:3000/auth/me", {
//         credentials: "include",
//       }).then((r) => r.json());

//       const addr: string | undefined = me?.address || undefined;
//       setAddress(addr);

//       if (!addr) {
//         setOwned([]);
//         setCreated([]);
//         return;
//       }

//       // 2) Possédés (on-chain)
//       const o = await fetch(
//         `http://localhost:3000/api/nft/owned?owner=${addr}`,
//         { credentials: "include" }
//       ).then((r) => r.json());
//       if (!o?.ok) throw new Error(o?.error || "owned_failed");
//       setOwned(o.items || []);

//       // 3) Créés/pending (in-memory)
//       try {
//         const c = await fetch(
//           `http://localhost:3000/api/nft/created?owner=${addr}`,
//           { credentials: "include" }
//         ).then((r) => r.json());
//         if (c?.ok) setCreated(c.items || []);
//         else setCreated([]);
//       } catch {
//         setCreated([]);
//       }
//     } catch (e: any) {
//       setErr(e?.message || "Erreur chargement");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   /* ----------- Adaptation pour la vue ----------- */
//   const displayOwned = useMemo(
//     () =>
//       owned.map((it) => {
//         const meta = decodeDataUriJson(it.tokenUri);
//         return {
//           kind: "owned" as const,
//           id: it.tokenId,
//           name: meta?.name || `Token #${it.tokenId}`,
//           desc: meta?.description,
//           img: ipfsToHttp(meta?.image),
//           href: `/tokens/${it.tokenId}`, // (facultatif) détail du token si tu crées cette page
//           cta: "Voir",
//         };
//       }),
//     [owned]
//   );

//   const displayCreated = useMemo(
//     () =>
//       created.map((c) => {
//         const title =
//           c?.meta?.title ||
//           (c.tokenId ? `Token #${c.tokenId}` : `Investment #${c.investmentId}`);
//         const desc =
//           c.status === "minted"
//             ? "Minté"
//             : c.status === "funds_received"
//             ? "Paiement confirmé, en attente de mint"
//             : "Créé, en attente de paiement";

//         // lien d’action : renvoyer vers la fiche bien si on a l’id
//         const propertyHref = c?.meta?.propertyId
//           ? `/properties/${c.meta.propertyId}`
//           : "/properties";

//         return {
//           kind: "created" as const,
//           id: c.investmentId,
//           name: title,
//           desc,
//           img: ipfsToHttp(c?.meta?.imageUrl), // ✅ le fix principal
//           href: propertyHref,
//           cta: "Investir",
//         };
//       }),
//     [created]
//   );

//   const all = useMemo(() => {
//     let arr = [...displayOwned, ...displayCreated];
//     const qq = q.trim().toLowerCase();
//     if (qq) arr = arr.filter((x) => `${x.name} ${x.desc ?? ""} ${x.id}`.toLowerCase().includes(qq));
//     if (tab === "owned") arr = arr.filter((x) => x.kind === "owned");
//     if (tab === "created") arr = arr.filter((x) => x.kind === "created");
//     return arr;
//   }, [displayOwned, displayCreated, q, tab]);

//   /* ----------- Rendu ----------- */
//   return (
//     <div className="wrap" style={{ paddingTop: 22, paddingBottom: 24 }}>
//       <style>{css}</style>

//       <h1 className="h1">Mes NFTs</h1>
//       <div style={{ color: "var(--sub)", marginBottom: 14 }}>
//         Titres possédés (on-chain) et créations en cours.
//       </div>

//       {/* Toolbar */}
//       <div style={{
//         display: "flex", gap: 8, alignItems: "center",
//         justifyContent: "space-between", marginBottom: 12
//       }}>
//         <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
//           <span className="badge">Adresse&nbsp;: {truncateMiddle(address)}</span>
//           <select value={tab} onChange={(e) => setTab(e.target.value as any)} className="select">
//             <option value="all">Tous</option>
//             <option value="owned">Possédés</option>
//             <option value="created">Créés</option>
//           </select>
//         </div>
//         <div style={{ display: "flex", gap: 8 }}>
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Rechercher un titre…"
//             className="input"
//           />
//           <button onClick={load} className="btn btnSmall" disabled={loading}>
//             {loading ? "Actualisation…" : "Actualiser"}
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       {!address && (
//         <div className="err" style={{ padding: 12, borderRadius: 10, marginBottom: 12 }}>
//           Connecte & signe (SIWE) depuis le checkout pour afficher tes titres.
//         </div>
//       )}
//       {address && err && (
//         <div className="err" style={{ padding: 12, borderRadius: 10, marginBottom: 12 }}>
//           {err}
//         </div>
//       )}

//       {/* Skeletons */}
//       {address && loading && (
//         <div className="grid">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div key={i} className="card">
//               <div style={{ height: 160, background: "#f3f4f6" }} />
//               <div style={{ padding: 12 }}>
//                 <div style={{ height: 14, background: "#f3f4f6", width: "60%", marginBottom: 8 }} />
//                 <div style={{ height: 10, background: "#f3f4f6", width: "35%" }} />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Vide */}
//       {address && !loading && all.length === 0 && (
//         <div className="ghost" style={{ padding: 16, borderRadius: 10 }}>
//           Aucun titre pour l’instant. Après paiement confirmé et mint, tes NFTs apparaîtront ici.
//         </div>
//       )}

//       {/* Liste */}
//       {address && !loading && all.length > 0 && (
//         <div className="grid">
//           {all.map((x) => (
//             <div key={`${x.kind}-${x.id}`} className="card">
//               <div style={{ aspectRatio: "4 / 3", background: "#f3f4f6" }}>
//                 {x.img ? (
//                   <img
//                     src={x.img}
//                     alt={x.name}
//                     style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
//                   />
//                 ) : (
//                   <div style={{
//                     width: "100%", height: "100%", display: "flex",
//                     alignItems: "center", justifyContent: "center",
//                     color: "#9ca3af", fontSize: 12
//                   }}>
//                     Pas d’image
//                   </div>
//                 )}
//               </div>
//               <div style={{ padding: 12 }}>
//                 <div style={{ fontWeight: 800 }}>{x.name}</div>
//                 {x.desc && <div style={{ color: "var(--sub)", fontSize: 12, marginTop: 4 }}>{x.desc}</div>}
//                 <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
//                   <a href={x.href} className={`btn btnSmall ${x.kind === "created" ? "btnPrimary" : "btnGhost"}`}>
//                     {x.cta}
//                   </a>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";

/* ─────────────────────────────────────────────
   Thème (même base que PropertyPage)
────────────────────────────────────────────── */
const css = `
:root{
  --bg:#ffffff; --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
  --red:#e11d2e; --red-700:#be123c;
}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink)}
a{text-decoration:none;color:inherit}
.wrap{max-width:1160px;margin:0 auto;padding:0 20px}
.h1{margin:0 0 6px;font-size:clamp(22px,3vw,28px);font-weight:900;letter-spacing:-.01em}
.badge{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 8px;background:#fff;color:var(--sub);font-weight:800}
.select,.input{border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;background:#fff}
.btn{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff;font-weight:900;cursor:pointer}
.btnSmall{padding:8px 10px;font-size:13px}
.btnGhost{background:#fff}
.btnPrimary{background:var(--red);border-color:var(--red);color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
.btnPrimary:hover{transform:translateY(-1px);background:var(--red-700);border-color:var(--red-700)}
.btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.card{position:relative;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
.status{position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:800}
.status.created{background:#fff7ed;color:#92400e;border:1px solid #fed7aa}
.status.funds{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}
.status.minted{background:#ecfdf5;color:#065f46;border:1px solid #bbf7d0}
.ghost{background:#fafafa;border:1px dashed #e5e7eb;color:#6b7280}
.err{border:1px solid #fde2e2;background:#fff6f6;color:#991b1b}
`;

/* ─────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
type Owned = { tokenId: string; tokenUri: string };
type Created = {
  investmentId: string;
  status: "created" | "funds_received" | "minted";
  tokenId?: string;
  meta?: {
    propertyId?: string;
    mode?: "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";
    units?: number;
    amountMAD?: number;
    title?: string;
    imageUrl?: string; // ✅ image du bien
  };
};

/* ─────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
function decodeDataUriJson(uri: string) {
  if (uri?.startsWith("data:application/json;base64,")) {
    try {
      return JSON.parse(atob(uri.slice("data:application/json;base64,".length)));
    } catch {
      return null;
    }
  }
  return null;
}
function ipfsToHttp(url?: string) {
  if (!url) return undefined;
  return url.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`
    : url;
}
function truncateMiddle(str?: string, keep = 6) {
  if (!str) return "—";
  return str.length <= keep * 2 + 3 ? str : `${str.slice(0, keep)}…${str.slice(-keep)}`;
}

/* ─────────────────────────────────────────────
   Page
────────────────────────────────────────────── */
export default function TokensPage() {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [owned, setOwned] = useState<Owned[]>([]);
  const [created, setCreated] = useState<Created[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>(undefined);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "owned" | "created">("all");

  async function load() {
    try {
      setErr(undefined);
      setLoading(true);

      // 1) Adresse liée (SIWE)
      const me = await fetch("http://localhost:3000/auth/me", {
        credentials: "include",
      }).then((r) => r.json());

      const addr: string | undefined = me?.address || undefined;
      setAddress(addr);

      if (!addr) {
        setOwned([]);
        setCreated([]);
        return;
      }

      // 2) NFTs possédés (on-chain)
      const o = await fetch(
        `http://localhost:3000/api/nft/owned?owner=${addr}`,
        { credentials: "include" }
      ).then((r) => r.json());
      if (!o?.ok) throw new Error(o?.error || "owned_failed");
      setOwned(o.items || []);

      // 3) Créés/pending (in-memory)
      try {
        const c = await fetch(
          `http://localhost:3000/api/nft/created?owner=${addr}`,
          { credentials: "include" }
        ).then((r) => r.json());
        if (c?.ok) setCreated(c.items || []);
        else setCreated([]);
      } catch {
        setCreated([]);
      }
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ----------- Adaptation pour la vue ----------- */
  const displayOwned = useMemo(
    () =>
      owned.map((it) => {
        const meta = decodeDataUriJson(it.tokenUri);
        return {
          kind: "owned" as const,
          id: it.tokenId,
          name: meta?.name || `Token #${it.tokenId}`,
          desc: meta?.description,
          img: ipfsToHttp(meta?.image),
          href: `/tokens/${it.tokenId}`, // si tu crées une page détail
          cta: "Voir",
          badgeClass: "minted" as const,
          badgeText: "Confirmé",
          disabled: false,
        };
      }),
    [owned]
  );

  const displayCreated = useMemo(
    () =>
      created.map((c) => {
        const title =
          c?.meta?.title ||
          (c.tokenId ? `Token #${c.tokenId}` : `Investment #${c.investmentId}`);

        // CTA + lien selon statut
        let cta = "";
        let href = "#";
        let disabled = false;
        let badgeClass: "created" | "funds" | "minted" = "created";
        let badgeText = "En attente de paiement";

        if (c.status === "created") {
          cta = "Finaliser le paiement";
          href = `/pay?investmentId=${c.investmentId}`;
          badgeClass = "created";
          badgeText = "Créé";
        } else if (c.status === "funds_received") {
          cta = "En attente de mint…";
          href = "#";
          disabled = true;
          badgeClass = "funds";
          badgeText = "Fonds reçus";
        } else {
          // minted
          cta = "Voir le NFT";
          href = c.tokenId ? `/tokens/${c.tokenId}` : "/tokens";
          badgeClass = "minted";
          badgeText = "Minté";
        }

        return {
          kind: "created" as const,
          id: c.investmentId,
          name: title,
          desc:
            c.status === "minted"
              ? "Minté"
              : c.status === "funds_received"
              ? "Paiement confirmé, en attente de mint"
              : "Créé, en attente de paiement",
          img: ipfsToHttp(c?.meta?.imageUrl), // ✅ image du bien conservée
          href,
          cta,
          disabled,
          badgeClass,
          badgeText,
        };
      }),
    [created]
  );

  const all = useMemo(() => {
    let arr = [...displayOwned, ...displayCreated];
    const qq = q.trim().toLowerCase();
    if (qq) arr = arr.filter((x) => `${x.name} ${x.desc ?? ""} ${x.id}`.toLowerCase().includes(qq));
    if (tab === "owned") arr = arr.filter((x) => x.kind === "owned");
    if (tab === "created") arr = arr.filter((x) => x.kind === "created");
    return arr;
  }, [displayOwned, displayCreated, q, tab]);

  /* ----------- Rendu ----------- */
  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 24 }}>
      <style>{css}</style>

      <h1 className="h1">Mes NFTs</h1>
      <div style={{ color: "var(--sub)", marginBottom: 14 }}>
        Titres possédés (on-chain) et créations en cours.
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center",
        justifyContent: "space-between", marginBottom: 12
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="badge">Adresse&nbsp;: {truncateMiddle(address)}</span>
          <select value={tab} onChange={(e) => setTab(e.target.value as any)} className="select">
            <option value="all">Tous</option>
            <option value="owned">Possédés</option>
            <option value="created">Créés</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un titre…"
            className="input"
          />
          <button onClick={load} className="btn btnSmall" disabled={loading}>
            {loading ? "Actualisation…" : "Actualiser"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {!address && (
        <div className="err" style={{ padding: 12, borderRadius: 10, marginBottom: 12 }}>
          Connecte & signe (SIWE) depuis le checkout pour afficher tes titres.
        </div>
      )}
      {address && err && (
        <div className="err" style={{ padding: 12, borderRadius: 10, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {/* Skeletons */}
      {address && loading && (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div style={{ height: 160, background: "#f3f4f6" }} />
              <div style={{ padding: 12 }}>
                <div style={{ height: 14, background: "#f3f4f6", width: "60%", marginBottom: 8 }} />
                <div style={{ height: 10, background: "#f3f4f6", width: "35%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vide */}
      {address && !loading && all.length === 0 && (
        <div className="ghost" style={{ padding: 16, borderRadius: 10 }}>
          Aucun titre pour l’instant. Après paiement confirmé et mint, tes NFTs apparaîtront ici.
        </div>
      )}

      {/* Liste */}
      {address && !loading && all.length > 0 && (
        <div className="grid">
          {all.map((x) => (
            <div key={`${x.kind}-${x.id}`} className="card">
              {/* Badge statut */}
              {"badgeClass" in x && x.badgeClass && (
                <span className={`status ${x.badgeClass === "funds" ? "funds" : x.badgeClass}`}>
                  {"badgeText" in x ? (x as any).badgeText : ""}
                </span>
              )}

              <div style={{ aspectRatio: "4 / 3", background: "#f3f4f6" }}>
                {x.img ? (
                  <img
                    src={x.img}
                    alt={x.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#9ca3af", fontSize: 12
                  }}>
                    Pas d’image
                  </div>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 800 }}>{x.name}</div>
                {x.desc && <div style={{ color: "var(--sub)", fontSize: 12, marginTop: 4 }}>{x.desc}</div>}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                  <a
                    href={x.href}
                    className={`btn btnSmall ${x.kind === "created" ? "btnPrimary" : "btnGhost"}`}
                    onClick={(e) => {
                      // si désactivé, on bloque la navigation
                      if ((x as any).disabled) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    aria-disabled={(x as any).disabled ? true : undefined}
                  >
                    {x.cta}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
