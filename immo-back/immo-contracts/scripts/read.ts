// scripts/read.ts
import pkg from "hardhat";
const { ethers, artifacts, network } = pkg;

async function main() {
  // 1) récupère l’adresse du contrat via argv ou env
  const addr = process.argv[2] || process.env.NFT_CONTRACT_ADDRESS;
  if (!addr) throw new Error("Passer l'adresse du contrat: `npx hardhat run scripts/read.ts --network localhost 0x...`");

  const [signer] = await ethers.getSigners();
  const abi = (await artifacts.readArtifact("ImmoTitle")).abi;
  const c = new ethers.Contract(addr, abi, signer);

  // 2) safety: vérifie que c’est bien un ERC721 (balanceOf ne revert pas)
  const ts = await c.totalSupply().catch(() => null);
  if (ts === null) throw new Error(`Pas d'ERC721 à ${addr} sur ${network.name}`);

  console.log("totalSupply =", ts.toString());
  if (ts > 0n) {
    console.log("ownerOf(1)  =", await c.ownerOf(1));
    console.log("tokenURI(1) =", await c.tokenURI(1));
  } else {
    console.log("Aucun token encore minté.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
