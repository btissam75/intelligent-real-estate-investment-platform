// src/ui/Page.tsx
import React from "react";
import "./page.css";

/** Conteneur de page standardisé (mêmes marges/largeur que Dashboard via AppShell) */
export function Page({ children }: { children: React.ReactNode }) {
  return <div className="page">{children}</div>;
}

/** En-tête de page (titre + actions à droite) */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="page-titles">
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-sub">{subtitle}</div>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

/** Grille responsive unifiée */
export function Grid({
  cols = 3,
  children,
}: {
  cols?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

/** Carte standard (mêmes rayons/ombres/bordures) */
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

/** Ligne (entre 2 colonnes) */
export function RowBetween({ children }: { children: React.ReactNode }) {
  return <div className="row-between">{children}</div>;
}
