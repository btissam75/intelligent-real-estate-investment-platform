// // scripts/deploy.ts
// import pkg from "hardhat";
// const { ethers } = pkg;

// async function main() {
//   const [deployer] = await ethers.getSigners();
//   console.log("Deployer:", await deployer.getAddress());
//   console.log("Balance:", (await deployer.provider!.getBalance(await deployer.getAddress())).toString());

//   const ImmoTitle = await ethers.getContractFactory("ImmoTitle");

//   // Optionnel : récupérer les fees (EIP-1559) et fixer un gasLimit confortable
//   const fee = await ethers.provider.getFeeData();
//   const contract = await ImmoTitle.deploy({
//     maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? undefined,
//     maxFeePerGas:        fee.maxFeePerGas ?? undefined,
//     gasLimit:            2_000_000, // aide parfois quand estimateGas échoue
//   });

//   await contract.waitForDeployment();
//   console.log("✅ ImmoTitle deployed at:", await contract.getAddress());
// }

// main().catch((e) => { console.error(e); process.exit(1); });
// scripts/deploy.ts
import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", await deployer.getAddress());
  console.log("Balance:", (await ethers.provider.getBalance(await deployer.getAddress())).toString());

  const ImmoTitle = await ethers.getContractFactory("ImmoTitle");
  const fee = await ethers.provider.getFeeData();

  // Petits garde-fous si le RPC renvoie null
  const maxFeePerGas = fee.maxFeePerGas ?? ethers.parseUnits("2", "gwei");
  const maxPriorityFeePerGas = fee.maxPriorityFeePerGas ?? ethers.parseUnits("1", "gwei");

  const c = await ImmoTitle.deploy({
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit: 2_000_000n,
  });

  await c.waitForDeployment();
  console.log("NFT_CONTRACT_ADDRESS:", await c.getAddress());
}
main().catch((e)=>{ console.error(e); process.exit(1); });
