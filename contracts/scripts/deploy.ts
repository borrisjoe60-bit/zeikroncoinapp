import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = process.env.TOKEN_OWNER || deployer.address;

  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Token owner:", owner);

  const Token = await ethers.getContractFactory("ZicronToken");
  const token = await Token.deploy(owner);
  await token.waitForDeployment();

  console.log("Zicron (ZCR) deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
