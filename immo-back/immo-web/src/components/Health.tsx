import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function Health() {
  const [ok, setOk] = useState<string>("…");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    apiGet<{ ok: boolean }>("/health")
      .then((j) => setOk(j.ok ? "OK" : "NOT OK"))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="card">
      <h2>API Health</h2>
      <p>Statut : <b>{ok}</b></p>
      {error && <p style={{color:"crimson"}}>Erreur: {error}</p>}
    </div>
  );
}
