import React, { useEffect, useMemo, useState } from "react";
import { createPublicClient, http, formatEther, getAddress } from "viem";
import { mainnet, sepolia } from "viem/chains";

// Utilise MetaMask comme provider
const eth = () => (window as any).ethereum as any | undefined;

type Tx = {
  hash: string;
  from: string;
  to: string | null;
  value: string; // en wei (string decimal depuis Etherscan)
  timeStamp: string;
};

const chainById: Record<string, { name: string; viem: any; explorer: string }> = {
  "0x1": { name: "Ethereum", viem: mainnet, explorer: "https://etherscan.io" },
  "0xaa36a7": { name: "Sepolia", viem: sepolia, explorer: "https://sepolia.etherscan.io" },
};

export default function WalletDashboard() {
  const [account, setAccount] = useState<string>();
  const [chainId, setChainId] = useState<string>();
  const [balance, setBalance] = useState<string>("0");
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  const chain = chainId ? chainById[chainId] : undefined;

  // bootstrap metamask
  useEffect(() => {
    const e = eth();
    if (!e) return;

    (async () => {
      try {
        const [accs, cid] = await Promise.all([
          e.request({ method: "eth_accounts" }),
          e.request({ method: "eth_chainId" }),
        ]);
        setAccount(accs?.[0]);
        setChainId(cid);
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

  const connect = async () => {
    const e = eth();
    if (!e) {
      alert("Installe MetaMask");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    const accs: string[] = await e.request({ method: "eth_requestAccounts" });
    setAccount(accs?.[0]);
    const cid: string = await e.request({ method: "eth_chainId" });
    setChainId(cid);
  };

  const refreshBalance = async () => {
    if (!account || !chain) return;
    const client = createPublicClient({ chain: chain.viem, transport: http() });
    const b = await client.getBalance({ address: getAddress(account) });
    setBalance(formatEther(b));
  };

  const loadTxs = async () => {
    if (!account || !chain) return;
    setLoading(true);
    setStatus("");
    try {
      const network = chain.name === "Ethereum" ? "mainnet" : "sepolia";
      const r = await fetch(`/api/portfolio/txs/${account}?network=${network}`);
      const j = await r.json();
      if (j.ok) {
        const list = (j.data?.result || []) as any[];
        setTxs(
          list.slice(0, 10).map((t) => ({
            hash: t.hash,
            from: t.from,
            to: t.to,
            value: t.value,
            timeStamp: t.timeStamp,
          }))
        );
      } else {
        setStatus("Erreur chargement transactions");
      }
    } catch (e: any) {
      setStatus(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBalance().catch(() => {});
    loadTxs().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between bg-white/60 rounded-xl border p-4">
        <div>
          <div className="text-xs text-gray-500">Compte</div>
          <div className="font-mono">
            {account ? `${account.slice(0, 10)}…${account.slice(-6)}` : "—"}
          </div>
          <div className="text-xs text-gray-500">
            Réseau : {chain?.name ?? "—"} {chainId ? `(${chainId})` : ""}
          </div>
        </div>

        <div className="flex gap-2">
          {!account ? (
            <button
              onClick={connect}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white font-semibold"
            >
              Connecter MetaMask
            </button>
          ) : (
            <>
              <button
                onClick={refreshBalance}
                className="px-3 py-2 rounded-lg border bg-white"
              >
                🔄 Solde
              </button>
              {chain && (
                <a
                  className="px-3 py-2 rounded-lg border bg-white"
                  target="_blank"
                  rel="noreferrer"
                  href={`${chain.explorer}/address/${account}`}
                >
                  Explorer
                </a>
              )}
            </>
          )}
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">Solde</div>
          <div className="text-3xl font-extrabold">
            {Number(balance).toFixed(6)} {chain?.name === "Ethereum" ? "ETH" : "ETH"}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Transactions récentes</div>
            <button
              onClick={loadTxs}
              className="px-3 py-1 rounded-lg border bg-white text-sm"
            >
              Rafraîchir
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500 mt-3">Chargement…</div>
          ) : txs.length === 0 ? (
            <div className="text-sm text-gray-500 mt-3">Aucune transaction</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {txs.map((t) => (
                <li key={t.hash} className="border rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-500">
                    {new Date(Number(t.timeStamp) * 1000).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-mono">{t.from.slice(0, 8)}…</span> →
                    <span className="font-mono"> {t.to ? t.to.slice(0, 8) + "…" : "—"}</span>
                  </div>
                  <div className="text-sm">
                    Montant: <b>{Number(t.value) / 1e18} ETH</b>
                  </div>
                  {chain && (
                    <a
                      className="text-violet-600 text-sm"
                      target="_blank"
                      rel="noreferrer"
                      href={`${chain.explorer}/tx/${t.hash}`}
                    >
                      Voir sur explorer
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {status && <div className="text-sm text-rose-600 mt-2">{status}</div>}
        </div>
      </section>
    </div>
  );
}
