import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const next = new URLSearchParams(loc.search).get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      await signup(email, password, fullName);
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Erreur de création de compte");
    } finally { setLoading(false); }
  }

  return (
    <div style={sx.page}>
      <form style={sx.card} onSubmit={onSubmit}>
        <h1 style={sx.h1}>Créer un compte</h1>
        {err && <div style={sx.err}>{err}</div>}
        <label style={sx.label}>Nom complet</label>
        <input style={sx.input} value={fullName} onChange={e=>setFullName(e.target.value)} />
        <label style={sx.label}>Email</label>
        <input style={sx.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label style={sx.label}>Mot de passe</label>
        <input style={sx.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button style={sx.btn} disabled={loading}>{loading?"Création…":"Créer le compte"}</button>
        <div style={sx.sub}>Déjà inscrit ? <Link to={`/signin?next=${encodeURIComponent(next)}`}>Se connecter</Link></div>
      </form>
    </div>
  );
}
const sx:any = {
  page:{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f8fafc"},
  card:{width:360,background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:16,boxShadow:"0 10px 30px rgba(2,6,23,.06)",display:"grid",gap:8},
  h1:{margin:0,fontSize:22,fontWeight:900,color:"#0f172a"},
  label:{fontSize:12,color:"#64748b",fontWeight:700,marginTop:6},
  input:{border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",fontSize:14},
  btn:{marginTop:8,border:"1px solid #e11d2e",background:"#e11d2e",color:"#fff",borderRadius:10,padding:"10px 12px",fontWeight:800,cursor:"pointer"},
  sub:{fontSize:12,color:"#64748b",marginTop:4},
  err:{background:"#fee2e2",border:"1px solid #fecaca",color:"#991b1b",padding:"8px 10px",borderRadius:8,fontSize:13}
};
import { signup } from "../services/auth";

// The handleSubmit function is not used and references undefined variables, so it has been removed.
