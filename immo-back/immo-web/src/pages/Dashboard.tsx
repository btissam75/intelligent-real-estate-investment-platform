import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type InvestIntent = {
  property: string;
  mode: "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";
  amount?: number;
  units?: number;
};

export default function Dashboard() {
  const nav = useNavigate();
  const { search } = useLocation();
  const [investOpen, setInvestOpen] = useState(false);
  const [intent, setIntent] = useState<InvestIntent | null>(null);

  // détecte l’intention d’investissement
  useEffect(() => {
    const q = new URLSearchParams(search);
    if (q.get("intent") === "invest") {
      const parsed: InvestIntent = {
        property: q.get("property") || "",
        mode: (q.get("mode") as any) || "SOLO",
        amount: q.get("amount") ? Number(q.get("amount")) : undefined,
        units:  q.get("units")  ? Number(q.get("units"))  : undefined,
      };
      setIntent(parsed);
      setInvestOpen(true);
    } else {
      setInvestOpen(false);
      setIntent(null);
    }
  }, [search]);

  // actions du panneau
  const handleCancel = () => {
    setInvestOpen(false);
    // retire l’intent de l’URL proprement
    nav("/dashboard", { replace: true });
  };

  const handleConfirm = async () => {
    // ici tu appelles ton backend pour créer la réservation/commande
    // ex:
    // const r = await fetch(`/api/offerings/${intent.property}/pledges`, { ... })
    // const { pledge_id } = await r.json();
    // nav(`/payments/${pledge_id}`);
    alert("Investissement confirmé (démo). Redirection paiement…");
    nav("/payments/demo"); // remplace par ta vraie route
  };

  return (
    <div className="page">
      {/* … ton contenu habituel du dashboard … */}

      {investOpen && intent && (
        <InvestDrawer intent={intent} onClose={handleCancel} onConfirm={handleConfirm} />
      )}
    </div>
  );
}

function InvestDrawer({
  intent,
  onClose,
  onConfirm,
}: {
  intent: InvestIntent;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const labelMode =
    intent.mode === "SOLO"
      ? "Achat solo"
      : intent.mode === "COLLECTIVE_FIXED"
      ? "Collectif — lots fixes"
      : "Collectif — lots variables";

  return (
    <div style={backdrop}>
      <div style={drawer}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <b>Investir — {labelMode}</b>
          <button onClick={onClose}>×</button>
        </div>

        <div style={{ marginTop: 10 }}>
          <div>Bien : <b>#{intent.property}</b></div>
          {intent.amount !== undefined && <div>Montant : <b>{intent.amount.toLocaleString()} MAD</b></div>}
          {intent.units  !== undefined &&  <div>Lots : <b>{intent.units}</b></div>}
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
            (Pré-sélection reçue depuis la fiche. Vous pouvez encore modifier ici.)
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={onClose}>Annuler</button>
          <button style={{ background: "#e11d2e", color: "#fff" }} onClick={onConfirm}>
            Confirmer et payer
          </button>
        </div>
      </div>
    </div>
  );
}

// styles rapides pour la démo
const backdrop: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(2,6,23,.35)", display: "grid", placeItems: "end", zIndex: 50,
};
const drawer: React.CSSProperties = {
  width: "min(560px, 100%)",
  background: "#fff",
  borderTopLeftRadius: 16, borderTopRightRadius: 16,
  padding: 16,
};
