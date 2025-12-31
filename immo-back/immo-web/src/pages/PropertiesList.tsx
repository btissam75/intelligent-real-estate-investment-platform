// src/pages/PropertiesList.tsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type OfferingStatus = "OPEN" | "FUNDED" | "CLOSED";
type LotsMode = "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";

export type PropertyCard = {
  id: string;
  title: string;
  city: string;
  priceMAD: number;
  status: OfferingStatus;
  lots: LotsMode;          // mode principal
  img: string;
  progress: number;        // %
};

const DATA: PropertyCard[] = [
  {
    id: "101",
    title: "F3 — Casablanca Centre",
    city: "Casablanca",
    priceMAD: 1000000,
    status: "OPEN",
    lots: "COLLECTIVE_FIXED",
    img: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
    progress: 62,
  },
  {
    id: "202",
    title: "Villa — Rabat Agdal",
    city: "Rabat",
    priceMAD: 3000000,
    status: "OPEN",
    lots: "COLLECTIVE_VAR",
    img: "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
    progress: 41,
  },
  {
    id: "303",
    title: "Studio — Marrakech Gueliz",
    city: "Marrakech",
    priceMAD: 680000,
    status: "FUNDED",
    lots: "SOLO",
    img: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop",
    progress: 100,
  },
  {
    id: "404",
    title: "Plateau — Tanger Marina",
    city: "Tanger",
    priceMAD: 2450000,
    status: "CLOSED",
    lots: "COLLECTIVE_FIXED",
    img: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1600&auto=format&fit=crop",
    progress: 100,
  },
];

export default function PropertiesList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | OfferingStatus>("ALL");

  const list = useMemo(() => {
    return DATA
      .filter(p => status === "ALL" ? true : p.status === status)
      .filter(p => q.trim()
        ? p.title.toLowerCase().includes(q.toLowerCase()) || p.city.toLowerCase().includes(q.toLowerCase())
        : true
      );
  }, [q, status]);

  return (
    <div style={sx.wrap}>
      <header style={sx.head}>
        <h1 style={sx.h1}>Biens disponibles</h1>
        <p style={sx.sub}>Accès libre : consulte la fiche. L’investissement est protégé (login requis).</p>
        <div style={sx.tools}>
          <div style={sx.search}>
            <span>🔎</span>
            <input
              placeholder="Ville ou titre…"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              style={sx.input}
            />
          </div>
          <select value={status} onChange={e=>setStatus(e.target.value as any)} style={sx.sel}>
            <option value="ALL">Tous</option>
            <option value="OPEN">Ouverts</option>
            <option value="FUNDED">Financés</option>
            <option value="CLOSED">Clôturés</option>
          </select>
        </div>
      </header>

      <div style={sx.grid}>
        {list.map(p=>(
          <article key={p.id} style={sx.card}>
            <div style={sx.coverWrap}>
              <img src={p.img} alt={p.title} style={sx.cover} />
              {p.status!=="OPEN" && <span style={sx.ribbon(p.status)}>{p.status}</span>}
            </div>
            <div style={{padding:12}}>
              <div style={sx.titleRow}>
                <div style={{minWidth:0}}>
                  <div style={sx.title}>{p.title}</div>
                  <div style={sx.meta}>{p.city}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={sx.price}>{p.priceMAD.toLocaleString()} MAD</div>
                  <div style={sx.metaSmall}>Mode: {labelLots(p.lots)}</div>
                </div>
              </div>

              <div style={{marginTop:8}}>
                <div style={sx.progress}>
                  <span style={sx.bar(p.progress)} />
                </div>
                <div style={sx.metaSmall}>{Math.round(p.progress)}% financé</div>
              </div>

              <div style={sx.actions}>
                <Link to={`/properties/${p.id}`} style={sx.btn}>
                  Voir la fiche
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {list.length===0 && <div style={sx.empty}>Aucun bien.</div>}
    </div>
  );
}

function labelLots(m: LotsMode){
  if(m==="SOLO") return "Achat solo";
  if(m==="COLLECTIVE_FIXED") return "Collectif (lots fixes)";
  return "Collectif (lots variables)";
}

const sx:Record<string,React.CSSProperties|any>={
  wrap:{maxWidth:1160,margin:"0 auto",padding:"20px 24px"},
  head:{border:"1px solid #eceff3",borderRadius:16,background:"#fff",padding:14,marginBottom:12},
  h1:{margin:0,fontSize:24,fontWeight:900,color:"#0b1220"},
  sub:{margin:"6px 0 10px",color:"#6b7280"},
  tools:{display:"flex",gap:8,flexWrap:"wrap"},
  search:{display:"flex",alignItems:"center",gap:8,border:"1px solid #eceff3",background:"#fff",borderRadius:12,padding:"8px 10px"},
  input:{border:"none",outline:"none",background:"transparent"},
  sel:{border:"1px solid #eceff3",background:"#fff",borderRadius:12,padding:"8px 10px",fontWeight:700},
  grid:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12},
  card:{border:"1px solid #eceff3",borderRadius:16,overflow:"hidden",background:"#fff"},
  coverWrap:{position:"relative",height:160,overflow:"hidden"},
  cover:{width:"100%",height:"100%",objectFit:"cover",display:"block"},
  ribbon:(s:OfferingStatus)=>({position:"absolute",left:10,top:10,borderRadius:10,padding:"4px 8px",color:"#fff",
    background: s==="FUNDED"?"#f59e0b":"#94a3b8",fontWeight:900,fontSize:12}),
  titleRow:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8},
  title:{fontWeight:900,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:440},
  meta:{fontSize:12,color:"#6b7280"},
  metaSmall:{fontSize:11,color:"#94a3a4"},
  price:{fontWeight:900,color:"#e11d2e"},
  progress:{height:8,background:"#f1f5f9",borderRadius:999,overflow:"hidden",marginTop:4},
  bar:(p:number)=>({display:"block",height:"100%",width:`${Math.max(0,Math.min(100,p))}%`,background:"linear-gradient(90deg,#fecaca,#dc2626)"}),
  actions:{display:"flex",justifyContent:"flex-end",marginTop:10},
  btn:{border:"1px solid #e11d2e",background:"#e11d2e",color:"#fff",padding:"8px 12px",borderRadius:12,fontWeight:900},
  empty:{textAlign:"center",border:"1px dashed #eceff3",borderRadius:12,padding:18,color:"#6b7280",marginTop:12},
};
