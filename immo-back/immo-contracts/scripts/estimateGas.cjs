const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Déployeur:", deployer.address);

  const ImmoTitle = await ethers.getContractFactory("ImmoTitle", deployer);

  // Crée la transaction de déploiement
  const deployTx = ImmoTitle.getDeployTransaction();

  // Estime le gas pour cette transaction
  const estimatedGas = await deployer.estimateGas(deployTx);

  // Récupère les infos de frais
  const feeData = await ethers.provider.getFeeData();

  console.log("Gas estimé:", estimatedGas.toString());
  console.log(
    "Prix max gas:",
    ethers.formatUnits(feeData.maxFeePerGas || 0, "gwei"),
    "gwei"
  );

  const costEth = estimatedGas * (feeData.maxFeePerGas || 0n);
  console.log("Coût approx:", ethers.formatEther(costEth), "ETH");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
