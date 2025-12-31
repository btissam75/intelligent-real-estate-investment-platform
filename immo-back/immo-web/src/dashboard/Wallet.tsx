// // // // src/Wallet.tsx
// // // import React, { useEffect, useMemo, useRef, useState } from "react";
// // // import { useNavigate } from "react-router-dom";

// // // /* ─────────────────────────────────────────────
// // //    Thème & helpers (palette + tokens)
// // // ────────────────────────────────────────────── */
// // // const theme = {
// // //   bg:        "#f4f7fb",
// // //   card:      "#ffffff",
// // //   ink:       "#0f172a",
// // //   inkSub:    "#64748b",
// // //   line:      "#e5e7eb",
// // //   primary:   "#2563eb",
// // //   primaryHi: "#1d4ed8",
// // //   accent:    "#06b6d4",
// // //   success:   "#10b981",
// // //   warn:      "#f59e0b",
// // // };

// // // const css = `
// // // :root{
// // //   --bg:${theme.bg}; --card:${theme.card};
// // //   --ink:${theme.ink}; --ink-sub:${theme.inkSub};
// // //   --line:${theme.line}; --pri:${theme.primary}; --pri-hi:${theme.primaryHi};
// // //   --acc:${theme.accent}; --ok:${theme.success}; --warn:${theme.warn};
// // // }
// // // .fade{animation:fade .28s ease-out both}
// // // .lift{transition:transform .14s ease, box-shadow .14s ease}
// // // .lift:hover{transform:translateY(-2px); box-shadow:0 10px 24px rgba(2,6,23,.06)}
// // // .ripple{position:absolute; inset:0; border-radius:inherit; overflow:hidden; pointer-events:none}
// // // .ripple>span{position:absolute;border-radius:9999px;transform:scale(0);background:rgba(255,255,255,.45);opacity:.8}
// // // .ripple.show>span{animation:rip .55s ease-out forwards}
// // // .skel{display:inline-block; border-radius:8px; background:linear-gradient(90deg,#eef2f7 0%,#e7ebf2 40%,#eef2f7 80%); background-size:200% 100%; animation:sk 1.1s linear infinite; min-width:8ch; min-height:1em}
// // // @keyframes rip{to{transform:scale(3);opacity:0}}
// // // @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
// // // @keyframes sk{from{background-position:200% 0}to{background-position:-200% 0}}
// // // @media (prefers-reduced-motion:reduce){.fade,.lift,.ripple.show>span,.skel{animation:none!important;transition:none!important}}
// // // `;

// // // type ChainKind = "evm" | "solana" | "other";
// // // type Asset = { id:string; symbol:string; name:string; chain:ChainKind; decimals:number; logo?:string };
// // // type Balance = { assetId:string; amount:string };
// // // type Rates = Record<string, number>;

// // // const ASSETS: Asset[] = [
// // //   { id:"eth",  symbol:"ETH",  name:"Ethereum", chain:"evm",    decimals:18, logo:"🟣" },
// // //   { id:"usdc", symbol:"USDC", name:"USD Coin", chain:"evm",    decimals:6,  logo:"🪙" },
// // //   { id:"dai",  symbol:"DAI",  name:"Dai",      chain:"evm",    decimals:18, logo:"🟡" },
// // //   { id:"sol",  symbol:"SOL",  name:"Solana",   chain:"solana", decimals:9,  logo:"🟩" },
// // // ];

// // // /* utils numériques */
// // // function toHuman(raw:string,dec:number,prec=6){
// // //   const neg=raw.startsWith("-"); const s=neg?raw.slice(1):raw;
// // //   const pad=s.padStart(dec+1,"0"); const int=pad.slice(0,-dec)||"0";
// // //   const frac=pad.slice(-dec).replace(/0+$/,"").slice(0,prec)||"0";
// // //   return `${neg?"-":""}${int}${frac==="0"?"":"."+frac}`;
// // // }
// // // const toFiat=(raw:string,dec:number,rate:number)=>Number(toHuman(raw,dec,12))*rate;
// // // const short=(a?:string,n=4)=>a?`${a.slice(0,2+n)}…${a.slice(-n)}`:"—";
// // // const chainName=(cid?:string)=>(
// // //   cid==="0x1"?"Ethereum":cid==="0xaa36a7"?"Sepolia":cid==="0x89"?"Polygon":
// // //   cid==="0xa"?"Optimism":cid==="0x2105"?"Base":cid?`Chain ${parseInt(cid,16)}`:"—"
// // // );

// // // /* mini toast maison */
// // // function useToast(){
// // //   const [msg,setMsg]=useState<string>(); const [type,setType]=useState<"ok"|"warn">("ok");
// // //   const show = (m:string,t:"ok"|"warn"="ok")=>{setType(t);setMsg(m);setTimeout(()=>setMsg(undefined),1600)};
// // //   const el = msg ? (
// // //     <div style={{
// // //       position:"fixed", right:16, bottom:16, zIndex:50,
// // //       background:"var(--card)", border:`1px solid ${type==="ok"?"#bbf7d0":"#fde68a"}`,
// // //       color:type==="ok"?"#065f46":"#92400e", padding:"10px 14px",
// // //       borderRadius:12, boxShadow:"0 10px 30px rgba(2,6,23,.12)"
// // //     }} className="fade">
// // //       {msg}
// // //     </div>
// // //   ) : null;
// // //   return { show, el };
// // // }

// // // /* ─────────────────────────────────────────────
// // //    Page
// // // ────────────────────────────────────────────── */
// // // export default function Wallet(){
// // //   const nav = useNavigate();
// // //   const toast = useToast();
// // //   const [refCcy,setRefCcy]=useState<"EUR"|"USD"|"MAD">("EUR");

// // //   const [hasMM,setHasMM]=useState(false);
// // //   const [account,setAccount]=useState<string|undefined>();
// // //   const [chainId,setChainId]=useState<string|undefined>();
// // //   const [loadingEth,setLoadingEth]=useState(false);

// // //   const [balances,setBalances]=useState<Balance[]>([
// // //     { assetId:"eth",  amount:"0" },
// // //     { assetId:"usdc", amount:"15230000" },
// // //     { assetId:"dai",  amount:"501234000000000000000" },
// // //     { assetId:"sol",  amount:"345600000" },
// // //   ]);

// // //   const rates:Rates = useMemo(()=>{
// // //     const base:Rates={ eth:2900, usdc:0.92, dai:0.92, sol:130 }; // EUR
// // //     if(refCcy==="EUR") return base;
// // //     if(refCcy==="USD"){ const fx=1.08; return mapRates(base,v=>v*fx); }
// // //     const fx=10.8; return mapRates(base,v=>v*fx); // MAD
// // //   },[refCcy]);
// // //   function mapRates(r:Rates,f:(v:number)=>number){ return Object.fromEntries(Object.entries(r).map(([k,v])=>[k,f(v)])); }

// // //   /* MetaMask */
// // //   useEffect(()=>{
// // //     const eth=(window as any).ethereum;
// // //     setHasMM(Boolean(eth)); if(!eth) return;
// // //     Promise.all([eth.request({method:"eth_accounts"}), eth.request({method:"eth_chainId"})])
// // //       .then(([accs,cid]:[string[],string])=>{ setAccount(accs?.[0]); setChainId(cid); })
// // //       .catch(()=>{});
// // //     const onA=(a:string[])=>setAccount(a?.[0]); const onC=(c:string)=>setChainId(c);
// // //     eth.on?.("accountsChanged",onA); eth.on?.("chainChanged",onC);
// // //     return ()=>{ eth.removeListener?.("accountsChanged",onA); eth.removeListener?.("chainChanged",onC); };
// // //   },[]);

// // //   /* solde ETH depuis backend */
// // //   useEffect(()=>{
// // //     if(!account) return;
// // //     setLoadingEth(true);
// // //     (async()=>{
// // //       try{
// // //         const r = await fetch(`http://localhost:3000/wallets/${account}/eth`);
// // //         const j = await r.json(); // { wei }
// // //         if(j?.wei){
// // //           setBalances(prev=>prev.map(b=>b.assetId==="eth"?{...b,amount:String(j.wei)}:b));
// // //         }
// // //       }catch(e){ toast.show("Impossible de charger le solde ETH","warn"); }
// // //       finally{ setLoadingEth(false); }
// // //     })();
// // //   },[account]);

// // //   const totalFiat = useMemo(()=>balances.reduce((s,b)=>{
// // //     const a=ASSETS.find(x=>x.id===b.assetId)!;
// // //     return s + toFiat(b.amount, a.decimals, rates[b.assetId]||0);
// // //   },0),[balances,rates]);

// // //   /* ripple generique */
// // //   const ripple = (e:React.MouseEvent<HTMLButtonElement>)=>{
// // //     const host=e.currentTarget.querySelector(".ripple") as HTMLDivElement;
// // //     if(!host) return;
// // //     host.classList.remove("show");
// // //     // Force reflow
// // //     // @ts-ignore
// // //     void host.offsetWidth;
// // //     const span=host.firstElementChild as HTMLSpanElement;
// // //     const d=Math.max(host.clientWidth,host.clientHeight);
// // //     const rect=host.getBoundingClientRect();
// // //     span.style.width=span.style.height=`${d}px`;
// // //     span.style.left=`${e.clientX-rect.left-d/2}px`;
// // //     span.style.top =`${e.clientY-rect.top -d/2}px`;
// // //     host.classList.add("show");
// // //   };

// // //   const connect = async (e:React.MouseEvent<HTMLButtonElement>)=>{
// // //     ripple(e);
// // //     const eth=(window as any).ethereum;
// // //     if(!eth) return toast.show("MetaMask non détecté","warn");
// // //     try{
// // //       const accs:string[] = await eth.request({method:"eth_requestAccounts"});
// // //       setAccount(accs?.[0]);
// // //       const cid:string = await eth.request({method:"eth_chainId"});
// // //       setChainId(cid);
// // //       toast.show("Connecté à MetaMask");
// // //     }catch(err:any){
// // //       toast.show(err?.message ?? "Connexion refusée","warn");
// // //     }
// // //   };

// // //   /* UI */
// // //   return (
// // //     <>
// // //       <style>{css}</style>
// // //       {toast.el}

// // //       {/* header compact */}
// // //       <div style={sx.header} className="fade">
// // //         <h1 style={sx.h1}>Mon Wallet</h1>
// // //         <div style={{display:"flex",gap:8,alignItems:"center"}}>
// // //           {account ? (
// // //             <div style={sx.pill}>
// // //               <span style={sx.dot} />
// // //               <b>{chainName(chainId)}</b>
// // //               <span style={{opacity:.6}}>•</span>
// // //               <span style={{fontFamily:"ui-monospace"}}>{short(account)}</span>
// // //             </div>
// // //           ) : (
// // //             <button style={sx.btnPrimary} onClick={connect} aria-label="Connect MetaMask">
// // //               Connect
// // //               <div className="ripple"><span/></div>
// // //             </button>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {/* contrôles */}
// // //       <div style={sx.grid2} className="fade">
// // //         <Card>
// // //           <RowBetween>
// // //             <RowLeft>
// // //               <Badge>✓</Badge>
// // //               <div style={sx.label}>Reference currency</div>
// // //             </RowLeft>
// // //             <button
// // //               style={sx.select}
// // //               onClick={()=>setRefCcy(refCcy==="EUR"?"USD":refCcy==="USD"?"MAD":"EUR")}
// // //               aria-label="Change currency"
// // //             >
// // //               {refCcy} ▾
// // //             </button>
// // //           </RowBetween>
// // //         </Card>

// // //         <Card>
// // //           <RowBetween>
// // //             <RowLeft>
// // //               <Badge>{hasMM?"🦊":"⚠️"}</Badge>
// // //               <div style={sx.label}>MetaMask</div>
// // //             </RowLeft>
// // //             <div style={{display:"flex",gap:8,alignItems:"center"}}>
// // //               {account ? (
// // //                 <>
// // //                   <span style={sx.tagOk}>{chainName(chainId)}</span>
// // //                   <Mono text={short(account)} copy={account} onCopy={()=>toast.show("Adresse copiée")} />
// // //                 </>
// // //               ) : (
// // //                 <button style={sx.btnGhost} onClick={connect}>Connect</button>
// // //               )}
// // //             </div>
// // //           </RowBetween>
// // //         </Card>
// // //       </div>

// // //       {/* adresses */}
// // //       <Section title="Main address (EVM)">
// // //         <Addr text={account || "—"} canCopy onCopy={()=>toast.show("Adresse copiée")} />
// // //       </Section>

// // //       <Section title="Solana address (à connecter plus tard)">
// // //         <Addr text="Phantom/Backpack non connecté" disabled />
// // //       </Section>

// // //       {/* portfolio */}
// // //       <div style={{marginTop:12}}>
// // //         <div style={sx.section}>Portfolio</div>
// // //         <div style={{display:"grid",gap:8}}>
// // //           {balances.map(b=>{
// // //             const a=ASSETS.find(x=>x.id===b.assetId)!;
// // //             const fiat=toFiat(b.amount, a.decimals, rates[a.id]||0);
// // //             const human=toHuman(b.amount, a.decimals);
// // //             const loading = loadingEth && a.id==="eth";
// // //             return (
// // //               <div key={a.id} style={sx.assetRow} className="lift">
// // //                 <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
// // //                   <div style={sx.assetLogo}>{a.logo ?? "◻️"}</div>
// // //                   <div style={{minWidth:0}}>
// // //                     <div style={{display:"flex",alignItems:"center",gap:8}}>
// // //                       <b>{a.symbol}</b>
// // //                       <span style={sx.chainBadge}>{a.chain.toUpperCase()}</span>
// // //                     </div>
// // //                     <div style={sx.sub}>{a.name}</div>
// // //                   </div>
// // //                 </div>
// // //                 <div style={{textAlign:"right"}}>
// // //                   <div style={{fontWeight:900}}>
// // //                     {loading ? <span className="skel" /> : human}
// // //                   </div>
// // //                   <div style={sx.sub}>
// // //                     {fiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}
// // //                   </div>
// // //                   {a.chain!=="evm" && <div style={{marginTop:6}}><span style={sx.badgeMuted}>Connect Phantom</span></div>}
// // //                 </div>
// // //               </div>
// // //             );
// // //           })}
// // //         </div>
// // //       </div>

// // //       {/* total + actions */}
// // //       <div style={sx.total}>
// // //         <div style={sx.sub}>Total</div>
// // //         <div style={{fontWeight:900,fontSize:22}}>
// // //           {totalFiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}
// // //         </div>
// // //       </div>

// // //       <div style={sx.actions}>
// // //         <Btn onClick={()=>nav("/deposit")}>Deposit</Btn>
// // //         <Btn onClick={()=>nav("/withdraw")}>Withdraw</Btn>
// // //         <Btn onClick={()=>nav("/transfer")}>Transfer</Btn>
// // //         <Btn onClick={()=>nav("/activity")}>Activity</Btn>
// // //         <Btn onClick={()=>nav("/tokens")}>Tokens</Btn>
// // //         <Btn onClick={()=>nav("/settings")}>Settings</Btn>
// // //       </div>

// // //       <div style={{marginTop:8,color:"var(--ink-sub)",fontSize:12}}>
// // //         * Solde ETH connecté au backend. Les autres montants sont simulés.
// // //       </div>
// // //     </>
// // //   );
// // // }

// // // /* ─────────────────────────────────────────────
// // //    Sous-composants UI
// // // ────────────────────────────────────────────── */
// // // function Card({children}:{children:React.ReactNode}){ return <div style={sx.card}>{children}</div>; }
// // // function RowBetween({children}:{children:React.ReactNode}){ return <div style={sx.between}>{children}</div>; }
// // // function RowLeft({children}:{children:React.ReactNode}){ return <div style={sx.rowLeft}>{children}</div>; }
// // // function Badge({children}:{children:React.ReactNode}){ return <div style={sx.badge}>{children}</div>; }

// // // function Section({title,children}:{title:string;children:React.ReactNode}){
// // //   return (
// // //     <div className="fade" style={{marginTop:8}}>
// // //       <div style={sx.section}>{title}</div>
// // //       {children}
// // //     </div>
// // //   );
// // // }

// // // function Mono({text,copy,onCopy}:{text:string;copy?:string;onCopy?:()=>void}){
// // //   const [ok,setOk]=useState(false);
// // //   return (
// // //     <div style={sx.mono}>
// // //       <span style={{whiteSpace:"nowrap"}}>{text}</span>
// // //       {copy && (
// // //         <button
// // //           style={sx.copy}
// // //           onClick={()=>{navigator.clipboard.writeText(copy); setOk(true); onCopy?.(); setTimeout(()=>setOk(false),900);}}
// // //           aria-label="Copy"
// // //         >{ok?"✓":"⧉"}</button>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // function Addr({text,canCopy,disabled,onCopy}:{text:string;canCopy?:boolean;disabled?:boolean;onCopy?:()=>void}){
// // //   const [ok,setOk]=useState(false);
// // //   return (
// // //     <div style={{...sx.addr,opacity:disabled?0.6:1}} className="lift">
// // //       <div style={sx.addrL}>
// // //         <div style={sx.addrIc}>⚙️</div>
// // //         <span style={sx.addrTxt}>{text}</span>
// // //       </div>
// // //       <div style={{display:"flex",gap:6}}>
// // //         <button style={sx.sq} title="QR" disabled>▣</button>
// // //         <button
// // //           style={sx.sq}
// // //           title="Copy"
// // //           disabled={!canCopy}
// // //           onClick={()=>{ if(!canCopy) return; navigator.clipboard.writeText(text); setOk(true); onCopy?.(); setTimeout(()=>setOk(false),900); }}
// // //         >
// // //           {ok?"✓":"⧉"}
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // function Btn({children,onClick}:{children:React.ReactNode;onClick:React.MouseEventHandler<HTMLButtonElement>}){
// // //   const on = (e:React.MouseEvent<HTMLButtonElement>)=>{
// // //     const host=e.currentTarget.querySelector(".ripple") as HTMLDivElement;
// // //     if(!host) return; host.classList.remove("show"); // reflow
// // //     // @ts-ignore
// // //     void host.offsetWidth;
// // //     const span=host.firstElementChild as HTMLSpanElement;
// // //     const d=Math.max(host.clientWidth,host.clientHeight);
// // //     const rect=host.getBoundingClientRect();
// // //     span.style.width=span.style.height=`${d}px`;
// // //     span.style.left=`${e.clientX-rect.left-d/2}px`;
// // //     span.style.top =`${e.clientY-rect.top -d/2}px`;
// // //     host.classList.add("show");
// // //   };
// // //   return (
// // //     <button style={sx.btnAction} onClick={(e)=>{on(e); onClick(e);}}>
// // //       {children}
// // //       <div className="ripple"><span/></div>
// // //     </button>
// // //   );
// // // }

// // // /* ─────────────────────────────────────────────
// // //    Styles
// // // ────────────────────────────────────────────── */
// // // const sx:Record<string,React.CSSProperties>={
// // //   header:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8},
// // //   h1:{margin:0,fontWeight:900,color:"var(--ink)",fontSize:20},

// // //   pill:{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 10px",
// // //     border:"1px solid var(--line)",borderRadius:999,background:"var(--card)",color:"var(--ink)"},
// // //   dot:{width:8,height:8,borderRadius:999,background:"var(--ok)",display:"inline-block"},

// // //   grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
// // //   card:{border:"1px solid var(--line)",borderRadius:14,background:"var(--card)",padding:10},
// // //   between:{display:"flex",alignItems:"center",justifyContent:"space-between"},
// // //   rowLeft:{display:"flex",alignItems:"center",gap:8},
// // //   label:{fontSize:13,color:"var(--ink)",fontWeight:800},
// // //   badge:{width:22,height:22,borderRadius:999,display:"grid",placeItems:"center",background:"#e0e7ff",color:"#1e3a8a",fontSize:12,fontWeight:900},

// // //   select:{border:"1px solid var(--line)",background:"var(--card)",borderRadius:12,padding:"6px 10px",cursor:"pointer",fontWeight:800},
// // //   tagOk:{background:"#ecfdf5",border:"1px solid #bbf7d0",color:"#065f46",borderRadius:10,padding:"6px 10px",fontWeight:800},

// // //   section:{fontSize:12,color:"var(--ink-sub)",margin:"10px 2px 6px",fontWeight:800},

// // //   addr:{border:"1px solid var(--line)",borderRadius:12,padding:"10px",background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"space-between"},
// // //   addrL:{display:"flex",alignItems:"center",gap:8,minWidth:0},
// // //   addrIc:{width:24,height:24,borderRadius:999,display:"grid",placeItems:"center",background:"#f1f5f9",fontSize:12},
// // //   addrTxt:{fontSize:14,color:"var(--ink)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:620},
// // //   sq:{width:32,height:32,border:"1px solid var(--line)",background:"var(--card)",borderRadius:8,cursor:"pointer"},

// // //   assetRow:{border:"1px solid var(--line)",borderRadius:12,padding:10,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"space-between"},
// // //   assetLogo:{width:32,height:32,borderRadius:999,display:"grid",placeItems:"center",background:"#f1f5f9",fontSize:16},
// // //   chainBadge:{fontSize:10,color:"#475569",border:"1px solid var(--line)",borderRadius:999,padding:"2px 6px",fontWeight:800},
// // //   sub:{fontSize:12,color:"var(--ink-sub)"},
// // //   badgeMuted:{fontSize:10,color:"#475569",border:"1px dashed var(--line)",borderRadius:999,padding:"2px 6px"},

// // //   total:{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginTop:10,borderTop:"1px dashed var(--line)",paddingTop:10},

// // //   mono:{display:"flex",alignItems:"center",gap:8,border:"1px solid var(--line)",borderRadius:8,padding:"6px 8px",
// // //     fontFamily:'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'},
// // //   copy:{width:26,height:26,border:"1px solid var(--line)",background:"var(--card)",borderRadius:6,cursor:"pointer"},

// // //   actions:{display:"grid",gridTemplateColumns:"repeat(6,minmax(0,1fr))",gap:8,marginTop:12},
// // //   btnAction:{position:"relative",overflow:"hidden",border:"1px solid var(--line)",background:"var(--card)",color:"var(--ink)",borderRadius:12,padding:"10px 0",cursor:"pointer",fontWeight:900},
// // //   btnGhost:{border:"1px solid var(--line)",background:"var(--card)",borderRadius:10,padding:"8px 12px",cursor:"pointer",fontWeight:900},
// // //   btnPrimary:{position:"relative",overflow:"hidden",border:"1px solid var(--pri)",background:"var(--pri)",color:"#fff",borderRadius:12,padding:"10px 14px",cursor:"pointer",fontWeight:900},
// // // };
// // // src/Wallet.tsx
// // import React, { useEffect, useMemo, useState } from "react";
// // import { useNavigate } from "react-router-dom";

// // /* ─────────────────────────────────────────────
// //    Thème & helpers (palette + tokens)
// // ────────────────────────────────────────────── */
// // const theme = {
// //   bg:"#f4f7fb", card:"#ffffff", ink:"#0f172a", inkSub:"#64748b", line:"#e5e7eb",
// //   primary:"#2563eb", primaryHi:"#1d4ed8", accent:"#06b6d4", success:"#10b981", warn:"#f59e0b",
// // };

// // const css = `
// // :root{
// //   --bg:${theme.bg}; --card:${theme.card};
// //   --ink:${theme.ink}; --ink-sub:${theme.inkSub};
// //   --line:${theme.line}; --pri:${theme.primary}; --pri-hi:${theme.primaryHi};
// //   --acc:${theme.accent}; --ok:${theme.success}; --warn:${theme.warn};
// // }
// // .fade{animation:fade .28s ease-out both}
// // .lift{transition:transform .14s ease, box-shadow .14s ease}
// // .lift:hover{transform:translateY(-2px); box-shadow:0 10px 24px rgba(2,6,23,.06)}
// // .ripple{position:absolute; inset:0; border-radius:inherit; overflow:hidden; pointer-events:none}
// // .ripple>span{position:absolute;border-radius:9999px;transform:scale(0);background:rgba(255,255,255,.45);opacity:.8}
// // .ripple.show>span{animation:rip .55s ease-out forwards}
// // .skel{display:inline-block; border-radius:8px; background:linear-gradient(90deg,#eef2f7 0%,#e7ebf2 40%,#eef2f7 80%); background-size:200% 100%; animation:sk 1.1s linear infinite; min-width:8ch; min-height:1em}
// // @keyframes rip{to{transform:scale(3);opacity:0}}
// // @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
// // @keyframes sk{from{background-position:200% 0}to{background-position:-200% 0}}
// // @media (prefers-reduced-motion:reduce){.fade,.lift,.ripple.show>span,.skel{animation:none!important;transition:none!important}}
// // `;

// // /* ─────────────────────────────────────────────
// //    Types
// // ────────────────────────────────────────────── */
// // type ChainKind = "evm" | "solana" | "other";
// // type Asset = { id:string; symbol:string; name:string; chain:ChainKind; decimals:number; logo?:string };
// // type Balance = { assetId:string; amount:string };
// // type Rates = Record<string, number>;

// // /* assets démo */
// // const ASSETS: Asset[] = [
// //   { id:"eth",  symbol:"ETH",  name:"Ethereum", chain:"evm",    decimals:18, logo:"🟣" },
// //   { id:"usdc", symbol:"USDC", name:"USD Coin", chain:"evm",    decimals:6,  logo:"🪙" },
// //   { id:"dai",  symbol:"DAI",  name:"Dai",      chain:"evm",    decimals:18, logo:"🟡" },
// //   { id:"sol",  symbol:"SOL",  name:"Solana",   chain:"solana", decimals:9,  logo:"🟩" },
// // ];

// // /* utils numériques */
// // function toHuman(raw:string,dec:number,prec=6){
// //   if(!raw) return "0";
// //   const neg=raw.startsWith("-"); const s=neg?raw.slice(1):raw;
// //   const pad=s.padStart(dec+1,"0"); const int=pad.slice(0,-dec)||"0";
// //   const frac=pad.slice(-dec).replace(/0+$/,"").slice(0,prec)||"0";
// //   return `${neg?"-":""}${int}${frac==="0"?"":"."+frac}`;
// // }
// // const toFiat=(raw:string,dec:number,rate:number)=>Number(toHuman(raw,dec,12))*rate;
// // const short=(a?:string,n=4)=>a?`${a.slice(0,2+n)}…${a.slice(-n)}`:"—";
// // const chainName=(cid?:string)=>(
// //   cid==="0x1"?"Ethereum":cid==="0xaa36a7"?"Sepolia":cid==="0x89"?"Polygon":
// //   cid==="0xa"?"Optimism":cid==="0x2105"?"Base":cid?`Chain ${parseInt(cid,16)}`:"—"
// // );

// // /* mini toast maison */
// // function useToast(){
// //   const [msg,setMsg]=useState<string>(); const [type,setType]=useState<"ok"|"warn">("ok");
// //   const show = (m:string,t:"ok"|"warn"="ok")=>{setType(t);setMsg(m);setTimeout(()=>setMsg(undefined),1600)};
// //   const el = msg ? (
// //     <div style={{
// //       position:"fixed", right:16, bottom:16, zIndex:50,
// //       background:"var(--card)", border:`1px solid ${type==="ok"?"#bbf7d0":"#fde68a"}`,
// //       color:type==="ok"?"#065f46":"#92400e", padding:"10px 14px",
// //       borderRadius:12, boxShadow:"0 10px 30px rgba(2,6,23,.12)"
// //     }} className="fade">
// //       {msg}
// //     </div>
// //   ) : null;
// //   return { show, el };
// // }

// // /* ─────────────────────────────────────────────
// //    Page
// // ────────────────────────────────────────────── */
// // export default function Wallet(){
// //   const nav = useNavigate();
// //   const toast = useToast();

// //   const [refCcy,setRefCcy]=useState<"EUR"|"USD"|"MAD">("EUR");
// //   const [hasMM,setHasMM]=useState(false);
// //   const [account,setAccount]=useState<string|undefined>();
// //   const [chainId,setChainId]=useState<string|undefined>();
// //   const [loadingEth,setLoadingEth]=useState(false);

// //   const [balances,setBalances]=useState<Balance[]>([
// //     { assetId:"eth",  amount:"0" },                        // ETH = connecté au backend
// //     { assetId:"usdc", amount:"15230000" },                 // 15.23 USDC (démo)
// //     { assetId:"dai",  amount:"501234000000000000000" },    // 501.234 DAI (démo)
// //     { assetId:"sol",  amount:"345600000" },                // 0.3456 SOL (démo)
// //   ]);

// //   /* taux fiat (EUR de base) -> refCcy */
// //   const rates:Rates = useMemo(()=>{
// //     const base:Rates={ eth:2900, usdc:0.92, dai:0.92, sol:130 }; // EUR
// //     if(refCcy==="EUR") return base;
// //     if(refCcy==="USD"){ const fx=1.08; return mapRates(base,v=>v*fx); }
// //     const fx=10.8; return mapRates(base,v=>v*fx); // MAD
// //   },[refCcy]);
// //   function mapRates(r:Rates,f:(v:number)=>number){ return Object.fromEntries(Object.entries(r).map(([k,v])=>[k,f(v)])); }

// //   /* MetaMask init & listeners */
// //   useEffect(()=>{
// //     const eth=(window as any).ethereum;
// //     setHasMM(Boolean(eth)); if(!eth) return;

// //     Promise.all([eth.request({method:"eth_accounts"}), eth.request({method:"eth_chainId"})])
// //       .then(([accs,cid]:[string[],string])=>{
// //         const addr=accs?.[0];
// //         setAccount(addr); setChainId(cid);
// //       })
// //       .catch(()=>{});

// //     const onA=(a:string[])=>setAccount(a?.[0]);
// //     const onC=(c:string)=>setChainId(c);
// //     eth.on?.("accountsChanged",onA);
// //     eth.on?.("chainChanged",onC);
// //     return ()=>{ eth.removeListener?.("accountsChanged",onA); eth.removeListener?.("chainChanged",onC); };
// //   },[]);

// //   /* solde ETH depuis backend (account change) */
// //   useEffect(()=>{
// //     if(!account) return;
// //     setLoadingEth(true);
// //     (async()=>{
// //       try{
// //         const r = await fetch(`http://localhost:3000/wallets/${account}/eth`);
// //         const j = await r.json(); // { wei }
// //         if(j?.wei){
// //           setBalances(prev=>prev.map(b=>b.assetId==="eth"?{...b,amount:String(j.wei)}:b));
// //         }
// //       }catch(e){ toast.show("Impossible de charger le solde ETH","warn"); }
// //       finally{ setLoadingEth(false); }
// //     })();
// //   },[account]);

// //   const totalFiat = useMemo(()=>balances.reduce((s,b)=>{
// //     const a=ASSETS.find(x=>x.id===b.assetId)!;
// //     return s + toFiat(b.amount, a.decimals, rates[b.assetId]||0);
// //   },0),[balances,rates]);

// //   /* ripple util */
// //   const ripple = (e:React.MouseEvent<HTMLButtonElement>)=>{
// //     const host=e.currentTarget.querySelector(".ripple") as HTMLDivElement;
// //     if(!host) return; host.classList.remove("show");
// //     // @ts-ignore
// //     void host.offsetWidth;
// //     const span=host.firstElementChild as HTMLSpanElement;
// //     const d=Math.max(host.clientWidth,host.clientHeight);
// //     const rect=host.getBoundingClientRect();
// //     span.style.width=span.style.height=`${d}px`;
// //     span.style.left=`${e.clientX-rect.left-d/2}px`;
// //     span.style.top =`${e.clientY-rect.top -d/2}px`;
// //     host.classList.add("show");
// //   };

// //   /* Connect / Disconnect */
// //   const connect = async (e?:React.MouseEvent<HTMLButtonElement>)=>{
// //     if(e) ripple(e);
// //     const eth=(window as any).ethereum;
// //     if(!eth) return toast.show("MetaMask non détecté","warn");
// //     try{
// //       // demande la permission & récupère le compte
// //       await eth.request({method:"wallet_requestPermissions", params:[{eth_accounts:{}}]});
// //       const accs:string[] = await eth.request({method:"eth_requestAccounts"});
// //       setAccount(accs?.[0]);
// //       const cid:string = await eth.request({method:"eth_chainId"});
// //       setChainId(cid);
// //       toast.show("Connecté à MetaMask");
// //     }catch(err:any){
// //       toast.show(err?.message ?? "Connexion refusée","warn");
// //     }
// //   };

// //   const disconnect = async ()=>{
// //     try{
// //       if((window as any).ethereum?.request){
// //         await (window as any).ethereum.request({
// //           method:"wallet_revokePermissions",
// //           params:[{eth_accounts:{}}],
// //         });
// //       }
// //     }catch{/* ignore si non supporté */}
// //     // reset local
// //     setAccount(undefined);
// //     setChainId(undefined);
// //     toast.show("Déconnecté ✅");
// //   };

// //   /* UI */
// //   return (
// //     <>
// //       <style>{css}</style>
// //       {toast.el}

