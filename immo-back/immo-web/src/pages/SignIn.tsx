import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const next = sp.get("next") || "/dashboard";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("http://localhost:8000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "signin_failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("auth", "1"); // ← pour tes pages publiques qui checkent ça
      nav(next);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f8fafc"}}>
      <form onSubmit={submit} style={{
        width:360,background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,
        padding:16,boxShadow:"0 10px 30px rgba(2,6,23,.06)"
      }}>
        <h1 style={{margin:0,fontSize:22,fontWeight:900}}>Se connecter</h1>
        <p style={{color:"#64748b",fontSize:13}}>Accédez à votre espace.</p>

        {err && <div style={{border:"1px solid #fecaca",background:"#fff1f2",color:"#991b1b",padding:8,borderRadius:8,marginBottom:8}}>{err}</div>}

        <label style={{fontSize:12,color:"#334155",fontWeight:700}}>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required
          style={{width:"100%",marginTop:4,marginBottom:10,padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:10}}/>

        <label style={{fontSize:12,color:"#334155",fontWeight:700}}>Mot de passe</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required
          style={{width:"100%",marginTop:4,marginBottom:12,padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:10}}/>

        <button disabled={busy} style={{
          width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid #e11d2e",
          background:"#e11d2e",color:"#fff",fontWeight:800,cursor:"pointer"
        }}>
          {busy ? "Connexion..." : "Se connecter"}
        </button>

        <div style={{marginTop:10,fontSize:12,color:"#64748b"}}>
          Pas de compte ? <a href={`/signup?next=${encodeURIComponent(next)}`} style={{color:"#e11d2e"}}>Créer un compte</a>
        </div>
      </form>
    </div>
  );
}
