# Private Voting on Hinkal

A privacy-preserving voting dApp where a voter casts a ballot **without
revealing their identity or their choice**, while the public chain still
guarantees eligibility, one-person-one-vote, and a verifiable tally.

Built on the **[Hinkal](https://hinkal-team.gitbook.io/hinkal) ZK shielded
pool** (`@hinkal/common`) — privacy primitive: **Zero-Knowledge**.

> Course project: *Privacy on Blockchain*. MVP demonstrating one successful
> private transaction end-to-end.

## The idea: "1 token = 1 vote"

- Each eligible voter is issued exactly **one `BALLOT` ERC-20 token**.
- The voter **shields** the token into the Hinkal pool (`deposit`).
- To vote, the voter does a **private send** of the token to the chosen
  **candidate's public address** (`withdraw`). Hinkal hides the sender.
- The **tally** is each candidate's public `BALLOT` balance.

Result: observers see *"a candidate received a ballot"* but **cannot link it to
the voter**. Double-voting is impossible (one token + ZK nullifier).

```
Voter ──deposit(1 BALLOT)──▶ Hinkal shielded pool ──withdraw(1)──▶ Candidate
   │                              (ZK note + nullifier)               │
   └──── identity ───────X (link broken by the shielded pool) ────────┘
```

| Demo screen | Source |
| --- | --- |
| User: Alice | local label |
| Vote: Candidate A | selected candidate |
| Encrypted vote: `0x8fa9…` | digest of shielded recipient commitment |
| Transaction: `0x8392…` | withdraw tx hash (link to explorer) |
| Status: Confirmed ✅ | on-chain confirmation |

## Repo layout

```
app/        React + Vite + ethers frontend (the demo UI)
  src/lib/hinkal.ts   Hinkal SDK wrapper (init, shield, vote, tally)
  src/lib/config.ts   chain / token / candidate config (via .env)
contracts/  Hardhat: BallotToken.sol (eligibility) + Election.sol (tally)
docs/       ARCHITECTURE.md + THREAT_MODEL.md (the written report)
```

## Quick start

### Frontend

```bash
cd app
cp .env.example .env      # fill in deployed addresses
npm install
npm run dev
```

Requires an injected wallet (MetaMask) on Sepolia. The Hinkal SDK needs a
one-time **access token** (compliance step) per wallet before transacting —
see `docs/THREAT_MODEL.md`.

### Contracts

```bash
cd contracts
cp .env.example .env      # RPC URL + burner private key
npm install
npm run build
npm run deploy:sepolia    # prints the VITE_* values for app/.env
```

## Privacy properties

- **Ballot secrecy** — no voter→choice link (Hinkal shielded withdraw).
- **One-person-one-vote** — one `BALLOT`/voter + ZK nullifier.
- **Eligibility** — `issueBallot` is owner-gated, one per address.
- **Verifiability** — tally = public on-chain balances, recomputable by anyone.

Full analysis in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

## Status / roadmap

- [x] Project scaffold, SDK wrapper, demo UI, contracts, write-up
- [ ] Deploy `BallotToken` + `Election` to Sepolia
- [ ] Obtain Hinkal access token for demo wallet(s)
- [ ] Wire and verify one live private vote end-to-end
- [ ] Record backup demo video

## Tech

React · Vite · TypeScript · ethers v6 · `@hinkal/common` · Hardhat · Solidity 0.8.24