// //       {/* header compact */}
// //       <div style={sx.header} className="fade">
// //         <h1 style={sx.h1}>Mon Wallet</h1>
// //         <div style={{display:"flex",gap:8,alignItems:"center"}}>
// //           {account ? (
// //             <>
// //               <div style={sx.pill}>
// //                 <span style={sx.dot} />
// //                 <b>{chainName(chainId)}</b>
// //                 <span style={{opacity:.6}}>•</span>
// //                 <span style={{fontFamily:"ui-monospace"}}>{short(account)}</span>
// //               </div>
// //               <button style={sx.btnGhost} onClick={disconnect}>Disconnect</button>
// //             </>
// //           ) : (
// //             <button style={sx.btnPrimary} onClick={connect} aria-label="Connect MetaMask">
// //               Connect
// //               <div className="ripple"><span/></div>
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* contrôles */}
// //       <div style={sx.grid2} className="fade">
// //         <Card>
// //           <RowBetween>
// //             <RowLeft>
// //               <Badge>✓</Badge>
// //               <div style={sx.label}>Reference currency</div>
// //             </RowLeft>
// //             <button
// //               style={sx.select}
// //               onClick={()=>setRefCcy(refCcy==="EUR"?"USD":refCcy==="USD"?"MAD":"EUR")}
// //               aria-label="Change currency"
// //             >
// //               {refCcy} ▾
// //             </button>
// //           </RowBetween>
// //         </Card>

// //         <Card>
// //           <RowBetween>
// //             <RowLeft>
// //               <Badge>{hasMM?"🦊":"⚠️"}</Badge>
// //               <div style={sx.label}>MetaMask</div>
// //             </RowLeft>
// //             <div style={{display:"flex",gap:8,alignItems:"center"}}>
// //               {account ? (
// //                 <>
// //                   <span style={sx.tagOk}>{chainName(chainId)}</span>
// //                   <Mono text={short(account)} copy={account} onCopy={()=>toast.show("Adresse copiée")} />
// //                   <button style={sx.btnGhost} onClick={disconnect}>Disconnect</button>
// //                 </>
// //               ) : (
// //                 <button style={sx.btnGhost} onClick={connect}>Connect</button>
// //               )}
// //             </div>
// //           </RowBetween>
// //         </Card>
// //       </div>

// //       {/* adresses */}
// //       <Section title="Main address (EVM)">
// //         <Addr text={account || "—"} canCopy onCopy={()=>toast.show("Adresse copiée")} />
// //       </Section>

// //       <Section title="Solana address (à connecter plus tard)">
// //         <Addr text="Phantom/Backpack non connecté" disabled />
// //       </Section>

// //       {/* portfolio */}
// //       <div style={{marginTop:12}}>
// //         <div style={sx.section}>Portfolio</div>
// //         <div style={{display:"grid",gap:8}}>
// //           {balances.map(b=>{
// //             const a=ASSETS.find(x=>x.id===b.assetId)!;
// //             const fiat=toFiat(b.amount, a.decimals, rates[a.id]||0);
// //             const human=toHuman(b.amount, a.decimals);
// //             const loading = loadingEth && a.id==="eth";
// //             return (
// //               <div key={a.id} style={sx.assetRow} className="lift">
// //                 <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
// //                   <div style={sx.assetLogo}>{a.logo ?? "◻️"}</div>
// //                   <div style={{minWidth:0}}>
// //                     <div style={{display:"flex",alignItems:"center",gap:8}}>
// //                       <b>{a.symbol}</b>
// //                       <span style={sx.chainBadge}>{a.chain.toUpperCase()}</span>
// //                     </div>
// //                     <div style={sx.sub}>{a.name}</div>
// //                   </div>
// //                 </div>
// //                 <div style={{textAlign:"right"}}>
// //                   <div style={{fontWeight:900}}>
// //                     {loading ? <span className="skel" /> : human}
// //                   </div>
// //                   <div style={sx.sub}>
// //                     {fiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}
// //                   </div>
// //                   {a.chain!=="evm" && <div style={{marginTop:6}}><span style={sx.badgeMuted}>Connect Phantom</span></div>}
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       {/* total + actions */}
// //       <div style={sx.total}>
// //         <div style={sx.sub}>Total</div>
// //         <div style={{fontWeight:900,fontSize:22}}>
// //           {totalFiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}
// //         </div>
// //       </div>

// //       <div style={sx.actions}>
// //         <Btn onClick={()=>nav("/deposit")}  disabled={!account}>Deposit</Btn>
// //         <Btn onClick={()=>nav("/withdraw")} disabled={!account}>Withdraw</Btn>
// //         <Btn onClick={()=>nav("/transfer")} disabled={!account}>Transfer</Btn>
// //         <Btn onClick={()=>nav("/activity")}>Activity</Btn>
// //         <Btn onClick={()=>nav("/tokens")}>Tokens</Btn>
// //         <Btn onClick={()=>nav("/settings")}>Settings</Btn>
// //       </div>

// //       <div style={{marginTop:8,color:"var(--ink-sub)",fontSize:12}}>
// //         * Solde ETH connecté au backend. Les autres montants sont simulés.
// //       </div>
// //     </>
// //   );
// // }

// // /* ─────────────────────────────────────────────
// //    Sous-composants UI
// // ────────────────────────────────────────────── */
// // function Card({children}:{children:React.ReactNode}){ return <div style={sx.card}>{children}</div>; }
// // function RowBetween({children}:{children:React.ReactNode}){ return <div style={sx.between}>{children}</div>; }
// // function RowLeft({children}:{children:React.ReactNode}){ return <div style={sx.rowLeft}>{children}</div>; }
// // function Badge({children}:{children:React.ReactNode}){ return <div style={sx.badge}>{children}</div>; }

// // function Section({title,children}:{title:string;children:React.ReactNode}){
// //   return (
// //     <div className="fade" style={{marginTop:8}}>
// //       <div style={sx.section}>{title}</div>
// //       {children}
// //     </div>
// //   );
// // }

// // function Mono({text,copy,onCopy}:{text:string;copy?:string;onCopy?:()=>void}){
// //   const [ok,setOk]=useState(false);
// //   return (
// //     <div style={sx.mono}>
// //       <span style={{whiteSpace:"nowrap"}}>{text}</span>
// //       {copy && (
// //         <button
// //           style={sx.copy}
// //           onClick={()=>{navigator.clipboard.writeText(copy); setOk(true); onCopy?.(); setTimeout(()=>setOk(false),900);}}
// //           aria-label="Copy"
// //         >{ok?"✓":"⧉"}</button>
// //       )}
// //     </div>
// //   );
// // }

// // function Addr({text,canCopy,disabled,onCopy}:{text:string;canCopy?:boolean;disabled?:boolean;onCopy?:()=>void}){
// //   const [ok,setOk]=useState(false);
// //   return (
// //     <div style={{...sx.addr,opacity:disabled?0.6:1}} className="lift">
// //       <div style={sx.addrL}>
// //         <div style={sx.addrIc}>⚙️</div>
// //         <span style={sx.addrTxt}>{text}</span>
// //       </div>
// //       <div style={{display:"flex",gap:6}}>
// //         <button style={sx.sq} title="QR" disabled>▣</button>
// //         <button
// //           style={sx.sq}
// //           title="Copy"
// //           disabled={!canCopy}
// //           onClick={()=>{ if(!canCopy) return; navigator.clipboard.writeText(text); setOk(true); onCopy?.(); setTimeout(()=>setOk(false),900); }}
// //         >
// //           {ok?"✓":"⧉"}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // function Btn({children,onClick,disabled}:{children:React.ReactNode;onClick:React.MouseEventHandler<HTMLButtonElement>;disabled?:boolean}){
// //   const on = (e:React.MouseEvent<HTMLButtonElement>)=>{
// //     const host=e.currentTarget.querySelector(".ripple") as HTMLDivElement;
// //     if(!host) return; host.classList.remove("show"); // reflow
// //     // @ts-ignore
// //     void host.offsetWidth;
// //     const span=host.firstElementChild as HTMLSpanElement;
// //     const d=Math.max(host.clientWidth,host.clientHeight);
// //     const rect=host.getBoundingClientRect();
// //     span.style.width=span.style.height=`${d}px`;
// //     span.style.left=`${e.clientX-rect.left-d/2}px`;
// //     span.style.top =`${e.clientY-rect.top -d/2}px`;
// //     host.classList.add("show");
// //   };
// //   return (
// //     <button
// //       style={{...sx.btnAction, opacity:disabled?0.45:1, cursor:disabled?"not-allowed":"pointer"}}
// //       onClick={(e)=>{ if(disabled) return; on(e); onClick(e); }}
// //       disabled={disabled}
// //     >
// //       {children}
// //       <div className="ripple"><span/></div>
// //     </button>
// //   );
// // }

// // /* ─────────────────────────────────────────────
// //    Styles
// // ────────────────────────────────────────────── */
// // const sx:Record<string,React.CSSProperties>={
// //   header:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8},
// //   h1:{margin:0,fontWeight:900,color:"var(--ink)",fontSize:20},

// //   pill:{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 10px",
// //     border:"1px solid var(--line)",borderRadius:999,background:"var(--card)",color:"var(--ink)"},
// //   dot:{width:8,height:8,borderRadius:999,background:"var(--ok)",display:"inline-block"},

// //   grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
// //   card:{border:"1px solid var(--line)",borderRadius:14,background:"var(--card)",padding:10},
// //   between:{display:"flex",alignItems:"center",justifyContent:"space-between"},
// //   rowLeft:{display:"flex",alignItems:"center",gap:8},
// //   label:{fontSize:13,color:"var(--ink)",fontWeight:800},
// //   badge:{width:22,height:22,borderRadius:999,display:"grid",placeItems:"center",background:"#e0e7ff",color:"#1e3a8a",fontSize:12,fontWeight:900},

// //   select:{border:"1px solid var(--line)",background:"var(--card)",borderRadius:12,padding:"6px 10px",cursor:"pointer",fontWeight:800},
// //   tagOk:{background:"#ecfdf5",border:"1px solid #bbf7d0",color:"#065f46",borderRadius:10,padding:"6px 10px",fontWeight:800},

// //   section:{fontSize:12,color:"var(--ink-sub)",margin:"10px 2px 6px",fontWeight:800},

// //   addr:{border:"1px solid var(--line)",borderRadius:12,padding:"10px",background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"space-between"},
// //   addrL:{display:"flex",alignItems:"center",gap:8,minWidth:0},
// //   addrIc:{width:24,height:24,borderRadius:999,display:"grid",placeItems:"center",background:"#f1f5f9",fontSize:12},
// //   addrTxt:{fontSize:14,color:"var(--ink)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:620},
// //   sq:{width:32,height:32,border:"1px solid var(--line)",background:"var(--card)",borderRadius:8,cursor:"pointer"},

// //   assetRow:{border:"1px solid var(--line)",borderRadius:12,padding:10,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"space-between"},
// //   assetLogo:{width:32,height:32,borderRadius:999,display:"grid",placeItems:"center",background:"#f1f5f9",fontSize:16},
// //   chainBadge:{fontSize:10,color:"#475569",border:"1px solid var(--line)",borderRadius:999,padding:"2px 6px",fontWeight:800},
// //   sub:{fontSize:12,color:"var(--ink-sub)"},
// //   badgeMuted:{fontSize:10,color:"#475569",border:"1px dashed var(--line)",borderRadius:999,padding:"2px 6px"},

// //   total:{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginTop:10,borderTop:"1px dashed var(--line)",paddingTop:10},

// //   mono:{display:"flex",alignItems:"center",gap:8,border:"1px solid var(--line)",borderRadius:8,padding:"6px 8px",
// //     fontFamily:'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'},
// //   copy:{width:26,height:26,border:"1px solid var(--line)",background:"var(--card)",borderRadius:6,cursor:"pointer"},

// //   actions:{display:"grid",gridTemplateColumns:"repeat(6,minmax(0,1fr))",gap:8,marginTop:12},
// //   btnAction:{position:"relative",overflow:"hidden",border:"1px solid var(--line)",background:"var(--card)",color:"var(--ink)",borderRadius:12,padding:"10px 0",cursor:"pointer",fontWeight:900},
// //   btnGhost:{border:"1px solid var(--line)",background:"var(--card)",borderRadius:10,padding:"8px 12px",cursor:"pointer",fontWeight:900},
// //   btnPrimary:{position:"relative",overflow:"hidden",border:"1px solid var(--pri)",background:"var(--pri)",color:"#fff",borderRadius:12,padding:"10px 14px",cursor:"pointer",fontWeight:900},
// // };
// // Wallet.tsx — Version Pro
// // - Liaison MetaMask complète (connect, listeners, ensureChain)
// // - Auth Web3 (SIWE-like) pour lier l'adresse au compte backend
// // - Bandeau réseau + switch / add chain
// // - Gestion provider absent (CTA Installer MetaMask)
// // - Persistance devise (localStorage)
// // - Zone "Mes NFTs" (titres) + actions Explorer/Attestation/Transférer
// // - Positions avec badge Unités
// // - Explorer links (adresse / tokens)
// // - watchAsset (USDC/DAI)
// // - Phantom stub (à implémenter plus tard)

// // import React, { useEffect, useMemo, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // // en haut du fichier
// // // Removed duplicate NFTItem type declaration

// // const [nfts, setNfts] = useState<NFTItem[] | null>(null);
// // const [loadingNFTs, setLoadingNFTs] = useState(false);
// // const [activeTab, setActiveTab] = useState<"portfolio"|"nfts"|"activity"|"settings">("portfolio");

// // /* ─────────────────────────────────────────────
// //    Thème & helpers (palette + tokens)
// // ────────────────────────────────────────────── */
// // const theme = {
// //   bg: "#ffffff", card: "#ffffff", ink: "#0b122a", inkSub: "#64748b", line: "#e5e7eb",
// //   primary: "#e11d2e", primaryHi: "#be123c", accent: "#06b6d4", success: "#10b981", warn: "#f59e0b",
// // };

// // const css = `
// // :root{--bg:${theme.bg};--card:${theme.card};--ink:${theme.ink};--ink-sub:${theme.inkSub};--line:${theme.line};--pri:${theme.primary};--pri-hi:${theme.primaryHi};--acc:${theme.accent};--ok:${theme.success};--warn:${theme.warn}}
// // *{box-sizing:border-box} html,body,#root{height:100%}
// // body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial}
// // .btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:10px 14px;border-radius:12px;font-weight:900;cursor:pointer;border:1px solid var(--line);transition:transform .15s ease,box-shadow .15s ease,background .15s ease}
// // .btnPrimary{background:var(--pri);border-color:var(--pri);color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)} .btnPrimary:hover{transform:translateY(-1px);background:var(--pri-hi)}
// // .btnGhost{background:#fff;color:var(--ink)} .btnWarn{background:#fff6e5;border-color:#fcd34d;color:#92400e}
// // .badge{font-size:11px;padding:3px 8px;border-radius:999px;border:1px solid var(--line);color:var(--ink-sub)}
// // .badgePri{border-color:#fecaca;color:var(--pri);background:#fff2f3;font-weight:900}
// // .card{border:1px solid var(--line);border-radius:14px;background:#fff;padding:12px}
// // .grid{display:grid;gap:8px} .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
// // .row{display:flex;align-items:center;justify-content:space-between}
// // .h1{margin:0;font-weight:900;font-size:20px}
// // .sub{font-size:12px;color:var(--ink-sub)}
// // .assetRow{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff;display:flex;align-items:center;justify-content:space-between}
// // .assetL{display:flex;align-items:center;gap:10px;min-width:0}
// // .logo{width:34px;height:34px;border-radius:999px;display:grid;place-items:center;background:#f1f5f9;font-size:16px}
// // .chain{font-size:10px;color:#475569;border:1px solid var(--line);border-radius:999px;padding:2px 6px;font-weight:800}
// // .skel{display:inline-block;border-radius:8px;background:linear-gradient(90deg,#eef2f7 0%,#e7ebf2 40%,#eef2f7 80%);background-size:200% 100%;animation:sk 1.1s linear infinite;min-width:8ch;min-height:1em}
// // @keyframes sk{from{background-position:200% 0}to{background-position:-200% 0}}
// // .banner{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px}
// // .nftBadge{font-size:10px;color:#6b21a8;border:1px solid #e9d5ff;border-radius:999px;padding:2px 6px;background:#faf5ff;font-weight:900}
// // .unitBadge{font-size:10px;color:#b91c1c;border:1px solid #fecaca;border-radius:999px;padding:2px 6px;background:#fff5f5;font-weight:900}
// // .link{color:var(--pri);font-weight:800}
// // `;

// // /* ─────────────────────────────────────────────
// //    Types & données locales
// // ────────────────────────────────────────────── */
// // type ChainKind = "evm" | "solana" | "other";
// // type Asset = { id:string; symbol:string; name:string; chain:ChainKind; decimals:number; logo?:string };
// // type Balance = { assetId:string; amount:string };
// // type Rates = Record<string, number>;

// // type Position = { id:string; title:string; assetId:string; amountRaw:string; units?:number; nftTokenIds?:string[]; status?:string };
// // type NFTItem = { tokenId:string; contract:string; title:string; imageUrl?:string; transferable:boolean; units?:number; category:string };

// // const ASSETS: Asset[] = [
// //   { id:"eth",  symbol:"ETH",  name:"Ethereum", chain:"evm",    decimals:18, logo:"🟣" },
// //   { id:"usdc", symbol:"USDC", name:"USD Coin", chain:"evm",    decimals:6,  logo:"🪙" },
// //   { id:"dai",  symbol:"DAI",  name:"Dai",      chain:"evm",    decimals:18, logo:"🟡" },
// //   { id:"sol",  symbol:"SOL",  name:"Solana",   chain:"solana", decimals:9,  logo:"🟩" },
// // ];

// // /* utils numériques */
// // function formatUnits(raw:string,dec:number,prec=6){ if(!raw) return "0"; const neg=raw.startsWith("-"); const s=neg?raw.slice(1):raw; const bi=BigInt(s); const base=BigInt(10)**BigInt(dec); const int=bi/base; const fracBI=bi%base; const fracStr=fracBI.toString().padStart(dec,"0").slice(0,prec).replace(/0+$/,''); return `${neg?"-":""}${int}${fracStr?'.'+fracStr:''}`; }
// // const toFiat=(raw:string,dec:number,rate:number)=>Number(formatUnits(raw,dec,12))*rate;
// // const short=(a?:string,n=4)=>a?`${a.slice(0,2+n)}…${a.slice(-n)}`:"—";
// // const chainName=(cid?:string)=>(cid==="0x1"?"Ethereum":cid==="0xaa36a7"?"Sepolia":cid==="0x89"?"Polygon":cid==="0xa"?"Optimism":cid==="0x2105"?"Base":cid?`Chain ${parseInt(cid,16)}`:"—");
// // const explorer=(kind:"address"|"token"|"tx", v:string, chainId?:string)=>{
// //   const base = chainId==="0x89"?"https://polygonscan.com": chainId==="0x2105"?"https://basescan.org": chainId==="0xaa36a7"?"https://sepolia.etherscan.io":"https://etherscan.io";
// //   return `${base}/${kind}/${v}`;
// // };

// // /* mini toast */
// // function useToast(){ const [msg,setMsg]=useState<string>(); const [tone,setTone]=useState<'ok'|'warn'|'err'>('ok'); const show=(m:string,t:'ok'|'warn'|'err'='ok')=>{setTone(t); setMsg(m); setTimeout(()=>setMsg(undefined),1800)}; const el= msg? (<div style={{position:'fixed',right:16,bottom:16,zIndex:50,background:'var(--card)',border:`1px solid ${tone==='ok'?'#bbf7d0':tone==='warn'?'#fde68a':'#fecaca'}`,color:tone==='ok'?'#065f46':tone==='warn'?'#92400e':'#7f1d1d',padding:'10px 14px',borderRadius:12,boxShadow:'0 10px 30px rgba(2,6,23,.12)'}}>{msg}</div>):null; return {show,el}; }

// // /* ─────────────────────────────────────────────
// //    Config réseau attendu (à adapter)
// // ────────────────────────────────────────────── */
// // const EXPECTED_CHAIN = { chainId:"0x1", name:"Ethereum", rpc:["https://rpc.ankr.com/eth"], explorer:"https://etherscan.io", currency:{name:"Ether",symbol:"ETH",decimals:18} } as const;

// // /* ─────────────────────────────────────────────
// //    Page
// // ────────────────────────────────────────────── */
// // export default function Wallet(){
// //   const nav = useNavigate();
// //   const toast = useToast();

// //   const [refCcy,setRefCcy]=useState<"EUR"|"USD"|"MAD"|"GBP"|"AED">(()=> (localStorage.getItem("fx_ccy") as any) || "EUR");
// //   useEffect(()=>{ localStorage.setItem("fx_ccy", refCcy); },[refCcy]);

// //   const [hasMM,setHasMM]=useState(false);
// //   const [account,setAccount]=useState<string|undefined>();
// //   const [chainId,setChainId]=useState<string|undefined>();
// //   const [isAuth,setIsAuth]=useState(false); // session backend liée par signature

// //   const [loadingEth,setLoadingEth]=useState(false);
// //   const [balances,setBalances]=useState<Balance[]>([
// //     { assetId:"eth",  amount:"0" },
// //     { assetId:"usdc", amount:"15230000" },
// //     { assetId:"dai",  amount:"501234000000000000000" },
// //     { assetId:"sol",  amount:"345600000" },
// //   ]);

// //   const [positions,setPositions] = useState<Position[]>([]);
// //   const [nfts,setNfts] = useState<NFTItem[]>([]);
// //   const [loadingNFTs,setLoadingNFTs]=useState(false);

// //   /* taux fiat (EUR base) -> refCcy */
// //   const rates:Rates = useMemo(()=>{ const base:Rates={ eth:2900, usdc:0.92, dai:0.92, sol:130 }; const fxTable = { EUR:1, USD:1.08, MAD:10.8, GBP:0.85, AED:3.97 } as const; const fx=fxTable[refCcy]; return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,v*fx])) as Rates; },[refCcy]);

// //   /* Provider boot */
// //   useEffect(()=>{ const eth=(window as any).ethereum; setHasMM(Boolean(eth)); if(!eth) return; (async()=>{ try{ const [accs, cid] = await Promise.all([ eth.request({method:"eth_accounts"}), eth.request({method:"eth_chainId"}) ]); setAccount(accs?.[0]); setChainId(cid); }catch{ /* noop */ } })(); const onA=(a:string[])=>setAccount(a?.[0]); const onC=(c:string)=>setChainId(c); eth.on?.('accountsChanged',onA); eth.on?.('chainChanged',onC); return ()=>{ eth.removeListener?.('accountsChanged',onA); eth.removeListener?.('chainChanged',onC); }; },[]);

// //   /* Fetch solde ETH backend (si account) */
// //   useEffect(()=>{ if(!account) return; setLoadingEth(true); (async()=>{ try{ const r = await fetch(`/wallets/${account}/eth`); const j = await r.json(); if(j?.wei){ setBalances(prev=>prev.map(b=>b.assetId==='eth'?{...b,amount:String(j.wei)}:b)); } }catch{ toast.show("Impossible de charger le solde ETH","warn");} finally{ setLoadingEth(false);} })(); },[account]);

// //   /* Charger positions + NFTs (session requise côté backend) */
// //   useEffect(()=>{ (async()=>{ try{ const [p,n] = await Promise.all([
// //       fetch('/me/wallet/positions',{credentials:'include'}).then(r=>r.ok?r.json():[]),
// //       (setLoadingNFTs(true), fetch('/me/wallet/nfts',{credentials:'include'}).then(r=>r.ok?r.json():[]))
// //     ]); setPositions(p||[]); setNfts(n||[]); } finally{ setLoadingNFTs(false); } })(); },[isAuth]);

// //   /* Helpers */
// //   const totalFiat = useMemo(()=>balances.reduce((s,b)=>{ const a=ASSETS.find(x=>x.id===b.assetId)!; return s + toFiat(b.amount, a.decimals, rates[b.assetId]||0); },0),[balances,rates]);
// //   const totalPositions = useMemo(()=>positions.reduce((s,p)=>{ const a=ASSETS.find(x=>x.id===p.assetId)!; return s + toFiat(p.amountRaw, a.decimals, rates[p.assetId]||0); },0),[positions,rates]);

// //   /* Actions */
// //   const connect = async ()=>{
// //     const eth=(window as any).ethereum; if(!eth) return toast.show("MetaMask non détecté","warn");
// //     try{
// //       await eth.request({method:'wallet_requestPermissions', params:[{eth_accounts:{}}]});
// //       const accs:string[] = await eth.request({method:'eth_requestAccounts'});
// //       setAccount(accs?.[0]); const cid:string = await eth.request({method:'eth_chainId'}); setChainId(cid); toast.show("Connecté à MetaMask");
// //       await ensureChain();
// //     }catch(err:any){ toast.show(err?.message||'Connexion refusée','err'); }
// //   };

// //   const ensureChain = async ()=>{
// //     const eth=(window as any).ethereum; if(!eth) return;
// //     const cid = await eth.request({method:'eth_chainId'});
// //     if(cid!==EXPECTED_CHAIN.chainId){
// //       try{ await eth.request({ method:'wallet_switchEthereumChain', params:[{ chainId: EXPECTED_CHAIN.chainId }] }); setChainId(EXPECTED_CHAIN.chainId); toast.show('Réseau basculé'); }
// //       catch(e:any){ if(e?.code===4902){ await eth.request({ method:'wallet_addEthereumChain', params:[{ chainId:EXPECTED_CHAIN.chainId, chainName:EXPECTED_CHAIN.name, rpcUrls:EXPECTED_CHAIN.rpc, nativeCurrency:EXPECTED_CHAIN.currency, blockExplorerUrls:[EXPECTED_CHAIN.explorer] }] }); } else { toast.show('Changement de réseau refusé','warn'); } }
// //     }
// //   };

// //   const signIn = async ()=>{
// //     const eth=(window as any).ethereum; if(!eth) return;
// //     try{
// //       const [addr] = await eth.request({method:'eth_requestAccounts'});
// //       const r = await fetch('/auth/nonce',{credentials:'include'}); const {nonce} = await r.json();
// //       const domain = window.location.host;
// //       const message = `domain: ${domain}\naddress: ${addr}\nstatement: Login\nnonce: ${nonce}\nissuedAt: ${new Date().toISOString()}\nexpirationTime: ${new Date(Date.now()+5*60*1000).toISOString()}`;
// //       const signature = await eth.request({ method:'personal_sign', params:[message, addr] });
// //       const v = await fetch('/auth/verify',{ method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ address: addr, message, signature }) });
// //       if(!v.ok) throw new Error('Auth failed'); setIsAuth(true); toast.show('Adresse liée au compte');
// //     }catch(e:any){ toast.show(e?.message||'Signature refusée','warn'); }
// //   };

// //   const logout = async ()=>{ try{ await fetch('/auth/logout',{method:'POST',credentials:'include'}); }catch{} setIsAuth(false); setAccount(undefined); setChainId(undefined); toast.show('Déconnecté'); };

// //   const addTokenToMM = async (symbol:'USDC'|'DAI')=>{
// //     const eth=(window as any).ethereum; if(!eth) return; try{
// //       const params = symbol==='USDC' ? { address:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals:6, image:'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' } : { address:'0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals:18, image:'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' };
// //       await eth.request({ method:'wallet_watchAsset', params:{ type:'ERC20', options:{ address: params.address, symbol, decimals: params.decimals, image: params.image } } });
// //       toast.show(symbol+' ajouté à MetaMask');
// //     }catch{ toast.show('Ajout refusé','warn'); }
// //   };

// //   /* UI */
// //   const hasWrongChain = hasMM && chainId && chainId!==EXPECTED_CHAIN.chainId;
// //   const installMMUrl = 'https://metamask.io/download/';

// //   return (
// //     <>
// //       <style>{css}</style>
// //       {toast.el}

// //       {/* Header */}
// //       <div className="row" style={{marginBottom:8}}>
// //         <h1 className="h1">Mon Wallet</h1>
// //         <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
// //           <button className="btn btnGhost" onClick={()=>setRefCcy(refCcy==='EUR'?'USD':refCcy==='USD'?'MAD':refCcy==='MAD'?'GBP':refCcy==='GBP'?'AED':'EUR')}>{refCcy} ▾</button>
// //           {hasMM ? (
// //             account ? (
// //               <>
// //                 <a className="pill link" href={explorer('address', account, chainId)} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
// //                   {short(account)} ↗
// //                 </a>
// //                 {!isAuth && <button className="btn btnPrimary" onClick={signIn}>Lier l'adresse (Signer)</button>}
// //                 <button className="btn btnGhost" onClick={logout}>Déconnexion</button>
// //               </>
// //             ) : (
// //               <button className="btn btnPrimary" onClick={connect}>Connecter MetaMask</button>
// //             )
// //           ) : (
// //             <a className="btn btnPrimary" href={installMMUrl} target="_blank" rel="noreferrer">Installer MetaMask</a>
// //           )}
// //         </div>
// //       </div>

// //       {/* Bandeau mauvais réseau */}
// //       {hasWrongChain && (
// //         <div className="banner" style={{marginBottom:8}}>
// //           <div>Réseau détecté: <b>{chainName(chainId)}</b> — attendu: <b>{EXPECTED_CHAIN.name}</b></div>
// //           <div style={{display:'flex',gap:8}}>
// //             <button className="btn btnWarn" onClick={ensureChain}>Basculer le réseau</button>
// //           </div>
// //         </div>
// //       )}

// //       {/* Contrôles */}
// //       <div className="grid2">
// //         <div className="card row">
// //           <div>
// //             <div className="sub">Total crypto</div>
// //             <div style={{fontWeight:900,fontSize:22}}>{totalFiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div>
// //           </div>
// //           <div style={{display:'flex',gap:6}}>
// //             <button className="btn btnGhost" onClick={()=>addTokenToMM('USDC')}>+USDC</button>
// //             <button className="btn btnGhost" onClick={()=>addTokenToMM('DAI')}>+DAI</button>
// //           </div>
// //         </div>
// //         <div className="card row">
// //           <div>
// //             <div className="sub">Total positions</div>
// //             <div style={{fontWeight:900,fontSize:22}}>{totalPositions.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div>
// //           </div>
// //           <span className="badgePri">Titres & unités</span>
// //         </div>
// //       </div>

// //       {/* Adresses */}
// //       <div className="grid" style={{marginTop:10}}>
// //         <div className="sub">Adresse EVM principale</div>
// //         <div className="assetRow">
// //           <div className="assetL"><div className="logo">🦊</div><div><b>{account? short(account):'—'}</b><div className="sub">{chainName(chainId)}</div></div></div>
// //           <div style={{display:'flex',gap:8}}>
// //             {account && <a className="btn btnGhost" href={explorer('address',account,chainId)} target="_blank" rel="noreferrer">Explorer</a>}
// //           </div>
// //         </div>
// //         <div className="sub">Adresse Solana (à connecter plus tard)</div>
// //         <div className="assetRow">
// //           <div className="assetL"><div className="logo">🪄</div><div><b>Phantom/Backpack</b><div className="sub">Non connecté</div></div></div>
// //           <button className="btn btnGhost" disabled>Connect Phantom</button>
// //         </div>
// //       </div>

// //       {/* Soldes par actif */}
// //       <div style={{marginTop:12}}>
// //         <div className="sub">Portfolio</div>
// //         <div className="grid">
// //           {ASSETS.map(a=>{ const b=balances.find(x=>x.assetId===a.id)!; const fiat=toFiat(b.amount,a.decimals,rates[a.id]||0); const human=formatUnits(b.amount,a.decimals); const loading = loadingEth && a.id==='eth'; return (
// //             <div key={a.id} className="assetRow">
// //               <div className="assetL"><div className="logo">{a.logo||'◻️'}</div><div><div style={{display:'flex',gap:8,alignItems:'center'}}><b>{a.symbol}</b><span className="chain">{a.chain.toUpperCase()}</span></div><div className="sub">{a.name}</div></div></div>
// //               <div style={{textAlign:'right'}}>
// //                 <div style={{fontWeight:900}}>{loading? <span className='skel'/> : human}</div>
// //                 <div className="sub">{fiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div>
// //                 {a.chain!=="evm" && <div style={{marginTop:6}}><span className="badge">Connect Phantom</span></div>}
// //               </div>
// //             </div>
// //           ); })}
// //         </div>
// //       </div>

// //       {/* Positions (avec unités & NFT badges) */}
// //       {positions.length>0 && (
// //         <div style={{marginTop:12}}>
// //           <div className="row"><div className="sub">Positions</div><a className="link" href="/properties" onClick={(e)=>{e.preventDefault(); nav('/properties');}}>Découvrir d'autres offres →</a></div>
// //           <div className="grid">
// //             {positions.map(p=>{ const a=ASSETS.find(x=>x.id===p.assetId)!; const amt=formatUnits(p.amountRaw,a.decimals); const fiat=toFiat(p.amountRaw,a.decimals,rates[p.assetId]||0); return (
// //               <div key={p.id} className="assetRow">
// //                 <div className="assetL" style={{gap:12}}>
// //                   <div className="logo">🏷️</div>
// //                   <div>
// //                     <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
// //                       <b>{p.title}</b>
// //                       {typeof p.units==='number' && <span className="unitBadge">Unités: {p.units}</span>}
// //                       {p.nftTokenIds?.map(id=> <span key={id} className="nftBadge">NFT {id}</span>)}
// //                     </div>
// //                     <div className="sub">{a.symbol} • {amt} ({fiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}) — {p.status||'En cours'}</div>
// //                   </div>
// //                 </div>
// //                 <div style={{display:'flex',gap:8}}>
// //                   <button className="btn btnGhost" onClick={()=>nav(`/properties/${p.id}`)}>Détails</button>
// //                   <button className="btn btnPrimary" onClick={()=>nav(`/transfer?pos=${p.id}`)}>Transférer</button>
// //                 </div>
// //               </div>
// //             ); })}
// //           </div>
// //         </div>
// //       )}

