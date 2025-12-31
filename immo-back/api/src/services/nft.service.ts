// // src/services/nft.service.ts
// import { ethers } from "ethers";
// import { Web3Storage, File } from "web3.storage";

// /* ───────────────────────────────
//    ENV & assertions démarrage
// ─────────────────────────────── */
// const {
//   RPC_URL,
//   MINTER_PK,
//   NFT_CONTRACT_ADDRESS,
//   W3S_TOKEN,
//   USE_DATA_URI_ON_FAIL, // "1" pour activer le fallback data: si Web3.Storage down
// } = process.env;

// if (!RPC_URL) throw new Error("RPC_URL missing");
// if (!MINTER_PK) throw new Error("MINTER_PK missing");
// if (!NFT_CONTRACT_ADDRESS) throw new Error("NFT_CONTRACT_ADDRESS missing");

// /* ───────────────────────────────
//    Provider / Signer / Contract
// ─────────────────────────────── */
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const signer = new ethers.Wallet(MINTER_PK, provider);

// // ABI minimal du contrat ImmoTitle
// const ABI = [
//   "function mintTo(address to, uint256 tokenId, string tokenUri) external",
//   "function tokenURI(uint256 tokenId) view returns (string)",
// ];

// // Typage fort du contrat pour éviter les "possibly undefined"
// type ImmoTitleContract = ethers.Contract & {
//   mintTo(
//     to: string,
//     tokenId: bigint,
//     tokenUri: string
//   ): Promise<ethers.TransactionResponse>;
//   tokenURI(tokenId: bigint): Promise<string>;
// };

// const contract = new ethers.Contract(
//   NFT_CONTRACT_ADDRESS,
//   ABI,
//   signer
// ) as ImmoTitleContract;

// /* ───────────────────────────────
//    Upload IPFS (Web3.Storage) + fallback
// ─────────────────────────────── */
// const w3 = W3S_TOKEN ? new Web3Storage({ token: W3S_TOKEN }) : undefined;

// function toDataURIJson(obj: unknown): string {
//   const b64 = Buffer.from(JSON.stringify(obj)).toString("base64");
//   return `data:application/json;base64,${b64}`;
// }

// async function uploadJSONToIPFS(name: string, obj: any): Promise<string> {
//   // Si pas de token, soit on fallback (si autorisé), soit on bloque
//   if (!w3) {
//     if (USE_DATA_URI_ON_FAIL === "1") return toDataURIJson(obj);
//     throw new Error("W3S_TOKEN missing");
//   }

//   try {
//     const blob = new Blob([JSON.stringify(obj)], {
//       type: "application/json",
//     });
//     const file = new File([blob], name);
//     const cid = await w3.put([file], { wrapWithDirectory: false });
//     return `ipfs://${cid}`;
//   } catch (err: any) {
//     // Fallback data: si explicitement demandé
//     if (USE_DATA_URI_ON_FAIL === "1") return toDataURIJson(obj);
//     throw err;
//   }
// }

// /* ───────────────────────────────
//    Types & helpers
// ─────────────────────────────── */
// export type MintInput = {
//   to: string;
//   tokenId: string | number; // conseillé: un ID unique par investissement
//   title: string;            // ex: "F3 — Casablanca Centre"
//   imageIpfs?: string;       // visuel du bien (ipfs://...)
//   amount: number;           // ex: 250
//   currency: string;         // EUR / MAD / USD ...
//   units?: number;           // nombre d’unités acquises (si achat collectif)
//   category: "Achat solo" | "Location" | "Exploitation" | "Résidence" | "Fonds";
//   pdfIpfs?: string;         // contrat PDF ipfs://...
//   pdfSha256?: string;       // hash du PDF si fourni
//   positionUrl?: string;     // lien vers tableau de bord / position
// };

// function nowIsoDate(): string {
//   return new Date().toISOString().slice(0, 10);
// }

// /* ───────────────────────────────
//    API principale
// ─────────────────────────────── */
// export async function mintTitleNFT(input: MintInput) {
//   const tokenId = BigInt(input.tokenId);

//   // Métadonnées compatibles ERC721 (OpenSea, etc.)
//   const metadata = {
//     name: `Titre — ${input.title}`,
//     description:
//       "Attestation d'investissement — droits et obligations conformément au contrat associé.",
//     image: input.imageIpfs || undefined,
//     external_url: input.positionUrl || undefined,
//     attributes: [
//       { trait_type: "Catégorie", value: input.category },
//       { trait_type: "Montant", value: `${input.amount} ${input.currency}` },
//       ...(typeof input.units === "number"
//         ? [{ trait_type: "Unités", value: input.units }]
//         : []),
//       ...(input.pdfSha256
//         ? [{ trait_type: "PDF_SHA256", value: input.pdfSha256 }]
//         : []),
//       { trait_type: "Date", value: nowIsoDate() },
//     ],
//     ...(input.pdfIpfs ? { document: input.pdfIpfs } : {}),
//   };

//   // 1) Upload des métadonnées
//   const tokenUri = await uploadJSONToIPFS(`meta-${tokenId}.json`, metadata);

//   // 2) Mint on-chain
//   const to = ethers.getAddress(input.to);
//   const tx = await contract.mintTo(to, tokenId, tokenUri);
//   const receipt = await tx.wait();

//   return {
//     ok: true as const,
//     tokenId: tokenId.toString(),
//     tokenUri,
//     txHash: tx.hash,
//     blockNumber: receipt?.blockNumber,
//   };
// }

// export async function getTokenURI(tokenId: string | number) {
//   const uri = await contract.tokenURI(BigInt(tokenId));
//   return { tokenId: String(tokenId), tokenUri: String(uri) };
// }

