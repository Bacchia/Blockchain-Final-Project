# Architecture — Private Voting on Hinkal

## 1. Goal

A voting system where a voter can cast a ballot **without revealing their
identity or their choice to observers**, while the chain still guarantees:

- **Eligibility** — only authorized voters can vote.
- **Uniqueness** — each voter votes at most once (no double voting).
- **Verifiability** — anyone can audit the final tally.

## 2. Privacy primitive

We use **ZK (zero-knowledge) via the Hinkal shielded pool** (`@hinkal/common`).
Hinkal is a privacy middleware for confidential token transfers built on
zkSNARKs + stealth addresses. We do **not** invent new cryptography; we compose
Hinkal's shielded transfers into a voting protocol.

## 3. Core idea: "1 token = 1 vote"

| Object | Meaning |
| --- | --- |
| `BALLOT` ERC-20 | A vote token. Exactly **one** is issued per eligible voter. |
| Candidate address | A public address; receiving a `BALLOT` = receiving a vote. |
| Shielded pool | Hides which voter sent which token. |

### Flow

```
1. SETUP (authority)
   - Deploy BallotToken + Election.
   - issueBallot(voter)   -> each eligible voter holds exactly 1 BALLOT.
   - addCandidate(addr)   -> register candidate public addresses.

2. SHIELD (voter)
   - hinkal.deposit([BALLOT], [1]) -> token enters the shielded pool.
     The link "voter holds a ballot" is now hidden behind a commitment.

3. VOTE (voter)
   - hinkal.withdraw([BALLOT], [1], candidateAddress, relayer=true)
     A private send from the pool to the candidate's PUBLIC address.
     Observers see "candidate received 1 ballot" but NOT who sent it.

4. TALLY (anyone)
   - Election.results() = each candidate's BALLOT balance.
```

## 4. Why each property holds

- **Anonymity of the voter→choice link:** the withdraw spends a shielded note
  via a ZK proof; the on-chain transaction does not reveal the source note or
  the voter's address. A relayer pays gas so the voter's wallet never appears.
- **Uniqueness:** a voter holds a single `BALLOT`. Spending it once is voting;
  the Hinkal **nullifier** prevents double-spending the same shielded note.
- **Eligibility:** `BallotToken.issueBallot` is `onlyOwner` and one-per-address.
- **Verifiability:** the tally is public ERC-20 balances; anyone can recompute.

## 5. Components

```
app/        React + Vite frontend (wallet connect, shield, vote, receipt, tally)
  src/lib/hinkal.ts   SDK wrapper: initHinkal, shieldBallot, castVote, balances
  src/lib/config.ts   chain, token, candidate configuration
contracts/  Hardhat project
  BallotToken.sol     eligibility + scarcity (1 token / voter)
  Election.sol        candidate registry + public tally
docs/       this write-up + threat model
```

## 6. Data flow diagram

```
 Voter wallet ──deposit(1 BALLOT)──▶ Hinkal shielded pool ──withdraw(1)──▶ Candidate addr
      │                                   (ZK note + nullifier)               │
      └── identity here ──────────────────X (broken link) ───────────────────┘
                                                                              ▼
                                                                   Election.results()
                                                                   (public tally)
```

## 7. Open design choices

- **Public running tally** (current): candidate balances are visible during the
  election. Simpler and more demoable.
- **Hidden tally until reveal** (alternative): use `transfer` (private→private)
  to per-candidate stealth addresses controlled by the authority, decrypt at the
  end. Stronger privacy, more complexity.