// //       {/* Mes NFTs (titres) */}
// //       <div style={{marginTop:12}}>
// //         <div className="row"><div className="sub">Mes NFTs (titres)</div>{loadingNFTs && <span className="badge">Chargement…</span>}</div>
// //         {nfts.length===0 ? (
// //           <div className="card sub">Aucun titre pour l'instant. Après un investissement signé, votre NFT d'attestation apparaît ici.</div>
// //         ) : (
// //           <div className="grid" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))'}}>
// //             {nfts.map(n=> (
// //               <div key={n.tokenId} className="card">
// //                 <img src={n.imageUrl||'/assets/placeholder.jpg'} alt="" style={{width:'100%',height:140,objectFit:'cover',borderRadius:8}}/>
// //                 <div className="row" style={{marginTop:8}}><b style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{n.title}</b><span className="badge">{n.category}</span></div>
// //                 <div className="sub" style={{marginTop:6}}>Token #{n.tokenId} {typeof n.units==='number' && (<span className="unitBadge" style={{marginLeft:6}}>Unités: {n.units}</span>)}</div>
// //                 <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
// //                   <a className="btn btnGhost" href={explorer('token', n.contract, chainId)} target="_blank" rel="noreferrer">Explorer</a>
// //                   <a className="btn btnPrimary" href={`/nft/${n.tokenId}/attestation`} target="_blank" rel="noreferrer">Attestation</a>
// //                   {n.transferable && <button className="btn btnGhost" onClick={()=>nav(`/transfer?nft=${n.tokenId}`)}>Transférer</button>}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       {/* Actions globales */}
// //       <div className="grid" style={{marginTop:12}}>
// //         <div className="row">
// //           <div className="sub">Actions</div>
// //           <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
// //             <button className="btn btnPrimary" onClick={()=>nav('/deposit')} disabled={!account || hasWrongChain || !isAuth}>Déposer</button>
// //             <button className="btn btnGhost" onClick={()=>nav('/withdraw')} disabled={!account || hasWrongChain || !isAuth}>Retirer</button>
// //             <button className="btn btnGhost" onClick={()=>nav('/transfer')} disabled={!account || !isAuth}>Transférer</button>
// //             <button className="btn btnGhost" onClick={()=>nav('/activity')}>Activité</button>
// //             <button className="btn btnGhost" onClick={()=>nav('/settings')}>Réglages</button>
// //           </div>
// //         </div>
// //         <div className="sub">* Les opérations critiques nécessitent une adresse connectée, le bon réseau et une <b>signature</b> (liaison compte).</div>
// //       </div>
// //     </>
// //   );
// // }
//[[[[[[[[[[[[[[[[[[[[[[[[VERSION1>>>>>>>>>>>/////5555555]]]]]]]]]]]]]]]]]]]]]]]]
// // src/pages/Wallet.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { listNfts } from "../lib/api";
// import InvestOrderDialog from "../components/InvestOrderDialog";

// /* ─────────────────────────────────────────────
//    Thème & helpers (palette + tokens)
// ────────────────────────────────────────────── */
// const theme = {
//   bg: "#ffffff",
//   card: "#ffffff",
//   ink: "#0b122a",
//   inkSub: "#64748b",
//   line: "#e5e7eb",
//   primary: "#e11d2e",
//   primaryHi: "#be123c",
//   accent: "#06b6d4",
//   success: "#10b981",
//   warn: "#f59e0b",
// };

// const css = `
// :root{
//   --bg:${theme.bg};--card:${theme.card};
//   --ink:${theme.ink};--ink-sub:${theme.inkSub};
//   --line:${theme.line};--pri:${theme.primary};--pri-hi:${theme.primaryHi};
//   --acc:${theme.accent};--ok:${theme.success};--warn:${theme.warn}
// }
// *{box-sizing:border-box} html,body,#root{height:100%}
// body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit}
// .btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:10px 14px;border-radius:12px;font-weight:900;cursor:pointer;border:1px solid var(--line);transition:transform .15s ease,box-shadow .15s ease,background .15s ease}
// .btnPrimary{background:var(--pri);border-color:var(--pri);color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
// .btnPrimary:hover{transform:translateY(-1px);background:var(--pri-hi)}
// .btnGhost{background:#fff;color:var(--ink)}
// .btnWarn{background:#fff6e5;border-color:#fcd34d;color:#92400e}
// .badge{font-size:11px;padding:3px 8px;border-radius:999px;border:1px solid var(--line);color:var(--ink-sub)}
// .badgePri{border-color:#fecaca;color:var(--pri);background:#fff2f3;font-weight:900}
// .card{border:1px solid var(--line);border-radius:14px;background:#fff;padding:12px}
// .grid{display:grid;gap:8px}
// .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
// .row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
// .h1{margin:0;font-weight:900;font-size:20px}
// .sub{font-size:12px;color:var(--ink-sub)}
// .assetRow{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:10px}
// .assetL{display:flex;align-items:center;gap:10px;min-width:0}
// .logo{width:34px;height:34px;border-radius:999px;display:grid;place-items:center;background:#f1f5f9;font-size:16px}
// .chain{font-size:10px;color:#475569;border:1px solid var(--line);border-radius:999px;padding:2px 6px;font-weight:800}
// .skel{display:inline-block;border-radius:8px;background:linear-gradient(90deg,#eef2f7 0%,#e7ebf2 40%,#eef2f7 80%);background-size:200% 100%;animation:sk 1.1s linear infinite;min-width:8ch;min-height:1em}
// @keyframes sk{from{background-position:200% 0}to{background-position:-200% 0}}
// .banner{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px}
// .nftBadge{font-size:10px;color:#6b21a8;border:1px solid #e9d5ff;border-radius:999px;padding:2px 6px;background:#faf5ff;font-weight:900}
// .unitBadge{font-size:10px;color:#b91c1c;border:1px solid #fecaca;border-radius:999px;padding:2px 6px;background:#fff5f5;font-weight:900}
// .link{color:var(--pri);font-weight:800}
// .pill{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--line);border-radius:999px;background:#fff}
// .tabs{display:flex;gap:6px;border-bottom:1px solid var(--line);margin-top:12px}
// .tab{padding:8px 10px;border-radius:10px;cursor:pointer;font-weight:800;color:var(--ink-sub)}
// .tab.active{color:var(--pri);background:#fff2f3;border:1px solid #fecaca}
// `;

// /* ─────────────────────────────────────────────
//    Types & données locales
// ────────────────────────────────────────────── */
// type ChainKind = "evm" | "solana" | "other";
// type Asset = { id: string; symbol: string; name: string; chain: ChainKind; decimals: number; logo?: string };
// type Balance = { assetId: string; amount: string };
// type Rates = Record<string, number>;

// type Position = {
//   id: string;
//   title: string;
//   assetId: string;
//   amountRaw: string;
//   units?: number;
//   nftTokenIds?: string[];
//   status?: string;
// };

// type NFTItem = {
//   tokenId: string;
//   contract: string;
//   title: string;
//   imageUrl?: string;
//   transferable: boolean;
//   units?: number;
//   category: string;
// };

// const ASSETS: Asset[] = [
//   { id: "eth", symbol: "ETH", name: "Ethereum", chain: "evm", decimals: 18, logo: "🟣" },
//   { id: "usdc", symbol: "USDC", name: "USD Coin", chain: "evm", decimals: 6, logo: "🪙" },
//   { id: "dai", symbol: "DAI", name: "Dai", chain: "evm", decimals: 18, logo: "🟡" },
//   { id: "sol", symbol: "SOL", name: "Solana", chain: "solana", decimals: 9, logo: "🟩" },
// ];

// /* utils numériques + utiles UI */
// function formatUnits(raw: string, dec: number, prec = 6) {
//   if (!raw) return "0";
//   const neg = raw.startsWith("-");
//   const s = neg ? raw.slice(1) : raw;
//   const bi = BigInt(s);
//   const base = BigInt(10) ** BigInt(dec);
//   const int = bi / base;
//   const fracBI = bi % base;
//   const fracStr = fracBI.toString().padStart(dec, "0").slice(0, prec).replace(/0+$/, "");
//   return `${neg ? "-" : ""}${int}${fracStr ? "." + fracStr : ""}`;
// }
// const toFiat = (raw: string, dec: number, rate: number) => Number(formatUnits(raw, dec, 12)) * rate;
// const short = (a?: string, n = 4) => (a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "—");
// const chainName = (cid?: string) =>
//   cid === "0x1"
//     ? "Ethereum"
//     : cid === "0xaa36a7"
//     ? "Sepolia"
//     : cid === "0x89"
//     ? "Polygon"
//     : cid === "0xa"
//     ? "Optimism"
//     : cid === "0x2105"
//     ? "Base"
//     : cid
//     ? `Chain ${parseInt(cid, 16)}`
//     : "—";

// const explorer = (kind: "address" | "token" | "tx", v: string, chainId?: string) => {
//   const base =
//     chainId === "0x89"
//       ? "https://polygonscan.com"
//       : chainId === "0x2105"
//       ? "https://basescan.org"
//       : chainId === "0xaa36a7"
//       ? "https://sepolia.etherscan.io"
//       : "https://etherscan.io";
//   return `${base}/${kind}/${v}`;
// };

// /* mini toast */
// function useToast() {
//   const [msg, setMsg] = useState<string>();
//   const [tone, setTone] = useState<"ok" | "warn" | "err">("ok");
//   const show = (m: string, t: "ok" | "warn" | "err" = "ok") => {
//     setTone(t);
//     setMsg(m);
//     setTimeout(() => setMsg(undefined), 1800);
//   };
//   const el = msg ? (
//     <div
//       style={{
//         position: "fixed",
//         right: 16,
//         bottom: 16,
//         zIndex: 50,
//         background: "var(--card)",
//         border: `1px solid ${tone === "ok" ? "#bbf7d0" : tone === "warn" ? "#fde68a" : "#fecaca"}`,
//         color: tone === "ok" ? "#065f46" : tone === "warn" ? "#92400e" : "#7f1d1d",
//         padding: "10px 14px",
//         borderRadius: 12,
//         boxShadow: "0 10px 30px rgba(2,6,23,.12)",
//       }}
//     >
//       {msg}
//     </div>
//   ) : null;
//   return { show, el };
// }

// /* ─────────────────────────────────────────────
//    Config réseau attendu (à adapter)
// ────────────────────────────────────────────── */
// const EXPECTED_CHAIN = {
//   chainId: "0x1",
//   name: "Ethereum",
//   rpc: ["https://rpc.ankr.com/eth"],
//   explorer: "https://etherscan.io",
//   currency: { name: "Ether", symbol: "ETH", decimals: 18 },
// } as const;

// /* ─────────────────────────────────────────────
//    Page
// ────────────────────────────────────────────── */
// export default function Wallet() {
//   const nav = useNavigate();
//   const toast = useToast();

//   // onglets (si tu veux les utiliser plus tard)
//   const [activeTab, setActiveTab] = useState<"portfolio" | "nfts" | "activity" | "settings">("portfolio");

//   const [refCcy, setRefCcy] = useState<"EUR" | "USD" | "MAD" | "GBP" | "AED">(
//     () => (localStorage.getItem("fx_ccy") as any) || "EUR"
//   );
//   useEffect(() => {
//     localStorage.setItem("fx_ccy", refCcy);
//   }, [refCcy]);

//   const [hasMM, setHasMM] = useState(false);
//   const [account, setAccount] = useState<string | undefined>();
//   const [chainId, setChainId] = useState<string | undefined>();
//   const [isAuth, setIsAuth] = useState(false); // session backend liée par signature

//   const [loadingEth, setLoadingEth] = useState(false);
//   const [balances, setBalances] = useState<Balance[]>([
//     { assetId: "eth", amount: "0" },
//     { assetId: "usdc", amount: "15230000" },
//     { assetId: "dai", amount: "501234000000000000000" },
//     { assetId: "sol", amount: "345600000" },
//   ]);

//   const [positions, setPositions] = useState<Position[]>([]);
//   const [nfts, setNfts] = useState<NFTItem[]>([]);
//   const [loadingNFTs, setLoadingNFTs] = useState(false);

//   /* taux fiat (EUR base) -> refCcy */
//   const rates: Rates = useMemo(() => {
//     const base: Rates = { eth: 2900, usdc: 0.92, dai: 0.92, sol: 130 }; // base EUR
//     const fxTable = { EUR: 1, USD: 1.08, MAD: 10.8, GBP: 0.85, AED: 3.97 } as const;
//     const fx = fxTable[refCcy];
//     return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v * fx])) as Rates;
//   }, [refCcy]);

//   /* Provider boot */
//   useEffect(() => {
//     const eth = (window as any).ethereum;
//     setHasMM(Boolean(eth));
//     if (!eth) return;

//     (async () => {
//       try {
//         const [accs, cid] = await Promise.all([
//           eth.request({ method: "eth_accounts" }),
//           eth.request({ method: "eth_chainId" }),
//         ]);
//         setAccount(accs?.[0]);
//         setChainId(cid);
//       } catch {
//         /* noop */
//       }
//     })();

//     const onA = (a: string[]) => setAccount(a?.[0]);
//     const onC = (c: string) => setChainId(c);
//     eth.on?.("accountsChanged", onA);
//     eth.on?.("chainChanged", onC);
//     return () => {
//       eth.removeListener?.("accountsChanged", onA);
//       eth.removeListener?.("chainChanged", onC);
//     };
//   }, []);
//   useEffect(()=>{
//   if(!account || !isAuth) return;
//   setLoadingNFTs(true);
//   listNfts(account)
//     .then(setNfts)
//     .catch(()=>setNfts([]))
//     .finally(()=>setLoadingNFTs(false));
// }, [account, isAuth]);

//   /* Fetch solde ETH backend (si account) */
//   useEffect(() => {
//     if (!account) return;
//     setLoadingEth(true);
//     (async () => {
//       try {
//         // adapte l’URL selon ton API
//         const r = await fetch(`/wallets/${account}/eth`);
//         const j = await r.json();
//         if (j?.wei) {
//           setBalances((prev) => prev.map((b) => (b.assetId === "eth" ? { ...b, amount: String(j.wei) } : b)));
//         }
//       } catch {
//         toast.show("Impossible de charger le solde ETH", "warn");
//       } finally {
//         setLoadingEth(false);
//       }
//     })();
//   }, [account]);

//   /* Charger positions + NFTs (session requise côté backend) */
//   useEffect(() => {
//     (async () => {
//       try {
//         setLoadingNFTs(true);
//         // adapte ces deux endpoints à ton backend
//         const [pRes, nRes] = await Promise.allSettled([
//           fetch("/me/wallet/positions", { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
//           fetch("/me/wallet/nfts", { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
//         ]);

//         if (pRes.status === "fulfilled" && Array.isArray(pRes.value)) setPositions(pRes.value);
//         if (nRes.status === "fulfilled" && Array.isArray(nRes.value)) setNfts(nRes.value);
//       } finally {
//         setLoadingNFTs(false);
//       }
//     })();
//   }, [isAuth]);

//   /* Helpers */
//   const totalFiat = useMemo(
//     () =>
//       balances.reduce((s, b) => {
//         const a = ASSETS.find((x) => x.id === b.assetId)!;
//         return s + toFiat(b.amount, a.decimals, rates[b.assetId] || 0);
//       }, 0),
//     [balances, rates]
//   );

//   const totalPositions = useMemo(
//     () =>
//       positions.reduce((s, p) => {
//         const a = ASSETS.find((x) => x.id === p.assetId)!;
//         return s + toFiat(p.amountRaw, a.decimals, rates[p.assetId] || 0);
//       }, 0),
//     [positions, rates]
//   );

//   /* Actions */
//   const connect = async () => {
//     const eth = (window as any).ethereum;
//     if (!eth) return toast.show("MetaMask non détecté", "warn");
//     try {
//       await eth.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
//       const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
//       setAccount(accs?.[0]);
//       const cid: string = await eth.request({ method: "eth_chainId" });
//       setChainId(cid);
//       toast.show("Connecté à MetaMask");
//       await ensureChain();
//     } catch (err: any) {
//       toast.show(err?.message || "Connexion refusée", "err");
//     }
//   };

//   const ensureChain = async () => {
//     const eth = (window as any).ethereum;
//     if (!eth) return;
//     const cid = await eth.request({ method: "eth_chainId" });
//     if (cid !== EXPECTED_CHAIN.chainId) {
//       try {
//         await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: EXPECTED_CHAIN.chainId }] });
//         setChainId(EXPECTED_CHAIN.chainId);
//         toast.show("Réseau basculé");
//       } catch (e: any) {
//         if (e?.code === 4902) {
//           await eth.request({
//             method: "wallet_addEthereumChain",
//             params: [
//               {
//                 chainId: EXPECTED_CHAIN.chainId,
//                 chainName: EXPECTED_CHAIN.name,
//                 rpcUrls: EXPECTED_CHAIN.rpc,
//                 nativeCurrency: EXPECTED_CHAIN.currency,
//                 blockExplorerUrls: [EXPECTED_CHAIN.explorer],
//               },
//             ],
//           });
//         } else {
//           toast.show("Changement de réseau refusé", "warn");
//         }
//       }
//     }
//   };

//   const signIn = async () => {
//     const eth = (window as any).ethereum;
//     if (!eth) return;
//     try {
//       const [addr] = await eth.request({ method: "eth_requestAccounts" });
//       const r = await fetch("/auth/nonce", { credentials: "include" });
//       const { nonce } = await r.json();

//       const domain = window.location.host;
//       const message = `domain: ${domain}
// address: ${addr}
// statement: Login
// nonce: ${nonce}
// issuedAt: ${new Date().toISOString()}
// expirationTime: ${new Date(Date.now() + 5 * 60 * 1000).toISOString()}`;

//       const signature = await eth.request({ method: "personal_sign", params: [message, addr] });
//       const v = await fetch("/auth/verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ address: addr, message, signature }),
//       });
//       if (!v.ok) throw new Error("Auth failed");
//       setIsAuth(true);
//       toast.show("Adresse liée au compte");
//     } catch (e: any) {
//       toast.show(e?.message || "Signature refusée", "warn");
//     }
//   };

//   const logout = async () => {
//     try {
//       await fetch("/auth/logout", { method: "POST", credentials: "include" });
//     } catch {}
//     setIsAuth(false);
//     setAccount(undefined);
//     setChainId(undefined);
//     toast.show("Déconnecté");
//   };

//   const addTokenToMM = async (symbol: "USDC" | "DAI") => {
//     const eth = (window as any).ethereum;
//     if (!eth) return;
//     try {
//       const params =
//         symbol === "USDC"
//           ? {
//               address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//               decimals: 6,
//               image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
//             }
//           : {
//               address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
//               decimals: 18,
//               image: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
//             };
//       await eth.request({
//         method: "wallet_watchAsset",
//         params: { type: "ERC20", options: { address: params.address, symbol, decimals: params.decimals, image: params.image } },
//       });
//       toast.show(symbol + " ajouté à MetaMask");
//     } catch {
//       toast.show("Ajout refusé", "warn");
//     }
//   };

//   /* UI */
//   const hasWrongChain = hasMM && chainId && chainId !== EXPECTED_CHAIN.chainId;
//   const installMMUrl = "https://metamask.io/download/";

//   return (
//     <>
//       <style>{css}</style>
//       {toast.el}

//       {/* Header */}

//       <div className="row" style={{ marginBottom: 8 }}>
//         <h1 className="h1">Mon Wallet</h1>
//         <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
//           <button
//             className="btn btnGhost"
//             onClick={() =>
//               setRefCcy(refCcy === "EUR" ? "USD" : refCcy === "USD" ? "MAD" : refCcy === "MAD" ? "GBP" : refCcy === "GBP" ? "AED" : "EUR")
//             }
//           >
//             {refCcy} ▾
//           </button>
//           {hasMM ? (
//             account ? (
//               <>
//                 <a
//                   className="pill link"
//                   href={explorer("address", account, chainId)}
//                   target="_blank"
//                   rel="noreferrer"
//                   style={{ textDecoration: "none" }}
//                 >
//                   {short(account)} ↗
//                 </a>
//                 {!isAuth && (
//                   <button className="btn btnPrimary" onClick={signIn}>
//                     Lier l'adresse (Signer)
//                   </button>
//                 )}
//                 <button className="btn btnGhost" onClick={logout}>
//                   Déconnexion
//                 </button>
//               </>
//             ) : (
//               <button className="btn btnPrimary" onClick={connect}>
//                 Connecter MetaMask
//               </button>
//             )
//           ) : (
//             <a className="btn btnPrimary" href={installMMUrl} target="_blank" rel="noreferrer">
//               Installer MetaMask
//             </a>
//           )}
//         </div>
//       </div>
      
//       {/* Bandeau mauvais réseau */}
//       {hasWrongChain && (
//         <div className="banner" style={{ marginBottom: 8 }}>
//           <div>
//             Réseau détecté: <b>{chainName(chainId)}</b> — attendu: <b>{EXPECTED_CHAIN.name}</b>
//           </div>
//           <div style={{ display: "flex", gap: 8 }}>
//             <button className="btn btnWarn" onClick={ensureChain}>
//               Basculer le réseau
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Tabs (optionnels) */}
//       <div className="tabs">
//         <div className={`tab ${activeTab === "portfolio" ? "active" : ""}`} onClick={() => setActiveTab("portfolio")}>
//           Portfolio
//         </div>
//         <div className={`tab ${activeTab === "nfts" ? "active" : ""}`} onClick={() => setActiveTab("nfts")}>
//           Mes NFTs
//         </div>
//         <div className={`tab ${activeTab === "activity" ? "active" : ""}`} onClick={() => setActiveTab("activity")}>
//           Activité
//         </div>
//         <div className={`tab ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
//           Réglages
//         </div>
//       </div>

//       {/* Contrôles top */}
//       <div className="grid2" style={{ marginTop: 10 }}>
//         <div className="card row">
//           <div>
//             <div className="sub">Total crypto</div>
//             <div style={{ fontWeight: 900, fontSize: 22 }}>
//               {totalFiat.toLocaleString(undefined, { maximumFractionDigits: 2 })} {refCcy}
//             </div>
//           </div>
//           <div style={{ display: "flex", gap: 6 }}>
//             <button className="btn btnGhost" onClick={() => addTokenToMM("USDC")}>
//               +USDC
//             </button>
//             <button className="btn btnGhost" onClick={() => addTokenToMM("DAI")}>
//               +DAI
//             </button>
//           </div>
//         </div>
//         <div className="card row">
//           <div>
//             <div className="sub">Total positions</div>
//             <div style={{ fontWeight: 900, fontSize: 22 }}>
//               {totalPositions.toLocaleString(undefined, { maximumFractionDigits: 2 })} {refCcy}
//             </div>
//           </div>
//           <span className="badgePri">Titres & unités</span>
//         </div>
//       </div>

//       {activeTab === "portfolio" && (
//         <>
//           {/* Adresses */}
//           <div className="grid" style={{ marginTop: 10 }}>
//             <div className="sub">Adresse EVM principale</div>
//             <div className="assetRow">
//               <div className="assetL">
//                 <div className="logo">🦊</div>
//                 <div>
//                   <b>{account ? short(account) : "—"}</b>
//                   <div className="sub">{chainName(chainId)}</div>
//                 </div>
//               </div>
//               <div style={{ display: "flex", gap: 8 }}>
//                 {account && (
//                   <a className="btn btnGhost" href={explorer("address", account, chainId)} target="_blank" rel="noreferrer">
//                     Explorer
//                   </a>
//                 )}
//               </div>
//             </div>

//             <div className="sub">Adresse Solana (à connecter plus tard)</div>
//             <div className="assetRow">
//               <div className="assetL">
//                 <div className="logo">🪄</div>
//                 <div>
//                   <b>Phantom/Backpack</b>
//                   <div className="sub">Non connecté</div>
//                 </div>
//               </div>
//               <button className="btn btnGhost" disabled>
//                 Connect Phantom
//               </button>
//             </div>
//           </div>

//           {/* Soldes par actif */}
//           <div style={{ marginTop: 12 }}>
//             <div className="sub">Portfolio</div>
//             <div className="grid">
//               {ASSETS.map((a) => {
//                 const b = balances.find((x) => x.assetId === a.id)!;
//                 const fiat = toFiat(b.amount, a.decimals, rates[a.id] || 0);
//                 const human = formatUnits(b.amount, a.decimals);
//                 const loading = loadingEth && a.id === "eth";
//                 return (
//                   <div key={a.id} className="assetRow">
//                     <div className="assetL">
//                       <div className="logo">{a.logo || "◻️"}</div>
//                       <div>
//                         <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                           <b>{a.symbol}</b>
//                           <span className="chain">{a.chain.toUpperCase()}</span>
//                         </div>
//                         <div className="sub">{a.name}</div>
//                       </div>
//                     </div>
//                     <div style={{ textAlign: "right" }}>
//                       <div style={{ fontWeight: 900 }}>{loading ? <span className="skel" /> : human}</div>
//                       <div className="sub">
//                         {fiat.toLocaleString(undefined, { maximumFractionDigits: 2 })} {refCcy}
//                       </div>
//                       {a.chain !== "evm" && (
//                         <div style={{ marginTop: 6 }}>
//                           <span className="badge">Connect Phantom</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Positions (unités + badges NFT) */}
//           {positions.length > 0 && (
//             <div style={{ marginTop: 12 }}>
//               <div className="row">
//                 <div className="sub">Positions</div>
//                 <a
//                   className="link"
//                   href="/properties"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     nav("/properties");
//                   }}
//                 >
//                   Découvrir d'autres offres →
//                 </a>
//               </div>
//               <div className="grid">
//                 {positions.map((p) => {
//                   const a = ASSETS.find((x) => x.id === p.assetId)!;
//                   const amt = formatUnits(p.amountRaw, a.decimals);
//                   const fiat = toFiat(p.amountRaw, a.decimals, rates[p.assetId] || 0);
//                   return (
//                     <div key={p.id} className="assetRow">
//                       <div className="assetL" style={{ gap: 12 }}>
//                         <div className="logo">🏷️</div>
//                         <div>
//                           <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
//                             <b>{p.title}</b>
//                             {typeof p.units === "number" && <span className="unitBadge">Unités: {p.units}</span>}
//                             {p.nftTokenIds?.map((id) => (
//                               <span key={id} className="nftBadge">
//                                 NFT {id}
//                               </span>
//                             ))}
//                           </div>
//                           <div className="sub">
//                             {a.symbol} • {amt} ({fiat.toLocaleString(undefined, { maximumFractionDigits: 2 })} {refCcy}) —{" "}
//                             {p.status || "En cours"}
//                           </div>
//                         </div>
//                       </div>
//                       <div style={{ display: "flex", gap: 8 }}>
//                         <button className="btn btnGhost" onClick={() => nav(`/properties/${p.id}`)}>
//                           Détails
//                         </button>
//                         <button className="btn btnPrimary" onClick={() => nav(`/transfer?pos=${p.id}`)}>
//                           Transférer
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </>
//       )}

//   {/* Mes NFTs */}
//       {activeTab === "nfts" && (
//         <div style={{ marginTop: 12 }}>
//           <div className="row">
//             <div className="sub">Mes NFTs (titres)</div>
//             {loadingNFTs && <span className="badge">Chargement…</span>}
//           </div>
//           {nfts.length === 0 ? (
//             <div className="card sub">Aucun titre pour l'instant. Après un investissement signé, votre NFT d'attestation apparaît ici.</div>
//           ) : (
//             <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
//               {nfts.map((n) => (
//                 <div key={n.tokenId} className="card">
//                   <img
//                     src={n.imageUrl || "/assets/placeholder.jpg"}
//                     alt=""
//                     style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }}
//                   />
//                   <div className="row" style={{ marginTop: 8 }}>
//                     <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</b>
//                     <span className="badge">{n.category}</span>
//                   </div>
//                   <div className="sub" style={{ marginTop: 6 }}>
//                     Token #{n.tokenId}{" "}
//                     {typeof n.units === "number" && <span className="unitBadge" style={{ marginLeft: 6 }}>Unités: {n.units}</span>}
//                   </div>

//                   <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
//                     <a className="btn btnGhost" href={explorer("token", n.contract, chainId)} target="_blank" rel="noreferrer">
//                       Explorer
//                     </a>
//                     <a className="btn btnPrimary" href={`/nft/${n.tokenId}/attestation`} target="_blank" rel="noreferrer">
//                       Attestation
//                     </a>
//                     {n.transferable && (
//                       <button className="btn btnGhost" onClick={() => nav(`/transfer?nft=${n.tokenId}`)}>
//                         Transférer
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Actions globales */}
//       <div className="grid" style={{ marginTop: 12 }}>
//         <div className="row">
//           <div className="sub">Actions</div>
//           <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//             <button className="btn btnPrimary" onClick={() => nav("/deposit")} disabled={!account || hasWrongChain || !isAuth}>
//               Déposer
//             </button>
//             <button className="btn btnGhost" onClick={() => nav("/withdraw")} disabled={!account || hasWrongChain || !isAuth}>
//               Retirer
//             </button>
//             <button className="btn btnGhost" onClick={() => nav("/transfer")} disabled={!account || !isAuth}>
//               Transférer
//             </button>
//             <button className="btn btnGhost" onClick={() => nav("/activity")}>Activité</button>
//             <button className="btn btnGhost" onClick={() => nav("/settings")}>Réglages</button>
//           </div>
//         </div>
//         <div className="sub">
//           * Les opérations critiques nécessitent une adresse connectée, le bon réseau et une <b>signature</b> (liaison compte).
//         </div>
//       </div>

//       {/* ✅ Ajout global de la modale d'investissement */}
//       <InvestOrderDialog />
//     </>
//   );
// }
//[[[[[[[[[[[[[[[[[[[[[[[[[[[V3]]]]]]]]]]]]]]]]]]]]]]]]]]]
// //src/pages/WalletPage.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// /* ——————————————————————  THEME (rouge/blanc) + styles globaux —————————————————————— */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
// :root{
//   --ink:#111827; --sub:#6b7280; --line:#eceff3;
//   --bg:#ffffff; --card:#ffffff;
//   --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2;
// }
// *{box-sizing:border-box}
// body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit}
// .section{margin-top:16px}

// /* Header */
// .w-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:22px auto 8px;max-width:1180px;padding:0 18px}
// .h1{margin:0;font-size:28px;font-weight:900;letter-spacing:-.01em}
// .pills{display:flex;gap:8px;flex-wrap:wrap}
// .pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;font-weight:800}
// .btn{position:relative;overflow:hidden;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff}
// .btn:active{transform:scale(.98)}
// .btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
// .btnGhost{border-color:#fecaca;color:var(--pri);background:#fff}
// .rip{position:absolute;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);transform:translate(-50%,-50%) scale(0);animation:r .6s ease-out forwards}
// @keyframes r{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

// /* Bar d'état */
// .hero{
//   max-width:1180px;margin:0 auto;padding:0 18px;
// }
// .heroCard{
//   position:relative;overflow:hidden;margin-top:8px;
//   border:1px solid var(--line);border-radius:18px;background:
//     radial-gradient(900px 240px at -10% -40%, rgba(225,17,46,.12), #0000),
//     radial-gradient(800px 240px at 110% -30%, rgba(190,18,60,.10), #0000),
//     #fff;
//   padding:16px;
//   box-shadow:0 12px 34px rgba(16,24,40,.06);
// }
// .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
// @media (max-width: 980px){ .stats{grid-template-columns:repeat(2,1fr)} }
// .sCard{border:1px solid var(--line);border-radius:14px;padding:12px;background:#fff}
// .sK{color:var(--sub);font-size:12px}
// .sV{font-weight:900;font-size:22px}

// /* Alert réseau */
// .alert{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px;margin-top:8px}

// /* Tabs */
// .tabs{max-width:1180px;margin:12px auto 0;padding:0 18px;display:flex;gap:6px;border-bottom:1px solid var(--line)}
// .tab{padding:9px 12px;border-radius:10px;cursor:pointer;color:var(--sub);font-weight:800}
// .tab.active{color:var(--pri);background:#fff2f3;border:1px solid #fecaca}

// /* Conteneur */
// .wrap{max-width:1180px;margin:0 auto;padding:0 18px}

// /* ——— Portfolio tiles ——— */
// .assets{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
// @media (max-width: 920px){ .assets{grid-template-columns:1fr} }

// .asset{
//   --hover: 0 18px 52px rgba(16,24,40,.12);
//   position:relative; display:flex; align-items:center; gap:14px;
//   border:1px solid var(--line); border-radius:16px; background:#fff; padding:14px;
//   box-shadow:0 12px 40px rgba(16,24,40,.06); transition:transform .16s ease, box-shadow .16s ease, border-color .16s ease;
// }
// .asset:hover{ transform:translateY(-2px); box-shadow:var(--hover); border-color:#ffd4d9 }
// .asset:after{
//   content:""; position:absolute; left:0; top:10px; bottom:10px; width:4px; border-radius:4px;
//   background:linear-gradient(180deg,#ffccd2,#e11d2e); opacity:.25;
// }
// .assetL{display:flex; align-items:center; gap:12px; min-width:0; flex:1}
// .logo{width:48px;height:48px;border-radius:14px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc;display:grid;place-items:center}
// .logo img{width:100%;height:100%;object-fit:cover}
// .name{font-weight:900}
// .chain{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid #e5e7eb;color:#475569;font-weight:800}
// .assetR{text-align:right;margin-left:auto}
// .assetAmt{font-weight:900;font-size:18px}
// .assetFiat{color:var(--sub);font-size:13px}
// .assetActions{display:flex;gap:8px;margin-top:8px}
// .chipBtn{border:1px solid #fecaca;color:#e11d2e;background:#fff;border-radius:10px;padding:6px 10px;font-weight:800;cursor:pointer}
// .spark{width:120px;height:32px;margin-left:auto;filter:drop-shadow(0 4px 10px rgba(225,29,46,.15))}
// .spark path{stroke-width:2}

