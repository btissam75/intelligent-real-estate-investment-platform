import React, { useEffect, useState } from "react";

// declare global {
//   interface Window {
//     ethereum?: {
//       isMetaMask?: boolean;
//       request: (args: { method: string; params?: unknown[] }) => Promise<any>;
//       on?: (event: string, handler: (...args: any[]) => void) => void;
//       removeListener?: (event: string, handler: (...args: any[]) => void) => void;
//     };
//   }
// }

// export default function TestMetaMask() {
//   const [hasMM, setHasMM] = useState(false);
//   const [account, setAccount] = useState<string | null>(null);
//   const [chainId, setChainId] = useState<string | null>(null);
//   const [log, setLog] = useState<string>("");

//   const logit = (m: string) => {
//     console.log(m);
//     setLog(prev => `${prev}\n${m}`);
//   };

//   useEffect(() => {
//     const eth = window.ethereum;
//     setHasMM(!!eth?.isMetaMask || !!eth);
//     if (!eth) {
//       logit("ethereum introuvable. Installe/active MetaMask.");
//       return;
//     }
//     // Pré-remplissage si déjà autorisé
//     Promise.all([
//       eth.request({ method: "eth_accounts" }),
//       eth.request({ method: "eth_chainId" }),
//     ])
//       .then(([accs, cid]) => {
//         setAccount(accs?.[0] ?? null);
//         setChainId(cid ?? null);
//         logit(`Init → account=${accs?.[0] ?? "—"} chainId=${cid ?? "—"}`);
//       })
//       .catch(e => logit("Init error: " + (e?.message ?? e)));

//     const onAcc = (accs: string[]) => {
//       setAccount(accs?.[0] ?? null);
//       logit("accountsChanged → " + (accs?.[0] ?? "—"));
//     };
//     const onChain = (cid: string) => {
//       setChainId(cid);
//       logit("chainChanged → " + cid);
//     };
//     eth.on?.("accountsChanged", onAcc);
//     eth.on?.("chainChanged", onChain);
//     return () => {
//       eth.removeListener?.("accountsChanged", onAcc);
//       eth.removeListener?.("chainChanged", onChain);
//     };
//   }, []);

//   const onConnect = async () => {
//     const eth = window.ethereum;
//     if (!eth) return alert("MetaMask non détecté.");
//     try {
//       const accs: string[] = await eth.request({ method: "eth_requestAccounts", params: [] });
//       const cid: string = await eth.request({ method: "eth_chainId" });
//       setAccount(accs?.[0] ?? null);
//       setChainId(cid ?? null);
//       logit(`Connect OK → ${accs?.[0]} @ ${cid}`);
//     } catch (e: any) {
//       // 4001 = user rejected
//       logit("Connect error: " + (e?.message ?? e));
//       alert(e?.message ?? "Connexion refusée");
//     }
//   };

//   return (
//     <div style={{ fontFamily: "sans-serif", padding: 16 }}>
//       <h2>Test MetaMask</h2>
//       <div>MetaMask détecté : <b>{hasMM ? "oui" : "non"}</b></div>
//       <div>Compte : <code>{account ?? "—"}</code></div>
//       <div>ChainId : <code>{chainId ?? "—"}</code></div>
//       <button onClick={onConnect} style={{ marginTop: 8, padding: "8px 12px" }}>
//         Connect MetaMask
//       </button>
//       <pre style={{ background: "#f5f5f5", padding: 8, marginTop: 12, whiteSpace: "pre-wrap" }}>{log}</pre>
//     </div>
//   );
// }
// import React, { useEffect, useState } from "react";

// declare global {
//   interface Window {
//     ethereum?: {
//       isMetaMask?: boolean;
//       providers?: any[];
//       request: (args: { method: string; params?: unknown[] }) => Promise<any>;
//       on?: (e: string, cb: (...a:any[])=>void) => void;
//       removeListener?: (e: string, cb: (...a:any[])=>void) => void;
//     };
//   }
// }

// export default function TestMetaMask() {
//   const [hasMM, setHasMM] = useState(false);
//   const [account, setAccount] = useState<string | null>(null);
//   const [chainId, setChainId] = useState<string | null>(null);

//   useEffect(() => {
//     // EIP-6963: plusieurs providers possibles
//     const getProvider = () => {
//       const eth = window.ethereum as any;
//       if (!eth) return undefined;
//       if (eth.providers && Array.isArray(eth.providers)) {
//         // on choisit MetaMask si présent
//         const mm = eth.providers.find((p: any) => p.isMetaMask);
//         return mm ?? eth.providers[0];
//       }
//       return eth;
//     };

//     const eth = getProvider();
//     console.log("ethereum =", eth);
//     setHasMM(!!eth);

//     if (!eth) return;

