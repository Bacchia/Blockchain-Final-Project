# Private Voting on Hinkal

> Vote anonymously. Verify publicly. Nobody can link your identity to your choice.

A privacy-preserving voting dApp built on the Hinkal ZK shielded pool. Voters cast ballots without revealing who they voted for — while the blockchain still guarantees that only eligible voters can vote, nobody votes twice, and the final tally is verifiable by anyone.

---

## The problem with on-chain voting

Traditional blockchain voting is transparent by default. Every transaction is public, which means anyone can look at the chain and see exactly who voted for whom. That's the opposite of what a ballot should be.

This project solves that with zero-knowledge proofs.

---

## How it works

The core idea is simple: **1 token = 1 vote**.

Each eligible voter receives exactly one `BALLOT` ERC-20 token, issued by the election authority. To vote, they send that token to their chosen candidate's address. The tally is just each candidate's token balance — transparent, recomputable, and tamper-proof.

The privacy comes from how the token is sent. Instead of a plain transfer, the voter deposits their ballot into **Hinkal's shielded pool**, then withdraws it to the candidate via a **ZK proof and a relayer**. The result: observers see that a candidate received a vote, but the link between the voter and their choice is cryptographically severed.

```
Voter ──deposit(1 BALLOT)──▶  Hinkal shielded pool  ──withdraw(1)──▶ Candidate
  │                             (ZK note + nullifier)                     │
  └──── identity ──────────────── X (broken) ──────────────────────────── ┘
```

Double voting is impossible — each voter holds exactly one token, and Hinkal's nullifier prevents the same shielded note from being spent twice.

---

## What's built

**Two smart contracts on Arc Testnet:**

- `BallotToken` — an ERC-20 where the authority mints exactly one token per eligible voter. One address, one ballot, enforced on-chain.
- `Election` — stores the candidate list and exposes a `results()` function that returns live vote counts. Anyone can call it and verify the tally independently.

**A React frontend:**

- Connects to MetaMask, auto-switches to the right network
- Loads candidates and live vote counts directly from the chain on every page load
- Walks the voter through: connect → shield ballot → cast private vote → see receipt
- Shows a live tally with progress bars and a leading indicator that updates after each vote

**Utility scripts:**

- `npm run deploy:arc` — deploys both contracts, registers candidates, issues ballots
- `npm run add:candidate` — adds a new candidate to a live election
- `npm run issue` — issues ballots to new voter addresses
- `node scripts/tally.cjs` — prints the live on-chain vote counts

---

## Live deployment

Deployed on **Arc Testnet** (chainId `5042002`) — the only testnet where Hinkal's shielded pool is operational.

| Contract | Address |
|---|---|
| BallotToken | `0x39298b3D75bdA16F1D4549A4eccce7d10C4f1829` |
| Election | `0x228322f50AA0215C57EcFEDe34ed9CC16f06321b` |

Explorer: [testnet.arcscan.app](https://testnet.arcscan.app)

---

## Demo mode

Hinkal's shielded pool requires a one-time KYC compliance step (an "access token") before any shielded transaction. This is a real-world anti-money-laundering measure baked into the protocol — and it isn't available for testnet wallets without going through mainnet first.

So the app ships with a `DEMO_MODE` flag. When it's on:

- The shielding step is **simulated** (clearly labelled in the UI)
- The vote is a **real on-chain token transfer** — the tally is real and verifiable on Arcscan
- Eligibility and one-vote enforcement are fully real

When `DEMO_MODE=false`, the app uses the full Hinkal path — real deposit, real shielded withdraw, real ZK proof. That requires a valid Hinkal access token on the active chain, which is obtainable on Ethereum mainnet via [app.hinkal.pro](https://app.hinkal.pro).

---

## Run it locally

**Prerequisites:** Node 22 (`nvm use 22`), MetaMask browser extension.

```bash
cd app
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. MetaMask will be prompted to add Arc Testnet automatically when you connect. To vote you'll need a wallet that holds a `BALLOT` token — either use the deployed election or redeploy your own.

**To redeploy:**

```bash
cd contracts
cp .env.example .env          # fill in ARC_TESTNET_RPC_URL and DEPLOYER_PRIVATE_KEY
npm install
npm run build
npm run deploy:arc
```

Fund the deployer with test USDC (Arc's gas token) at [faucet.circle.com](https://faucet.circle.com) → select *Arc Testnet*.

---

## Privacy properties

| Property | Guaranteed by |
|---|---|
| Only eligible voters can vote | `issueBallot` is owner-only, one per address |
| Nobody votes twice | One token per voter + ZK nullifier |
| Tally is accurate and public | Candidate balances are on-chain ERC-20 state |
| Voter identity is hidden | Hinkal shielded withdraw via ZK proof + relayer |

The last property is the hard one. The first three are enforced entirely by the contracts and are live in this deployment. The fourth is implemented in code and works on mainnet — it's the one that needs the KYC access token.

---

## Tech

React · Vite · TypeScript · ethers v6 · `@hinkal/common` · Hardhat · Solidity 0.8.24 · Arc Testnet