// /* ——— Unités d'investissement ——— */
// .unitsCard{border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px;box-shadow:0 12px 34px rgba(16,24,40,.06)}
// .unitsHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
// .uBadge{border:1px solid #fecaca;background:#fff1f2;color:#e11d2e;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px}
// .uMeta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px}
// .uBox{border:1px solid #f3f4f6;border-radius:12px;padding:10px;text-align:center}
// .uK{color:var(--sub);font-size:12px}
// .uV{font-weight:900;font-size:18px}
// .uList{display:grid;gap:10px}
// .uItem{display:flex;gap:10px;align-items:center;border:1px solid #f0f2f6;border-radius:12px;padding:10px}
// .uThumb{width:56px;height:40px;border-radius:10px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc}
// .uThumb img{width:100%;height:100%;object-fit:cover}
// .uTitle{font-weight:900}
// .uUnits{margin-left:auto;font-weight:900}
// .uActions{display:flex;gap:8px}

// /* ——— NFTs ——— */
// .nGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
// @media (max-width:990px){ .nGrid{grid-template-columns:repeat(2,1fr)} }
// @media (max-width:640px){ .nGrid{grid-template-columns:1fr} }
// .nCard{border:1px solid var(--line);border-radius:16px;padding:12px;background:#fff;box-shadow:0 10px 28px rgba(16,24,40,.06)}
// .nImg{width:100%;height:160px;border-radius:10px;object-fit:cover;border:1px solid #eef2f7}
// .nHead{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
// .badge{border:1px solid var(--line);border-radius:999px;padding:3px 8px;font-size:12px;color:var(--sub)}
// .nBtns{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
// `;

// /* ——————————————————————  HELPERS / DATA —————————————————————— */
// type ChainKind = "evm" | "solana";
// type Asset = { id: "eth"|"usdc"|"dai"|"sol"; symbol: "ETH"|"USDC"|"DAI"|"SOL"; name: string; chain: ChainKind; decimals: number; };
// type Balance = { assetId: Asset["id"]; amount: string };

// type UnitLine = {
//   propertyId: string; title: string; thumb?: string;
//   units: number; status: "en_attente" | "confirmé" | "livré";
//   investmentId?: string;
// };

// type NFTItem = { tokenId: string; contract: string; title: string; imageUrl?: string; transferable: boolean; units?: number; category: string };

// const ASSETS: Asset[] = [
//   { id:"eth",  symbol:"ETH",  name:"Ethereum",        chain:"evm",   decimals:18 },
//   { id:"usdc", symbol:"USDC", name:"USD Coin",        chain:"evm",   decimals:6  },
//   { id:"dai",  symbol:"DAI",  name:"Dai",             chain:"evm",   decimals:18 },
//   { id:"sol",  symbol:"SOL",  name:"Solana",          chain:"solana",decimals:9  },
// ];

// const TOKEN_LOGO: Record<string,string> = {
//   ETH:"https://cryptologos.cc/logos/ethereum-eth-logo.png",
//   USDC:"https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
//   DAI:"https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
//   SOL:"https://cryptologos.cc/logos/solana-sol-logo.png",
// };

// const EXPECTED_CHAIN = { chainId:"0xaa36a7", name:"Sepolia", explorer:"https://sepolia.etherscan.io",
//   currency:{ name:"Ether", symbol:"ETH", decimals:18 }, rpc:["https://rpc.ankr.com/eth_sepolia"] } as const;

// const short = (a?:string, n=4)=> a ? `${a.slice(0,2+n)}…${a.slice(-n)}` : "—";
// const formatUnits = (raw:string, dec:number, prec=6)=>{
//   if(!raw) return "0";
//   const neg = raw.startsWith("-"); const s = neg ? raw.slice(1) : raw;
//   const bi = BigInt(s); const base = BigInt(10)**BigInt(dec);
//   const i = bi/base; const f = bi%base;
//   const frac = f.toString().padStart(dec,"0").slice(0,prec).replace(/0+$/,"");
//   return `${neg?"-":""}${i}${frac? "."+frac:""}`;
// };
// const toFiat = (raw:string, dec:number, rate:number)=> Number(formatUnits(raw,dec,12))*rate;

// const chainName = (cid?:string)=> cid==="0xaa36a7"?"Sepolia":cid==="0x1"?"Ethereum":cid?`Chain ${parseInt(cid,16)}`:"—";

// const ripple = (e:React.MouseEvent<HTMLElement>)=>{
//   const host=e.currentTarget as HTMLElement; const r=document.createElement("i"); r.className="rip";
//   const rect = host.getBoundingClientRect(); r.style.left=`${e.clientX-rect.left}px`; r.style.top=`${e.clientY-rect.top}px`;
//   host.appendChild(r); setTimeout(()=>r.remove(),600);
// };

// const Sparkline: React.FC<{ color?:string; points?:number[] }> = ({ color="#e11d2e", points })=>{
//   const pts = points ?? [8,12,10,16,14,20,18,28,22,30];
//   const max=Math.max(...pts), min=Math.min(...pts), H=32, W=120;
//   const norm=(v:number)=> H-2 - ((v-min)/(max-min||1))*(H-4);
//   const step = W/(pts.length-1);
//   const d = pts.map((v,i)=>`${i*step},${norm(v)}`).join(" ");
//   return (
//     <svg className="spark" viewBox={`0 0 ${W} ${H}`} fill="none">
//       <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stopColor={color} stopOpacity=".28"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
//       <polyline points={d} stroke={color} fill="url(#g)" />
//     </svg>
//   );
// };

// /* ——————————————————————  PAGE  —————————————————————— */
// export default function WalletPage(){
//   const nav = useNavigate();
//   const loc = useLocation();
//   const q = new URLSearchParams(loc.search);
//   const intent = q.get("intent") as ("pay"|"deposit"|"withdraw"|"transfer"|null);

//   // sections refs pour auto-scroll suivant l'intent
//   const refPortfolio = useRef<HTMLDivElement|null>(null);
//   const refUnits     = useRef<HTMLDivElement|null>(null);
//   const refNFTs      = useRef<HTMLDivElement|null>(null);

//   const [refCcy, setRefCcy] = useState<"EUR"|"USD"|"MAD"|"GBP"|"AED">(
//     ()=>(localStorage.getItem("fx_ccy") as any)||"EUR"
//   );
//   useEffect(()=>localStorage.setItem("fx_ccy",refCcy),[refCcy]);

//   // MetaMask / SIWE
//   const [hasMM,setHasMM]=useState(false);
//   const [account,setAccount]=useState<string|undefined>();
//   const [chainId,setChainId]=useState<string|undefined>();
//   const [isAuth,setIsAuth]=useState(false);

//   // Données (mock + prêt à brancher API)
//   const [balances,setBalances]=useState<Balance[]>([
//     { assetId:"eth",  amount:"12000000000000000" },     // 0.012
//     { assetId:"usdc", amount:"15230000" },              // 15.23
//     { assetId:"dai",  amount:"501234000000000000000" }, // 501.234
//     { assetId:"sol",  amount:"345600000" },             // 0.3456
//   ]);

//   const [units,setUnits] = useState<UnitLine[]>([
//     { propertyId:"101", title:"F3 — Casablanca Centre", thumb:"https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200&auto=format&fit=crop", units:3, status:"livré" },
//     { propertyId:"204", title:"Studio — Gauthier", thumb:"https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop", units:1, status:"en_attente", investmentId:"d1i0lfia13n" },
//   ]);

//   const [nfts,setNfts]=useState<NFTItem[]>([]);  // charge après auth si tu veux

//   // FX & prix (base EUR -> refCcy)
//   const rates = useMemo(()=>{
//     const base = { eth:2900, usdc:0.92, dai:0.92, sol:130 }; // EUR
//     const fxTable = { EUR:1, USD:1.08, MAD:10.8, GBP:0.85, AED:3.97 } as const;
//     const fx = fxTable[refCcy]; const out:any={};
//     Object.entries(base).forEach(([k,v])=>out[k]=v*fx); return out as Record<Asset["id"],number>;
//   },[refCcy]);

//   const totalCrypto = useMemo(()=>balances.reduce((s,b)=>{
//     const a=ASSETS.find(x=>x.id===b.assetId)!; return s + toFiat(b.amount,a.decimals,rates[a.id]||0);
//   },0),[balances,rates]);

//   const totalUnits = useMemo(()=> units.reduce((s,u)=>s+u.units,0),[units]);
//   const totalUnitsConfirmed = useMemo(()=>units.filter(u=>u.status!=="en_attente").reduce((s,u)=>s+u.units,0),[units]);
//   const totalUnitsPending   = useMemo(()=>units.filter(u=>u.status==="en_attente").reduce((s,u)=>s+u.units,0),[units]);

//   // Boot MM
//   useEffect(()=>{
//     const eth=(window as any).ethereum; setHasMM(Boolean(eth)); if(!eth) return;
//     (async()=>{
//       try{
//         const [accs,cid]=await Promise.all([
//           eth.request({method:"eth_accounts"}),
//           eth.request({method:"eth_chainId"})
//         ]);
//         setAccount(accs?.[0]); setChainId(cid);
//       }catch{}
//     })();
//     const onA=(a:string[])=>setAccount(a?.[0]); const onC=(c:string)=>setChainId(c);
//     eth.on?.("accountsChanged",onA); eth.on?.("chainChanged",onC);
//     return()=>{ eth.removeListener?.("accountsChanged",onA); eth.removeListener?.("chainChanged",onC); };
//   },[]);

//   // Auto-scroll selon intent (pay/deposit/withdraw/transfer)
//   useEffect(()=>{
//     const el = intent==="pay" ? refUnits.current
//             : intent==="deposit" ? refPortfolio.current
//             : intent==="withdraw" ? refPortfolio.current
//             : intent==="transfer" ? refPortfolio.current
//             : null;
//     if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
//   },[intent]);

//   const ensureChain = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return;
//     const cid = await eth.request({method:"eth_chainId"});
//     if(cid !== EXPECTED_CHAIN.chainId){
//       try{
//         await eth.request({method:"wallet_switchEthereumChain", params:[{chainId:EXPECTED_CHAIN.chainId}]});
//         setChainId(EXPECTED_CHAIN.chainId);
//       }catch(e:any){
//         if(e?.code===4902){
//           await eth.request({method:"wallet_addEthereumChain", params:[{
//             chainId:EXPECTED_CHAIN.chainId, chainName:EXPECTED_CHAIN.name, rpcUrls:EXPECTED_CHAIN.rpc,
//             nativeCurrency:EXPECTED_CHAIN.currency, blockExplorerUrls:[EXPECTED_CHAIN.explorer]
//           }]});
//         }
//       }
//     }
//   };
//   const connect = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return window.open("https://metamask.io/download/","_blank");
//     await eth.request({method:"wallet_requestPermissions", params:[{eth_accounts:{}}]});
//     const accs:string[]=await eth.request({method:"eth_requestAccounts"}); setAccount(accs?.[0]);
//     const cid:string=await eth.request({method:"eth_chainId"}); setChainId(cid); ensureChain();
//   };
//   const signIn = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return;
//     const [addr]=await eth.request({method:"eth_requestAccounts"});
//     const nonce= await fetch("/auth/nonce",{credentials:"include"}).then(r=>r.json()).catch(()=>({nonce:Math.random().toString(36).slice(2)}));
//     const domain=window.location.host;
//     const msg=`domain: ${domain}
// address: ${addr}
// statement: Login
// nonce: ${nonce.nonce}
// issuedAt: ${new Date().toISOString()}`;
//     const signature=await eth.request({method:"personal_sign", params:[msg,addr]});
//     const ok= await fetch("/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({address:addr,message:msg,signature})}).then(r=>r.ok);
//     if(ok) setIsAuth(true);
//   };
//   const logout = async()=>{ try{ await fetch("/auth/logout",{method:"POST",credentials:"include"});}catch{} setIsAuth(false); setAccount(undefined); };

//   const wrongChain = hasMM && chainId && chainId!==EXPECTED_CHAIN.chainId;

//   return (
//     <>
//       <style>{CSS}</style>

//       {/* HEADER */}
//       <header className="w-head">
//         <h1 className="h1">Mon Wallet</h1>
//         <div className="pills">
//           <button className="pill" onClick={()=>setRefCcy(refCcy==="EUR"?"USD":refCcy==="USD"?"MAD":refCcy==="MAD"?"GBP":refCcy==="GBP"?"AED":"EUR")}>{refCcy} ▾</button>
//           {hasMM ? (
//             account ? (
//               <>
//                 <span className="pill">{short(account)} • {chainName(chainId)}</span>
//                 {!isAuth && <button className="btn btnPrimary" onClick={(e)=>{ripple(e);signIn();}}>Lier (Signer)</button>}
//                 <button className="btn btnGhost" onClick={(e)=>{ripple(e);logout();}}>Déconnexion</button>
//               </>
//             ) : (
//               <button className="btn btnPrimary" onClick={(e)=>{ripple(e);connect();}}>Connecter MetaMask</button>
//             )
//           ) : (
//             <a className="btn btnPrimary" href="https://metamask.io/download/" target="_blank" rel="noreferrer">Installer MetaMask</a>
//           )}
//         </div>
//       </header>

//       {/* HERO / STATS */}
//       <div className="hero">
//         {wrongChain && (
//           <div className="alert">
//             <div>Réseau détecté : <b>{chainName(chainId)}</b> — attendu : <b>{EXPECTED_CHAIN.name}</b></div>
//             <button className="btn btnGhost" onClick={(e)=>{ripple(e);ensureChain();}}>Basculer vers {EXPECTED_CHAIN.name}</button>
//           </div>
//         )}
//         <div className="heroCard">
//           <div className="stats">
//             <div className="sCard"><div className="sK">Total crypto</div><div className="sV">{totalCrypto.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div></div>
//             <div className="sCard"><div className="sK">Unités totales</div><div className="sV">{totalUnits}</div></div>
//             <div className="sCard"><div className="sK">Unités confirmées</div><div className="sV">{totalUnitsConfirmed}</div></div>
//             <div className="sCard"><div className="sK">En attente</div><div className="sV" style={{color:"var(--pri)"}}>{totalUnitsPending}</div></div>
//           </div>
//         </div>
//       </div>

//       {/* TABS */}
//       <nav className="tabs">
//         <div className="tab active">Portfolio</div>
//         <div className="tab" onClick={()=>refUnits.current?.scrollIntoView({behavior:"smooth"})}>Unités</div>
//         <div className="tab" onClick={()=>refNFTs.current?.scrollIntoView({behavior:"smooth"})}>Titres / NFTs</div>
//         <div className="tab" onClick={()=>nav("/activity")}>Activité</div>
//         <div className="tab" onClick={()=>nav("/settings")}>Réglages</div>
//       </nav>

//       <main className="wrap">
//         {/* ——————————— PORTFOLIO ——————————— */}
//         <section ref={refPortfolio} className="section">
//           <div className="assets">
//             {ASSETS.map(a=>{
//               const bal = balances.find(b=>b.assetId===a.id)!;
//               const human = formatUnits(bal.amount,a.decimals);
//               const fiat  = Number(human)*(rates[a.id]||0);
//               const color = a.id==="usdc"?"#3b82f6":a.id==="dai"?"#f59e0b":a.id==="sol"?"#10b981":"#e11d2e";
//               return (
//                 <article key={a.id} className="asset">
//                   <div className="assetL">
//                     <div className="logo"><img src={TOKEN_LOGO[a.symbol]} alt={a.symbol}/></div>
//                     <div style={{minWidth:0}}>
//                       <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
//                         <span className="name">{a.symbol}</span>
//                         <span className="chain">{a.chain.toUpperCase()}</span>
//                       </div>
//                       <div className="sub">{a.name}</div>
//                     </div>
//                   </div>

//                   <Sparkline color={color} />

//                   <div className="assetR">
//                     <div className="assetAmt">{human}</div>
//                     <div className="assetFiat">{fiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div>
//                     <div className="assetActions">
//                       <button className="chipBtn" onClick={()=>nav(`/transfer?asset=${a.id}`)} disabled={!isAuth}>Transférer</button>
//                       {a.id!=="eth" && <button className="chipBtn" onClick={()=>nav(`/swap?to=${a.id}`)}>Swap</button>}
//                     </div>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         </section>

//         {/* ——————————— UNITÉS D’INVESTISSEMENT ——————————— */}
//         <section ref={refUnits} className="section">
//           <div className="unitsCard">
//             <div className="unitsHeader">
//               <b>Unités d’investissement</b>
//               <span className="uBadge">Titres fractionnés</span>
//             </div>

//             <div className="uMeta">
//               <div className="uBox"><div className="uK">Total unités</div><div className="uV">{totalUnits}</div></div>
//               <div className="uBox"><div className="uK">Confirmées</div><div className="uV">{totalUnitsConfirmed}</div></div>
//               <div className="uBox"><div className="uK">En attente</div><div className="uV" style={{color:"var(--pri)"}}>{totalUnitsPending}</div></div>
//             </div>

//             <div className="uList">
//               {units.map(u=>(
//                 <div key={u.propertyId} className="uItem">
//                   <div className="uThumb"><img src={u.thumb || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"} alt="thumb"/></div>
//                   <div>
//                     <div className="uTitle">{u.title}</div>
//                     <div className="sub">{u.status==="livré"?"Livré (NFT émis)":u.status==="confirmé"?"Confirmé":"En attente de paiement"}</div>
//                   </div>
//                   <div className="uUnits">{u.units} u.</div>
//                   <div className="uActions">
//                     {u.status==="en_attente" ? (
//                       <button className="chipBtn" onClick={()=>nav(`/pay?investmentId=${u.investmentId}`)}>Finaliser</button>
//                     ) : (
//                       <>
//                         <button className="chipBtn" onClick={()=>nav(`/properties/${u.propertyId}`)}>Détails</button>
//                         <button className="chipBtn" onClick={()=>nav(`/tokens?propertyId=${u.propertyId}`)}>Voir NFT</button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ——————————— TITRES & NFTs ——————————— */}
//         <section ref={refNFTs} className="section">
//           <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
//             <div className="sub">Titres & NFTs</div>
//             <button className="btn btnGhost" onClick={()=>nav("/tokens")}>Voir tout</button>
//           </div>
//           {nfts.length===0 ? (
//             <div className="nCard" style={{marginTop:8}}>
//               <div className="sub">Aucun titre pour l’instant. Après paiement confirmé et mint, vos NFTs apparaissent ici.</div>
//             </div>
//           ):(
//             <div className="nGrid">
//               {nfts.map(n=>(
//                 <div className="nCard" key={n.tokenId}>
//                   <img className="nImg" src={n.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"} alt="nft"/>
//                   <div className="nHead">
//                     <b style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.title}</b>
//                     <span className="badge">{n.category}</span>
//                   </div>
//                   <div className="sub" style={{marginTop:6}}>Token #{n.tokenId}{typeof n.units==="number" && <> • {n.units} u.</>}</div>
//                   <div className="nBtns">
//                     <a className="btn btnGhost" href={`${EXPECTED_CHAIN.explorer}/token/${n.contract}`} target="_blank" rel="noreferrer">Explorer</a>
//                     <a className="btn btnPrimary" href={`/nft/${n.tokenId}/attestation`} target="_blank" rel="noreferrer">Attestation</a>
//                     {n.transferable && <button className="btn btnGhost" onClick={()=>nav(`/transfer?nft=${n.tokenId}`)}>Transférer</button>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* ——————————— ACTIONS RAPIDES ——————————— */}
//         <section className="section">
//           <div className="row" style={{justifyContent:"space-between"}}>
//             <div className="sub">Actions</div>
//             <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
//               <button className="btn btnPrimary" onClick={()=>nav("/deposit")}  disabled={!account||wrongChain||!isAuth}>Déposer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/withdraw")} disabled={!account||wrongChain||!isAuth}>Retirer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/transfer")} disabled={!account||!isAuth}>Transférer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/offers")}>Offres</button>
//             </div>
//           </div>
//           <div className="sub" style={{marginTop:6}}>
//             * Opérations critiques : adresse connectée, bon réseau ({EXPECTED_CHAIN.name}) et <b>signature</b> (liaison SIWE).
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }
// src/pages/WalletPro.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// /* ===========================================================
//    THEME (blanc/rouge) + ANIMATIONS + LAYOUT
//    =========================================================== */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
// :root{
//   --ink:#0b1220; --sub:#6b7280; --line:#eceff3;
//   --bg:#ffffff; --card:#ffffff;
//   --pri:#e11d2e; --pri-700:#be123c; --soft:#fff1f2;
//   --ok:#16a34a; --warn:#f59e0b; --err:#dc2626;
//   --shadow:0 16px 44px rgba(16,24,40,.08);
// }
// *{box-sizing:border-box}
// html,body,#root{height:100%}
// body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit}
// button{font-family:inherit}
// .wrap{max-width:1180px;margin:26px auto 40px;padding:0 18px}

// /* TITRAGE */
// .h1{margin:0;font-weight:800;letter-spacing:-.02em;font-size:32px;font-family:"Plus Jakarta Sans",Inter}
// .kicker{color:var(--sub);font-size:12px}
// .hr{height:1px;background:var(--line);margin:14px 0}

// /* BADGES & BUTTONS */
// .badge{border:1px solid #ffd4d9;background:var(--soft);color:var(--pri);font-weight:800;padding:4px 8px;border-radius:999px;font-size:12px}
// .badgeGray{border:1px solid var(--line);background:#fff;color:var(--sub);font-weight:800;padding:4px 8px;border-radius:999px;font-size:12px}
// .btn{border:1px solid var(--line);background:#fff;border-radius:12px;padding:10px 12px;font-weight:900;cursor:pointer;transition:transform .06s ease, box-shadow .15s ease}
// .btn:active{transform:scale(.98)}
// .btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.15)}
// .btnGhost{border-color:#fecaca;color:var(--pri);background:#fff}
// .btnWarn{border-color:#fde68a;background:#fffbeb;color:#92400e}
// .btnTiny{padding:6px 8px;font-weight:800}

// /* TOP STATUS BAR (réseau/compte) */
// .top{
//   border:1px solid var(--line);border-radius:16px;background:
//     radial-gradient(1200px 260px at -10% -30%, rgba(225,17,39,.08), #fff0),
//     radial-gradient(900px 260px at 110% -20%, rgba(190,18,60,.06), #fff0),
//     #fff;
//   padding:14px 14px 12px; box-shadow:0 12px 34px rgba(16,24,40,.05);
// }
// .topRow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
// .statRow{display:flex;gap:10px;flex-wrap:wrap}

// /* STAT CARDS (total / positions) */
// .stat{border:1px solid var(--line);background:#fff;border-radius:12px;padding:10px 12px;min-width:220px}
// .stat .k{color:var(--sub);font-size:12px}
// .stat .v{font-weight:900;font-size:20px}

// /* SECTION TITLES */
// .srow{display:flex;align-items:center;justify-content:space-between;gap:10px}
// .h2{margin:0;font-weight:900;letter-spacing:-.01em;font-size:18px}

// /* PORTFOLIO GRID (actifs) */
// .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
// @media (max-width:1100px){ .grid4{grid-template-columns:repeat(2,1fr)} }
// @media (max-width:640px){ .grid4{grid-template-columns:1fr} }
// .asset{
//   border:1px solid var(--line);border-radius:14px;background:#fff;padding:12px;display:flex;gap:12px;align-items:center;
//   box-shadow:0 12px 32px rgba(16,24,40,.05);transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease;
// }
// .asset:hover{transform:translateY(-2px);box-shadow:var(--shadow);border-color:#ffd4d9}
// .logo{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:18px;background:linear-gradient(135deg,#fff,#fafafa);border:1px solid var(--line)}
// .meta{min-width:0}
// .sym{font-weight:900}
// .chain{margin-left:8px;border:1px solid var(--line);border-radius:999px;padding:2px 8px;font-size:10px;color:#475569}
// .name{color:var(--sub);font-size:12px}
// .val{margin-left:auto;text-align:right}
// .num{font-weight:900}
// .fiat{color:var(--sub);font-size:12px}

// /* UNITS (investissement) */
// .units{
//   border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px;box-shadow:0 12px 34px rgba(16,24,40,.05)
// }
// .unitItem{border:1px dashed var(--line);border-radius:12px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
// .unitLeft{display:flex;align-items:center;gap:10px}
// .unitImg{width:56px;height:56px;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#f8fafc}
// .unitImg>img{width:100%;height:100%;object-fit:cover;display:block}
// .badgeUnit{font-size:10px;border:1px solid #fecaca;border-radius:999px;padding:2px 6px;color:#b91c1c;background:#fff5f5;font-weight:900}
// .progress{height:8px;background:#f1f5f9;border-radius:999px;overflow:hidden}
// .progress>span{display:block;height:100%;background:linear-gradient(90deg,#fecaca,#dc2626);width:0%}

// /* NFTs */
// .nftGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
// @media (max-width:980px){ .nftGrid{grid-template-columns:repeat(2,1fr)} }
// @media (max-width:640px){ .nftGrid{grid-template-columns:1fr} }
// .nft{border:1px solid var(--line);border-radius:14px;background:#fff;padding:10px}
// .nftImg{height:140px;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:#f8fafc}
// .nftImg>img{width:100%;height:100%;object-fit:cover;display:block}

// /* ACTIVITY FEED */
// .feed{border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px}
// .log{display:grid;grid-template-columns:20px 1fr;gap:10px;align-items:start}
// .dot{width:10px;height:10px;border-radius:999px;background:#e5e7eb;margin-top:6px}
// .dot.ok{background:#86efac}.dot.warn{background:#fde68a}.dot.err{background:#fecaca}
// .logCard{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff}
// .logMeta{color:var(--sub);font-size:12px}

// /* SECURITY */
// .sec{border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px}
// .row{display:flex;align-items:center;justify-content:space-between;gap:10px}

// /* TOAST */
// .toast{position:fixed;right:16px;bottom:16px;z-index:50;background:#fff;border:1px solid #d1fae5;color:#065f46;padding:10px 14px;border-radius:12px;box-shadow:0 10px 30px rgba(2,6,23,.12)}
// .toast.warn{border-color:#fde68a;color:#92400e}.toast.err{border-color:#fecaca;color:#7f1d1d}

// /* DRAWER PAIEMENT (intent=pay) */
// .drawer{position:fixed;right:0;top:0;bottom:0;width:420px;max-width:100%;background:#fff;border-left:1px solid var(--line);box-shadow:-12px 0 40px rgba(2,6,23,.15);transform:translateX(100%);transition:transform .26s cubic-bezier(.22,1,.36,1);z-index:60}
// .drawer.on{transform:translateX(0)}
// .dHd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid var(--line)}
// .dBody{padding:14px;display:grid;gap:10px}
// .qr{height:140px;border:1px dashed var(--line);border-radius:12px;display:grid;place-items:center;background:#fafafa}
// .helper{color:var(--sub);font-size:12px}

// /* SMOOTH SCROLL */
// html{scroll-behavior:smooth}
// `;

// /* ===========================================================
//    TYPES / HELPERS
//    =========================================================== */
// type Asset = { id:"ETH"|"USDC"|"DAI"|"SOL"; name:string; chain:"EVM"|"SOLANA"; logo:string; amount:string; fiat:string };
// type UnitPos = { id:string; title:string; image:string; apr:number; units:number; progress:number; status:"created"|"pending_funds"|"funds_received"|"minted" };
// type NftItem = { tokenId:string; title:string; image:string; category:string; transferable:boolean; contract?:string };
// type Activity = { id:string; when:string; title:string; detail:string; tone:"ok"|"warn"|"err" };
// type PayInit = { to:string; amount:string; chainId:string; token:"ETH"|"USDC"; ref:string };

// /* small helpers */
// const short = (a?:string,n=4)=>a?`${a.slice(0,2+n)}…${a.slice(-n)}`:"—";
// const explorer = (kind:"address"|"tx"|"token", v:string, chainId?:string)=>{
//   const base = chainId==="0xaa36a7"?"https://sepolia.etherscan.io":"https://etherscan.io";
//   return `${base}/${kind}/${v}`;
// };

// /* toast */
// function useToast(){
//   const [t,setT]=useState<{msg:string; tone:"ok"|"warn"|"err"}>();
//   return {
//     show:(msg:string,tone:"ok"|"warn"|"err"="ok")=>{ setT({msg,tone}); setTimeout(()=>setT(undefined),1800); },
//     el: t ? <div className={`toast ${t.tone}`}>{t.msg}</div> : null
//   };
// }

// /* ===========================================================
//    PAGE
//    =========================================================== */
// export default function WalletPro(){
//   const nav = useNavigate();
//   const loc = useLocation();
//   const toast = useToast();
//   const params = new URLSearchParams(loc.search);
//   const intent = params.get("intent");     // e.g. "pay"
//   const invId  = params.get("investmentId") || undefined;

//   /* On mount: scroll top soft */
//   useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); },[]);

//   /* Metamask basic wiring */
//   const [hasMM,setHasMM]=useState(false);
//   const [account,setAccount]=useState<string>();
//   const [chainId,setChainId]=useState<string>();
//   useEffect(()=>{
//     const eth=(window as any).ethereum;
//     setHasMM(Boolean(eth));
//     if(!eth) return;
//     (async()=>{
//       try{
//         const [a,c] = await Promise.all([
//           eth.request({method:"eth_accounts"}), eth.request({method:"eth_chainId"})
//         ]);
//         setAccount(a?.[0]); setChainId(c);
//       }catch{}
//     })();
//     const onA=(a:string[])=>setAccount(a?.[0]);
//     const onC=(c:string)=>setChainId(c);
//     eth.on?.("accountsChanged",onA); eth.on?.("chainChanged",onC);
//     return ()=>{ eth.removeListener?.("accountsChanged",onA); eth.removeListener?.("chainChanged",onC); };
//   },[]);

//   const EXPECTED_CHAIN = { chainId:"0xaa36a7", name:"Sepolia" }; // adapte (mainnet si tu veux)
//   const wrongNet = hasMM && chainId && chainId!==EXPECTED_CHAIN.chainId;

//   const connectMM = async()=>{
//     const eth=(window as any).ethereum; if(!eth) return toast.show("MetaMask non détecté","warn");
//     try{
//       const accs:string[] = await eth.request({method:"eth_requestAccounts"});
//       setAccount(accs?.[0]);
//       const c = await eth.request({method:"eth_chainId"}); setChainId(c);
//       toast.show("Connecté");
//     }catch(e:any){ toast.show(e?.message||"Refusé","err"); }
//   };
//   const switchChain = async()=>{
//     const eth=(window as any).ethereum; if(!eth) return;
//     try{
//       await eth.request({method:"wallet_switchEthereumChain", params:[{chainId:EXPECTED_CHAIN.chainId}]});
//       setChainId(EXPECTED_CHAIN.chainId);
//       toast.show("Réseau basculé");
//     }catch(e:any){ toast.show("Changement de réseau refusé","warn"); }
//   };

//   /* DATA MOCK (branche tes endpoints) */
//   const assets:Asset[] = [
//     { id:"ETH",  name:"Ethereum",  chain:"EVM",    logo:"🟣", amount:"0.0831", fiat:"€ 228.42" },
//     { id:"USDC", name:"USD Coin",  chain:"EVM",    logo:"🪙", amount:"152.30", fiat:"€ 140.11" },
//     { id:"DAI",  name:"Dai",       chain:"EVM",    logo:"🟡", amount:"501.234", fiat:"€ 461.14" },
//     { id:"SOL",  name:"Solana",    chain:"SOLANA", logo:"🟩", amount:"0.3456", fiat:"€ 44.93" },
//   ];
//   const units:UnitPos[] = [
//     { id:"101", title:"F3 – Casablanca Centre", image:"https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=1200&auto=format&fit=crop", apr:9.2, units:3, progress:68, status:"pending_funds" },
//     { id:"202", title:"Villa – Rabat Agdal", image:"https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop", apr:8.0, units:1, progress:42, status:"created" },
//   ];
//   const nfts:NftItem[] = [
//     { tokenId:"7812", title:"F3 – Casablanca", image:"https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop", category:"Titre", transferable:false },
//     { tokenId:"7931", title:"Villa – Rabat",   image:"https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop", category:"Titre", transferable:true },
//   ];
//   const activity:Activity[] = [
//     { id:"a1", when:"il y a 3 min", title:"Ordre signé", detail:"property: 101 – units: 1 – nonce: af29…", tone:"ok" },
//     { id:"a2", when:"il y a 1 min", title:"Paiement en attente", detail:"Virement généré ref VIR-101-8e1c", tone:"warn" },
//   ];

//   const totalFiat = useMemo(()=>{
//     const nums = assets.map(a=>Number(a.fiat.replace(/[^\d.,-]/g,"").replace(",",".")||"0"));
//     return "€ " + nums.reduce((s,x)=>s+x,0).toFixed(2);
//   },[assets]);