//     Promise.all([
//       eth.request({ method: "eth_accounts" }),
//       eth.request({ method: "eth_chainId" }),
//     ])
//       .then(([accs, cid]: [string[], string]) => {
//         console.log("init accounts=", accs, "chainId=", cid);
//         setAccount(accs?.[0] ?? null);
//         setChainId(cid ?? null);
//       })
//       .catch((e: any) => console.warn("init error:", e));

//     const onAcc = (accs: string[]) => setAccount(accs?.[0] ?? null);
//     const onChain = (cid: string) => setChainId(cid);

//     eth.on?.("accountsChanged", onAcc);
//     eth.on?.("chainChanged", onChain);
//     return () => {
//       eth.removeListener?.("accountsChanged", onAcc);
//       eth.removeListener?.("chainChanged", onChain);
//     };
//   }, []);

//   const onConnect = async () => {
//     console.log("➡️ clic bouton Connect");
//     const pick = () => {
//       const eth = window.ethereum as any;
//       if (!eth) return undefined;
//       if (eth.providers?.length) {
//         const mm = eth.providers.find((p: any) => p.isMetaMask);
//         return mm ?? eth.providers[0];
//       }
//       return eth;
//     };
//     const eth = pick();
//     if (!eth) return alert("MetaMask non détecté (extension installée et activée ?)");

//     try {
//       const accs: string[] = await eth.request({ method: "eth_requestAccounts", params: [] });
//       const cid: string = await eth.request({ method: "eth_chainId" });
//       console.log("✅ connect OK:", accs[0], "@", cid);
//       setAccount(accs?.[0] ?? null);
//       setChainId(cid ?? null);
//     } catch (e: any) {
//       console.error("❌ connect error:", e);
//       alert(e?.message ?? "Connexion refusée");
//     }
//   };

//   return (
//     <div style={{ padding: 16, fontFamily: "sans-serif" }}>
//       <h2>Test MetaMask</h2>
//       <div>Provider présent : <b>{hasMM ? "oui" : "non"}</b></div>
//       <div>Compte : <code>{account ?? "—"}</code></div>
//       <div>ChainId : <code>{chainId ?? "—"}</code></div>
//       <button onClick={onConnect} style={{ marginTop: 10, padding: "8px 12px" }}>
//         Connect MetaMask
//       </button>
//     </div>
//   );
// }import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      providers?: any[];
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (e: string, cb: (...a:any[])=>void) => void;
      removeListener?: (e: string, cb: (...a:any[])=>void) => void;
    };
  }
}

export default function TestMetaMask() {
  const [hasMM, setHasMM] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  useEffect(() => {
    // EIP-6963: plusieurs providers possibles
    const getProvider = () => {
      const eth = window.ethereum as any;
      if (!eth) return undefined;
      if (eth.providers && Array.isArray(eth.providers)) {
        // on choisit MetaMask si présent
        const mm = eth.providers.find((p: any) => p.isMetaMask);
        return mm ?? eth.providers[0];
      }
      return eth;
    };

    const eth = getProvider();
    console.log("ethereum =", eth);
    setHasMM(!!eth);

    if (!eth) return;

    Promise.all([
      eth.request({ method: "eth_accounts" }),
      eth.request({ method: "eth_chainId" }),
    ])
      .then(([accs, cid]: [string[], string]) => {
        console.log("init accounts=", accs, "chainId=", cid);
        setAccount(accs?.[0] ?? null);
        setChainId(cid ?? null);
      })
      .catch((e: any) => console.warn("init error:", e));

    const onAcc = (accs: string[]) => setAccount(accs?.[0] ?? null);
    const onChain = (cid: string) => setChainId(cid);

    eth.on?.("accountsChanged", onAcc);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAcc);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const onConnect = async () => {
    console.log("➡️ clic bouton Connect");
    const pick = () => {
      const eth = window.ethereum as any;
      if (!eth) return undefined;
      if (eth.providers?.length) {
        const mm = eth.providers.find((p: any) => p.isMetaMask);
        return mm ?? eth.providers[0];
      }
      return eth;
    };
    const eth = pick();
    if (!eth) return alert("MetaMask non détecté (extension installée et activée ?)");

    try {
      const accs: string[] = await eth.request({ method: "eth_requestAccounts", params: [] });
      const cid: string = await eth.request({ method: "eth_chainId" });
      console.log("✅ connect OK:", accs[0], "@", cid);
      setAccount(accs?.[0] ?? null);
      setChainId(cid ?? null);
    } catch (e: any) {
      console.error("❌ connect error:", e);
      alert(e?.message ?? "Connexion refusée");
    }
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>Test MetaMask</h2>
      <div>Provider présent : <b>{hasMM ? "oui" : "non"}</b></div>
      <div>Compte : <code>{account ?? "—"}</code></div>
      <div>ChainId : <code>{chainId ?? "—"}</code></div>
      <button onClick={onConnect} style={{ marginTop: 10, padding: "8px 12px" }}>
        Connect MetaMask
      </button>
    </div>
  );
}

