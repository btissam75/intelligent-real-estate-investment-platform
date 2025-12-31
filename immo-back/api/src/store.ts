// // api/src/store.ts

// // --------------------------------------------------------------------
// // Investissements
// // --------------------------------------------------------------------
// export type Investment = {
//   id: string;
//   userAddress: string; // adresse EVM de l’investisseur
//   propertyId: string;
//   mode: "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";
//   amountMAD?: number | undefined;
//   units?: number | undefined;
//   status: "pending_funds" | "funds_received" | "confirmed" | "failed";
//   createdAt: string;     // ISO string
//   orderMessage: string;  // message "order" signé
//   signature: string;     // signature de l’ordre
// };

// export const Nonces = new Set<string>();
// export const Investments = new Map<string, Investment>();

// // --------------------------------------------------------------------
// // NFTs possédés (cache éventuel pour l’onglet “Possédés”)
// // --------------------------------------------------------------------
// export type UserNftOwned = {
//   tokenId: string;
//   contract: string;
//   title: string;
//   category: string;
//   imageUrl?: string;
//   units?: number;
//   transferable: boolean;
// };

// // Clé = owner (adresse en lowercase)
// export const UserNFTs = new Map<string, UserNftOwned[]>();

// // --------------------------------------------------------------------
// // NFTs “créés / pending / mintés” pour l’onglet « Créations en cours »
// // --------------------------------------------------------------------
// // api/src/store.ts  (ensure this is exactly what you have)

// export type CreatedNftItem = {
//   investmentId: string;
//   owner: string;
//   status: "created" | "funds_received" | "minted";
//   tokenId?: string;
//   meta?: {
//     propertyId?: string;
//     mode?: "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";
//     units?: number;       // <- optional
//     amountMAD?: number;   // <- optional
//     title?: string;
//     imageUrl?: string;
//   };
//   createdAt: number;
// };

// // owner (lowercase) -> liste des créations
// export const CreatedByOwner = new Map<string, CreatedNftItem[]>();

// // ----------------------- Helpers CRUD -------------------------------

// /** Ajoute une entrée "created" à partir d’un investissement */
// export function created_addFromInvestment(
//   inv: Investment,
//   meta?: CreatedNftItem["meta"],
// ): CreatedNftItem {
//   const owner = String(inv.userAddress || "").toLowerCase();
//   const list = CreatedByOwner.get(owner) ?? [];

//   const row: CreatedNftItem = {
//     investmentId: inv.id,
//     owner,
//     status: "created",
//     tokenId: undefined,
//     meta: meta ?? {
//       propertyId: inv.propertyId,
//       mode: inv.mode,
//       units: inv.units,
//       amountMAD: inv.amountMAD,
//     },
//     createdAt: Date.now(),
//   };

//   list.push(row);
//   CreatedByOwner.set(owner, list);
//   return row;
// }

// /** Marque une création comme "funds_received" (après confirmation paiement) */
// export function created_markFundsReceived(investmentId: string): CreatedNftItem | undefined {
//   const row = created_findByInvestmentId(investmentId);
//   if (row) row.status = "funds_received";
//   return row;
// }

// /** Marque une création comme "minted" et assigne le tokenId */
// export function created_markMinted(investmentId: string, tokenId: string): CreatedNftItem | undefined {
//   const row = created_findByInvestmentId(investmentId);
//   if (row) {
//     row.status = "minted";
//     row.tokenId = tokenId;
//   }
//   return row;
// }

// /** Liste des créations pour un owner (tri décroissant, sans valeurs undefined inutiles) */
// export function created_listForOwner(owner: string): Array<{
//   investmentId: string;
//   status: CreatedNftItem["status"];
//   tokenId?: string;
//   meta?: CreatedNftItem["meta"];
// }> {
//   const key = String(owner || "").toLowerCase();
//   const arr = CreatedByOwner.get(key) ?? [];

//   return [...arr]
//     .sort((a, b) => b.createdAt - a.createdAt)
//     .map(({ investmentId, status, tokenId, meta }) => {
//       const out: {
//         investmentId: string;
//         status: CreatedNftItem["status"];
//         tokenId?: string;
//         meta?: CreatedNftItem["meta"];
//       } = { investmentId, status };
//       if (tokenId !== undefined) out.tokenId = tokenId;
//       if (meta !== undefined) out.meta = meta;
//       return out;
//     });
// }

// /** (optionnel) utilitaire pour nettoyer un owner */
// export function created_clearOwner(owner: string): void {
//   CreatedByOwner.delete(String(owner || "").toLowerCase());
// }

