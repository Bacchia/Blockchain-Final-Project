import { useState } from 'react';
import './App.css';
import { CANDIDATES, EXPLORER_BASE, type Candidate } from './lib/config';
import {
  castVote,
  getSigner,
  hasAccessToken,
  initHinkal,
  shieldBallot,
  type VoteReceipt,
} from './lib/hinkal';

type Phase = 'disconnected' | 'connected' | 'shielded' | 'voted';

function shortAddr(a: string) {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : '';
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('disconnected');
  const [address, setAddress] = useState('');
  const [voterName, setVoterName] = useState('Alice');
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function handleConnect() {
    setError('');
    setBusy(true);
    setStatus('Connecting wallet & deriving shielded keys...');
    try {
      const signer = await getSigner();
      setAddress(await signer.getAddress());
      await initHinkal(signer);
      const ok = await hasAccessToken();
      if (!ok) {
        setError(
          'Wallet has no Hinkal access token (one-time compliance step). Complete it, then reconnect.',
        );
      }
      setPhase('connected');
      setStatus('Connected. Shield your ballot to begin.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleShield() {
    setError('');
    setBusy(true);
    setStatus('Shielding ballot token into the private pool...');
    try {
      await shieldBallot();
      setPhase('shielded');
      setStatus('Ballot shielded. Your identity is now hidden. Pick a candidate.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVote() {
    if (!selected) return;
    setError('');
    setBusy(true);
    setStatus('Casting private vote (sender hidden)...');
    try {
      const r = await castVote(selected.address);
      setReceipt(r);
      setPhase('voted');
      setStatus('Vote confirmed on-chain.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>Private Voting</h1>
        <p className="subtitle">
          Anonymous, verifiable voting on a public chain — powered by the Hinkal
          shielded pool. Nobody can link a voter to their choice.
        </p>
        <div className="wallet">
          {address ? (
            <span className="pill">{shortAddr(address)}</span>
          ) : (
            <button onClick={handleConnect} disabled={busy}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Cast your vote</h2>

          <label className="field">
            <span>Voter</span>
            <input
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Your name (local label only)"
            />
          </label>

          <div className="field">
            <span>Candidate</span>
            <div className="candidates">
              {CANDIDATES.map((c) => (
                <button
                  key={c.id}
                  className={`candidate ${selected?.id === c.id ? 'active' : ''}`}
                  onClick={() => setSelected(c)}
                  disabled={phase === 'voted'}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            {phase === 'connected' && (
              <button onClick={handleShield} disabled={busy}>
                1. Shield ballot
              </button>
            )}
            {phase === 'shielded' && (
              <button onClick={handleVote} disabled={busy || !selected}>
                2. Cast private vote
              </button>
            )}
            {phase === 'disconnected' && (
              <button onClick={handleConnect} disabled={busy}>
                Connect to start
              </button>
            )}
          </div>

          {status && <p className="status">{status}</p>}
          {error && <p className="error">{error}</p>}
        </section>

        <section className="card receipt">
          <h2>Receipt</h2>
          <Row label="User" value={voterName || '—'} />
          <Row label="Vote" value={selected?.name ?? '—'} />
          <Row
            label="Encrypted vote"
            value={receipt?.encryptedVote ?? '—'}
            mono
          />
          <Row
            label="Transaction"
            value={
              receipt ? (
                <a
                  href={`${EXPLORER_BASE}/tx/${receipt.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortAddr(receipt.txHash)}
                </a>
              ) : (
                '—'
              )
            }
            mono
          />
          <Row
            label="Status"
            value={phase === 'voted' ? 'Confirmed ✅' : 'Pending'}
          />

          <div className="note">
            The chain stores a ZK proof + commitment — never "{voterName} →{' '}
            {selected?.name ?? 'candidate'}". Open the transaction to verify the
            sender is not revealed.
          </div>
        </section>
      </main>

      <footer className="foot">
        Built with @hinkal/common · 1 token = 1 vote · ZK shielded pool
      </footer>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      <span className={`row-value ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  );
}
