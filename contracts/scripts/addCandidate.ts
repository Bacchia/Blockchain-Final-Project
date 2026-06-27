import { ethers } from "hardhat";

async function main() {
  const electionAddr =
    process.env.ELECTION_ADDRESS ?? "0x228322f50AA0215C57EcFEDe34ed9CC16f06321b";
  const candidate = process.env.NEW_CANDIDATE;
  const name = process.env.NEW_CANDIDATE_NAME ?? "New Candidate";

  if (!candidate || !ethers.isAddress(candidate)) {
    throw new Error("Set NEW_CANDIDATE to a valid address.");
  }

  const [authority] = await ethers.getSigners();
  console.log("Authority:", authority.address);

  const election = await ethers.getContractAt("Election", electionAddr);
  const tx = await election.addCandidate(candidate, name);
  console.log("Submitted:", tx.hash);
  await tx.wait();

  console.log(`Added "${name}" -> ${candidate}`);
  console.log("Total candidates:", (await election.candidateCount()).toString());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