// // ----------------------- Interne ------------------------------------
// function created_findByInvestmentId(investmentId: string): CreatedNftItem | undefined {
//   for (const [, list] of CreatedByOwner) {
//     const found = list.find((x) => x.investmentId === investmentId);
//     if (found) return found;
//   }
//   return undefined;
// }
// api/src/store.ts

// --------------------------------------------------------------------
// Investissements
// --------------------------------------------------------------------
export type Investment = {
  id: string;
  userAddress: string; // adresse EVM de l’investisseur
  propertyId: string;
  mode: "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";
  amountMAD?: number | undefined;
  units?: number | undefined;
  status: "pending_funds" | "funds_received" | "confirmed" | "failed";
  createdAt: string;     // ISO string
  orderMessage: string;  // message d’ordre signé
  signature: string;     // signature de l’ordre
};

export const Nonces = new Set<string>();
export const Investments = new Map<string, Investment>();

// --------------------------------------------------------------------
// NFTs possédés (cache éventuel)
// --------------------------------------------------------------------
export type UserNftOwned = {
  tokenId: string;
  contract: string;
  title: string;
  category: string;
  imageUrl?: string;
  units?: number;
  transferable: boolean;
};

// Clé = owner (adresse en lowercase)
export const UserNFTs = new Map<string, Array<UserNftOwned>>();

// --------------------------------------------------------------------
// NFTs “créés/pending/mintés” (pour l’onglet Mes NFTs → Créés)
// --------------------------------------------------------------------
export type CreatedNftItem = {
  investmentId: string;
  owner: string; // adresse EVM en lowercase
  status: "created" | "funds_received" | "minted";
  tokenId?: string | undefined; // connu après mint
  meta?: {
    propertyId?: string;
    mode?: "SOLO" | "COLLECTIVE_FIXED" | "COLLECTIVE_VAR";
    units?: number;
    amountMAD?: number;
    title?: string;
    imageUrl?: string;
  } | undefined;
  createdAt: number; // epoch ms (tri)
};

// owner (lowercase) -> liste des créations
export const CreatedByOwner = new Map<string, CreatedNftItem[]>();

// ----------------------- Helpers CRUD -------------------------------

// Ajoute une entrée "created" à partir d’un investissement
export function created_addFromInvestment(
  inv: Investment,
  meta?: CreatedNftItem["meta"]
): CreatedNftItem {
  const owner = String(inv.userAddress || "").toLowerCase();
  const list = CreatedByOwner.get(owner) ?? [];

  const row: CreatedNftItem = {
    investmentId: inv.id,
    owner,
    status: "created",
    meta:
      meta ??
      ({
        propertyId: inv.propertyId,
        mode: inv.mode,
        ...(inv.units !== undefined ? { units: inv.units } : {}),
        ...(inv.amountMAD !== undefined ? { amountMAD: inv.amountMAD } : {}),
      } as CreatedNftItem["meta"]),
    createdAt: Date.now(),
  };

  list.push(row);
  CreatedByOwner.set(owner, list);
  return row;
}

// Marque "funds_received"
export function created_markFundsReceived(
  investmentId: string
): CreatedNftItem | undefined {
  const row = created_findByInvestmentId(investmentId);
  if (row) row.status = "funds_received";
  return row;
}

// Marque "minted" + tokenId
export function created_markMinted(
  investmentId: string,
  tokenId: string
): CreatedNftItem | undefined {
  const row = created_findByInvestmentId(investmentId);
  if (row) {
    row.status = "minted";
    row.tokenId = tokenId;
  }
  return row;
}

// Liste des créations pour un owner (tri décroissant)
export function created_listForOwner(owner: string): Array<{
  investmentId: string;
  status: CreatedNftItem["status"];
  tokenId?: string;
  meta?: CreatedNftItem["meta"];
}> {
  const key = String(owner || "").toLowerCase();
  const arr = CreatedByOwner.get(key) ?? [];

  return [...arr]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(({ investmentId, status, tokenId, meta }) => ({
      investmentId,
      status,
      ...(tokenId !== undefined ? { tokenId } : {}),
      ...(meta !== undefined ? { meta } : {}),
    }));
}

// (optionnel) reset d’un owner
export function created_clearOwner(owner: string): void {
  CreatedByOwner.delete(String(owner || "").toLowerCase());
}

// ----------------------- Interne ------------------------------------
function created_findByInvestmentId(
  investmentId: string
): CreatedNftItem | undefined {
  for (const [, list] of CreatedByOwner) {
    const found = list.find((x) => x.investmentId === investmentId);
    if (found) return found;
  }
  return undefined;
}
