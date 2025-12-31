const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Compte #0:", signer.address);
  const bal = await signer.provider.getBalance(signer.address);
  console.log("Balance:", ethers.formatEther(bal), "ETH");
}

main().catch((e) => { console.error(e); process.exit(1); });
