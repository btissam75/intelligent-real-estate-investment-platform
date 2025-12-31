// immo-web/src/config/tokens.ts


// ⚠️ Mets ici les adresses OFFICIELLES du réseau choisi (Sepolia).
// Remplace <ADDRESS> par la vraie adresse (docs officielles ou Etherscan Verified).
// src/config/tokens.ts
export type Erc20Token = {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  logo?: string;
};

export const TOKENS_SEPOLIA: Erc20Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x0000000000000000000000000000000000000000", // ⚠️ remplace
    decimals: 6,
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
  {
    symbol: "DAI",
    name: "Dai",
    address: "0x0000000000000000000000000000000000000000", // ⚠️ remplace
    decimals: 18,
    logo: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
  },
];
