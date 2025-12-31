import React from "react";
import { TOKENS } from "../dashboard/Tokens";

/** Conteneur centré + largeur max */
export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: "100%",
      maxWidth: TOKENS.container.max,
      paddingLeft: TOKENS.container.padX,
      paddingRight: TOKENS.container.padX,
      margin: "0 auto",
      display: "grid",
      gap: TOKENS.container.gap,
    }}>
      {children}
    </div>
  );
}

/** Titre de page + sous-titre alignés */
export function TitleBar({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 48 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 20, color: TOKENS.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ marginLeft: "auto" }}>{right}</div>
    </div>
  );
}

/** Carte standardisée */
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: TOKENS.cardBg,
      border: `1px solid ${TOKENS.border}`,
      borderRadius: TOKENS.radius,
      padding: 14,
      boxShadow: TOKENS.cardShadow,
      ...style,
    }}>
      {children}
    </div>
  );
}

/** Grille standard (cols ajustables) */
export function Grid({ cols = 2, gap = 12, children }: { cols?: number; gap?: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap, gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {children}
    </div>
  );
}

/** Label + champ vertical */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, color: TOKENS.textMuted }}>{label}</div>
      {children}
    </label>
  );
}

/** Input standardisé */
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{
      height: 40, padding: "0 12px",
      border: `1px solid ${TOKENS.border}`,
      background: "#fff", borderRadius: TOKENS.radius,
      outline: "none", fontSize: 14, ...props.style
    }} />
  );
}

/** Select standardisé */
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{
      height: 40, padding: "0 12px",
      border: `1px solid ${TOKENS.border}`,
      background: "#fff", borderRadius: TOKENS.radius,
      outline: "none", fontSize: 14, ...props.style
    }} />
  );
}

/** Boutons cohérents */
export function Button({ children, variant = "primary", ...rest }:
{ children: React.ReactNode; variant?: "primary" | "ghost" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base: React.CSSProperties = {
    height: 40, padding: "0 14px", borderRadius: TOKENS.radius,
    cursor: "pointer", fontWeight: 800, fontSize: 14,
    border: "1px solid transparent",
  };
  const map: Record<string, React.CSSProperties> = {
    primary: { background: TOKENS.blue, color: "#fff", borderColor: TOKENS.blue },
    ghost:   { background: TOKENS.blueSoft, color: TOKENS.blueDark, borderColor: TOKENS.blueSoft },
    danger:  { background: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" },
  };
  return <button {...rest} style={{ ...base, ...map[variant] }}>{children}</button>;
}

/** Barre d’actions horizontale */
export function ActionBar({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>{children}</div>;
}
