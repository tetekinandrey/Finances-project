import { useState } from 'react'
import { useStore } from '../store'
import { balance, eur, progress } from '../logic'
import { shortAddress } from '../seed'
import GoalDetail from './GoalDetail'

export default function Pocket({ go }: { go: (tab: string) => void }) {
  const { state } = useStore()
  const [openLeica, setOpenLeica] = useState(false)

  if (openLeica)
    return (
      <GoalDetail
        onBack={() => setOpenLeica(false)}
        onOpenChat={() => go('chats')}
      />
    )

  const bal = balance(state)
  const pct = progress(state)
  const { account, goal } = state
  const name = account.connected ? account.label : 'Your identity'

  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>Pocket</h2>
        <div className="muted">Your cards</div>
      </div>

      {/* Identity */}
      <div className="wallet-card id">
        <div className="wallet-top">
          <span className="wallet-kind">Identity</span>
          <span className="wallet-chip">🪪</span>
        </div>
        <div className="wallet-id-name">{name}</div>
        <div className="wallet-sub">
          {account.connected ? shortAddress(account.address) : 'Not connected'}
        </div>
      </div>

      {/* Main account */}
      <div className="wallet-card main">
        <div className="wallet-top">
          <span className="wallet-kind">Main account</span>
          <span className="wallet-chip">💳</span>
        </div>
        <div className="wallet-balance">
          {account.balanceChecked ? eur(account.balance) : '—'}
        </div>
        <div className="wallet-sub">
          {account.connected ? shortAddress(account.address) : 'Set up in Settings'}
        </div>
      </div>

      {/* Leica savings */}
      <button className="wallet-card savings" onClick={() => setOpenLeica(true)}>
        <div className="wallet-top">
          <span className="wallet-kind">Savings · {goal.name}</span>
          <span className="wallet-chip">{goal.emoji}</span>
        </div>
        <div className="wallet-balance">{eur(bal)}</div>
        <div className="wallet-sub">of {eur(goal.targetPrice)} · tap for details</div>
        <div className="wallet-progress">
          <div className="wallet-progress-fill" style={{ width: `${pct * 100}%` }} />
        </div>
      </button>
    </div>
  )
}
