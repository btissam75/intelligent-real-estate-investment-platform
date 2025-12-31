// src/services/wallet.ts
import { createPublicClient, http, erc20Abi } from "viem";
import { sepolia } from "viem/chains";
import type { Erc20Token } from "@/config/tokens";

const RPC = "https://rpc.ankr.com/eth_sepolia";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC),
});

async function getNativeBalance(address: `0x${string}`) {
  const wei = await publicClient.getBalance({ address });
  return Number(wei) / 1e18;
}

async function getErc20Balance(token: Erc20Token, address: `0x${string}`) {
  if (
    !token.address ||
    token.address.toLowerCase() === "0x0000000000000000000000000000000000000000"
  ) {
    return 0; // placeholder non valide → 0
  }
  const raw = await publicClient.readContract({
    address: token.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });
  return Number(raw) / 10 ** token.decimals;
}

/** Renvoie le portefeuille natif + ERC20 pour une adresse donnée. */
export async function getPortfolio(
  address: `0x${string}`,
  tokens: Erc20Token[]
): Promise<{
  eth: number;
  erc20: Array<Erc20Token & { amount: number }>;
}> {
  const [eth, ...rest] = await Promise.all([
    getNativeBalance(address),
    ...tokens.map((t) => getErc20Balance(t, address)),
  ]);
  return {
    eth,
    erc20: tokens.map((t, i) => ({ ...t, amount: rest[i] || 0 })),
  };
}
