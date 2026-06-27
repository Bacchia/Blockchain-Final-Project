import { ethers } from "hardhat";

async function main() {
  const tokenAddr =
    process.env.BALLOT_TOKEN_ADDRESS ?? "0x39298b3D75bdA16F1D4549A4eccce7d10C4f1829";

  const voters = (process.env.NEW_VOTERS ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!voters.length) {
    throw new Error("Set NEW_VOTERS to one or more addresses.");
  }
  for (const v of voters) {
    if (!ethers.isAddress(v)) throw new Error(`Invalid address: ${v}`);
  }

  const [authority] = await ethers.getSigners();
  console.log("Authority:", authority.address);

  const token = await ethers.getContractAt("BallotToken", tokenAddr);
  const tx = await token.issueBallots(voters);
  console.log("Submitted:", tx.hash);
  await tx.wait();

  for (const v of voters) {
    const bal = await token.balanceOf(v);
    console.log(`  ${v} -> ${ethers.formatEther(bal)} BALLOT`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
