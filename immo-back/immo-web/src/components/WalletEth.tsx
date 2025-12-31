import { useState } from "react";
import { connectMetaMask } from "../lib/eth";
import { apiGet } from "../lib/api";

type EthResp = { address: string; wei: string; eth: number };

export default function WalletEth() {
  const [address, setAddress] = useState<string>("");
  const [data, setData] = useState<EthResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const onConnect = async () => {
    setErr("");
    try {
      const a = await connectMetaMask();
      setAddress(a);
      setLoading(true);
      const j = await apiGet<EthResp>(`/wallets/${a}/eth`);
      setData(j);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Wallet ETH (Sepolia)</h2>
      {!address ? (
        <button onClick={onConnect}>🔗 Connecter MetaMask</button>
      ) : (
        <p>Adresse : <code>{address}</code></p>
      )}

      {loading && <p>Chargement…</p>}
      {err && <p style={{color:"crimson"}}>Erreur: {err}</p>}

      {data && (
        <div>
          <p>ETH (wei) : {data.wei}</p>
          <p>ETH      : {data.eth}</p>
        </div>
      )}
      {!data && address && !loading && <p>Pas de données (peut-être solde = 0).</p>}
    </div>
  );
}
