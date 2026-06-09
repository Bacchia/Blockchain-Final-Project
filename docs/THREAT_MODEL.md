# Threat Model — Private Voting on Hinkal

## 1. Actors

- **Voter** — holds one `BALLOT`, wants to vote privately.
- **Election authority** — deploys contracts, issues ballots, registers
  candidates. Trusted for *eligibility*, not for *ballot secrecy*.
- **Public observer** — reads the chain / mempool. The adversary for privacy.
- **Relayer** — submits the voter's withdraw tx and pays gas.
- **Hinkal infrastructure** — shielded-pool contracts, prover enclave, relayer
  network, compliance (access-token) layer.

## 2. What is hidden vs. visible

| Data | Visible to observer? |
| --- | --- |
| That an address received a ballot (eligibility) | Yes (by design) |
| That *some* vote was cast | Yes (a shielded tx occurred) |
| Per-candidate vote totals | Yes (public tally — intended) |
| **Which voter voted for which candidate** | **No** |
| **Whether a specific voter has voted yet** | No (their note is shielded) |

## 3. Security goals

1. **Ballot secrecy** — no link between a voter and their chosen candidate.
2. **One-person-one-vote** — at most one counted vote per eligible voter.
3. **Integrity** — totals equal the number of validly cast ballots.
4. **Eligibility** — non-issued addresses cannot vote.

## 4. Threats and mitigations

| Threat | Mitigation |
| --- | --- |
| Link voter→choice via sender address | Hinkal shielded withdraw hides the source note; relayer pays gas |
| Double voting | Single `BALLOT` per voter + ZK nullifier prevents note re-spend |
| Voting without eligibility | `issueBallot` is `onlyOwner`, one per address |
| Timing/amount correlation | Fixed vote amount (1 token); batch voting window reduces correlation |
| Mempool linkage | Use relayer so the voter's EOA never broadcasts the vote tx |
| Forged tally | Tally is derived from on-chain ERC-20 balances; recomputable by anyone |

## 5. Trust assumptions

- **Authority** is trusted to issue ballots fairly (eligibility), but **cannot**
  see how anyone voted.
- **Hinkal prover/relayer** are trusted for liveness and not to deanonymize via
  side information; the ZK proofs themselves protect correctness.
- **Compliance/access-token layer**: each wallet needs a one-time Hinkal access
  token. The authority/voters must obtain this before the demo.

## 6. Known limitations (be honest in the demo)

- Coercion / vote-selling is **not** prevented (no receipt-freeness).
- An observer learns the public vote totals during the election (running tally).
- Anonymity set = the set of voters who shielded ballots; a tiny election leaks
  more by statistics. Larger turnout = stronger privacy.
- We rely on Hinkal's relayer + prover being available during the demo.

## 7. One failure mode to discuss (rubric requirement)

If the **relayer is unavailable**, a voter could be forced to submit the vote
from their own EOA (`isRelayerOff = true`), which re-links their public address
to the vote tx and weakens anonymity. Mitigation: retry via relayer, or fall
back to private→private `transfer` so the candidate address is also a stealth
address.
