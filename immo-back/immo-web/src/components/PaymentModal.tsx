import React from "react";
import PaymentCryptoPage from "../pages/PaymentCryptoPage";

export default function PaymentModal({
  open,
  onClose,
  amountEth,
  toAddress,
}: {
  open: boolean;
  onClose: () => void;
  amountEth: string;
  toAddress: string;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100000,
      }}
    >
      <div
        style={{
          width: "min(1100px, 96vw)",
          height: "min(90vh, 820px)",
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            background: "linear-gradient(135deg,#ef4444,#9333ea)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          Paiement crypto
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}
          >
            ✖
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", background: "#f9fafb" }}>
          {/* ⚠️ Adapte les props à ta version de PaymentCryptoPage */}
          <PaymentCryptoPage
            mode="sepolia"           // ou "hardhat"
            reference="CHAT-ORDER"
            amountEth={amountEth}
            toAddress={toAddress}
            ttlSeconds={15 * 60}
          />
        </div>
      </div>
    </div>
  );
}
