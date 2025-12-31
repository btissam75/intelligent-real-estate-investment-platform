// src/components/chat/ChatWidget.tsx
import React, { useEffect, useRef, useState } from "react";
import Chat from "./Chat";

/** Optionnel : forcer un thème; sinon -> détecte système */
type ChatWidgetProps = {
  theme?: "light" | "dark";
};

export default function ChatWidget({ theme }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Détection automatique si la prop theme n'est pas fournie
  const resolvedTheme: "light" | "dark" = (() => {
    if (theme) return theme;
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  })();

  // Fermer si click hors du panneau
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (open && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <>
      {/* Bouton flottant */}
      <button
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
        onClick={() => setOpen((o) => !o)}
        className="ia-fab"
      >
        💬
      </button>

      {/* Scope du widget = variables et styles **localisés** */}
      <div className={`ia-scope ia-${resolvedTheme}`}>
        {open && (
          <aside
            ref={panelRef}
            className={`ia-panel ${expanded ? "ia-panel--xl" : ""}`}
            role="dialog"
            aria-modal="true"
          >
            <header className="ia-header">
              <div className="ia-title">
                <span className="ia-logo">🤖</span> Invest-Assistant
              </div>
              <div className="ia-actions">
                <button
                  title={expanded ? "Réduire" : "Agrandir"}
                  onClick={() => setExpanded((x) => !x)}
                  className="ia-iconbtn"
                >
                  {expanded ? "↔" : "⤢"}
                </button>
                <button
                  title="Fermer"
                  onClick={() => setOpen(false)}
                  className="ia-iconbtn"
                >
                  ✖
                </button>
              </div>
            </header>

            <main className="ia-body">
              <div className="ia-tip">
                <b>Bonjour</b> 👋 Je suis votre assistant.
                <br />
                Exemples : « Simuler investissement locatif », « Je veux payer
                0.05 ETH ».
              </div>

              {/* Fenêtre de chat */}
              <Chat />
            </main>
          </aside>
        )}
      </div>

      <style>{css}</style>
    </>
  );
}

/* ------------------ CSS SCOPÉ (ne touche pas ton thème global) ------------------ */
const css = `
/* Palette **locale** au widget (scopée à .ia-scope) */
.ia-scope{
  --bg: #0b1020;
  --panel: #11162a;
  --muted: #8a93a8;
  --line: #1d2440;
  --primary: #7c3aed;
  --primary-2: #ef4444;
  --text: #e6e9ff;
  --text-strong: #ffffff;
  --bubble-me: #1c2546;
  --bubble-bot: #121a33;
  --input-bg: #0d1330;
  --fab-shadow: 0 16px 40px rgba(0,0,0,.35);
  --panel-shadow: 0 30px 80px rgba(0,0,0,.55);
}

/* Variante claire */
.ia-scope.ia-light{
  --bg: #ffffff;
  --panel: #f9fafb;
  --muted: #4b5563;
  --line: #e5e7eb;
  --text: #111827;
  --text-strong: #0b1220;
  --bubble-me: #eef2ff;
  --bubble-bot: #ffffff;
  --input-bg: #ffffff;
  --fab-shadow: 0 14px 32px rgba(0,0,0,.18);
  --panel-shadow: 0 30px 60px rgba(0,0,0,.20);
}

/* FAB flottant : hors scope pour rester visible partout */
.ia-fab{
  position: fixed;
  bottom: 22px; right: 22px;
  width: 68px; height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #ef4444);
  color: #fff;
  border: none;
  box-shadow: var(--fab-shadow, 0 16px 40px rgba(0,0,0,.35));
  font-size: 28px;
  cursor: pointer;
  z-index: 10000;
  transition: transform .2s ease;
}
.ia-fab:hover{ transform: translateY(-2px) scale(1.02); }

/* Panneau */
.ia-scope .ia-panel{
  position: fixed;
  right: 20px; bottom: 20px;
  width: 420px; height: min(80vh, 760px);
  display: flex; flex-direction: column;
  background: linear-gradient(180deg, var(--panel), var(--bg));
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  z-index: 10001;
  box-shadow: var(--panel-shadow);
  animation: iaSlideUp .18s ease-out;
  color: var(--text);
}
.ia-scope .ia-panel--xl{ width: 520px; }

@keyframes iaSlideUp{
  from{ transform: translateY(10px); opacity: 0; }
  to{ transform: translateY(0); opacity: 1; }
}

/* Mobile = plein écran */
@media (max-width: 768px){
  .ia-scope .ia-panel{
    right: 0; bottom: 0; left: 0; top: 0;
    width: 100vw; height: 100dvh;
    border-radius: 0;
  }
}

/* Header */
.ia-scope .ia-header{
  height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px;
  background: linear-gradient(135deg, rgba(26,31,59,.9), rgba(20,26,49,.9));
  color: var(--text-strong);
  border-bottom: 1px solid var(--line);
}
.ia-scope.ia-light .ia-header{
  background: linear-gradient(135deg, #eef2ff, #ffffff);
  color: #0b1220;
}
.ia-scope .ia-title{ font-weight: 800; letter-spacing: .2px; display: flex; align-items:center; gap:8px; }
.ia-scope .ia-logo{
  display:inline-grid; place-items:center; width:28px; height:28px; border-radius:8px;
  background: linear-gradient(135deg, var(--primary), #5b21b6); color:#fff;
}
.ia-scope .ia-actions{ display:flex; gap:6px; }
.ia-scope .ia-iconbtn{
  width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--line);
  color: var(--text-strong); background: rgba(14,20,48,.6); cursor: pointer;
}
.ia-scope.ia-light .ia-iconbtn{ background:#ffffff; color:#111827; }
.ia-scope .ia-iconbtn:hover{ background: rgba(18,26,59,.7); }
.ia-scope.ia-light .ia-iconbtn:hover{ background:#f3f4f6; }

/* Body */
.ia-scope .ia-body{
  flex: 1; overflow: hidden auto; padding: 14px; scrollbar-width: thin;
  scrollbar-color: #2e365f transparent;
}
.ia-scope.ia-light .ia-body{ scrollbar-color: #cbd5e1 transparent; }

.ia-scope .ia-tip{
  font-size: 13px; line-height: 1.45;
  color: var(--muted);
  background: rgba(15,22,49,.6);
  border: 1px solid var(--line);
  padding: 10px 12px; border-radius: 12px; margin-bottom: 10px;
}
.ia-scope.ia-light .ia-tip{
  background:#ffffff; border-color:#e5e7eb; color:#475569;
}
`;
