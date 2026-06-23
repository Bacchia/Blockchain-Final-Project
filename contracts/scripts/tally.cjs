const { ethers } = require('ethers');

const ELECTION = '0xb49ED152C58D2e782f4BA217AB64644432AD2279';

async function main() {
  const provider = new ethers.JsonRpcProvider(
    process.env.ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network',
  );
  const election = new ethers.Contract(
    ELECTION,
    [
      'function results() view returns (address[], uint256[])',
      'function candidateName(address) view returns (string)',
    ],
    provider,
  );
  const [addrs, votes] = await election.results();
  console.log('--- Live tally (Arc Testnet) ---');
  for (let i = 0; i < addrs.length; i++) {
    const name = await election.candidateName(addrs[i]);
    console.log(`${name || addrs[i]}: ${ethers.formatEther(votes[i])} vote(s)`);
  }
}

main().catch((e) => {
  console.error('ERR:', e.shortMessage || e.message);
  process.exitCode = 1;
});
