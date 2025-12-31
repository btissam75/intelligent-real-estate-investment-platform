// src/pages/ActivityPage.tsx
import React, { useEffect, useMemo, useState } from "react";

type ChainIdHex = `0x${string}`;
type TxStatus = "pending" | "confirmed" | "failed";

type TxItem = {
  id: string;               // unique (hash)
  hash: string;
  createdAt: number;        // epoch sec
  from?: string;
  to?: string;
  amountEth?: string;       // string “0.05”
  chainId: ChainIdHex;      // “0xaa36a7” (Sepolia) / “0x1” (mainnet)…
  note?: string;            // facultatif (ex: “Paiement EcoTech”)
  status: TxStatus;
};

const CHAINS: Record<string, { name: string; explorer: string }> = {
  "0x1":       { name: "Ethereum", explorer: "https://etherscan.io" },
  "0xaa36a7":  { name: "Sepolia",  explorer: "https://sepolia.etherscan.io" },
  "0x89":      { name: "Polygon",  explorer: "https://polygonscan.com" },
};

const getEth = () => (window as any)?.ethereum as
  | {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    }
  | undefined;

function loadLog(): TxItem[] {
  try {
    return JSON.parse(localStorage.getItem("tx_log") || "[]");
  } catch {
    return [];
  }
}
function saveLog(list: TxItem[]) {
  localStorage.setItem("tx_log", JSON.stringify(list));
}

export default function ActivityPage() {
  const [items, setItems] = useState<TxItem[]>(() => loadLog());
  const [filter, setFilter] = useState<TxStatus | "all">("all");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => items
      .filter(i => (filter === "all" ? true : i.status === filter))
      .sort((a, b) => b.createdAt - a.createdAt),
    [items, filter]
  );

  // Poll les “pending”
  useEffect(() => {
    const eth = getEth();
    if (!eth) return;
    const hasPending = items.some(i => i.status === "pending");
    if (!hasPending) return;

    let stop = false;
    const tick = async () => {
      try {
        setBusy(true);
        const next = await Promise.all(
          items.map(async (it) => {
            if (it.status !== "pending") return it;
            try {
              const rcpt = await eth.request({
                method: "eth_getTransactionReceipt",
                params: [it.hash],
              });
              if (!rcpt) return it; // toujours pending
              const done: TxItem = {
                ...it,
                status: rcpt.status === "0x1" ? "confirmed" : "failed",
              };
              return done;
            } catch {
              return it;
            }
          })
        );
        if (!stop) {
          setItems(next);
          saveLog(next);
        }
      } finally {
        setBusy(false);
      }
    };

    tick();
    const id = setInterval(tick, 8000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [items]);

  const clearAll = () => {
    setItems([]);
    saveLog([]);
  };

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px", fontFamily: "Inter, system-ui" }}>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Activité</h1>
      <div style={{ color: "#6b7280", marginTop: 4 }}>Historique des transactions (local)</div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
        >
          <option value="all">Toutes</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="failed">Échouées</option>
        </select>
        <button
          onClick={clearAll}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff" }}
        >
          Vider
        </button>
        {busy && <span style={{ color: "#6b7280" }}>Rafraîchissement…</span>}
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 16, border: "1px dashed #e5e7eb", borderRadius: 12, color: "#6b7280" }}>
            Aucune transaction pour le moment.
          </div>
        ) : (
          filtered.map((tx) => {
            const chain = CHAINS[tx.chainId] || { name: `Chain ${tx.chainId}`, explorer: "" };
            const explorerUrl = chain.explorer ? `${chain.explorer}/tx/${tx.hash}` : undefined;

            return (
              <div
                key={tx.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  background: "#fff",
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {tx.amountEth ?? "—"} ETH
                    <span style={{ marginLeft: 8, color: "#6b7280", fontWeight: 600 }}>
                      → {tx.to ? short(tx.to) : "—"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                    {new Date(tx.createdAt * 1000).toLocaleString()} • {chain.name}
                    {tx.note ? ` • ${tx.note}` : ""}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Hash:&nbsp;
                    {explorerUrl ? (
                      <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color: "#0ea5e9" }}>
                        {short(tx.hash, 6)}
                      </a>
                    ) : (
                      short(tx.hash, 6)
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #e5e7eb",
                      background:
                        tx.status === "confirmed"
                          ? "#ecfdf5"
                          : tx.status === "failed"
                          ? "#fff1f2"
                          : "#f1f5f9",
                      color:
                        tx.status === "confirmed"
                          ? "#065f46"
                          : tx.status === "failed"
                          ? "#991b1b"
                          : "#334155",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {tx.status === "pending" ? "En attente" : tx.status === "confirmed" ? "Confirmée" : "Échouée"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// petit util
function short(a?: string, n = 4) {
  return a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "—";
}
