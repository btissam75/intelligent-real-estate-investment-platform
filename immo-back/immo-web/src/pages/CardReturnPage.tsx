// src/pages/CardReturnPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* =========================================================
   Page de retour / statut après "Payer par carte"
   - Compatible Stripe Checkout (success_url / cancel_url)
   - Polling backend jusqu'à confirmation
   - Téléchargement attestation + redirection vers NFT
========================================================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Sora:wght@600;700;800&display=swap');
:root{ --ink:#0b1220; --sub:#6b7280; --line:#eceff3; --pri:#e11d2e; --pri-700:#be123c; --ok:#065f46; }
*{box-sizing:border-box}
body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
.page{max-width:900px;margin:28px auto 40px;padding:0 18px}
.h1{font-family:Sora,Inter,sans-serif;font-weight:800;font-size:32px;margin:0 0 8px}
.p{color:var(--sub)}
.card{border:1px solid var(--line);border-radius:18px;background:#fff;padding:18px;box-shadow:0 16px 44px rgba(16,24,40,.05)}
.row{display:flex;gap:12px;align-items:flex-start}
.badge{border:1px solid #ffd4d9;background:#fff;color:var(--pri);padding:6px 10px;border-radius:999px;font-weight:800;font-size:12px}
.kv{display:grid;grid-template-columns:160px 1fr;gap:8px 12px;margin-top:8px}
.hr{height:1px;background:#f0f2f6;margin:14px 0}
.btn{border-radius:12px;padding:11px 14px;font-weight:800;cursor:pointer;border:1px solid #e5e7eb;background:#fff;color:var(--ink);position:relative;overflow:hidden}
.btn.primary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff}
.btn.ghost{border-color:#fecaca;color:var(--pri)}
.btn[disabled]{opacity:.6;cursor:not-allowed}
.flex{display:flex;gap:8px;flex-wrap:wrap}
.alert{margin-top:10px;padding:12px;border-radius:12px}
.alert.ok{background:#ecfdf5;border:1px solid #bbf7d0;color:var(--ok)}
.alert.err{background:#fff6f6;border:1px solid #fde2e2;color:#991b1b}
.spinner{width:16px;height:16px;border-radius:50%;border:2px solid #e5e7eb;border-top-color:var(--pri);animation:sp 1s linear infinite;display:inline-block;vertical-align:middle}
@keyframes sp{to{transform:rotate(360deg)}}
.small{font-size:12px;color:var(--sub)}
.center{display:flex;align-items:center;gap:8px}
`;

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (process.env as any)?.REACT_APP_API_BASE ||
  "http://localhost:3000";

// Types côté front — adaptez selon la réponse réelle du backend
interface CardStatus {
  status: "requires_action" | "processing" | "paid" | "failed" | "canceled";
  investmentId?: string;
  amount?: number;   // devise du checkout
  currency?: string; // ex: EUR
  receiptUrl?: string;    // URL Stripe (facultatif)
  attestationUrl?: string; // lien PDF (absolu ou relatif)
  nftId?: string; // id NFT si déjà émis
}

export default function CardReturnPage() {
  const nav = useNavigate();
  const q = new URLSearchParams(useLocation().search);

  // Stripe renvoie généralement success_url?session_id=cs_test_...
  const sessionId = q.get("session_id") || q.get("sessionId") || "";
  const investmentId = q.get("investmentId") || "";
  const isCanceled = q.get("canceled") === "1" || q.get("canceled") === "true";

  const [status, setStatus] = useState<CardStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [polling, setPolling] = useState<boolean>(false);

  // Helper: résout une URL d'attestation potentiellement relative
  const resolveAttestationUrl = useCallback((raw?: string) => {
    if (!raw) return undefined;
    const s = raw.trim();
    if (/^https?:\/\//i.test(s)) return s; // absolue
    // relative -> préfixe API_BASE
    return `${API_BASE}${s.startsWith("/") ? "" : "/"}${s}`;
  }, []);

  // Téléchargement attestation en blob (garde le bon nom si fourni)
  const downloadAttestation = useCallback(async () => {
    try {
      const url = resolveAttestationUrl(status?.attestationUrl);
      if (!url) throw new Error("URL attestation manquante");

      const resp = await fetch(url, { credentials: "include" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const dispo = resp.headers.get("Content-Disposition") || "";
      const match = dispo.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
      const fallback = `attestation-${status?.investmentId || "invest"}.pdf`;
      const filename = match ? decodeURIComponent(match[1]) : fallback;

      const blob = await resp.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setErr(e?.message || "Échec du téléchargement de l’attestation");
    }
  }, [status?.attestationUrl, status?.investmentId, resolveAttestationUrl]);

  // Polling exponentiel doux jusqu’à état final
  useEffect(() => {
    let stop = false;
    if (!sessionId && !investmentId) return;

    async function fetchOnce() {
      try {
        setErr(null);
        const url = sessionId
          ? `${API_BASE}/api/payments/card/status?sessionId=${encodeURIComponent(sessionId)}`
          : `${API_BASE}/api/payments/card/status?investmentId=${encodeURIComponent(investmentId)}`;
        const r = await fetch(url, { credentials: "include" });
        const data: CardStatus = await r.json();
        if (!r.ok) throw new Error((data as any)?.error || `HTTP ${r.status}`);
        setStatus(data);
        // stop si état final
        if (["paid", "failed", "canceled"].includes(data.status)) {
          setPolling(false);
          return true;
        }
        return false;
      } catch (e: any) {
        setErr(e?.message || "Erreur statut paiement");
        return false;
      }
    }

    let attempt = 0;
    let active = true;
    (async () => {
      setPolling(true);
      while (active && !stop) {
        const done = await fetchOnce();
        if (done) break;
        attempt += 1;
        const delay = Math.min(8000, 800 * Math.pow(1.4, attempt));
        await new Promise((res) => setTimeout(res, delay));
      }
      if (active) setPolling(false);
    })();

    return () => { stop = true; active = false; };
  }, [sessionId, investmentId]);

  const title = useMemo(() => {
    if (isCanceled || status?.status === "canceled") return "Paiement annulé";
    if (status?.status === "failed") return "Paiement refusé";
    if (status?.status === "paid") return "Paiement confirmé";
    return "Traitement du paiement";
  }, [status, isCanceled]);

  const subtitle = useMemo(() => {
    if (isCanceled || status?.status === "canceled") return "Vous pouvez réessayer ou choisir un autre moyen de paiement.";
    if (status?.status === "failed") return "Votre banque a refusé l’opération. Réessayez ou changez de carte.";
    if (status?.status === "paid") return "Nous générons votre attestation et votre NFT. Merci pour votre investissement.";
    return "Cela peut prendre quelques secondes pendant la validation.";
  }, [status, isCanceled]);

  const showSpinner =
    !["paid", "failed", "canceled"].includes(
      status?.status || (isCanceled ? "canceled" : "processing")
    );

  const effectiveInvestmentId = status?.investmentId || investmentId || "—";

  return (
    <div className="page">
      <style>{CSS}</style>

      <h1 className="h1">{title}</h1>
      <p className="p">{subtitle}</p>

      <div className="card" aria-live="polite">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <span className="badge"># {effectiveInvestmentId}</span>
          <div className="center">
            {showSpinner && <span className="spinner" aria-label="Chargement" />}
            {polling && <span className="small">Mise à jour en cours…</span>}
          </div>
        </div>

        <div className="kv">
          <div>Session</div>
          <div>{sessionId ? sessionId : <em>—</em>}</div>
          <div>Statut</div>
          <div>{status?.status || (isCanceled ? "canceled" : "processing")}</div>
          <div>Montant</div>
          <div>{status?.amount ? `${status.amount} ${status.currency || ""}` : <em>—</em>}</div>
        </div>

        <div className="hr" />

        {err && <div className="alert err">{err}</div>}
        {status?.status === "paid" && (
          <div className="alert ok">
            Paiement confirmé ✅. Votre NFT sera visible dans « Mes NFTs ».
          </div>
        )}

        <div className="hr" />

        <div className="flex">
          {status?.status === "paid" && (
            <>
              {status.attestationUrl && (
                <button className="btn" onClick={downloadAttestation}>
                  Télécharger l’attestation PDF
                </button>
              )}
              <button className="btn primary" onClick={() => nav("/nfts")}>
                Voir mes NFTs
              </button>
              <button
                className="btn ghost"
                onClick={() => nav(`/pay?investmentId=${encodeURIComponent(effectiveInvestmentId)}`)}
              >
                Revenir au paiement
              </button>
            </>
          )}

          {(status?.status === "failed" || isCanceled) && (
            <>
              <button
                className="btn primary"
                onClick={() => nav(`/pay?investmentId=${encodeURIComponent(effectiveInvestmentId)}`)}
              >
                Réessayer le paiement
              </button>
              <button className="btn" onClick={() => nav(-1)}>
                Retour
              </button>
            </>
          )}

          {(!status || status.status === "processing" || status.status === "requires_action") && (
            <>
              <button className="btn" onClick={() => window.location.reload()}>
                Rafraîchir
              </button>
              <button
                className="btn ghost"
                onClick={() => nav(`/pay?investmentId=${encodeURIComponent(effectiveInvestmentId)}`)}
              >
                Changer de moyen de paiement
              </button>
            </>
          )}
        </div>

        {status?.receiptUrl && status.status === "paid" && <div className="hr" />}
        {status?.receiptUrl && status.status === "paid" && (
          <div className="small">
            Reçu Stripe :{" "}
            <a href={status.receiptUrl} target="_blank" rel="noreferrer">
              ouvrir
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
