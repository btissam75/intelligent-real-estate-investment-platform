import { useEffect, useState } from "react";

declare global {
  interface Window { ethereum?: any }
}

export function useMetamask() {
  const [hasMM, setHasMM] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [balanceEth, setBalanceEth] = useState<string>("");

  async function connect() {
    if (!window.ethereum) return;
    const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
    const addr = accounts[0] || "";
    setAddress(addr);
    const chain = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(chain);
    await refreshBalance(addr);
  }

  async function refreshBalance(addr = address) {
    if (!window.ethereum || !addr) return;
    const wei = await window.ethereum.request({
      method: "eth_getBalance",
      params: [addr, "latest"],
    });
    const eth = (Number(BigInt(wei)) / 1e18).toFixed(6);
    setBalanceEth(eth);
  }

  // Test ownership (facultatif)
  async function signTest() {
    if (!window.ethereum || !address) return;
    const msg = `Sign to verify ownership:\n${address}\n${new Date().toISOString()}`;
    const from = address;
    const params = [msg, from];
    const sig = await window.ethereum.request({ method: "personal_sign", params });
    return sig;
  }

  useEffect(() => {
    setHasMM(!!window.ethereum);
    if (!window.ethereum) return;

    const onAccounts = (accs: string[]) => {
      setAddress(accs[0] || "");
      if (accs[0]) refreshBalance(accs[0]);
    };
    const onChain = (cid: string) => {
      setChainId(cid);
      if (address) refreshBalance(address);
    };

    window.ethereum.on?.("accountsChanged", onAccounts);
    window.ethereum.on?.("chainChanged", onChain);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", onAccounts);
      window.ethereum?.removeListener?.("chainChanged", onChain);
    };
  }, [address]);

  return { hasMM, address, chainId, balanceEth, connect, refreshBalance, signTest };
}
