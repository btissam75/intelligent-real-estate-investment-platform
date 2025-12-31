import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div style={{minHeight:"100dvh", display:"grid", gridTemplateRows:"auto 1fr auto"}}>
      {/* Header public (rouge & blanc) */}
      <header style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(255,255,255,.9)", backdropFilter:"saturate(160%) blur(10px)",
        borderBottom:"1px solid #eceff3"
      }}>
        <div style={{maxWidth:1160, margin:"0 auto", padding:"10px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,fontWeight:900}}>
            <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#e11d2e,#ff4d61)"}}/>
            Immo<span style={{color:"#e11d2e"}}>Back</span>
          </div>
          <nav style={{display:"flex",gap:12}}>
            <Link to="/" style={lnk}>Accueil</Link>
            <Link to="/properties" style={lnk}>Biens</Link>
            <Link to="/signin" style={{...lnk, border:"1px solid #e11d2e", padding:"6px 10px", borderRadius:10, color:"#fff", background:"#e11d2e", fontWeight:800}}>
              Se connecter
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenu public */}
      <main style={{minHeight:0}}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{borderTop:"1px solid #eceff3"}}>
        <div style={{maxWidth:1160, margin:"0 auto", padding:"14px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between", color:"#6b7280", fontSize:12}}>
          <span>© {new Date().getFullYear()} ImmoBack</span>
          <div style={{display:"flex",gap:12}}>
            <a style={lnk} href="#">Conditions</a>
            <a style={lnk} href="#">Confidentialité</a>
            <a style={lnk} href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const lnk: React.CSSProperties = { color:"#0b1220", textDecoration:"none" };
