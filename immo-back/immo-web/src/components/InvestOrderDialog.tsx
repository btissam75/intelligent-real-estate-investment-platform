// immo-web/src/components/InvestOrderDialog.tsx
import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";

type MintResponse =
  | { ok: true; tokenId: string; tokenUri: string; txHash: string; blockNumber: number | null }
  | { ok: false; error: string };

function toNumber(v: string | null | undefined, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export default function InvestOrderDialog() {
  const [sp, setSp] = useSearchParams();

  // ouverture via /wallet?next=invest&propertyId=202&mode=COLLECTIVE_VAR&amount=10000
  const open = sp.get("next") === "invest";
  const propertyId = sp.get("propertyId") ?? "—";
  const mode = (sp.get("mode") || "COLLECTIVE_VAR") as
    | "SOLO"
    | "COLLECTIVE_FIXED"
    | "COLLECTIVE_VAR";

  // valeurs simulées passées dans l’URL
  const unitsFromUrl = toNumber(sp.get("units"));
  const amountFromUrl = toNumber(sp.get("amount"));

  // états UI
  const [address, setAddress] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<{ tokenId: string; txHash: string }>();

  const category = useMemo<"Achat solo" | "Location" | "Exploitation" | "Résidence" | "Fonds">(
    () => "Achat solo",
    []
  );

  const computedAmount = useMemo(() => {
    // pour SOLO, l’amount est obligatoire (p.ex prix total du bien)
    // pour COLLECTIVE_FIXED, amount = units * price (ici on laisse l’amount venant de l’URL)
    // pour COLLECTIVE_VAR, amount = montant libre saisi (ici venant de l’URL)
    return amountFromUrl > 0 ? amountFromUrl : 0;
  }, [amountFromUrl]);

  function close() {
    sp.delete("next");
    setSp(sp);
    setError(undefined);
    setResult(undefined);
  }

  async function handleMint() {
    setError(undefined);
    setResult(undefined);

    try {
      if (!window.ethereum) throw new Error("MetaMask non détecté");
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);

      // --- Construire le payload attendu par votre MintSchema ---
      // Champs requis par Zod :
      // to, tokenId, title, amount, currency, category (+ units? imageIpfs? etc.)
      const tokenId = Date.now(); // pour dev : un id unique. En prod, génère côté serveur.
      const title = `Bien ${propertyId}`;
      const currency = "MAD"; // ou "USDC" selon ton cas

      // units seulement pour FIXED (facultatif dans le schéma)
      const units = mode === "COLLECTIVE_FIXED" ? unitsFromUrl || 0 : undefined;

      const payload = {
        to: addr,
        tokenId,
        title,
        amount: computedAmount, // number
        currency,               // string (2..6)
        ...(units ? { units } : {}),
        category,               // "Achat solo" | ...
        // Optionnels si tu veux enrichir :
        // imageIpfs: "ipfs://.../image.png",
        // pdfIpfs: "ipfs://.../contrat.pdf",
        // pdfSha256: "abc123...",
        // positionUrl: `${window.location.origin}/dashboard/positions/${propertyId}`,
      };

      const res = await fetch("/api/nft/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as MintResponse;
      if (!res.ok || !("ok" in json) || !json.ok) {
        const msg = (json as any)?.error || "mint_failed";
        throw new Error(msg);
      }

      setResult({ tokenId: json.tokenId, txHash: json.txHash });
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 60,
      }}
      onClick={close}
    >
      <div
        className="card"
        style={{ width: 560, maxWidth: "95vw", padding: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row" style={{ marginBottom: 12 }}>
          <h2 className="h1" style={{ fontSize: 20, margin: 0 }}>
            Checkout investissement
          </h2>
          <button className="btn" onClick={close}>Fermer</button>
        </div>

        <div className="grid" style={{ gap: 6 }}>
          <div><b>Bien:</b> {propertyId}</div>
          <div><b>Mode:</b> {mode}</div>
          {mode === "COLLECTIVE_FIXED" && <div><b>Lots:</b> {unitsFromUrl || 0}</div>}
          {mode !== "COLLECTIVE_FIXED" && <div><b>Montant:</b> {computedAmount.toLocaleString()} MAD</div>}
          <div><b>Adresse:</b> {address ?? "—"}</div>

          <div className="banner" style={{ marginTop: 8 }}>
            La création du **Titre NFT** se fait côté serveur (minter custodial).  
            Ton adresse EVM sera le propriétaire du NFT.
          </div>
        </div>

        {error && (
          <div style={{ color: "#b91c1c", marginTop: 10, fontSize: 13 }}>
            Erreur: {error}
          </div>
        )}

        {result ? (
          <div className="card" style={{ marginTop: 12, borderStyle: "dashed" }}>
            <div><b>Succès !</b></div>
            <div>Token ID: {result.tokenId}</div>
            <div>Tx Hash: <a href={`https://etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer">{result.txHash}</a></div>
          </div>
        ) : (
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" onClick={handleMint} disabled={loading}>
              {loading ? "Création…" : "Créer le Titre (mint NFT)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
