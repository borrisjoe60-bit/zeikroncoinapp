import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("ZiekronToken");
  const token = await Token.deploy(1000000000);

  await token.waitForDeployment();

  console.log("ZeikronToken deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});