//   /* DRAWER PAY (intent=pay) */
//   const [drawerOpen,setDrawerOpen]=useState(false);
//   const [pay, setPay] = useState<PayInit|undefined>();
//   const [txHash,setTxHash]=useState<string>();
//   const [busy,setBusy]=useState(false);

//   useEffect(()=>{
//     if(intent==="pay" && invId){
//       // pré-remplissage (mock ou fetch backend: /api/payments/crypto/init?investmentId=xx)
//       setPay({ to:"0x1111222233334444555566667777888899990000", amount:"0.042", chainId: EXPECTED_CHAIN.chainId, token:"ETH", ref:`INV-${invId}` });
//       setDrawerOpen(true);
//       setTimeout(()=>document.getElementById("drawerpay")?.scrollIntoView({behavior:"smooth"}), 120);
//     }
//   },[intent, invId]);

//   const sendTx = async()=>{
//     if(!pay) return;
//     const eth=(window as any).ethereum; if(!eth) return toast.show("MetaMask non détecté","warn");
//     if(!account) { await connectMM(); }
//     if(wrongNet) { await switchChain(); }
//     try{
//       setBusy(true);
//       // basique ETH; pour ERC20 on ferait un contract call / allowance etc.
//       const txParams = {
//         from: account,
//         to: pay.to,
//         value: "0x" + Math.round(Number(pay.amount) * 1e18).toString(16),
//       };
//       const hash = await eth.request({ method:"eth_sendTransaction", params:[txParams]});
//       setTxHash(hash);
//       toast.show("TX envoyée, en attente…");
//       // polling simple (mock)
//       setTimeout(()=>{
//         toast.show("TX confirmée ✓");
//         // callback backend
//         fetch(`/api/payments/onchain/confirm?investmentId=${invId}&txHash=${hash}`, { credentials:"include" }).catch(()=>{});
//       }, 1800);
//     }catch(e:any){
//       toast.show(e?.message||"Envoi refusé","err");
//     }finally{
//       setBusy(false);
//     }
//   };

//   /* PROGRESS ANIM on units */
//   const barsRef = useRef<Record<string,HTMLSpanElement>>({});
//   useEffect(()=>{
//     units.forEach(u=>{
//       const el = barsRef.current[u.id];
//       if(el){ requestAnimationFrame(()=>{ el.style.width = `${u.progress}%`; }); }
//     });
//   },[units]);

//   return (
//     <div className="wrap">
//       <style>{CSS}</style>
//       {toast.el}

//       {/* TOP */}
//       <section className="top">
//         <div className="topRow">
//           <div>
//             <h1 className="h1">Mon Wallet</h1>
//             <div className="kicker">Réseau principal : <span className="badge">{EXPECTED_CHAIN.name}</span></div>
//           </div>
//           <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
//             {hasMM ? (
//               account ? (
//                 <>
//                   <a className="badgeGray" href={explorer("address", account, chainId)} target="_blank" rel="noreferrer">
//                     {short(account)} ↗
//                   </a>
//                   {wrongNet && <button className="btnWarn" onClick={switchChain}>Mauvais réseau · Basculer</button>}
//                   <button className="btnGhost" onClick={()=>nav("/settings")}>Réglages</button>
//                 </>
//               ) : (
//                 <button className="btnPrimary" onClick={connectMM}>Connecter MetaMask</button>
//               )
//             ) : (
//               <a className="btnPrimary" href="https://metamask.io/download/" target="_blank" rel="noreferrer">Installer MetaMask</a>
//             )}
//           </div>
//         </div>

//         <div className="hr" />

//         <div className="statRow">
//           <div className="stat">
//             <div className="k">Valeur portefeuille</div>
//             <div className="v">{totalFiat}</div>
//           </div>
//           <div className="stat">
//             <div className="k">Réseau</div>
//             <div className="v">{wrongNet ? "⚠︎ Mauvais" : "🟢 OK"} <span className="k">({chainId||"—"})</span></div>
//           </div>
//           <div className="stat">
//             <div className="k">Titres / Unités</div>
//             <div className="v">{nfts.length} NFT · {units.reduce((s,x)=>s+x.units,0)} unités</div>
//           </div>
//           <div className="stat">
//             <div className="k">Dernière action</div>
//             <div className="v">Aujourd’hui</div>
//           </div>
//         </div>
//       </section>

//       {/* PORTFOLIO */}
//       <section style={{marginTop:16}}>
//         <div className="srow">
//           <h2 className="h2">Portfolio</h2>
//           <div style={{display:"flex",gap:8}}>
//             <button className="btn" onClick={()=>nav("/deposit")}>Déposer</button>
//             <button className="btn" onClick={()=>nav("/withdraw")}>Retirer</button>
//             <button className="btnPrimary" onClick={()=>nav("/transfer")}>Transférer</button>
//           </div>
//         </div>
//         <div className="grid4" style={{marginTop:10}}>
//           {assets.map(a=>(
//             <div key={a.id} className="asset">
//               <div className="logo">{a.logo}</div>
//               <div className="meta">
//                 <div style={{display:"flex",alignItems:"center",minWidth:0}}>
//                   <span className="sym">{a.id}</span><span className="chain">{a.chain}</span>
//                 </div>
//                 <div className="name">{a.name}</div>
//               </div>
//               <div className="val">
//                 <div className="num">{a.amount}</div>
//                 <div className="fiat">{a.fiat}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* UNITS (investissement) */}
//       <section style={{marginTop:18}} className="units" id="units">
//         <div className="srow">
//           <h2 className="h2">Mes unités d’investissement</h2>
//           <a className="badgeGray" href="/properties">Découvrir d’autres offres →</a>
//         </div>
//         <div style={{display:"grid",gap:10, marginTop:10}}>
//           {units.map(u=>(
//             <div className="unitItem" key={u.id}>
//               <div className="unitLeft">
//                 <div className="unitImg"><img src={u.image} alt={u.title} /></div>
//                 <div>
//                   <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
//                     <b>{u.title}</b>
//                     <span className="badgeUnit">Unités: {u.units}</span>
//                     <span className="badge">APR {u.apr}%</span>
//                     <span className="badgeGray">{u.status.replace("_"," ")}</span>
//                   </div>
//                   <div style={{marginTop:6}} className="progress"><span ref={(el)=>{ if(!barsRef.current) barsRef.current={}; if(el) barsRef.current[u.id]=el; }} /></div>
//                 </div>
//               </div>
//               <div style={{display:"flex",gap:8}}>
//                 <button className="btn" onClick={()=>nav(`/properties/${u.id}`)}>Détails</button>
//                 <button className="btnPrimary" onClick={()=>nav(`/invest/checkout?propertyId=${u.id}`)}>Compléter</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* NFTs */}
//       <section style={{marginTop:18}}>
//         <div className="srow">
//           <h2 className="h2">Mes NFTs (titres)</h2>
//           <a className="badgeGray" href="/tokens">Voir tout →</a>
//         </div>
//         {nfts.length===0 ? (
//           <div className="badgeGray" style={{display:"inline-block",marginTop:10}}>Aucun titre pour l’instant.</div>
//         ):(
//           <div className="nftGrid" style={{marginTop:10}}>
//             {nfts.map(n=>(
//               <article key={n.tokenId} className="nft">
//                 <div className="nftImg"><img src={n.image} alt={n.title} /></div>
//                 <div className="row" style={{marginTop:8}}>
//                   <b style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.title}</b>
//                   <span className="badgeGray">{n.category}</span>
//                 </div>
//                 <div className="kicker" style={{marginTop:6}}>Token #{n.tokenId}</div>
//                 <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
//                   <a className="btn" href={explorer("token", n.contract || "0x0000000000000000000000000000000000000000", chainId)} target="_blank" rel="noreferrer">Explorer</a>
//                   <a className="btnPrimary" href={`/nft/${n.tokenId}/attestation`} target="_blank" rel="noreferrer">Attestation</a>
//                   {n.transferable && <button className="btn" onClick={()=>nav(`/transfer?nft=${n.tokenId}`)}>Transférer</button>}
//                 </div>
//               </article>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* ACTIVITY */}
//       <section style={{marginTop:18}} className="feed" id="activity">
//         <div className="srow">
//           <h2 className="h2">Activité</h2>
//           <div style={{display:"flex",gap:8}}>
//             <button className="btn">Exporter CSV</button>
//             <button className="btnGhost" onClick={()=>nav("/activity")}>Filtrer</button>
//           </div>
//         </div>
//         <div style={{display:"grid",gap:12,marginTop:10}}>
//           {activity.map(a=>(
//             <div key={a.id} className="log">
//               <span className={`dot ${a.tone}`} />
//               <div className="logCard">
//                 <b>{a.title}</b>
//                 <div className="logMeta">{a.when}</div>
//                 <div className="kicker" style={{marginTop:6}}>{a.detail}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* SECURITY */}
//       <section style={{marginTop:18}} className="sec" id="security">
//         <div className="srow">
//           <h2 className="h2">Sécurité & conformité</h2>
//           <div style={{display:"flex",gap:8}}>
//             <button className="btnGhost" onClick={()=>nav("/settings#2fa")}>Activer 2FA</button>
//             <button className="btnGhost" onClick={()=>nav("/settings#devices")}>Appareils</button>
//           </div>
//         </div>
//         <div style={{display:"grid",gap:10,marginTop:10}}>
//           <div className="row">
//             <div className="kicker">Session SIWE</div>
//             <button className="btn" onClick={()=>nav("/signin?reauth=1")}>Re-signer</button>
//           </div>
//           <div className="row">
//             <div className="kicker">Approvals ERC-20 (USDC/DAI)</div>
//             <button className="btn" onClick={()=>nav("/settings#approvals")}>Voir & Revoke</button>
//           </div>
//           <div className="row">
//             <div className="kicker">Destinataires sûrs</div>
//             <button className="btn" onClick={()=>nav("/settings#addressbook")}>Gérer</button>
//           </div>
//         </div>
//       </section>

//       {/* DRAWER PAIEMENT */}
//       <aside className={`drawer ${drawerOpen ? "on":""}`} id="drawerpay" aria-live="polite">
//         <div className="dHd">
//           <b>Payer l’investissement {invId ? `#${invId}` : ""}</b>
//           <button className="btn" onClick={()=>setDrawerOpen(false)}>Fermer</button>
//         </div>
//         <div className="dBody">
//           {!pay ? (
//             <div className="kicker">Chargement…</div>
//           ) : (
//             <>
//               <div className="kicker">Réseau</div>
//               <div className="badge">{EXPECTED_CHAIN.name}</div>

//               <div className="kicker">Destinataire</div>
//               <div className="badgeGray">{short(pay.to,6)}</div>

//               <div className="kicker">Montant</div>
//               <div className="badgeGray">{pay.amount} {pay.token}</div>

//               <div className="kicker">Référence</div>
//               <div className="badgeGray">{pay.ref}</div>

//               <div className="qr">QR / Payment Request</div>
//               <div className="helper">Le paiement est confirmé après 1–2 blocs. Vous recevrez le NFT et l’attestation PDF automatiquement.</div>

//               <div style={{display:"flex",gap:8}}>
//                 <button className="btnGhost" onClick={()=>nav(`/pay?investmentId=${invId}`)}>Autres moyens</button>
//                 <button className="btnPrimary" disabled={busy||wrongNet||!hasMM} onClick={sendTx}>
//                   Envoyer la transaction {busy && "…"}
//                 </button>
//               </div>

//               {txHash && (
//                 <a className="badgeGray" href={explorer("tx", txHash, chainId)} target="_blank" rel="noreferrer">
//                   Voir TX ↗
//                 </a>
//               )}
//               {wrongNet && <div className="badge" style={{background:"#fffbe6",borderColor:"#fde68a",color:"#92400e"}}>Mauvais réseau — bascule requise</div>}
//             </>
//           )}
//         </div>
//       </aside>
//     </div>
//   );
// }




// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { createPublicClient, http, formatEther, erc20Abi } from "viem";
// import { sepolia, mainnet } from "viem/chains";
// const CHAIN_BY_ID:any = { "0xaa36a7": sepolia, "0x1": mainnet };



// /* ——————————————————————  THEME (rouge/blanc) + styles globaux —————————————————————— */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
// :root{
//   --ink:#111827; --sub:#6b7280; --line:#eceff3;
//   --bg:#ffffff; --card:#ffffff;
//   --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2;
// }
// *{box-sizing:border-box}
// body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit}
// .section{margin-top:16px}

// /* Header */
// .w-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:22px auto 8px;max-width:1180px;padding:0 18px}
// .h1{margin:0;font-size:28px;font-weight:900;letter-spacing:-.01em}
// .pills{display:flex;gap:8px;flex-wrap:wrap}
// .pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;font-weight:800}
// .btn{position:relative;overflow:hidden;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff}
// .btn:active{transform:scale(.98)}
// .btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
// .btnGhost{border-color:#fecaca;color:var(--pri);background:#fff}
// .rip{position:absolute;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);transform:translate(-50%,-50%) scale(0);animation:r .6s ease-out forwards}
// @keyframes r{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

// /* Bar d'état */
// .hero{
//   max-width:1180px;margin:0 auto;padding:0 18px;
// }
// .heroCard{
//   position:relative;overflow:hidden;margin-top:8px;
//   border:1px solid var(--line);border-radius:18px;background:
//     radial-gradient(900px 240px at -10% -40%, rgba(225,17,46,.12), #0000),
//     radial-gradient(800px 240px at 110% -30%, rgba(190,18,60,.10), #0000),
//     #fff;
//   padding:16px;
//   box-shadow:0 12px 34px rgba(16,24,40,.06);
// }
// .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
// @media (max-width: 980px){ .stats{grid-template-columns:repeat(2,1fr)} }
// .sCard{border:1px solid var(--line);border-radius:14px;padding:12px;background:#fff}
// .sK{color:var(--sub);font-size:12px}
// .sV{font-weight:900;font-size:22px}

// /* Alert réseau */
// .alert{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px;margin-top:8px}

// /* Tabs */
// .tabs{max-width:1180px;margin:12px auto 0;padding:0 18px;display:flex;gap:6px;border-bottom:1px solid var(--line)}
// .tab{padding:9px 12px;border-radius:10px;cursor:pointer;color:var(--sub);font-weight:800}
// .tab.active{color:var(--pri);background:#fff2f3;border:1px solid #fecaca}

// /* Conteneur */
// .wrap{max-width:1180px;margin:0 auto;padding:0 18px}

// /* ——— Portfolio tiles ——— */
// .assets{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
// @media (max-width: 920px){ .assets{grid-template-columns:1fr} }

// .asset{
//   --hover: 0 18px 52px rgba(16,24,40,.12);
//   position:relative; display:flex; align-items:center; gap:14px;
//   border:1px solid var(--line); border-radius:16px; background:#fff; padding:14px;
//   box-shadow:0 12px 40px rgba(16,24,40,.06); transition:transform .16s ease, box-shadow .16s ease, border-color .16s ease;
// }
// .asset:hover{ transform:translateY(-2px); box-shadow:var(--hover); border-color:#ffd4d9 }
// .asset:after{
//   content:""; position:absolute; left:0; top:10px; bottom:10px; width:4px; border-radius:4px;
//   background:linear-gradient(180deg,#ffccd2,#e11d2e); opacity:.25;
// }
// .assetL{display:flex; align-items:center; gap:12px; min-width:0; flex:1}
// .logo{width:48px;height:48px;border-radius:14px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc;display:grid;place-items:center}
// .logo img{width:100%;height:100%;object-fit:cover}
// .name{font-weight:900}
// .chain{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid #e5e7eb;color:#475569;font-weight:800}
// .assetR{text-align:right;margin-left:auto}
// .assetAmt{font-weight:900;font-size:18px}
// .assetFiat{color:var(--sub);font-size:13px}
// .assetActions{display:flex;gap:8px;margin-top:8px}
// .chipBtn{border:1px solid #fecaca;color:#e11d2e;background:#fff;border-radius:10px;padding:6px 10px;font-weight:800;cursor:pointer}
// .spark{width:120px;height:32px;margin-left:auto;filter:drop-shadow(0 4px 10px rgba(225,29,46,.15))}
// .spark path{stroke-width:2}

// /* ——— Unités d'investissement ——— */
// .unitsCard{border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px;box-shadow:0 12px 34px rgba(16,24,40,.06)}
// .unitsHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
// .uBadge{border:1px solid #fecaca;background:#fff1f2;color:#e11d2e;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px}
// .uMeta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px}
// .uBox{border:1px solid #f3f4f6;border-radius:12px;padding:10px;text-align:center}
// .uK{color:var(--sub);font-size:12px}
// .uV{font-weight:900;font-size:18px}
// .uList{display:grid;gap:10px}
// .uItem{display:flex;gap:10px;align-items:center;border:1px solid #f0f2f6;border-radius:12px;padding:10px}
// .uThumb{width:56px;height:40px;border-radius:10px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc}
// .uThumb img{width:100%;height:100%;object-fit:cover}
// .uTitle{font-weight:900}
// .uUnits{margin-left:auto;font-weight:900}
// .uActions{display:flex;gap:8px}

// /* ——— NFTs ——— */
// .nGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
// @media (max-width:990px){ .nGrid{grid-template-columns:repeat(2,1fr)} }
// @media (max-width:640px){ .nGrid{grid-template-columns:1fr} }
// .nCard{border:1px solid var(--line);border-radius:16px;padding:12px;background:#fff;box-shadow:0 10px 28px rgba(16,24,40,.06)}
// .nImg{width:100%;height:160px;border-radius:10px;object-fit:cover;border:1px solid #eef2f7}
// .nHead{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
// .badge{border:1px solid var(--line);border-radius:999px;padding:3px 8px;font-size:12px;color:var(--sub)}
// .nBtns{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
// `;

// /* ——————————————————————  HELPERS / DATA —————————————————————— */
// type ChainKind = "evm" | "solana";
// type Asset = { id: "eth"|"usdc"|"dai"|"sol"; symbol: "ETH"|"USDC"|"DAI"|"SOL"; name: string; chain: ChainKind; decimals: number; };
// type Balance = { assetId: Asset["id"]; amount: string };

// type UnitLine = {
//   propertyId: string; title: string; thumb?: string;
//   units: number; status: "en_attente" | "confirmé" | "livré";
//   investmentId?: string;
// };

// type NFTItem = { tokenId: string; contract: string; title: string; imageUrl?: string; transferable: boolean; units?: number; category: string };

// const ASSETS: Asset[] = [
//   { id:"eth",  symbol:"ETH",  name:"Ethereum",        chain:"evm",   decimals:18 },
//   { id:"usdc", symbol:"USDC", name:"USD Coin",        chain:"evm",   decimals:6  },
//   { id:"dai",  symbol:"DAI",  name:"Dai",             chain:"evm",   decimals:18 },
//   { id:"sol",  symbol:"SOL",  name:"Solana",          chain:"solana",decimals:9  },
// ];

// const TOKEN_LOGO: Record<string,string> = {
//   ETH:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkD569_CoUYIIYAnrrzEvgHJtafI6fmScJ3trt1ZJE5-HF4UMt3B4Wl4lfIX1iInC7B0E&usqp=CAU",
//   USDC:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ43MuDqq54iD1ZCRL_uthAPkfwSSL-J5qI_Q&s",
//   DAI:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCE8Lgbhy4J9u-j0UgoXNIF_wC9XM0QPVi2w&s",
//   SOL:"https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
// };

// const EXPECTED_CHAIN = { chainId:"0xaa36a7", name:"Sepolia", explorer:"https://sepolia.etherscan.io", currency:{ name:"Ether", symbol:"ETH", decimals:18 }, rpc:["https://rpc.ankr.com/eth_sepolia"] } as const;

// const short = (a?:string, n=4)=> a ? `${a.slice(0,2+n)}…${a.slice(-n)}` : "—";
// const formatUnits = (raw:string, dec:number, prec=6)=>{
//   if(!raw) return "0";
//   const neg = raw.startsWith("-"); const s = neg ? raw.slice(1) : raw;
//   const bi = BigInt(s); const base = BigInt(10)**BigInt(dec);
//   const i = bi/base; const f = bi%base;
//   const frac = f.toString().padStart(dec,"0").slice(0,prec).replace(/0+$/,"");
//   return `${neg?"-":""}${i}${frac? "."+frac:""}`;
// };
// const toFiat = (raw:string, dec:number, rate:number)=> Number(formatUnits(raw,dec,12))*rate;

// const chainName = (cid?:string)=> cid==="0xaa36a7"?"Sepolia":cid==="0x1"?"Ethereum":cid?`Chain ${parseInt(cid,16)}`:"—";

// const ripple = (e:React.MouseEvent<HTMLElement>)=>{
//   const host=e.currentTarget as HTMLElement; const r=document.createElement("i"); r.className="rip";
//   const rect = host.getBoundingClientRect(); r.style.left=`${e.clientX-rect.left}px`; r.style.top=`${e.clientY-rect.top}px`;
//   host.appendChild(r); setTimeout(()=>r.remove(),600);
// };

// const Sparkline: React.FC<{ color?:string; points?:number[] }> = ({ color="#e11d2e", points })=>{
//   const pts = points ?? [8,12,10,16,14,20,18,28,22,30];
//   const max=Math.max(...pts), min=Math.min(...pts), H=32, W=120;
//   const norm=(v:number)=> H-2 - ((v-min)/(max-min||1))*(H-4);
//   const step = W/(pts.length-1);
//   const d = pts.map((v,i)=>`${i*step},${norm(v)}`).join(" ");
//   return (
//     <svg className="spark" viewBox={`0 0 ${W} ${H}`} fill="none">
//       <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stopColor={color} stopOpacity=".28"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
//       <polyline points={d} stroke={color} fill="url(#g)" />
//     </svg>
//   );
// };

// /* ——————————————————————  PAGE  —————————————————————— */
// export default function WalletPage(){
//   const nav = useNavigate();
//   const loc = useLocation();
//   const q = new URLSearchParams(loc.search);
//   const intent = q.get("intent") as ("pay"|"deposit"|"withdraw"|"transfer"|null);

//   // sections refs pour auto-scroll suivant l'intent
//   const refPortfolio = useRef<HTMLDivElement|null>(null);
//   const refUnits     = useRef<HTMLDivElement|null>(null);
//   const refNFTs      = useRef<HTMLDivElement|null>(null);

//   const [refCcy, setRefCcy] = useState<"EUR"|"USD"|"MAD"|"GBP"|"AED">(
//     ()=>(localStorage.getItem("fx_ccy") as any)||"EUR"
//   );
//   useEffect(()=>localStorage.setItem("fx_ccy",refCcy),[refCcy]);

//   // MetaMask / SIWE
//   const [hasMM,setHasMM]=useState(false);
//   const [account,setAccount]=useState<string|undefined>();
//   const [chainId,setChainId]=useState<string|undefined>();
//   const [isAuth,setIsAuth]=useState(false);

//   // Données (mock + prêt à brancher API)
//   const [balances,setBalances]=useState<Balance[]>([
//     { assetId:"eth",  amount:"12000000000000000" },     // 0.012
//     { assetId:"usdc", amount:"15230000" },              // 15.23
//     { assetId:"dai",  amount:"501234000000000000000" }, // 501.234
//     { assetId:"sol",  amount:"345600000" },             // 0.3456
//   ]);

//   const [units,setUnits] = useState<UnitLine[]>([
//     { propertyId:"101", title:"F3 — Casablanca Centre", thumb:"https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200&auto=format&fit=crop", units:3, status:"livré" },
//     { propertyId:"204", title:"Studio — Gauthier", thumb:"https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop", units:1, status:"en_attente", investmentId:"d1i0lfia13n" },
//   ]);

//   const [nfts,setNfts]=useState<NFTItem[]>([]);  // charge après auth si tu veux

//   // FX & prix (base EUR -> refCcy)
//   const rates = useMemo(()=>{
//     const base = { eth:2900, usdc:0.92, dai:0.92, sol:130 }; // EUR
//     const fxTable = { EUR:1, USD:1.08, MAD:10.8, GBP:0.85, AED:3.97 } as const;
//     const fx = fxTable[refCcy]; const out:any={};
//     Object.entries(base).forEach(([k,v])=>out[k]=v*fx); return out as Record<Asset["id"],number>;
//   },[refCcy]);

//   const totalCrypto = useMemo(()=>balances.reduce((s,b)=>{
//     const a=ASSETS.find(x=>x.id===b.assetId)!; return s + toFiat(b.amount,a.decimals,rates[a.id]||0);
//   },0),[balances,rates]);

//   const totalUnits = useMemo(()=> units.reduce((s,u)=>s+u.units,0),[units]);
//   const totalUnitsConfirmed = useMemo(()=>units.filter(u=>u.status!=="en_attente").reduce((s,u)=>s+u.units,0),[units]);
//   const totalUnitsPending   = useMemo(()=>units.filter(u=>u.status==="en_attente").reduce((s,u)=>s+u.units,0),[units]);

//   // Boot MM
//   useEffect(()=>{
//     const eth=(window as any).ethereum; setHasMM(Boolean(eth)); if(!eth) return;
//     (async()=>{
//       try{
//         const [accs,cid]=await Promise.all([
//           eth.request({method:"eth_accounts"}),
//           eth.request({method:"eth_chainId"})
//         ]);
//         setAccount(accs?.[0]); setChainId(cid);
//       }catch{}
//     })();
//     const onA=(a:string[])=>setAccount(a?.[0]); const onC=(c:string)=>setChainId(c);
//     eth.on?.("accountsChanged",onA); eth.on?.("chainChanged",onC);
//     return()=>{ eth.removeListener?.("accountsChanged",onA); eth.removeListener?.("chainChanged",onC); };
//   },[]);

//   // Auto-scroll selon intent (pay/deposit/withdraw/transfer)
//   useEffect(()=>{
//     const el = intent==="pay" ? refUnits.current
//             : intent==="deposit" ? refPortfolio.current
//             : intent==="withdraw" ? refPortfolio.current
//             : intent==="transfer" ? refPortfolio.current
//             : null;
//     if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
//   },[intent]);

//   const ensureChain = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return;
//     const cid = await eth.request({method:"eth_chainId"});
//     if(cid !== EXPECTED_CHAIN.chainId){
//       try{
//         await eth.request({method:"wallet_switchEthereumChain", params:[{chainId:EXPECTED_CHAIN.chainId}]});
//         setChainId(EXPECTED_CHAIN.chainId);
//       }catch(e:any){
//         if(e?.code===4902){
//           await eth.request({method:"wallet_addEthereumChain", params:[{
//             chainId:EXPECTED_CHAIN.chainId, chainName:EXPECTED_CHAIN.name, rpcUrls:EXPECTED_CHAIN.rpc,
//             nativeCurrency:EXPECTED_CHAIN.currency, blockExplorerUrls:[EXPECTED_CHAIN.explorer]
//           }]});
//         }
//       }
//     }
//   };
//   const connect = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return window.open("https://metamask.io/download/","_blank");
//     await eth.request({method:"wallet_requestPermissions", params:[{eth_accounts:{}}]});
//     const accs:string[]=await eth.request({method:"eth_requestAccounts"}); setAccount(accs?.[0]);
//     const cid:string=await eth.request({method:"eth_chainId"}); setChainId(cid); ensureChain();
//   };
//   const signIn = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return;
//     const [addr]=await eth.request({method:"eth_requestAccounts"});
//     const nonce= await fetch("/auth/nonce",{credentials:"include"}).then(r=>r.json()).catch(()=>({nonce:Math.random().toString(36).slice(2)}));
//     const domain=window.location.host;
//     const msg=`domain: ${domain}
// address: ${addr}
// statement: Login
// nonce: ${nonce.nonce}
// issuedAt: ${new Date().toISOString()}`;
//     const signature=await eth.request({method:"personal_sign", params:[msg,addr]});
//     const ok= await fetch("/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({address:addr,message:msg,signature})}).then(r=>r.ok);
//     if(ok) setIsAuth(true);
//   };
//   const logout = async()=>{ try{ await fetch("/auth/logout",{method:"POST",credentials:"include"});}catch{} setIsAuth(false); setAccount(undefined); };

//   const wrongChain = hasMM && chainId && chainId!==EXPECTED_CHAIN.chainId;

//   return (
//     <>
//       <style>{CSS}</style>

//       {/* HEADER */}
//       <header className="w-head">
//         <h1 className="h1">Mon Wallet</h1>
//         <div className="pills">
//           <button className="pill" onClick={()=>setRefCcy(refCcy==="EUR"?"USD":refCcy==="USD"?"MAD":refCcy==="MAD"?"GBP":refCcy==="GBP"?"AED":"EUR")}>{refCcy} ▾</button>
//           {hasMM ? (
//             account ? (
//               <>
//                 <span className="pill">{short(account)} • {chainName(chainId)}</span>
//                 {!isAuth && <button className="btn btnPrimary" onClick={(e)=>{ripple(e);signIn();}}>Lier (Signer)</button>}
//                 {units.map((u) => (
//   <button key={u.propertyId} onClick={() => nav(`/payment/crypto/${u.investmentId}`)}>
//     Finaliser
//   </button>
// ))}

//                 <button className="btn btnGhost" onClick={(e)=>{ripple(e);logout();}}>Déconnexion</button>

//               </>
//             ) : (
//               <button className="btn btnPrimary" onClick={(e)=>{ripple(e);connect();}}>Connecter MetaMask</button>
//             )
//           ) : (
//             <a className="btn btnPrimary" href="https://metamask.io/download/" target="_blank" rel="noreferrer">Installer MetaMask</a>
//           )}
//         </div>
//       </header>

//       {/* HERO / STATS */}
//       <div className="hero">
//         {wrongChain && (
//           <div className="alert">
//             <div>Réseau détecté : <b>{chainName(chainId)}</b> — attendu : <b>{EXPECTED_CHAIN.name}</b></div>
//             <button className="btn btnGhost" onClick={(e)=>{ripple(e);ensureChain();}}>Basculer vers {EXPECTED_CHAIN.name}</button>
//           </div>
//         )}
//         <div className="heroCard">
//           <div className="stats">
//             <div className="sCard"><div className="sK">Total crypto</div><div className="sV">{totalCrypto.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div></div>
//             <div className="sCard"><div className="sK">Unités totales</div><div className="sV">{totalUnits}</div></div>
//             <div className="sCard"><div className="sK">Unités confirmées</div><div className="sV">{totalUnitsConfirmed}</div></div>
//             <div className="sCard"><div className="sK">En attente</div><div className="sV" style={{color:"var(--pri)"}}>{totalUnitsPending}</div></div>
//           </div>
//         </div>
//       </div>

//       {/* TABS */}
//       <nav className="tabs">
//         <div className="tab active">Portfolio</div>
//         <div className="tab" onClick={()=>refUnits.current?.scrollIntoView({behavior:"smooth"})}>Unités</div>
//         <div className="tab" onClick={()=>refNFTs.current?.scrollIntoView({behavior:"smooth"})}>Titres / NFTs</div>
//         <div className="tab" onClick={()=>nav("/activity")}>Activité</div>
//         <div className="tab" onClick={()=>nav("/settings")}>Réglages</div>
//       </nav>

//       <main className="wrap">
//         {/* ——————————— PORTFOLIO ——————————— */}
//         <section ref={refPortfolio} className="section">
//           <div className="assets">
//             {ASSETS.map(a=>{
//               const bal = balances.find(b=>b.assetId===a.id)!;
//               const human = formatUnits(bal.amount,a.decimals);
//               const fiat  = Number(human)*(rates[a.id]||0);
//               const color = a.id==="usdc"?"#3b82f6":a.id==="dai"?"#f59e0b":a.id==="sol"?"#10b981":"#e11d2e";
//               return (
//                 <article key={a.id} className="asset">
//                   <div className="assetL">
//                     <div className="logo"><img src={TOKEN_LOGO[a.symbol]} alt={a.symbol}/></div>
//                     <div style={{minWidth:0}}>
//                       <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
//                         <span className="name">{a.symbol}</span>
//                         <span className="chain">{a.chain.toUpperCase()}</span>
//                       </div>
//                       <div className="sub">{a.name}</div>
//                     </div>
//                   </div>

//                   <Sparkline color={color} />

//                   <div className="assetR">
//                     <div className="assetAmt">{human}</div>
//                     <div className="assetFiat">{fiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div>
//                     <div className="assetActions">
//                       <button className="chipBtn" onClick={()=>nav(`/transfer?asset=${a.id}`)} disabled={!isAuth}>Transférer</button>
//                       {a.id!=="eth" && <button className="chipBtn" onClick={()=>nav(`/swap?to=${a.id}`)}>Swap</button>}
//                     </div>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         </section>

//         {/* ——————————— UNITÉS D’INVESTISSEMENT ——————————— */}
//         <section ref={refUnits} className="section">
//           <div className="unitsCard">
//             <div className="unitsHeader">
//               <b>Unités d’investissement</b>
//               <span className="uBadge">Titres fractionnés</span>
//             </div>

//             <div className="uMeta">
//               <div className="uBox"><div className="uK">Total unités</div><div className="uV">{totalUnits}</div></div>
//               <div className="uBox"><div className="uK">Confirmées</div><div className="uV">{totalUnitsConfirmed}</div></div>
//               <div className="uBox"><div className="uK">En attente</div><div className="uV" style={{color:"var(--pri)"}}>{totalUnitsPending}</div></div>
//             </div>

