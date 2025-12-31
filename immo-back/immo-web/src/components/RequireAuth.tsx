import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const token = localStorage.getItem("token"); // remplace par ton vrai contexte si besoin
  const location = useLocation();

  if (!token) {
    // Redirige vers /signin en conservant la page demandée
    return (
      <Navigate
        to={`/signin?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <Outlet />; // rend les routes enfants protégées
}