// /* ───────────────────────────────
//    Sanity check (optionnel)
// ─────────────────────────────── */
// // Tu peux exposer une petite fonction de health pour vérifier le réseau
// export async function nftServiceHealth() {
//   const [net, addr] = await Promise.all([
//     provider.getNetwork(),
//     signer.getAddress(),
//   ]);
//   return {
//     network: `${net.name} (${net.chainId})`,
//     minter: addr,
//     contract: NFT_CONTRACT_ADDRESS,
//     ipfs: Boolean(W3S_TOKEN),
//     dataUriFallback: USE_DATA_URI_ON_FAIL === "1",
//   };
// }
// src/routes/nft.route.ts
// api/src/services/nft.service.ts
// api/src/services/nft.service.ts
import { ethers } from "ethers";
import { Web3Storage, File } from "web3.storage";

// ── Env ─────────────────────────────────────────────────────────────
const {
  RPC_URL,
  MINTER_PK,
  NFT_CONTRACT_ADDRESS,
  W3S_TOKEN,
  USE_DATA_URI_ON_FAIL,
} = process.env;

if (!RPC_URL) throw new Error("RPC_URL missing");
if (!MINTER_PK) throw new Error("MINTER_PK missing");
if (!NFT_CONTRACT_ADDRESS) throw new Error("NFT_CONTRACT_ADDRESS missing");

// ── Ethers ─────────────────────────────────────────────────────────
export const provider = new ethers.JsonRpcProvider(RPC_URL);
export const signer = new ethers.Wallet(MINTER_PK, provider);

const ABI = [
  "function mintTo(address to, uint256 tokenId, string tokenUri) external",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

type ImmoTitleContract = ethers.Contract & {
  mintTo(to: string, tokenId: bigint, tokenUri: string): Promise<ethers.TransactionResponse>;
  tokenURI(tokenId: bigint): Promise<string>;
};

const contract = new ethers.Contract(
  NFT_CONTRACT_ADDRESS,
  ABI,
  signer
) as ImmoTitleContract;

// ── IPFS (Web3.Storage) ────────────────────────────────────────────
const w3 = W3S_TOKEN ? new Web3Storage({ token: W3S_TOKEN }) : undefined;

function toDataURIJson(obj: unknown): string {
  const b64 = Buffer.from(JSON.stringify(obj)).toString("base64");
  return `data:application/json;base64,${b64}`;
}

async function uploadJSONToIPFS(name: string, obj: any): Promise<string> {
  if (!w3) {
    if (USE_DATA_URI_ON_FAIL === "1") return toDataURIJson(obj);
    throw new Error("W3S_TOKEN missing");
  }
  try {
    const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
    const file = new File([blob], name);
    const cid = await w3.put([file], { wrapWithDirectory: false });
    return `ipfs://${cid}`;
  } catch (err) {
    if (USE_DATA_URI_ON_FAIL === "1") return toDataURIJson(obj);
    throw err;
  }
}

// ── Types publics ──────────────────────────────────────────────────
export type MintInput = {
  to: string;
  tokenId: string | number;
  title: string;
  imageIpfs?: string;
  amount: number;
  currency: string;
  units?: number;
  category: "Achat solo" | "Location" | "Exploitation" | "Résidence" | "Fonds";
  pdfIpfs?: string;
  pdfSha256?: string;
  positionUrl?: string;
};

export type MintResult = {
  ok: true;
  tokenId: string;
  tokenUri: string;
  txHash: string;
  blockNumber?: number | undefined; // optionnel
};

// ── Helpers ────────────────────────────────────────────────────────
function nowIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── API du service ─────────────────────────────────────────────────
export async function mintTitleNFT(input: MintInput): Promise<MintResult> {
  const tokenId = BigInt(input.tokenId);

  const metadata = {
    name: `Titre — ${input.title}`,
    description: "Attestation d'investissement — droits et obligations conformément au contrat associé.",
    image: input.imageIpfs || undefined,
    external_url: input.positionUrl || undefined,
    attributes: [
      { trait_type: "Catégorie", value: input.category },
      { trait_type: "Montant", value: `${input.amount} ${input.currency}` },
      ...(typeof input.units === "number" ? [{ trait_type: "Unités", value: input.units }] : []),
      ...(input.pdfSha256 ? [{ trait_type: "PDF_SHA256", value: input.pdfSha256 }] : []),
      { trait_type: "Date", value: nowIsoDate() },
    ],
    ...(input.pdfIpfs ? { document: input.pdfIpfs } : {}),
  };

  const tokenUri = await uploadJSONToIPFS(`meta-${tokenId}.json`, metadata);
  const to = ethers.getAddress(input.to);

  const tx = await contract.mintTo(to, tokenId, tokenUri);
  const receipt = await tx.wait();

  return {
    ok: true,
    tokenId: tokenId.toString(),
    tokenUri,
    txHash: tx.hash,
    blockNumber: receipt?.blockNumber,
  };
}

export async function getTokenURI(tokenId: string | number) {
  const uri = await contract.tokenURI(BigInt(tokenId));
  return { tokenId: String(tokenId), tokenUri: String(uri) };
}

export async function nftServiceHealth() {
  const [net, addr] = await Promise.all([provider.getNetwork(), signer.getAddress()]);
  return {
    network: `${net.name} (${net.chainId})`,
    minter: addr,
    contract: NFT_CONTRACT_ADDRESS,
    ipfs: Boolean(W3S_TOKEN),
    dataUriFallback: USE_DATA_URI_ON_FAIL === "1",
  };
}