//             <div className="uList">
//               {units.map(u=>(
//                 <div key={u.propertyId} className="uItem">
//                   <div className="uThumb"><img src={u.thumb || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"} alt="thumb"/></div>
//                   <div>
//                     <div className="uTitle">{u.title}</div>
//                     <div className="sub">{u.status==="livré"?"Livré (NFT émis)":u.status==="confirmé"?"Confirmé":"En attente de paiement"}</div>
//                   </div>
//                   <div className="uUnits">{u.units} u.</div>
//                   <div className="uActions">
//                     {u.status==="en_attente" ? (
//                       <button className="chipBtn" onClick={()=>nav(`/pay?investmentId=${u.investmentId}`)}>Finaliser</button>
//                     ) : (
//                       <>
//                         <button className="chipBtn" onClick={()=>nav(`/properties/${u.propertyId}`)}>Détails</button>
//                         <button className="chipBtn" onClick={()=>nav(`/tokens?propertyId=${u.propertyId}`)}>Voir NFT</button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ——————————— TITRES & NFTs ——————————— */}
//         <section ref={refNFTs} className="section">
//           <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
//             <div className="sub">Titres & NFTs</div>
//             <button className="btn btnGhost" onClick={()=>nav("/tokens")}>Voir tout</button>
//           </div>
//           {nfts.length===0 ? (
//             <div className="nCard" style={{marginTop:8}}>
//               <div className="sub">Aucun titre pour l’instant. Après paiement confirmé et mint, vos NFTs apparaissent ici.</div>
//             </div>
//           ):(
//             <div className="nGrid">
//               {nfts.map(n=>(
//                 <div className="nCard" key={n.tokenId}>
//                   <img className="nImg" src={n.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"} alt="nft"/>
//                   <div className="nHead">
//                     <b style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.title}</b>
//                     <span className="badge">{n.category}</span>
//                   </div>
//                   <div className="sub" style={{marginTop:6}}>Token #{n.tokenId}{typeof n.units==="number" && <> • {n.units} u.</>}</div>
//                   <div className="nBtns">
//                     <a className="btn btnGhost" href={`${EXPECTED_CHAIN.explorer}/token/${n.contract}`} target="_blank" rel="noreferrer">Explorer</a>
//                     <a className="btn btnPrimary" href={`/nft/${n.tokenId}/attestation`} target="_blank" rel="noreferrer">Attestation</a>
//                     {n.transferable && <button className="btn btnGhost" onClick={()=>nav(`/transfer?nft=${n.tokenId}`)}>Transférer</button>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* ——————————— ACTIONS RAPIDES ——————————— */}
//         <section className="section">
//           <div className="row" style={{justifyContent:"space-between"}}>
//             <div className="sub">Actions</div>
//             <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
//               <button className="btn btnPrimary" onClick={()=>nav("/deposit")}  disabled={!account||wrongChain||!isAuth}>Déposer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/withdraw")} disabled={!account||wrongChain||!isAuth}>Retirer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/transfer")} disabled={!account||!isAuth}>Transférer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/offers")}>Offres</button>
//             </div>
//           </div>
//           <div className="sub" style={{marginTop:6}}>
//             * Opérations critiques : adresse connectée, bon réseau ({EXPECTED_CHAIN.name}) et <b>signature</b> (liaison SIWE).
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }


// // src/pages/WalletPage.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   createPublicClient,
//   http,
//   erc20Abi,
// } from "viem";
// import { sepolia, mainnet } from "viem/chains";

// /* -------------------------- Config chaînes / tokens -------------------------- */

// // Réseau attendu (Sepolia). Change si besoin.
// const EXPECTED_CHAIN = {
//   chainId: "0xaa36a7",
//   name: "Sepolia",
//   explorer: "https://sepolia.etherscan.io",
//   currency: { name: "Ether", symbol: "ETH", decimals: 18 },
//   rpc: ["https://rpc.ankr.com/eth_sepolia"],
// } as const;

// // Client viem pour lecture on-chain
// const publicClient = createPublicClient({
//   chain: sepolia,
//   transport: http(EXPECTED_CHAIN.rpc[0]),
// });

// // Tokens connus (exemples – remplace par tes adresses réelles Sepolia)
// export type Erc20Token = {
//   symbol: string;
//   name: string;
//   address: `0x${string}`;
//   decimals: number;
//   logo?: string;
// };

// const TOKENS_SEPOLIA: Erc20Token[] = [
//   // ⚠️ Remplace les adresses par celles que TU utilises sur Sepolia
//   {
//     symbol: "USDC",
//     name: "USD Coin",
//     address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
//     decimals: 6,
//     logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
//   },
//   {
//     symbol: "DAI",
//     name: "Dai",
//     address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
//     decimals: 18,
//     logo: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
//   },
// ];

// /* ------------------------------- On-chain utils ------------------------------ */

// const getEthereum = () => (window as any).ethereum as any | undefined;

// async function getNativeBalance(address: `0x${string}`) {
//   const wei = await publicClient.getBalance({ address });
//   return Number(wei) / 1e18;
// }

// async function getErc20Balance(token: Erc20Token, address: `0x${string}`) {
//   const raw = await publicClient.readContract({
//     address: token.address,
//     abi: erc20Abi,
//     functionName: "balanceOf",
//     args: [address],
//   });
//   return Number(raw) / 10 ** token.decimals;
// }

// async function getPortfolio(
//   address: `0x${string}`,
//   tokens: Erc20Token[]
// ) {
//   const [eth, ...rest] = await Promise.all([
//     getNativeBalance(address),
//     ...tokens.map((t) => getErc20Balance(t, address)),
//   ]);
//   return {
//     eth,
//     erc20: tokens.map((t, i) => ({ ...t, amount: rest[i] })),
//   };
// }

// /* --------------------------------- UI assets -------------------------------- */

// const TOKEN_LOGO: Record<string, string> = {
//   ETH: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkD569_CoUYIIYAnrrzEvgHJtafI6fmScJ3trt1ZJE5-HF4UMt3B4Wl4lfIX1iInC7B0E&usqp=CAU",
//   USDC: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ43MuDqq54iD1ZCRL_uthAPkfwSSL-J5qI_Q&s",
//   DAI: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCE8Lgbhy4J9u-j0UgoXNIF_wC9XM0QPVi2w&s",
//   SOL: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
// };

// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
// :root{ --ink:#111827; --sub:#6b7280; --line:#eceff3; --bg:#ffffff; --card:#ffffff; --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2; }
// *{box-sizing:border-box} body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit} .section{margin-top:16px}
// .w-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:22px auto 8px;max-width:1180px;padding:0 18px}
// .h1{margin:0;font-size:28px;font-weight:900;letter-spacing:-.01em}
// .pills{display:flex;gap:8px;flex-wrap:wrap} .pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;font-weight:800}
// .btn{position:relative;overflow:hidden;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff}
// .btn:active{transform:scale(.98)} .btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
// .btnGhost{border-color:#fecaca;color:var(--pri);background:#fff}
// .rip{position:absolute;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);transform:translate(-50%,-50%) scale(0);animation:r .6s ease-out forwards}
// @keyframes r{to{transform:translate(-50%,-50%) scale(22);opacity:0}}
// .hero{ max-width:1180px;margin:0 auto;padding:0 18px;}
// .heroCard{ position:relative;overflow:hidden;margin-top:8px; border:1px solid var(--line);border-radius:18px;background:
//   radial-gradient(900px 240px at -10% -40%, rgba(225,17,46,.12), #0000),
//   radial-gradient(800px 240px at 110% -30%, rgba(190,18,60,.10), #0000), #fff;
//   padding:16px; box-shadow:0 12px 34px rgba(16,24,40,.06);
// }
// .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
// @media (max-width: 980px){ .stats{grid-template-columns:repeat(2,1fr)} }
// .sCard{border:1px solid var(--line);border-radius:14px;padding:12px;background:#fff}
// .sK{color:var(--sub);font-size:12px} .sV{font-weight:900;font-size:22px}
// .alert{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px;margin-top:8px}
// .tabs{max-width:1180px;margin:12px auto 0;padding:0 18px;display:flex;gap:6px;border-bottom:1px solid var(--line)}
// .tab{padding:9px 12px;border-radius:10px;cursor:pointer;color:var(--sub);font-weight:800}
// .tab.active{color:var(--pri);background:#fff2f3;border:1px solid #fecaca}
// .wrap{max-width:1180px;margin:0 auto;padding:0 18px}
// .assets{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
// @media (max-width: 920px){ .assets{grid-template-columns:1fr} }
// .asset{
//   --hover: 0 18px 52px rgba(16,24,40,.12);
//   position:relative; display:flex; align-items:center; gap:14px;
//   border:1px solid var(--line); border-radius:16px; background:#fff; padding:14px;
//   box-shadow:0 12px 40px rgba(16,24,40,.06); transition:transform .16s ease, box-shadow .16s ease, border-color .16s ease;
// }
// .asset:hover{ transform:translateY(-2px); box-shadow:var(--hover); border-color:#ffd4d9 }
// .asset:after{
//   content:""; position:absolute; left:0; top:10px; bottom:10px; width:4px; border-radius:4px;
//   background:linear-gradient(180deg,#ffccd2,#e11d2e); opacity:.25;
// }
// .assetL{display:flex; align-items:center; gap:12px; min-width:0; flex:1}
// .logo{width:48px;height:48px;border-radius:14px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc;display:grid;place-items:center}
// .logo img{width:100%;height:100%;object-fit:cover}
// .name{font-weight:900}
// .chain{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid #e5e7eb;color:#475569;font-weight:800}
// .assetR{text-align:right;margin-left:auto}
// .assetAmt{font-weight:900;font-size:18px}
// .assetFiat{color:var(--sub);font-size:13px}
// .assetActions{display:flex;gap:8px;margin-top:8px}
// .chipBtn{border:1px solid #fecaca;color:#e11d2e;background:#fff;border-radius:10px;padding:6px 10px;font-weight:800;cursor:pointer}
// .spark{width:120px;height:32px;margin-left:auto;filter:drop-shadow(0 4px 10px rgba(225,29,46,.15))}
// .spark path{stroke-width:2}
// .unitsCard{border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px;box-shadow:0 12px 34px rgba(16,24,40,.06)}
// .unitsHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
// .uBadge{border:1px solid #fecaca;background:#fff1f2;color:#e11d2e;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px}
// .uMeta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px}
// .uBox{border:1px solid #f3f4f6;border-radius:12px;padding:10px;text-align:center}
// .uK{color:var(--sub);font-size:12px}
// .uV{font-weight:900;font-size:18px}
// .uList{display:grid;gap:10px}
// .uItem{display:flex;gap:10px;align-items:center;border:1px solid #f0f2f6;border-radius:12px;padding:10px}
// .uThumb{width:56px;height:40px;border-radius:10px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc}
// .uThumb img{width:100%;height:100%;object-fit:cover}
// .uTitle{font-weight:900}
// .uUnits{margin-left:auto;font-weight:900}
// .uActions{display:flex;gap:8px}
// .nGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
// @media (max-width:990px){ .nGrid{grid-template-columns:repeat(2,1fr)} }
// @media (max-width:640px){ .nGrid{grid-template-columns:1fr} }
// .nCard{border:1px solid var(--line);border-radius:16px;padding:12px;background:#fff;box-shadow:0 10px 28px rgba(16,24,40,.06)}
// .nImg{width:100%;height:160px;border-radius:10px;object-fit:cover;border:1px solid #eef2f7}
// .nHead{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
// .badge{border:1px solid var(--line);border-radius:999px;padding:3px 8px;font-size:12px;color:var(--sub)}
// .nBtns{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
// `;

// /* --------------------------------- Helpers UI -------------------------------- */

// const short = (a?: string, n = 4) =>
//   a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "—";

// const chainName = (cid?: string) =>
//   cid === "0xaa36a7"
//     ? "Sepolia"
//     : cid === "0x1"
//     ? "Ethereum"
//     : cid
//     ? `Chain ${parseInt(cid, 16)}`
//     : "—";

// const ripple = (e: React.MouseEvent<HTMLElement>) => {
//   const host = e.currentTarget as HTMLElement;
//   const r = document.createElement("i");
//   r.className = "rip";
//   const rect = host.getBoundingClientRect();
//   r.style.left = `${e.clientX - rect.left}px`;
//   r.style.top = `${e.clientY - rect.top}px`;
//   host.appendChild(r);
//   setTimeout(() => r.remove(), 600);
// };

// const Sparkline: React.FC<{ color?: string; points?: number[] }> = ({
//   color = "#e11d2e",
//   points,
// }) => {
//   const pts = points ?? [8, 12, 10, 16, 14, 20, 18, 28, 22, 30];
//   const max = Math.max(...pts),
//     min = Math.min(...pts),
//     H = 32,
//     W = 120;
//   const norm = (v: number) => H - 2 - ((v - min) / (max - min || 1)) * (H - 4);
//   const step = W / (pts.length - 1);
//   const d = pts.map((v, i) => `${i * step},${norm(v)}`).join(" ");
//   return (
//     <svg className="spark" viewBox={`0 0 ${W} ${H}`} fill="none">
//       <defs>
//         <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
//           <stop stopColor={color} stopOpacity=".28" />
//           <stop offset="1" stopColor={color} stopOpacity="0" />
//         </linearGradient>
//       </defs>
//       <polyline points={d} stroke={color} fill="url(#g)" />
//     </svg>
//   );
// };

// /* ------------------------------- Types “données” ------------------------------ */

// type ChainKind = "evm" | "solana";
// type UnitLine = {
//   propertyId: string;
//   title: string;
//   thumb?: string;
//   units: number;
//   status: "en_attente" | "confirmé" | "livré";
//   investmentId?: string;
// };
// type NFTItem = {
//   tokenId: string;
//   contract: string;
//   title: string;
//   imageUrl?: string;
//   transferable: boolean;
//   units?: number;
//   category: string;
// };

// /* ================================== PAGE =================================== */

// export default function WalletPage() {
//   const nav = useNavigate();
//   const loc = useLocation();
//   const q = new URLSearchParams(loc.search);
//   const intent = q.get("intent") as "pay" | "deposit" | "withdraw" | "transfer" | null;

//   const refPortfolio = useRef<HTMLDivElement | null>(null);
//   const refUnits = useRef<HTMLDivElement | null>(null);
//   const refNFTs = useRef<HTMLDivElement | null>(null);

//   const [refCcy, setRefCcy] = useState<"EUR" | "USD" | "MAD" | "GBP" | "AED">(
//     () => (localStorage.getItem("fx_ccy") as any) || "EUR"
//   );
//   useEffect(() => localStorage.setItem("fx_ccy", refCcy), [refCcy]);

//   // MetaMask / SIWE
//   const [hasMM, setHasMM] = useState(false);
//   const [account, setAccount] = useState<string | undefined>();
//   const [chainId, setChainId] = useState<string | undefined>();
//   const [isAuth, setIsAuth] = useState(false);

//   // SOLDES RÉELS
//   const [nativeEth, setNativeEth] = useState<number>(0);
//   const [erc20s, setErc20s] = useState<
//     { symbol: string; name: string; decimals: number; address: `0x${string}`; amount: number; logo?: string }[]
//   >([]);

//   // Données “investissement” (mock pour l’instant)
//   const [units] = useState<UnitLine[]>([
//     {
//       propertyId: "101",
//       title: "F3 — Casablanca Centre",
//       thumb:
//         "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200&auto=format&fit=crop",
//       units: 3,
//       status: "livré",
//     },
//     {
//       propertyId: "204",
//       title: "Studio — Gauthier",
//       thumb:
//         "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop",
//       units: 1,
//       status: "en_attente",
//       investmentId: "d1i0lfia13n",
//     },
//   ]);
//   const [nfts] = useState<NFTItem[]>([]);

//   // FX “vite fait” (tu peux brancher une vraie API plus tard)
//   const rates = useMemo(() => {
//     const base = { eth: 2900, usdc: 0.92, dai: 0.92 }; // EUR
//     const fxTable = { EUR: 1, USD: 1.08, MAD: 10.8, GBP: 0.85, AED: 3.97 } as const;
//     const fx = fxTable[refCcy]; const out: any = {};
//     Object.entries(base).forEach(([k, v]) => (out[k] = v * fx));
//     return out as Record<"eth" | "usdc" | "dai", number>;
//   }, [refCcy]);

//   const totalCrypto = useMemo(() => {
//     const ethFiat = nativeEth * (rates.eth || 0);
//     const erc20Fiat = erc20s.reduce((s, t) => {
//       const key = t.symbol.toLowerCase() as "usdc" | "dai";
//       return s + t.amount * (rates[key] || 0);
//     }, 0);
//     return ethFiat + erc20Fiat;
//   }, [nativeEth, erc20s, rates]);

//   const totalUnits = useMemo(() => units.reduce((s, u) => s + u.units, 0), [units]);
//   const totalUnitsConfirmed = useMemo(
//     () => units.filter((u) => u.status !== "en_attente").reduce((s, u) => s + u.units, 0),
//     [units]
//   );
//   const totalUnitsPending = useMemo(
//     () => units.filter((u) => u.status === "en_attente").reduce((s, u) => s + u.units, 0),
//     [units]
//   );

//   // Boot MetaMask
//   useEffect(() => {
//     const eth = getEthereum(); setHasMM(Boolean(eth)); if (!eth) return;
//     (async () => {
//       try {
//         const [accs, cid] = await Promise.all([
//           eth.request({ method: "eth_accounts" }),
//           eth.request({ method: "eth_chainId" }),
//         ]);
//         setAccount(accs?.[0]); setChainId(cid);
//       } catch {}
//     })();
//     const onA = (a: string[]) => setAccount(a?.[0]);
//     const onC = (c: string) => setChainId(c);
//     eth.on?.("accountsChanged", onA);
//     eth.on?.("chainChanged", onC);
//     return () => {
//       eth.removeListener?.("accountsChanged", onA);
//       eth.removeListener?.("chainChanged", onC);
//     };
//   }, []);

//   // Charger le portefeuille réel dès que account est dispo
//   useEffect(() => {
//     if (!account) return;
//     (async () => {
//       try {
//         const { eth, erc20 } = await getPortfolio(account as `0x${string}`, TOKENS_SEPOLIA);
//         setNativeEth(eth);
//         setErc20s(erc20);
//       } catch (e) {
//         console.error("portfolio error:", e);
//       }
//     })();
//   }, [account]);

//   // Auto-scroll selon l’intent
//   useEffect(() => {
//     const el =
//       intent === "pay"
//         ? refUnits.current
//         : intent === "deposit"
//         ? refPortfolio.current
//         : intent === "withdraw"
//         ? refPortfolio.current
//         : intent === "transfer"
//         ? refPortfolio.current
//         : null;
//     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//   }, [intent]);

//   const ensureChain = async () => {
//     const eth = getEthereum(); if (!eth) return;
//     const cid = await eth.request({ method: "eth_chainId" });
//     if (cid !== EXPECTED_CHAIN.chainId) {
//       try {
//         await eth.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId: EXPECTED_CHAIN.chainId }],
//         });
//         setChainId(EXPECTED_CHAIN.chainId);
//       } catch (e: any) {
//         if (e?.code === 4902) {
//           await eth.request({
//             method: "wallet_addEthereumChain",
//             params: [
//               {
//                 chainId: EXPECTED_CHAIN.chainId,
//                 chainName: EXPECTED_CHAIN.name,
//                 rpcUrls: EXPECTED_CHAIN.rpc,
//                 nativeCurrency: EXPECTED_CHAIN.currency,
//                 blockExplorerUrls: [EXPECTED_CHAIN.explorer],
//               },
//             ],
//           });
//         }
//       }
//     }
//   };

//   const connect = async () => {
//     const eth = getEthereum();
//     if (!eth) return window.open("https://metamask.io/download/", "_blank");
//     await eth.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
//     const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
//     setAccount(accs?.[0]);
//     const cid: string = await eth.request({ method: "eth_chainId" });
//     setChainId(cid);
//     ensureChain();
//   };

//   const signIn = async () => {
//     const eth = getEthereum(); if (!eth) return;
//     const [addr] = await eth.request({ method: "eth_requestAccounts" });
//     const nonce = await fetch("/auth/nonce", { credentials: "include" })
//       .then((r) => r.json())
//       .catch(() => ({ nonce: Math.random().toString(36).slice(2) }));
//     const domain = window.location.host;
//     const msg = `domain: ${domain}
// address: ${addr}
// statement: Login
// nonce: ${nonce.nonce}
// issuedAt: ${new Date().toISOString()}`;
//     const signature = await eth.request({ method: "personal_sign", params: [msg, addr] });
//     const ok = await fetch("/auth/verify", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ address: addr, message: msg, signature }),
//     }).then((r) => r.ok);
//     if (ok) setIsAuth(true);
//   };

//   const logout = async () => {
//     try {
//       await fetch("/auth/logout", { method: "POST", credentials: "include" });
//     } catch {}
//     setIsAuth(false);
//     setAccount(undefined);
//   };

//   const wrongChain = hasMM && chainId && chainId !== EXPECTED_CHAIN.chainId;

//   /* ------------------------------------ UI ----------------------------------- */

//   return (
//     <>
//       <style>{CSS}</style>

//       {/* HEADER */}
//       <header className="w-head">
//         <h1 className="h1">Mon Wallet</h1>
//         <div className="pills">
//           <button
//             className="pill"
//             onClick={() =>
//               setRefCcy(
//                 refCcy === "EUR"
//                   ? "USD"
//                   : refCcy === "USD"
//                   ? "MAD"
//                   : refCcy === "MAD"
//                   ? "GBP"
//                   : refCcy === "GBP"
//                   ? "AED"
//                   : "EUR"
//               )
//             }
//           >
//             {refCcy} ▾
//           </button>
//           {hasMM ? (
//             account ? (
//               <>
//                 <span className="pill">
//                   {short(account)} • {chainName(chainId)}
//                 </span>
//                 {!isAuth && (
//                   <button
//                     className="btn btnPrimary"
//                     onClick={(e) => {
//                       ripple(e);
//                       signIn();
//                     }}
//                   >
//                     Lier (Signer)
//                   </button>
//                 )}

//                 <button
//                   className="btn btnGhost"
//                   onClick={(e) => {
//                     ripple(e);
//                     logout();
//                   }}
//                 >
//                   Déconnexion
//                 </button>
//               </>
//             ) : (
//               <button
//                 className="btn btnPrimary"
//                 onClick={(e) => {
//                   ripple(e);
//                   connect();
//                 }}
//               >
//                 Connecter MetaMask
//               </button>
//             )
//           ) : (
//             <a
//               className="btn btnPrimary"
//               href="https://metamask.io/download/"
//               target="_blank"
//               rel="noreferrer"
//             >
//               Installer MetaMask
//             </a>
//           )}
//         </div>
//       </header>

//       {/* HERO / STATS */}
//       <div className="hero">
//         {wrongChain && (
//           <div className="alert">
//             <div>
//               Réseau détecté : <b>{chainName(chainId)}</b> — attendu :{" "}
//               <b>{EXPECTED_CHAIN.name}</b>
//             </div>
//             <button
//               className="btn btnGhost"
//               onClick={(e) => {
//                 ripple(e);
//                 ensureChain();
//               }}
//             >
//               Basculer vers {EXPECTED_CHAIN.name}
//             </button>
//           </div>
//         )}

//         <div className="heroCard">
//           <div className="stats">
//             <div className="sCard">
//               <div className="sK">Total crypto</div>
//               <div className="sV">
//                 {totalCrypto.toLocaleString(undefined, { maximumFractionDigits: 2 })} {refCcy}
//               </div>
//             </div>
//             <div className="sCard">
//               <div className="sK">Unités totales</div>
//               <div className="sV">{totalUnits}</div>
//             </div>
//             <div className="sCard">
//               <div className="sK">Unités confirmées</div>
//               <div className="sV">{totalUnitsConfirmed}</div>
//             </div>
//             <div className="sCard">
//               <div className="sK">En attente</div>
//               <div className="sV" style={{ color: "var(--pri)" }}>{totalUnitsPending}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* TABS */}
//       <nav className="tabs">
//         <div className="tab active">Portfolio</div>
//         <div className="tab" onClick={() => refUnits.current?.scrollIntoView({ behavior: "smooth" })}>
//           Unités
//         </div>
//         <div className="tab" onClick={() => refNFTs.current?.scrollIntoView({ behavior: "smooth" })}>
//           Titres / NFTs
//         </div>
//         <div className="tab" onClick={() => nav("/activity")}>Activité</div>
//         <div className="tab" onClick={() => nav("/settings")}>Réglages</div>
//       </nav>

//       {/* CONTENU */}
//       <main className="wrap">
//         {/* ——— PORTFOLIO (ETH + ERC-20 réels) ——— */}
//         <section ref={refPortfolio} className="section">
//           <div className="assets">
//             {/* ETH natif */}
//             <article className="asset">
//               <div className="assetL">
//                 <div className="logo"><img src={TOKEN_LOGO.ETH} alt="ETH" /></div>
//                 <div style={{ minWidth: 0 }}>
//                   <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
//                     <span className="name">ETH</span>
//                     <span className="chain">EVM</span>
//                   </div>
//                   <div className="sub">Ethereum (Sepolia)</div>
//                 </div>
//               </div>
//               <Sparkline color="#e11d2e" />
//               <div className="assetR">
//                 <div className="assetAmt">{nativeEth.toFixed(6)}</div>
//                 <div className="assetFiat">
//                   {(nativeEth * (rates.eth || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })} {refCcy}
//                 </div>
//                 <div className="assetActions">
//                   <button className="chipBtn" onClick={() => nav(`/transfer?asset=eth`)} disabled={!isAuth}>
//                     Transférer
//                   </button>
//                 </div>
//               </div>
//             </article>

//             {/* ERC-20 dynamiques */}
//             {erc20s.map((t) => {
//               const fiat = t.amount * ((rates as any)[t.symbol.toLowerCase()] || 0);
//               const color = t.symbol === "USDC" ? "#3b82f6" : t.symbol === "DAI" ? "#f59e0b" : "#e11d2e";
//               return (
//                 <article key={t.address} className="asset">
//                   <div className="assetL">
//                     <div className="logo">
//                       {t.logo ? <img src={t.logo} alt={t.symbol} /> : t.symbol}
//                     </div>
//                     <div style={{ minWidth: 0 }}>
//                       <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
//                         <span className="name">{t.symbol}</span>
//                         <span className="chain">EVM</span>
//                       </div>
//                       <div className="sub">{t.name}</div>
//                     </div>
//                   </div>
//                   <Sparkline color={color} />
//                   <div className="assetR">
//                     <div className="assetAmt">{t.amount.toFixed(6)}</div>
//                     <div className="assetFiat">
//                       {fiat.toLocaleString(undefined, { maximumFractionDigits: 2 })} {refCcy}
//                     </div>
//                     <div className="assetActions">
//                       <button className="chipBtn" onClick={() => nav(`/transfer?asset=${t.symbol}`)} disabled={!isAuth}>
//                         Transférer
//                       </button>
//                     </div>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         </section>

//         {/* ——— UNITÉS ——— */}
//         <section ref={refUnits} className="section">
//           <div className="unitsCard">
//             <div className="unitsHeader">
//               <b>Unités d’investissement</b>
//               <span className="uBadge">Titres fractionnés</span>
//             </div>

//             <div className="uMeta">
//               <div className="uBox"><div className="uK">Total unités</div><div className="uV">{totalUnits}</div></div>
//               <div className="uBox"><div className="uK">Confirmées</div><div className="uV">{totalUnitsConfirmed}</div></div>
//               <div className="uBox"><div className="uK">En attente</div><div className="uV" style={{ color: "var(--pri)" }}>{totalUnitsPending}</div></div>
//             </div>

//             <div className="uList">
//               {units.map((u) => (
//                 <div key={u.propertyId} className="uItem">
//                   <div className="uThumb">
//                     <img
//                       src={
//                         u.thumb ||
//                         "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"
//                       }
//                       alt="thumb"
//                     />
//                   </div>
//                   <div>
//                     <div className="uTitle">{u.title}</div>
//                     <div className="sub">
//                       {u.status === "livré"
//                         ? "Livré (NFT émis)"
//                         : u.status === "confirmé"
//                         ? "Confirmé"
//                         : "En attente de paiement"}
//                     </div>
//                   </div>
//                   <div className="uUnits">{u.units} u.</div>
//                   <div className="uActions">
//                     {u.status === "en_attente" ? (
//                       <button className="chipBtn" onClick={() => nav(`/pay?investmentId=${u.investmentId}`)}>
//                         Finaliser
//                       </button>
//                     ) : (
//                       <>
//                         <button className="chipBtn" onClick={() => nav(`/properties/${u.propertyId}`)}>
//                           Détails
//                         </button>
//                         <button className="chipBtn" onClick={() => nav(`/tokens?propertyId=${u.propertyId}`)}>
//                           Voir NFT
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ——— NFTs ——— */}
//         <section ref={refNFTs} className="section">
//           <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
//             <div className="sub">Titres & NFTs</div>
//             <button className="btn btnGhost" onClick={() => nav("/tokens")}>Voir tout</button>
//           </div>
//           {nfts.length === 0 ? (
//             <div className="nCard" style={{ marginTop: 8 }}>
//               <div className="sub">
//                 Aucun titre pour l’instant. Après paiement confirmé et mint, vos NFTs apparaissent ici.
//               </div>
//             </div>
//           ) : (
//             <div className="nGrid">
//               {nfts.map((n) => (
//                 <div className="nCard" key={n.tokenId}>
//                   <img
//                     className="nImg"
//                     src={
//                       n.imageUrl ||
//                       "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"
//                     }
//                     alt="nft"
//                   />
//                   <div className="nHead">
//                     <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                       {n.title}
//                     </b>
//                     <span className="badge">{n.category}</span>
//                   </div>
//                   <div className="sub" style={{ marginTop: 6 }}>
//                     Token #{n.tokenId}
//                     {typeof n.units === "number" && <> • {n.units} u.</>}
//                   </div>
//                   <div className="nBtns">
//                     <a
//                       className="btn btnGhost"
//                       href={`${EXPECTED_CHAIN.explorer}/token/${n.contract}`}
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       Explorer
//                     </a>
//                     <a
//                       className="btn btnPrimary"
//                       href={`/nft/${n.tokenId}/attestation`}
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       Attestation
//                     </a>
//                     {n.transferable && (
//                       <button className="btn btnGhost" onClick={() => nav(`/transfer?nft=${n.tokenId}`)}>
//                         Transférer
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* ——— Actions rapides ——— */}
//         <section className="section">
//           <div className="row" style={{ justifyContent: "space-between" }}>
//             <div className="sub">Actions</div>
//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//               <button className="btn btnPrimary" onClick={() => nav("/deposit")} disabled={!account || wrongChain || !isAuth}>
//                 Déposer
//               </button>
//               <button className="btn btnGhost" onClick={() => nav("/withdraw")} disabled={!account || wrongChain || !isAuth}>
//                 Retirer
//               </button>
//               <button className="btn btnGhost" onClick={() => nav("/transfer")} disabled={!account || !isAuth}>
//                 Transférer
//               </button>
//               <button className="btn btnGhost" onClick={() => nav("/offers")}>
//                 Offres
//               </button>
//             </div>
//           </div>
//           <div className="sub" style={{ marginTop: 6 }}>
//             * Opérations critiques : adresse connectée, bon réseau ({EXPECTED_CHAIN.name}) et <b>signature</b> (liaison SIWE).
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }



// // src/pages/WalletPage.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { erc20Abi, createPublicClient, http } from "viem";
// import { sepolia } from "viem/chains";

// /* ------------------------------------------------------------------ */
// /*               CONFIG RÉSEAU + CLIENT (lecture on-chain)            */
// /* ------------------------------------------------------------------ */
// const EXPECTED_CHAIN = {
//   chainId: "0xaa36a7",
//   name: "Sepolia",
//   explorer: "https://sepolia.etherscan.io",
//   currency: { name: "Ether", symbol: "ETH", decimals: 18 },
//   rpc: ["https://rpc.ankr.com/eth_sepolia"],
// } as const;

// const publicClient = createPublicClient({
//   chain: sepolia,
//   transport: http(EXPECTED_CHAIN.rpc[0]),
// });

// /* ------------------------------------------------------------------ */
// /*                   IMPORTS PROJET (tokens + service)                 */
// /* ------------------------------------------------------------------ */
// export type Erc20Token = {
//   symbol: string;
//   name: string;
//   address: `0x${string}`;
//   decimals: number;
//   logo?: string;
// };

// // ⚠️ adapte/importe depuis ton projet réel
// import { TOKENS_SEPOLIA } from "../config/tokens";
// import { getPortfolio } from "../services/wallet";



// /* ------------------------------------------------------------------ */
// /*                             STYLES                                 */
// /* ------------------------------------------------------------------ */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
// :root{ --ink:#111827; --sub:#6b7280; --line:#eceff3; --bg:#ffffff; --card:#ffffff; --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2; }
// *{box-sizing:border-box} body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
// a{text-decoration:none;color:inherit} .section{margin-top:16px}

// /* Header */
// .w-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:22px auto 8px;max-width:1180px;padding:0 18px}
// .h1{margin:0;font-size:28px;font-weight:900;letter-spacing:-.01em}
// .pills{display:flex;gap:8px;flex-wrap:wrap}
// .pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;font-weight:800}

// .btn{position:relative;overflow:hidden;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff}
// .btn:active{transform:scale(.98)}
// .btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
// .btnGhost{border-color:#fecaca;color:var(--pri);background:#fff}
// .chipBtn{border:1px solid #fecaca;color:#e11d2e;background:#fff;border-radius:10px;padding:6px 10px;font-weight:800;cursor:pointer}
// .rip{position:absolute;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);transform:translate(-50%,-50%) scale(0);animation:r .6s ease-out forwards}
// @keyframes r{to{transform:translate(-50%,-50%) scale(22);opacity:0}}

