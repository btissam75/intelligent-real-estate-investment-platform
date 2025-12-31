// immo-web/src/lib/eth.ts
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export const publicClientSepolia = createPublicClient({
  chain: sepolia,
  transport: http("https://rpc.ankr.com/eth_sepolia"),
});

// Helper: récupère provider injecté (MetaMask)
export const getEthereum = () => (window as any).ethereum as any | undefined;
// lib/eth.ts (Hardhat)
import { defineChain } from "viem";

export const hardhat = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: { name:"Ether", symbol:"ETH", decimals:18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

export const publicClientHardhat = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
});
