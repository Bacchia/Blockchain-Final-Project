import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const candidates = [
    { name: "Candidate A", address: process.env.CANDIDATE_A ?? deployer.address },
    { name: "Candidate B", address: process.env.CANDIDATE_B ?? deployer.address },
    { name: "Candidate C", address: process.env.CANDIDATE_C ?? deployer.address },
  ];

  const voters = (process.env.VOTERS ?? deployer.address)
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const Ballot = await ethers.getContractFactory("BallotToken");
  const ballot = await Ballot.deploy();
  await ballot.waitForDeployment();
  const ballotAddr = await ballot.getAddress();
  console.log("BallotToken:", ballotAddr);

  const Election = await ethers.getContractFactory("Election");
  const election = await Election.deploy(ballotAddr, "Demo Election 2026");
  await election.waitForDeployment();
  console.log("Election:", await election.getAddress());

  for (const c of candidates) {
    const tx = await election.addCandidate(c.address, c.name);
    await tx.wait();
    console.log(`  + ${c.name} -> ${c.address}`);
  }

  const issue = await ballot.issueBallots(voters);
  await issue.wait();
  console.log("Issued ballots to:", voters.join(", "));

  console.log("\n--- frontend .env ---");
  console.log(`VITE_BALLOT_TOKEN_ADDRESS=${ballotAddr}`);
  console.log(`VITE_CANDIDATE_A=${candidates[0].address}`);
  console.log(`VITE_CANDIDATE_B=${candidates[1].address}`);
  console.log(`VITE_CANDIDATE_C=${candidates[2].address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