// /* Hero / stats */
// .hero{ max-width:1180px;margin:0 auto;padding:0 18px;}
// .heroCard{ position:relative;overflow:hidden;margin-top:8px; border:1px solid var(--line);border-radius:18px;background:
//   radial-gradient(900px 240px at -10% -40%, rgba(225,17,46,.12), #0000),
//   radial-gradient(800px 240px at 110% -30%, rgba(190,18,60,.10), #0000), #fff;
//   padding:16px; box-shadow:0 12px 34px rgba(16,24,40,.06);
// }
// .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
// @media (max-width: 980px){ .stats{grid-template-columns:repeat(2,1fr)} }
// .sCard{border:1px solid var(--line);border-radius:14px;padding:12px;background:#fff}
// .sK{color:var(--sub);font-size:12px}
// .sV{font-weight:900;font-size:22px}

// /* alert réseau */
// .alert{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px;margin-top:8px}

// /* Tabs */
// .tabs{max-width:1180px;margin:12px auto 0;padding:0 18px;display:flex;gap:6px;border-bottom:1px solid var(--line)}
// .tab{padding:9px 12px;border-radius:10px;cursor:pointer;color:var(--sub);font-weight:800}
// .tab.active{color:var(--pri);background:#fff2f3;border:1px solid #fecaca}

// /* Container */
// .wrap{max-width:1180px;margin:0 auto;padding:0 18px}

// /* Assets */
// .assets{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
// @media (max-width: 920px){ .assets{grid-template-columns:1fr} }
// .asset{
//   --hover: 0 18px 52px rgba(16,24,40,.12);
//   position:relative; display:flex; align-items:center; gap:14px;
//   border:1px solid var(--line); border-radius:16px; background:#fff; padding:14px;
//   box-shadow:0 12px 40px rgba(16,24,40,.06); transition:transform .16s ease, box-shadow .16s ease, border-color .16s ease;
// }
// .asset:hover{ transform:translateY(-2px); box-shadow:var(--hover); border-color:#ffd4d9 }
// .asset:after{
//   content:""; position:absolute; left:0; top:10px; bottom:10px; width:4px; border-radius:4px;
//   background:linear-gradient(180deg,#ffccd2,#e11d2e); opacity:.25;
// }
// .assetL{display:flex; align-items:center; gap:12px; min-width:0; flex:1}
// .logo{width:48px;height:48px;border-radius:14px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc;display:grid;place-items:center}
// .logo img{width:100%;height:100%;object-fit:cover}
// .name{font-weight:900}
// .chain{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid #e5e7eb;color:#475569;font-weight:800}
// .assetR{text-align:right;margin-left:auto}
// .assetAmt{font-weight:900;font-size:18px}
// .assetFiat{color:var(--sub);font-size:13px}
// .assetActions{display:flex;gap:8px;margin-top:8px}
// .spark{width:120px;height:32px;margin-left:auto;filter:drop-shadow(0 4px 10px rgba(225,29,46,.15))}
// .spark path{stroke-width:2}

// /* Unités */
// .unitsCard{border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px;box-shadow:0 12px 34px rgba(16,24,40,.06)}
// .unitsHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
// .uBadge{border:1px solid #fecaca;background:#fff1f2;color:#e11d2e;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px}
// .uMeta{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px}
// .uBox{border:1px solid #f3f4f6;border-radius:12px;padding:10px;text-align:center}
// .uK{color:var(--sub);font-size:12px}
// .uV{font-weight:900;font-size:18px}
// .uFilters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
// .uFilter{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 10px;font-weight:800;cursor:pointer;color:#475569}
// .uFilter.active{border-color:#fecaca;color:#e11d2e;background:#fff1f2}

// .uList{display:grid;gap:10px}
// .uItem{display:flex;gap:10px;align-items:center;border:1px solid #f0f2f6;border-radius:12px;padding:10px}
// .uThumb{width:56px;height:40px;border-radius:10px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc}
// .uThumb img{width:100%;height:100%;object-fit:cover}
// .uTitle{font-weight:900}
// .uPill{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid #e5e7eb;color:#475569;font-weight:800}
// .uUnits{margin-left:auto;font-weight:900}
// .uActions{display:flex;gap:8px}

// /* NFTs */
// .nGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
// @media (max-width:990px){ .nGrid{grid-template-columns:repeat(2,1fr)} }
// @media (max-width:640px){ .nGrid{grid-template-columns:1fr} }
// .nCard{border:1px solid var(--line);border-radius:16px;padding:12px;background:#fff;box-shadow:0 10px 28px rgba(16,24,40,.06)}
// .nImg{width:100%;height:160px;border-radius:10px;object-fit:cover;border:1px solid #eef2f7}
// .nHead{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
// .badge{border:1px solid var(--line);border-radius:999px;padding:3px 8px;font-size:12px;color:#6b7280}
// .nBtns{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
// `;

// /* ------------------------------------------------------------------ */
// /*                              HELPERS                               */
// /* ------------------------------------------------------------------ */
// const TOKEN_LOGO: Record<string,string> = {
//   ETH:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkD569_CoUYIIYAnrrzEvgHJtafI6fmScJ3trt1ZJE5-HF4UMt3B4Wl4lfIX1iInC7B0E&usqp=CAU",
//   USDC:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ43MuDqq54iD1ZCRL_uthAPkfwSSL-J5qI_Q&s",
//   DAI:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCE8Lgbhy4J9u-j0UgoXNIF_wC9XM0QPVi2w&s",
//   SOL:"https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
// };

// const short = (a?:string, n=4)=> a ? `${a.slice(0,2+n)}…${a.slice(-n)}` : "—";
// const chainName = (cid?:string)=> cid==="0xaa36a7"?"Sepolia":cid==="0x1"?"Ethereum":cid?`Chain ${parseInt(cid,16)}`:"—";

// const ripple = (e:React.MouseEvent<HTMLElement>)=>{
//   const host=e.currentTarget as HTMLElement; const r=document.createElement("i"); r.className="rip";
//   const rect = host.getBoundingClientRect(); r.style.left=`${e.clientX-rect.left}px`; r.style.top=`${e.clientY-rect.top}px`;
//   host.appendChild(r); setTimeout(()=>r.remove(),600);
// };

// const Sparkline: React.FC<{ color?:string; points?:number[] }> = ({ color="#e11d2e", points })=>{
//   const pts = points ?? [8,12,10,16,14,20,18,28,22,30];
//   const max=Math.max(...pts), min=Math.min(...pts), H=32, W=120;
//   const norm=(v:number)=> H-2 - ((v-min)/(max-min||1))*(H-4);
//   const step = W/(pts.length-1);
//   const d = pts.map((v,i)=>`${i*step},${norm(v)}`).join(" ");
//   return (
//     <svg className="spark" viewBox={`0 0 ${W} ${H}`} fill="none">
//       <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stopColor={color} stopOpacity=".28"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
//       <polyline points={d} stroke={color} fill="url(#g)" />
//     </svg>
//   );
// };
// // en haut des states
// const [fiatBalance, setFiatBalance] = useState<number>(0);

// // charge un solde mock (remplace par fetch backend)
// useEffect(() => {
//   // TODO: remplace par GET /api/wallet/fiat-balance
//   setFiatBalance(1250); // 1 250 {refCcy} pour la démo
// }, []);

// /* ------------------------------------------------------------------ */
// /*                         TYPES “INVEST”                             */
// /* ------------------------------------------------------------------ */
// type UnitKind =
//   | "achat_solo"
//   | "achat_collectif"
//   | "location"
//   | "exploitation"
//   | "fonds_garanti";

// type UnitStatus = "en_attente" | "confirmé" | "livré" | "annulé";

// type UnitLine = {
//   propertyId: string;
//   title: string;
//   thumb?: string;
//   units: number;             // nb d’unités de l’utilisateur
//   unitPrice?: number;        // pour achat collectif variable (facultatif)
//   kind: UnitKind;
//   status: UnitStatus;
//   investmentId?: string;     // pour paiement / finalisation
// };

// type NFTItem = {
//   tokenId: string; contract: string; title: string; imageUrl?: string;
//   transferable: boolean; units?: number; category: string;
// };

// /* ------------------------------------------------------------------ */
// /*                               PAGE                                 */
// /* ------------------------------------------------------------------ */
// export default function WalletPage(){
//   const nav = useNavigate();
//   const loc = useLocation();
//   const q = new URLSearchParams(loc.search);
//   const intent = q.get("intent") as ("pay"|"deposit"|"withdraw"|"transfer"|null);

//   // sections
//   const refPortfolio = useRef<HTMLDivElement|null>(null);
//   const refUnits     = useRef<HTMLDivElement|null>(null);
//   const refNFTs      = useRef<HTMLDivElement|null>(null);

//   // devise affichage
//   const [refCcy, setRefCcy] = useState<"EUR"|"USD"|"MAD"|"GBP"|"AED">(
//     ()=>(localStorage.getItem("fx_ccy") as any)||"EUR"
//   );
//   useEffect(()=>localStorage.setItem("fx_ccy",refCcy),[refCcy]);

//   // MetaMask / SIWE
//   const [hasMM,setHasMM]=useState(false);
//   const [account,setAccount]=useState<string|undefined>();
//   const [chainId,setChainId]=useState<string|undefined>();
//   const [isAuth,setIsAuth]=useState(false);

//   // portefeuille dynamique
//   const [nativeEth, setNativeEth] = useState<number>(0);
//   const [erc20s, setErc20s] = useState<{symbol:string; name:string; decimals:number; address:`0x${string}`; amount:number; logo?:string}[]>([]);

//   // unités utilisateur (démo enrichie)
//   const [units, setUnits] = useState<UnitLine[]>([
//     { propertyId:"101", title:"F3 — Casablanca Centre", thumb:"https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200&auto=format&fit=crop", units:3, kind:"achat_solo",      status:"livré" },
//     { propertyId:"204", title:"Studio — Gauthier",      thumb:"https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop", units:1, kind:"achat_collectif", status:"en_attente", investmentId:"d1i0lfia13n", unitPrice: 1200 },
//     { propertyId:"305", title:"Local — Location long terme",  units:2, kind:"location",     status:"confirmé" },
//     { propertyId:"408", title:"Suite — Exploitation hôtelière", units:1, kind:"exploitation", status:"confirmé" },
//     { propertyId:"501", title:"Fonds garanti — tranche A",     units:5, kind:"fonds_garanti", status:"confirmé" },
//   ]);
//   // state
// const [solBalance, setSolBalance] = useState<number>(0);

// // charge depuis ton API (idéal)
// useEffect(() => {
//   (async () => {
//     try {
//       // TODO: remplace par l’endpoint réel et l’adresse Solana de l’utilisateur
//       const r = await fetch(`/api/solana/balance?owner=${encodeURIComponent("AdresseSolanaPubKey")}`);
//       const { balance } = await r.json();
//       setSolBalance(balance); // en SOL
//     } catch (e) {
//       console.warn("solana balance failed", e);
//     }
//   })();
// }, []);

//   const [nfts,setNfts]=useState<NFTItem[]>([]);

//   // FX (ex rapide)
//   const rates = useMemo(()=>{
//     const base = { ETH:2900, USDC:0.92, DAI:0.92, SOL:130 }; // EUR
//     const fxTable = { EUR:1, USD:1.08, MAD:10.8, GBP:0.85, AED:3.97 } as const;
//     const fx = fxTable[refCcy];
//     return Object.fromEntries(Object.entries(base).map(([k,v])=>[k, v*fx])) as Record<string, number>;
//   },[refCcy]);

//   const totalCrypto = useMemo(()=>{
//     const ethFiat = nativeEth * (rates.ETH || 0);
//     const erc20Fiat = erc20s.reduce((s,t)=> s + t.amount*(rates[t.symbol.toUpperCase()]||0), 0);
//     return ethFiat + erc20Fiat;
//   },[nativeEth,erc20s,rates]);

//   // Compteurs “mes unités”
//   const totalUnits = useMemo(()=> units.reduce((s,u)=>s+u.units,0),[units]);
//   const totalUnitsConfirmed = useMemo(()=>units.filter(u=>u.status!=="en_attente" && u.status!=="annulé").reduce((s,u)=>s+u.units,0),[units]);
//   const totalUnitsPending   = useMemo(()=>units.filter(u=>u.status==="en_attente").reduce((s,u)=>s+u.units,0),[units]);

//   // Filtres (par type)
//   const [unitFilter, setUnitFilter] = useState<"all"|UnitKind>("all");
//   const visibleUnits = useMemo(
//     () => unitFilter==="all" ? units : units.filter(u=>u.kind===unitFilter),
//     [units, unitFilter]
//   );

//   // Boot MM
//   useEffect(()=>{
//     const eth=(window as any).ethereum; setHasMM(Boolean(eth)); if(!eth) return;
//     (async()=>{
//       try{
//         const [accs,cid]=await Promise.all([
//           eth.request({method:"eth_accounts"}),
//           eth.request({method:"eth_chainId"})
//         ]);
//         setAccount(accs?.[0]); setChainId(cid);
//       }catch{}
//     })();
//     const onA=(a:string[])=>setAccount(a?.[0]); const onC=(c:string)=>setChainId(c);
//     eth.on?.("accountsChanged",onA); eth.on?.("chainChanged",onC);
//     return()=>{ eth.removeListener?.("accountsChanged",onA); eth.removeListener?.("chainChanged",onC); };
//   },[]);

//   // Charger portefeuille réel
//   useEffect(() => {
//     if (!account) return;
//     (async () => {
//       try {
//         const { eth, erc20 } = await getPortfolio(account as `0x${string}`, TOKENS_SEPOLIA);
//         setNativeEth(eth);
//         setErc20s(erc20);
//       } catch (e) {
//         console.error("portfolio error:", e);
//       }
//     })();
//   }, [account]);
//   // à placer tout en haut du composant (en dehors du return)
// const [showFinalize, setShowFinalize] = useState(false);
// const finalizeBtnRef = useRef<HTMLDivElement | null>(null);

// // referme le dropdown quand on clique ailleurs
// useEffect(() => {
//   const onClickOutside = (e: MouseEvent) => {
//     if (!finalizeBtnRef.current) return;
//     if (!finalizeBtnRef.current.contains(e.target as Node)) {
//       setShowFinalize(false);
//     }
//   };
//   document.addEventListener("click", onClickOutside);
//   return () => document.removeEventListener("click", onClickOutside);
// }, []);

//   // Auto-scroll intent
//   useEffect(()=>{
//     const el = intent==="pay" ? refUnits.current
//             : intent==="deposit" ? refPortfolio.current
//             : intent==="withdraw" ? refPortfolio.current
//             : intent==="transfer" ? refPortfolio.current
//             : null;
//     if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
//   },[intent]);
  
//   // Actions MM / SIWE
//   const ensureChain = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return;
//     const cid = await eth.request({method:"eth_chainId"});
//     if(cid !== EXPECTED_CHAIN.chainId){
//       try{
//         await eth.request({method:"wallet_switchEthereumChain", params:[{chainId:EXPECTED_CHAIN.chainId}]});
//         setChainId(EXPECTED_CHAIN.chainId);
//       }catch(e:any){
//         if(e?.code===4902){
//           await eth.request({method:"wallet_addEthereumChain", params:[{
//             chainId:EXPECTED_CHAIN.chainId, chainName:EXPECTED_CHAIN.name, rpcUrls:EXPECTED_CHAIN.rpc,
//             nativeCurrency:EXPECTED_CHAIN.currency, blockExplorerUrls:[EXPECTED_CHAIN.explorer]
//           }]});
//         }
//       }
//     }
//   };
//   const connect = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return window.open("https://metamask.io/download/","_blank");
//     await eth.request({method:"wallet_requestPermissions", params:[{eth_accounts:{}}]});
//     const accs:string[]=await eth.request({method:"eth_requestAccounts"}); setAccount(accs?.[0]);
//     const cid:string=await eth.request({method:"eth_chainId"}); setChainId(cid); ensureChain();
//   };
//   const signIn = async ()=>{
//     const eth=(window as any).ethereum; if(!eth) return;
//     const [addr]=await eth.request({method:"eth_requestAccounts"});
//     const nonce= await fetch("/auth/nonce",{credentials:"include"}).then(r=>r.json()).catch(()=>({nonce:Math.random().toString(36).slice(2)}));
//     const domain=window.location.host;
//     const msg=`domain: ${domain}
// address: ${addr}
// statement: Login
// nonce: ${nonce.nonce}
// issuedAt: ${new Date().toISOString()}`;
//     const signature=await eth.request({method:"personal_sign", params:[msg,addr]});
//     const ok= await fetch("/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({address:addr,message:msg,signature})}).then(r=>r.ok);
//     if(ok) setIsAuth(true);
//   };
//   const logout = async()=>{ try{ await fetch("/auth/logout",{method:"POST",credentials:"include"});}catch{} setIsAuth(false); setAccount(undefined); };

//   const wrongChain = hasMM && chainId && chainId!==EXPECTED_CHAIN.chainId;

//   /* ------------------------------ RENDU UI ------------------------------ */
//   return (
//     <>
//       <style>{CSS}</style>

//     {/* HEADER */}
// <header className="w-head">
//   <h1 className="h1">Mon Wallet</h1>

//   <div className="pills" style={{ position: "relative", gap: 10, display: "flex", alignItems: "center" }}>
//     {/* Devise */}
//     <button
//       className="pill"
//       onClick={() => {
//         const order: any = { EUR: "USD", USD: "MAD", MAD: "GBP", GBP: "AED", AED: "EUR" };
//         setRefCcy(order[refCcy]);
//       }}
//     >
//       {refCcy} ▾
//     </button>

//     {/* Bouton Finaliser (dropdown) — visible s'il existe des unités en attente */}
//     {units.some((u) => u.status === "en_attente") && (
//       <div ref={finalizeBtnRef} style={{ position: "relative" }}>
//         <button
//           className="btn btnPrimary"
//           onClick={(e) => {
//             ripple(e);
//             setShowFinalize((v) => !v);
//           }}
//         >
//           Finaliser ▾
//         </button>

//         {showFinalize && (
//           <div
//             style={{
//               position: "absolute",
//               top: "110%",
//               right: 0,
//               border: "1px solid var(--line)",
//               background: "#fff",
//               borderRadius: 12,
//               boxShadow: "0 18px 42px rgba(16,24,40,.12)",
//               minWidth: 260,
//               padding: 8,
//               zIndex: 1000,
//             }}
//           >
//             <div style={{ padding: "6px 10px", fontSize: 12, color: "var(--sub)" }}>
//               Sélectionne un investissement à finaliser
//             </div>

//             {units
//               .filter((u) => u.status === "en_attente")
//               .map((u) => (
//                 <div
//                   key={u.propertyId}
//                   onClick={() => {
//                     if (!u.investmentId) return alert("ID d’investissement manquant.");
//                     nav(`/payment/crypto/${u.investmentId}`);
//                     setShowFinalize(false);
//                   }}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 10,
//                     padding: "10px 12px",
//                     borderRadius: 10,
//                     cursor: "pointer",
//                   }}
//                   onMouseDown={(e) => e.preventDefault()} // évite la perte de focus avant le click
//                 >
//                   <div
//                     style={{
//                       width: 40,
//                       height: 28,
//                       borderRadius: 8,
//                       overflow: "hidden",
//                       border: "1px solid #eef2f7",
//                       background: "#f8fafc",
//                       flex: "0 0 auto",
//                     }}
//                   >
//                     <img
//                       src={
//                         u.thumb ||
//                         "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"
//                       }
//                       alt="thumb"
//                       style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                     />
//                   </div>
//                   <div style={{ minWidth: 0, flex: 1 }}>
//                     <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                       {u.title}
//                     </div>
//                     <div className="small">En attente • {u.units} u.</div>
//                   </div>
//                   <div className="pill" style={{ fontWeight: 900 }}>Payer</div>
//                 </div>
//               ))}

//             <div style={{ height: 6 }} />
//             <button
//               className="btn btnGhost"
//               style={{ width: "100%" }}
//               onClick={(e) => {
//                 ripple(e);
//                 setShowFinalize(false);
//               }}
//             >
//               Fermer
//             </button>
//           </div>
//         )}
//       </div>
//     )}

//     {/* MetaMask / Auth */}
//     {hasMM ? (
//       account ? (
//         <>
//           <span className="pill">{short(account)} • {chainName(chainId)}</span>

//           {!isAuth && (
//             <button
//               className="btn btnPrimary"
//               onClick={(e) => {
//                 ripple(e);
//                 signIn();
//               }}
//             >
//               Lier (Signer)
//             </button>
//           )}

//           <button
//             className="btn btnGhost"
//             onClick={(e) => {
//               ripple(e);
//               logout();
//             }}
//           >
//             Déconnexion
//           </button>
//         </>
//       ) : (
//         <button
//           className="btn btnPrimary"
//           onClick={(e) => {
//             ripple(e);
//             connect();
//           }}
//         >
//           Connecter MetaMask
//         </button>
//       )
//     ) : (
//       <a className="btn btnPrimary" href="https://metamask.io/download/" target="_blank" rel="noreferrer">
//         Installer MetaMask
//       </a>
//     )}
//   </div>
// </header>


//       {/* HERO / STATS Utilisateur */}
//       <div className="hero">
//         {wrongChain && (
//           <div className="alert">
//             <div>Réseau détecté : <b>{chainName(chainId)}</b> — attendu : <b>{EXPECTED_CHAIN.name}</b></div>
//             <button className="btn btnGhost" onClick={(e)=>{ripple(e);ensureChain();}}>Basculer vers {EXPECTED_CHAIN.name}</button>
//           </div>
//         )}
//         <div className="heroCard">
//           <div className="stats">
//             <div className="sCard"><div className="sK">Total crypto</div><div className="sV">{totalCrypto.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div></div>
//             <div className="sCard"><div className="sK">Mes unités (total)</div><div className="sV">{totalUnits}</div></div>
//             <div className="sCard"><div className="sK">Confirmées</div><div className="sV">{totalUnitsConfirmed}</div></div>
//             <div className="sCard"><div className="sK">En attente</div><div className="sV" style={{color:"var(--pri)"}}>{totalUnitsPending}</div></div>
//           </div>
//         </div>
//       </div>

//       {/* TABS */}
//       <nav className="tabs">
//         <div className="tab active">Portfolio</div>
//         <div className="tab" onClick={()=>refUnits.current?.scrollIntoView({behavior:"smooth"})}>Unités</div>
//         <div className="tab" onClick={()=>refNFTs.current?.scrollIntoView({behavior:"smooth"})}>Titres / NFTs</div>
//         <div className="tab" onClick={()=>nav("/activity")}>Activité</div>
//         <div className="tab" onClick={()=>nav("/settings")}>Réglages</div>
//       </nav>

//       <main className="wrap">
//         {/* --------------------- PORTFOLIO (ETH + ERC-20) --------------------- */}
//         {/* --------------------- PORTFOLIO (ETH + Cash + SOL + ERC-20) --------------------- */}
// <section ref={refPortfolio} className="section">
//   <div className="assets">
//     {/* ETH */}
//     <article className="asset">
//       <div className="assetL">
//         <div className="logo"><img src={TOKEN_LOGO.ETH} alt="ETH" /></div>
//         <div style={{minWidth:0}}>
//           <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
//             <span className="name">ETH</span><span className="chain">EVM</span>
//           </div>
//           <div className="sub">Ethereum (Sepolia)</div>
//         </div>
//       </div>
//       <Sparkline color="#e11d2e" />
//       <div className="assetR">
//         <div className="assetAmt">{nativeEth.toFixed(6)}</div>
//         <div className="assetFiat">
//           {(nativeEth * (rates.eth || 0)).toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}
//         </div>
//         <div className="assetActions">
//           <button className="chipBtn" onClick={()=>nav(`/transfer?asset=ETH`)} disabled={!isAuth}>Transférer</button>
//         </div>
//       </div>
//     </article>

//     {/* CASH (fiat off-chain) */}
//     <article className="asset">
//       <div className="assetL">
//         <div className="logo">
//           <img src="https://img.icons8.com/?size=100&id=23209&format=png" alt="Cash" />
//         </div>
//         <div style={{ minWidth: 0 }}>
//           <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
//             <span className="name">CASH</span>
//             <span className="chain">OFF-CHAIN</span>
//           </div>
//           <div className="sub">Solde fiat (compte cash)</div>
//         </div>
//       </div>

//       <Sparkline color="#10b981" />
//       <div className="assetR">
//         <div className="assetAmt">
//           {fiatBalance.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}
//         </div>
//         <div className="assetFiat">Compte libellé en {refCcy}</div>
//         <div className="assetActions">
//           <button className="chipBtn" onClick={()=>nav("/deposit-fiat")} disabled={!isAuth}>Déposer</button>
//           <button className="chipBtn" onClick={()=>nav("/withdraw-fiat")} disabled={!isAuth}>Retirer</button>
//         </div>
//       </div>
//     </article>

//     {/* SOL (Solana) */}
//     {(solBalance > 0 || true) && (
//       <article className="asset">
//         <div className="assetL">
//           <div className="logo"><img src={TOKEN_LOGO.SOL} alt="SOL" /></div>
//           <div style={{ minWidth: 0 }}>
//             <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
//               <span className="name">SOL</span>
//               <span className="chain">SOLANA</span>
//             </div>
//             <div className="sub">Solana (off-EVM)</div>
//           </div>
//         </div>
//         <Sparkline color="#10b981" />
//         <div className="assetR">
//           <div className="assetAmt">{solBalance.toFixed(6)}</div>
//           {/* Si tu as un prix SOL→refCcy, affiche-le ici */}
//           {/* <div className="assetFiat">
//             {(solBalance * (rates.sol || 0)).toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}
//           </div> */}
//           <div className="assetActions">
//             <button className="chipBtn" onClick={()=>nav("/transfer?asset=SOL")} disabled={!isAuth}>Transférer</button>
//           </div>
//         </div>
//       </article>
//     )}

//     {/* ERC-20 (USDC/DAI...) */}
//     {erc20s.map((t) => {
//       const key = t.symbol.toLowerCase() as "usdc" | "dai"; // aligne avec rates
//       const fiat = t.amount * ((rates as any)[key] || 0);
//       const color =
//         t.symbol === "USDC" ? "#3b82f6" :
//         t.symbol === "DAI"  ? "#f59e0b" :
//                               "#e11d2e";
//       return (
//         <article key={t.address} className="asset">
//           <div className="assetL">
//             <div className="logo">{t.logo ? <img src={t.logo} alt={t.symbol}/> : t.symbol}</div>
//             <div style={{minWidth:0}}>
//               <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
//                 <span className="name">{t.symbol}</span><span className="chain">EVM</span>
//               </div>
//               <div className="sub">{t.name}</div>
//             </div>
//           </div>
//           <Sparkline color={color} />
//           <div className="assetR">
//             <div className="assetAmt">{t.amount.toFixed(6)}</div>
//             <div className="assetFiat">
//               {fiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}
//             </div>
//             <div className="assetActions">
//               <button className="chipBtn" onClick={()=>nav(`/transfer?asset=${t.symbol}`)} disabled={!isAuth}>Transférer</button>
//               {t.symbol!=="ETH" && (
//                 <button className="chipBtn" onClick={()=>nav(`/swap?to=${t.symbol}`)}>Swap</button>
//               )}
//             </div>
//           </div>
//         </article>
//       );
//     })}
//   </div>
// </section>


//         {/* ------------------- UNITÉS D’INVESTISSEMENT (avec types) ------------------- */}
//         <section ref={refUnits} className="section">
//           <div className="unitsCard">
//             <div className="unitsHeader">
//               <b>Unités d’investissement (mes positions)</b>
//               <span className="uBadge">Vos unités : {totalUnits}</span>
//             </div>

//             {/* Filtres par type */}
//             <div className="uFilters">
//               {(["all","achat_solo","achat_collectif","location","exploitation","fonds_garanti"] as const).map(k => (
//                 <button key={k} className={`uFilter ${unitFilter===k?"active":""}`} onClick={()=>setUnitFilter(k)}>
//                   {k==="all"?"Tous":k.replace("_"," ")}
//                 </button>
//               ))}
//             </div>

//             {/* KPIs unités */}
//             <div className="uMeta">
//               <div className="uBox"><div className="uK">Total unités</div><div className="uV">{totalUnits}</div></div>
//               <div className="uBox"><div className="uK">Confirmées</div><div className="uV">{totalUnitsConfirmed}</div></div>
//               <div className="uBox"><div className="uK">En attente</div><div className="uV" style={{color:"var(--pri)"}}>{totalUnitsPending}</div></div>
//               <div className="uBox"><div className="uK">Types détenus</div><div className="uV">{new Set(units.map(u=>u.kind)).size}</div></div>
//             </div>

//             {/* Liste */}
//             <div className="uList">
//               {visibleUnits.map(u=>(
//                 <div key={`${u.propertyId}-${u.kind}`} className="uItem">
//                   <div className="uThumb"><img src={u.thumb || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"} alt="thumb"/></div>
//                   <div style={{minWidth:0}}>
//                     <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
//                       <div className="uTitle">{u.title}</div>
//                       <span className="uPill">{u.kind.replace("_"," ")}</span>
//                       <span className="uPill" style={{borderColor:u.status==="en_attente"?"#fecaca":"#e5e7eb", color:u.status==="en_attente"?"#e11d2e":"#475569"}}>
//                         {u.status==="livré"?"livré":u.status==="confirmé"?"confirmé":u.status==="annulé"?"annulé":"en attente"}
//                       </span>
//                       {typeof u.unitPrice==="number" && <span className="uPill">{u.unitPrice.toLocaleString()} {refCcy}/u.</span>}
//                     </div>
//                     <div className="sub">
//                       {u.kind==="location" && "Revenus locatifs mensuels après mise en location"}
//                       {u.kind==="exploitation" && "Revenus d’exploitation (hôtel / commerce) au prorata"}
//                       {u.kind==="fonds_garanti" && "Revenu garanti après franchise (si applicable)"}
//                       {u.kind==="achat_collectif" && "Achat par unités (fixe/variable selon projet)"}
//                       {u.kind==="achat_solo" && "Achat global (100% du lot)"}
//                     </div>
//                   </div>

//                   <div className="uUnits">{u.units} u.</div>

//                   <div className="uActions">
//                     {/* Actions contextuelles */}
//                     {u.status==="en_attente" && (
//                       <>
//                         <button className="chipBtn" onClick={()=>nav(`/pay?investmentId=${u.investmentId}`)}>
//                           Finaliser
//                         </button>
//                         {u.kind==="achat_collectif" && (
//                           <button className="chipBtn" onClick={()=>nav(`/increase?investmentId=${u.investmentId}`)}>
//                             Ajouter des unités
//                           </button>
//                         )}
//                       </>
//                     )}
//                     {u.status==="confirmé" && (
//                       <>
//                         <button className="chipBtn" onClick={()=>nav(`/contracts/${u.propertyId}`)}>Contrat</button>
//                         {u.kind!=="achat_solo" && <button className="chipBtn" onClick={()=>nav(`/resale?propertyId=${u.propertyId}`)}>Revendre</button>}
//                       </>
//                     )}
//                     {u.status==="livré" && (
//                       <>
//                         <button className="chipBtn" onClick={()=>nav(`/tokens?propertyId=${u.propertyId}`)}>Voir NFT</button>
//                         <button className="chipBtn" onClick={()=>nav(`/attestations/${u.propertyId}`)}>Attestation</button>
//                       </>
//                     )}
//                     {u.status==="annulé" && (
//                       <button className="chipBtn" onClick={()=>nav(`/support?ref=${u.propertyId}`)}>Support</button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//               {visibleUnits.length===0 && (
//                 <div className="uBox" style={{textAlign:"center"}}>Aucune unité pour ce filtre.</div>
//               )}
//             </div>
//           </div>
//         </section>

//         {/* --------------------------- TITRES & NFTs --------------------------- */}
//         <section ref={refNFTs} className="section">
//           <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
//             <div className="sub">Titres & NFTs</div>
//             <button className="btn btnGhost" onClick={()=>nav("/tokens")}>Voir tout</button>
//           </div>
//           {nfts.length===0 ? (
//             <div className="nCard" style={{marginTop:8}}>
//               <div className="sub">Aucun titre pour l’instant. Après paiement confirmé et mint, vos NFTs apparaissent ici.</div>
//             </div>
//           ):(
//             <div className="nGrid">
//               {nfts.map(n=>(
//                 <div className="nCard" key={n.tokenId}>
//                   <img className="nImg" src={n.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"} alt="nft"/>
//                   <div className="nHead">
//                     <b style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.title}</b>
//                     <span className="badge">{n.category}</span>
//                   </div>
//                   <div className="sub" style={{marginTop:6}}>Token #{n.tokenId}{typeof n.units==="number" && <> • {n.units} u.</>}</div>
//                   <div className="nBtns">
//                     <a className="btn btnGhost" href={`${EXPECTED_CHAIN.explorer}/token/${n.contract}`} target="_blank" rel="noreferrer">Explorer</a>
//                     <a className="btn btnPrimary" href={`/nft/${n.tokenId}/attestation`} target="_blank" rel="noreferrer">Attestation</a>
//                     {n.transferable && <button className="btn btnGhost" onClick={()=>nav(`/transfer?nft=${n.tokenId}`)}>Transférer</button>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* --------------------------- ACTIONS RAPIDES --------------------------- */}
//         <section className="section">
//           <div className="row" style={{justifyContent:"space-between"}}>
//             <div className="sub">Actions</div>
//             <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
//               <button className="btn btnPrimary" onClick={()=>nav("/deposit")}  disabled={!account||wrongChain||!isAuth}>Déposer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/withdraw")} disabled={!account||wrongChain||!isAuth}>Retirer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/transfer")} disabled={!account||!isAuth}>Transférer</button>
//               <button className="btn btnGhost"   onClick={()=>nav("/offers")}>Offres</button>
//             </div>
//           </div>
//           <div className="sub" style={{marginTop:6}}>
//             * Opérations critiques : adresse connectée, bon réseau ({EXPECTED_CHAIN.name}) et <b>signature</b> (liaison SIWE).
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }



