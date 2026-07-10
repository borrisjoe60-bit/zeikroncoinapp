import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with:", deployer.address);

  const Token = await ethers.getContractFactory("ZiekronToken");

  const token = await Token.deploy(deployer.address);

  await token.waitForDeployment();

  console.log("Zeikroncoin deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});