// src/pages/WalletPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { erc20Abi, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

/* ---------------------------------- Réseau ---------------------------------- */
const EXPECTED_CHAIN = {
  chainId: "0xaa36a7",
  name: "Sepolia",
  explorer: "https://sepolia.etherscan.io",
  currency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: ["https://rpc.ankr.com/eth_sepolia"],
} as const;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(EXPECTED_CHAIN.rpc[0]),
});

/* ----------------------------- Types / Imports ------------------------------ */
export type Erc20Token = {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  logo?: string;
};

// ⚠️ adapte les chemins à ton projet
import { TOKENS_SEPOLIA } from "../config/tokens";
import { getPortfolio } from "../services/wallet";

/* ----------------------------------- CSS ----------------------------------- */
const CSS = `/* … même CSS que ta version (inchangé) … */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
:root{ --ink:#111827; --sub:#6b7280; --line:#eceff3; --bg:#ffffff; --card:#ffffff; --pri:#e11d2e; --pri-700:#be123c; --pri-soft:#fff1f2; }
*{box-sizing:border-box} body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
a{text-decoration:none;color:inherit} .section{margin-top:16px}
/* Header */
.w-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:22px auto 8px;max-width:1180px;padding:0 18px}
.h1{margin:0;font-size:28px;font-weight:900;letter-spacing:-.01em}
.pills{display:flex;gap:8px;flex-wrap:wrap}
.pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;font-weight:800}
.btn{position:relative;overflow:hidden;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer;border:1px solid var(--line);background:#fff}
.btn:active{transform:scale(.98)}
.btnPrimary{border-color:var(--pri);background:linear-gradient(135deg,var(--pri),var(--pri-700));color:#fff;box-shadow:0 14px 34px rgba(225,29,46,.18)}
.btnGhost{border-color:#fecaca;color:var(--pri);background:#fff}
.chipBtn{border:1px solid #fecaca;color:#e11d2e;background:#fff;border-radius:10px;padding:6px 10px;font-weight:800;cursor:pointer}
.rip{position:absolute;width:12px;height:12px;border-radius:999px;background:rgba(255,255,255,.75);transform:translate(-50%,-50%) scale(0);animation:r .6s ease-out forwards}
@keyframes r{to{transform:translate(-50%,-50%) scale(22);opacity:0}}
/* Hero / stats */
.hero{ max-width:1180px;margin:0 auto;padding:0 18px;}
.heroCard{ position:relative;overflow:hidden;margin-top:8px; border:1px solid var(--line);border-radius:18px;background:
  radial-gradient(900px 240px at -10% -40%, rgba(225,17,46,.12), #0000),
  radial-gradient(800px 240px at 110% -30%, rgba(190,18,60,.10), #0000), #fff;
  padding:16px; box-shadow:0 12px 34px rgba(16,24,40,.06);
}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
@media (max-width: 980px){ .stats{grid-template-columns:repeat(2,1fr)} }
.sCard{border:1px solid var(--line);border-radius:14px;padding:12px;background:#fff}
.sK{color:var(--sub);font-size:12px}
.sV{font-weight:900;font-size:22px}
/* alert réseau */
.alert{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;padding:10px;border-radius:12px;margin-top:8px}
/* Tabs */
.tabs{max-width:1180px;margin:12px auto 0;padding:0 18px;display:flex;gap:6px;border-bottom:1px solid var(--line)}
.tab{padding:9px 12px;border-radius:10px;cursor:pointer;color:#6b7280;font-weight:800}
.tab.active{color:var(--pri);background:#fff2f3;border:1px solid #fecaca}
/* Container */
.wrap{max-width:1180px;margin:0 auto;padding:0 18px}
/* Assets */
.assets{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
@media (max-width: 920px){ .assets{grid-template-columns:1fr} }
.asset{--hover: 0 18px 52px rgba(16,24,40,.12);position:relative;display:flex;align-items:center;gap:14px;border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px;box-shadow:0 12px 40px rgba(16,24,40,.06);transition:transform .16s ease, box-shadow .16s ease, border-color .16s ease;}
.asset:hover{ transform:translateY(-2px); box-shadow:var(--hover); border-color:#ffd4d9 }
.asset:after{ content:""; position:absolute; left:0; top:10px; bottom:10px; width:4px; border-radius:4px; background:linear-gradient(180deg,#ffccd2,#e11d2e); opacity:.25;}
.assetL{display:flex; align-items:center; gap:12px; min-width:0; flex:1}
.logo{width:48px;height:48px;border-radius:14px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc;display:grid;place-items:center}
.logo img{width:100%;height:100%;object-fit:cover}
.name{font-weight:900}
.chain{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid #e5e7eb;color:#475569;font-weight:800}
.assetR{text-align:right;margin-left:auto}
.assetAmt{font-weight:900;font-size:18px}
.assetFiat{color:var(--sub);font-size:13px}
.assetActions{display:flex;gap:8px;margin-top:8px}
.spark{width:120px;height:32px;margin-left:auto;filter:drop-shadow(0 4px 10px rgba(225,29,46,.15))}
.spark path{stroke-width:2}
/* Unités */
.unitsCard{border:1px solid var(--line);border-radius:16px;background:#fff;padding:14px;box-shadow:0 12px 34px rgba(16,24,40,.06)}
.unitsHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.uBadge{border:1px solid #fecaca;background:#fff1f2;color:#e11d2e;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px}
.uMeta{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px}
.uBox{border:1px solid #f3f4f6;border-radius:12px;padding:10px;text-align:center}
.uK{color:#6b7280;font-size:12px}
.uV{font-weight:900;font-size:18px}
.uFilters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.uFilter{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 10px;font-weight:800;cursor:pointer;color:#475569}
.uFilter.active{border-color:#fecaca;color:#e11d2e;background:#fff1f2}
.uList{display:grid;gap:10px}
.uItem{display:flex;gap:10px;align-items:center;border:1px solid #f0f2f6;border-radius:12px;padding:10px}
.uThumb{width:56px;height:40px;border-radius:10px;overflow:hidden;border:1px solid #eef2f7;background:#f8fafc}
.uThumb img{width:100%;height:100%;object-fit:cover}
.uTitle{font-weight:900}
.uPill{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid #e5e7eb;color:#475569;font-weight:800}
.uUnits{margin-left:auto;font-weight:900}
.uActions{display:flex;gap:8px}
/* NFTs */
.nGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
@media (max-width:990px){ .nGrid{grid-template-columns:repeat(2,1fr)} }
@media (max-width:640px){ .nGrid{grid-template-columns:1fr} }
.nCard{border:1px solid var(--line);border-radius:16px;padding:12px;background:#fff;box-shadow:0 10px 28px rgba(16,24,40,.06)}
.nImg{width:100%;height:160px;border-radius:10px;object-fit:cover;border:1px solid #eef2f7}
.nHead{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
.badge{border:1px solid var(--line);border-radius:999px;padding:3px 8px;font-size:12px;color:#6b7280}
.nBtns{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
`;

/* -------------------------------- Helpers UI ------------------------------- */
const TOKEN_LOGO: Record<string,string> = {
  ETH:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkD569_CoUYIIYAnrrzEvgHJtafI6fmScJ3trt1ZJE5-HF4UMt3B4Wl4lfIX1iInC7B0E&usqp=CAU",
  USDC:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ43MuDqq54iD1ZCRL_uthAPkfwSSL-J5qI_Q&s",
  DAI:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCE8Lgbhy4J9u-j0UgoXNIF_wC9XM0QPVi2w&s",
  SOL:"https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
};
const short = (a?:string, n=4)=> a ? `${a.slice(0,2+n)}…${a.slice(-n)}` : "—";
const chainName = (cid?:string)=> cid==="0xaa36a7"?"Sepolia":cid==="0x1"?"Ethereum":cid?`Chain ${parseInt(cid,16)}`:"—";
const ripple = (e:React.MouseEvent<HTMLElement>)=>{
  const host=e.currentTarget as HTMLElement; const r=document.createElement("i"); r.className="rip";
  const rect = host.getBoundingClientRect(); r.style.left=`${e.clientX-rect.left}px`; r.style.top=`${e.clientY-rect.top}px`;
  host.appendChild(r); setTimeout(()=>r.remove(),600);
};
const Sparkline: React.FC<{ color?:string; points?:number[] }> = ({ color="#e11d2e", points })=>{
  const pts = points ?? [8,12,10,16,14,20,18,28,22,30];
  const max=Math.max(...pts), min=Math.min(...pts), H=32, W=120;
  const norm=(v:number)=> H-2 - ((v-min)/(max-min||1))*(H-4);
  const step = W/(pts.length-1);
  const d = pts.map((v,i)=>`${i*step},${norm(v)}`).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} fill="none">
      <defs><linearGradient id="g" x1="0" y="0" x2="0" y2="1"><stop stopColor={color} stopOpacity=".28"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polyline points={d} stroke={color} fill="url(#g)" />
    </svg>
  );
};

/* ---------------------------------- Types ---------------------------------- */
type UnitKind = "achat_solo" | "achat_collectif" | "location" | "exploitation" | "fonds_garanti";
type UnitStatus = "en_attente" | "confirmé" | "livré" | "annulé";
type UnitLine = {
  propertyId: string;
  title: string;
  thumb?: string;
  units: number;
  unitPrice?: number;
  kind: UnitKind;
  status: UnitStatus;
  investmentId?: string;
};
type NFTItem = { tokenId: string; contract: string; title: string; imageUrl?: string; transferable: boolean; units?: number; category: string };

/* ================================== PAGE =================================== */
export default function WalletPage(){
  const nav = useNavigate();
  const loc = useLocation();
  const q = new URLSearchParams(loc.search);
  const intent = q.get("intent") as ("pay"|"deposit"|"withdraw"|"transfer"|null);

  // sections
  const refPortfolio = useRef<HTMLDivElement|null>(null);
  const refUnits     = useRef<HTMLDivElement|null>(null);
  const refNFTs      = useRef<HTMLDivElement|null>(null);

  // devise
  const [refCcy, setRefCcy] = useState<"EUR"|"USD"|"MAD"|"GBP"|"AED">(
    ()=>(localStorage.getItem("fx_ccy") as any)||"EUR"
  );
  useEffect(()=>localStorage.setItem("fx_ccy",refCcy),[refCcy]);

  // MetaMask / SIWE
  const [hasMM,setHasMM]=useState(false);
  const [account,setAccount]=useState<string|undefined>();
  const [chainId,setChainId]=useState<string|undefined>();
  const [isAuth,setIsAuth]=useState(false);

  // Portefeuille on-chain
  const [nativeEth, setNativeEth] = useState<number>(0);
  const [erc20s, setErc20s] = useState<{symbol:string; name:string; decimals:number; address:`0x${string}`; amount:number; logo?:string}[]>([]);

  // Off-chain / Solana (démos)
  const [fiatBalance, setFiatBalance] = useState<number>(0);
  const [solBalance, setSolBalance]   = useState<number>(0);

  useEffect(() => { setFiatBalance(1250); }, []); // TODO: remplace par un fetch backend
  useEffect(() => {
    (async () => {
      try {
        // TODO: remplace endpoint + pubkey
        // const r = await fetch(`/api/solana/balance?owner=${encodeURIComponent("AdresseSolanaPubKey")}`);
        // const { balance } = await r.json();
        const balance = 0; // démo
        setSolBalance(balance);
      } catch {}
    })();
  }, []);

  // Unités utilisateur (démo enrichie)
  const [units] = useState<UnitLine[]>([
    { propertyId:"101", title:"F3 — Casablanca Centre",      thumb:"https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200&auto=format&fit=crop", units:3, kind:"achat_solo",      status:"livré" },
    { propertyId:"204", title:"Studio — Gauthier",           thumb:"https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop", units:1, kind:"achat_collectif", status:"en_attente", investmentId:"d1i0lfia13n", unitPrice: 1200 },
    { propertyId:"305", title:"Local — Location long terme", units:2, kind:"location",     status:"confirmé" },
    { propertyId:"408", title:"Suite — Exploitation hôtel",  units:1, kind:"exploitation", status:"confirmé" },
    { propertyId:"501", title:"Fonds garanti — Tranche A",   units:5, kind:"fonds_garanti", status:"confirmé" },
  ]);

  // NFTs
  const [nfts] = useState<NFTItem[]>([]);

  // Prix (minuscule partout)
  const rates = useMemo(()=>{
    const base = { eth:2900, usdc:0.92, dai:0.92, sol:130 }; // en EUR
    const fxTable = { EUR:1, USD:1.08, MAD:10.8, GBP:0.85, AED:3.97 } as const;
    const fx = fxTable[refCcy];
    return {
      eth: base.eth*fx,
      usdc: base.usdc*fx,
      dai: base.dai*fx,
      sol: base.sol*fx,
    };
  },[refCcy]);

  const totalCrypto = useMemo(()=>{
    const ethFiat = nativeEth * (rates.eth || 0);
    const erc20Fiat = erc20s.reduce((s,t)=> s + t.amount*(rates[t.symbol.toLowerCase() as "usdc"|"dai"]||0), 0);
    return ethFiat + erc20Fiat;
  },[nativeEth,erc20s,rates]);

  // KPIs unités
  const totalUnits = useMemo(()=> units.reduce((s,u)=>s+u.units,0),[units]);
  const totalUnitsConfirmed = useMemo(()=>units.filter(u=>u.status!=="en_attente" && u.status!=="annulé").reduce((s,u)=>s+u.units,0),[units]);
  const totalUnitsPending   = useMemo(()=>units.filter(u=>u.status==="en_attente").reduce((s,u)=>s+u.units,0),[units]);

  // Filtres
  const [unitFilter, setUnitFilter] = useState<"all"|UnitKind>("all");
  const visibleUnits = useMemo(
    () => unitFilter==="all" ? units : units.filter(u=>u.kind===unitFilter),
    [units, unitFilter]
  );

  // Finaliser dropdown
  const [showFinalize, setShowFinalize] = useState(false);
  const finalizeBtnRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!finalizeBtnRef.current) return;
      if (!finalizeBtnRef.current.contains(e.target as Node)) setShowFinalize(false);
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  // Boot MetaMask
  useEffect(()=>{
    const eth=(window as any).ethereum; setHasMM(Boolean(eth)); if(!eth) return;
    (async()=>{
      try{
        const [accs,cid]=await Promise.all([
          eth.request({method:"eth_accounts"}),
          eth.request({method:"eth_chainId"})
        ]);
        setAccount(accs?.[0]); setChainId(cid);
      }catch{}
    })();
    const onA=(a:string[])=>setAccount(a?.[0]); const onC=(c:string)=>setChainId(c);
    eth.on?.("accountsChanged",onA); eth.on?.("chainChanged",onC);
    return()=>{ eth.removeListener?.("accountsChanged",onA); eth.removeListener?.("chainChanged",onC); };
  },[]);

  // Charger portefeuille réel
  useEffect(() => {
    if (!account) return;
    (async () => {
      try {
        const { eth, erc20 } = await getPortfolio(account as `0x${string}`, TOKENS_SEPOLIA);
        setNativeEth(eth);
        setErc20s(erc20);
      } catch (e) {
        console.error("portfolio error:", e);
      }
    })();
  }, [account]);

  // Auto-scroll intent
  useEffect(()=>{
    const el = intent==="pay" ? refUnits.current
            : intent==="deposit" ? refPortfolio.current
            : intent==="withdraw" ? refPortfolio.current
            : intent==="transfer" ? refPortfolio.current
            : null;
    if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
  },[intent]);

  // Actions MM / SIWE
  const ensureChain = async ()=>{
    const eth=(window as any).ethereum; if(!eth) return;
    const cid = await eth.request({method:"eth_chainId"});
    if(cid !== EXPECTED_CHAIN.chainId){
      try{
        await eth.request({method:"wallet_switchEthereumChain", params:[{chainId:EXPECTED_CHAIN.chainId}]});
        setChainId(EXPECTED_CHAIN.chainId);
      }catch(e:any){
        if(e?.code===4902){
          await eth.request({method:"wallet_addEthereumChain", params:[{
            chainId:EXPECTED_CHAIN.chainId, chainName:EXPECTED_CHAIN.name, rpcUrls:EXPECTED_CHAIN.rpc,
            nativeCurrency:EXPECTED_CHAIN.currency, blockExplorerUrls:[EXPECTED_CHAIN.explorer]
          }]});
        }
      }
    }
  };
  const connect = async ()=>{
    const eth=(window as any).ethereum; if(!eth) return window.open("https://metamask.io/download/","_blank");
    await eth.request({method:"wallet_requestPermissions", params:[{eth_accounts:{}}]});
    const accs:string[]=await eth.request({method:"eth_requestAccounts"}); setAccount(accs?.[0]);
    const cid:string=await eth.request({method:"eth_chainId"}); setChainId(cid); ensureChain();
  };
  const signIn = async ()=>{
    const eth=(window as any).ethereum; if(!eth) return;
    const [addr]=await eth.request({method:"eth_requestAccounts"});
    const nonce= await fetch("/auth/nonce",{credentials:"include"}).then(r=>r.json()).catch(()=>({nonce:Math.random().toString(36).slice(2)}));
    const domain=window.location.host;
    const msg=`domain: ${domain}
address: ${addr}
statement: Login
nonce: ${nonce.nonce}
issuedAt: ${new Date().toISOString()}`;
    const signature=await eth.request({method:"personal_sign", params:[msg,addr]});
    const ok= await fetch("/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({address:addr,message:msg,signature})}).then(r=>r.ok);
    if(ok) setIsAuth(true);
  };
  const logout = async()=>{ try{ await fetch("/auth/logout",{method:"POST",credentials:"include"});}catch{} setIsAuth(false); setAccount(undefined); };

  const wrongChain = hasMM && chainId && chainId!==EXPECTED_CHAIN.chainId;

  /* --------------------------------- Rendu --------------------------------- */
  return (
    <>
      <style>{CSS}</style>

      {/* HEADER */}
      <header className="w-head">
        <h1 className="h1">Mon Wallet</h1>
        <div className="pills" style={{ position:"relative", gap:10, display:"flex", alignItems:"center" }}>
          {/* Devise */}
          <button className="pill" onClick={()=>{
            const order: any = { EUR:"USD", USD:"MAD", MAD:"GBP", GBP:"AED", AED:"EUR" };
            setRefCcy(order[refCcy]);
          }}>{refCcy} ▾</button>

          {/* Finaliser (dropdown) */}
          {units.some(u=>u.status==="en_attente") && (
            <div ref={finalizeBtnRef} style={{ position:"relative" }}>
              <button className="btn btnPrimary" onClick={(e)=>{ripple(e); setShowFinalize(v=>!v);}}>Finaliser ▾</button>
              {showFinalize && (
                <div style={{
                  position:"absolute", top:"110%", right:0, border:"1px solid var(--line)", background:"#fff", borderRadius:12,
                  boxShadow:"0 18px 42px rgba(16,24,40,.12)", minWidth:260, padding:8, zIndex:1000
                }}>
                  <div style={{ padding:"6px 10px", fontSize:12, color:"var(--sub)" }}>Sélectionne un investissement à finaliser</div>
                  {units.filter(u=>u.status==="en_attente").map(u=>(
                    <div key={u.propertyId}
                      onClick={()=>{
                        if(!u.investmentId) return alert("ID d’investissement manquant.");
                        nav(`/payment/crypto/${u.investmentId}`); setShowFinalize(false);
                      }}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, cursor:"pointer" }}
                      onMouseDown={(e)=>e.preventDefault()}>
                      <div style={{ width:40, height:28, borderRadius:8, overflow:"hidden", border:"1px solid #eef2f7", background:"#f8fafc", flex:"0 0 auto" }}>
                        <img src={u.thumb || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"} alt="thumb" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      </div>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontWeight:900, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.title}</div>
                        <div className="small">En attente • {u.units} u.</div>
                      </div>
                      <div className="pill" style={{ fontWeight:900 }}>Payer</div>
                    </div>
                  ))}
                  <div style={{ height:6 }} />
                  <button className="btn btnGhost" style={{ width:"100%" }} onClick={(e)=>{ripple(e); setShowFinalize(false);}}>Fermer</button>
                </div>
              )}
            </div>
          )}

          {/* MetaMask */}
          {hasMM ? (
            account ? (
              <>
                <span className="pill">{short(account)} • {chainName(chainId)}</span>
                {!isAuth && <button className="btn btnPrimary" onClick={(e)=>{ripple(e);signIn();}}>Lier (Signer)</button>}
                <button className="btn btnGhost" onClick={(e)=>{ripple(e);logout();}}>Déconnexion</button>
              </>
            ) : (
              <button className="btn btnPrimary" onClick={(e)=>{ripple(e);connect();}}>Connecter MetaMask</button>
            )
          ) : (
            <a className="btn btnPrimary" href="https://metamask.io/download/" target="_blank" rel="noreferrer">Installer MetaMask</a>
          )}
        </div>
      </header>

      {/* HERO / STATS */}
      <div className="hero">
        {wrongChain && (
          <div className="alert">
            <div>Réseau détecté : <b>{chainName(chainId)}</b> — attendu : <b>{EXPECTED_CHAIN.name}</b></div>
            <button className="btn btnGhost" onClick={(e)=>{ripple(e);ensureChain();}}>Basculer vers {EXPECTED_CHAIN.name}</button>
          </div>
        )}
        <div className="heroCard">
          <div className="stats">
            <div className="sCard"><div className="sK">Total crypto</div><div className="sV">{totalCrypto.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div></div>
            <div className="sCard"><div className="sK">Mes unités (total)</div><div className="sV">{totalUnits}</div></div>
            <div className="sCard"><div className="sK">Confirmées</div><div className="sV">{totalUnitsConfirmed}</div></div>
            <div className="sCard"><div className="sK">En attente</div><div className="sV" style={{color:"var(--pri)"}}>{totalUnitsPending}</div></div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <nav className="tabs">
        <div className="tab active">Portfolio</div>
        <div className="tab" onClick={()=>refUnits.current?.scrollIntoView({behavior:"smooth"})}>Unités</div>
        <div className="tab" onClick={()=>refNFTs.current?.scrollIntoView({behavior:"smooth"})}>Titres / NFTs</div>
        <div className="tab" onClick={()=>nav("/activity")}>Activité</div>
        <div className="tab" onClick={()=>nav("/settings")}>Réglages</div>
      </nav>

      <main className="wrap">
        {/* --------------------- PORTFOLIO (ETH + Cash + SOL + ERC-20) --------------------- */}
        <section ref={refPortfolio} className="section">
          <div className="assets">
            {/* ETH */}
            <article className="asset">
              <div className="assetL">
                <div className="logo"><img src={TOKEN_LOGO.ETH} alt="ETH" /></div>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <span className="name">ETH</span><span className="chain">EVM</span>
                  </div>
                  <div className="sub">Ethereum (Sepolia)</div>
                </div>
              </div>
              <Sparkline color="#e11d2e" />
              <div className="assetR">
                <div className="assetAmt">{nativeEth.toFixed(6)}</div>
                <div className="assetFiat">{(nativeEth*(rates.eth||0)).toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div>
                <div className="assetActions">
                  <button className="chipBtn" onClick={()=>nav(`/transfer?asset=ETH`)} disabled={!isAuth}>Transférer</button>
                </div>
              </div>
            </article>

            {/* CASH (off-chain) */}
            <article className="asset">
              <div className="assetL">
                <div className="logo"><img src="https://img.icons8.com/?size=100&id=23209&format=png" alt="Cash" /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="name">CASH</span><span className="chain">OFF-CHAIN</span>
                  </div>
                  <div className="sub">Solde fiat (compte cash)</div>
                </div>
              </div>
              <Sparkline color="#10b981" />
              <div className="assetR">
                <div className="assetAmt">{fiatBalance.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div>
                <div className="assetFiat">Compte libellé en {refCcy}</div>
                <div className="assetActions">
                  <button className="chipBtn" onClick={()=>nav("/deposit-fiat")} disabled={!isAuth}>Déposer</button>
                  <button className="chipBtn" onClick={()=>nav("/withdraw-fiat")} disabled={!isAuth}>Retirer</button>
                </div>
              </div>
            </article>

            {/* SOL */}
            {(solBalance > 0 || true) && (
              <article className="asset">
                <div className="assetL">
                  <div className="logo"><img src={TOKEN_LOGO.SOL} alt="SOL" /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="name">SOL</span><span className="chain">SOLANA</span>
                    </div>
                    <div className="sub">Solana (off-EVM)</div>
                  </div>
                </div>
                <Sparkline color="#10b981" />
                <div className="assetR">
                  <div className="assetAmt">{solBalance.toFixed(6)}</div>
                  {/* si tu as le prix: <div className="assetFiat">{(solBalance*(rates.sol||0)).toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div> */}
                  <div className="assetActions">
                    <button className="chipBtn" onClick={()=>nav("/transfer?asset=SOL")} disabled={!isAuth}>Transférer</button>
                  </div>
                </div>
              </article>
            )}

            {/* ERC-20 dynamiques */}
            {erc20s.map(t=>{
              const key = t.symbol.toLowerCase() as "usdc"|"dai";
              const fiat = t.amount * ((rates as any)[key] || 0);
              const color = t.symbol==="USDC"?"#3b82f6":t.symbol==="DAI"?"#f59e0b":"#e11d2e";
              return (
                <article key={t.address} className="asset">
                  <div className="assetL">
                    <div className="logo">{t.logo ? <img src={t.logo} alt={t.symbol}/> : t.symbol}</div>
                    <div style={{minWidth:0}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span className="name">{t.symbol}</span><span className="chain">EVM</span>
                      </div>
                      <div className="sub">{t.name}</div>
                    </div>
                  </div>
                  <Sparkline color={color} />
                  <div className="assetR">
                    <div className="assetAmt">{t.amount.toFixed(6)}</div>
                    <div className="assetFiat">{fiat.toLocaleString(undefined,{maximumFractionDigits:2})} {refCcy}</div>
                    <div className="assetActions">
                      <button className="chipBtn" onClick={()=>nav(`/transfer?asset=${t.symbol}`)} disabled={!isAuth}>Transférer</button>
                      {t.symbol!=="ETH" && <button className="chipBtn" onClick={()=>nav(`/swap?to=${t.symbol}`)}>Swap</button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ------------------- UNITÉS D’INVESTISSEMENT ------------------- */}
        <section ref={refUnits} className="section">
          <div className="unitsCard">
            <div className="unitsHeader">
              <b>Unités d’investissement (mes positions)</b>
              <span className="uBadge">Vos unités : {totalUnits}</span>
            </div>

            <div className="uFilters">
              {(["all","achat_solo","achat_collectif","location","exploitation","fonds_garanti"] as const).map(k => (
                <button key={k} className={`uFilter ${unitFilter===k?"active":""}`} onClick={()=>setUnitFilter(k)}>
                  {k==="all"?"Tous":k.replace("_"," ")}
                </button>
              ))}
            </div>

            <div className="uMeta">
              <div className="uBox"><div className="uK">Total unités</div><div className="uV">{totalUnits}</div></div>
              <div className="uBox"><div className="uK">Confirmées</div><div className="uV">{totalUnitsConfirmed}</div></div>
              <div className="uBox"><div className="uK">En attente</div><div className="uV" style={{color:"var(--pri)"}}>{totalUnitsPending}</div></div>
              <div className="uBox"><div className="uK">Types détenus</div><div className="uV">{new Set(units.map(u=>u.kind)).size}</div></div>
            </div>

            <div className="uList">
              {visibleUnits.map(u=>(
                <div key={`${u.propertyId}-${u.kind}`} className="uItem">
                  <div className="uThumb"><img src={u.thumb || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"} alt="thumb"/></div>
                  <div style={{minWidth:0}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <div className="uTitle">{u.title}</div>
                      <span className="uPill">{u.kind.replace("_"," ")}</span>
                      <span className="uPill" style={{borderColor:u.status==="en_attente"?"#fecaca":"#e5e7eb", color:u.status==="en_attente"?"#e11d2e":"#475569"}}>
                        {u.status==="livré"?"livré":u.status==="confirmé"?"confirmé":u.status==="annulé"?"annulé":"en attente"}
                      </span>
                      {typeof u.unitPrice==="number" && <span className="uPill">{u.unitPrice.toLocaleString()} {refCcy}/u.</span>}
                    </div>
                    <div className="sub">
                      {u.kind==="location" && "Revenus locatifs mensuels après mise en location"}
                      {u.kind==="exploitation" && "Revenus d’exploitation (hôtel / commerce) au prorata"}
                      {u.kind==="fonds_garanti" && "Revenu garanti après franchise (si applicable)"}
                      {u.kind==="achat_collectif" && "Achat par unités (fixe/variable selon projet)"}
                      {u.kind==="achat_solo" && "Achat global (100% du lot)"}
                    </div>
                  </div>

                  <div className="uUnits">{u.units} u.</div>

                  <div className="uActions">
                    {u.status==="en_attente" && (
                      <>
                        <button className="chipBtn" onClick={()=>nav(`/pay?investmentId=${u.investmentId}`)}>Finaliser</button>
                        {u.kind==="achat_collectif" && (
                          <button className="chipBtn" onClick={()=>nav(`/increase?investmentId=${u.investmentId}`)}>Ajouter des unités</button>
                        )}
                      </>
                    )}
                    {u.status==="confirmé" && (
                      <>
                        <button className="chipBtn" onClick={()=>nav(`/contracts/${u.propertyId}`)}>Contrat</button>
                        {u.kind!=="achat_solo" && <button className="chipBtn" onClick={()=>nav(`/resale?propertyId=${u.propertyId}`)}>Revendre</button>}
                      </>
                    )}
                    {u.status==="livré" && (
                      <>
                        <button className="chipBtn" onClick={()=>nav(`/tokens?propertyId=${u.propertyId}`)}>Voir NFT</button>
                        <button className="chipBtn" onClick={()=>nav(`/attestations/${u.propertyId}`)}>Attestation</button>
                      </>
                    )}
                    {u.status==="annulé" && (
                      <button className="chipBtn" onClick={()=>nav(`/support?ref=${u.propertyId}`)}>Support</button>
                    )}
                  </div>
                </div>
              ))}
              {visibleUnits.length===0 && (
                <div className="uBox" style={{textAlign:"center"}}>Aucune unité pour ce filtre.</div>
              )}
            </div>
          </div>
        </section>

        {/* --------------------------- TITRES & NFTs --------------------------- */}
        <section ref={refNFTs} className="section">
          <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
            <div className="sub">Titres & NFTs</div>
            <button className="btn btnGhost" onClick={()=>nav("/tokens")}>Voir tout</button>
          </div>
          {nfts.length===0 ? (
            <div className="nCard" style={{marginTop:8}}>
              <div className="sub">Aucun titre pour l’instant. Après paiement confirmé et mint, vos NFTs apparaissent ici.</div>
            </div>
          ):(
            <div className="nGrid">
              {nfts.map(n=>(
                <div className="nCard" key={n.tokenId}>
                  <img className="nImg" src={n.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"} alt="nft"/>
                  <div className="nHead">
                    <b style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.title}</b>
                    <span className="badge">{n.category}</span>
                  </div>
                  <div className="sub" style={{marginTop:6}}>Token #{n.tokenId}{typeof n.units==="number" && <> • {n.units} u.</>}</div>
                  <div className="nBtns">
                    <a className="btn btnGhost" href={`${EXPECTED_CHAIN.explorer}/token/${n.contract}`} target="_blank" rel="noreferrer">Explorer</a>
                    <a className="btn btnPrimary" href={`/nft/${n.tokenId}/attestation`} target="_blank" rel="noreferrer">Attestation</a>
                    {n.transferable && <button className="btn btnGhost" onClick={()=>nav(`/transfer?nft=${n.tokenId}`)}>Transférer</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --------------------------- ACTIONS RAPIDES --------------------------- */}
        <section className="section">
          <div className="row" style={{justifyContent:"space-between"}}>
            <div className="sub">Actions</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button className="btn btnPrimary" onClick={()=>nav("/deposit")}  disabled={!account||wrongChain||!isAuth}>Déposer</button>
              <button className="btn btnGhost"   onClick={()=>nav("/withdraw")} disabled={!account||wrongChain||!isAuth}>Retirer</button>
              <button className="btn btnGhost"   onClick={()=>nav("/transfer")} disabled={!account||!isAuth}>Transférer</button>
              <button className="btn btnGhost"   onClick={()=>nav("/offers")}>Offres</button>
            </div>
          </div>
          <div className="sub" style={{marginTop:6}}>
            * Opérations critiques : adresse connectée, bon réseau ({EXPECTED_CHAIN.name}) et <b>signature</b> (liaison SIWE).
          </div>
        </section>
      </main>
    </>
  );
}
