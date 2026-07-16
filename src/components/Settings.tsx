import { useState } from 'react'
import GoalSettings from './GoalSettings'
import Habits from './Habits'
import Chain from './Chain'

type View = null | 'goal' | 'habits' | 'chain'

const ROWS: { id: Exclude<View, null>; ico: string; label: string; hint: string }[] = [
  { id: 'goal', ico: '🎯', label: 'Goal', hint: 'Name, price, image' },
  { id: 'habits', ico: '🧾', label: 'Items & habits', hint: 'What you save on' },
  { id: 'chain', ico: '🔗', label: 'Polkadot account', hint: 'Wallet & vault' },
]

export default function Settings() {
  const [view, setView] = useState<View>(null)

  if (view) {
    return (
      <div className="fade-in stack">
        <button className="back-row" onClick={() => setView(null)}>
          ← Settings
        </button>
        {view === 'goal' && <GoalSettings />}
        {view === 'habits' && <Habits />}
        {view === 'chain' && <Chain />}
      </div>
    )
  }

  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>Settings</h2>
        <div className="muted">Manage your plan</div>
      </div>

      <div className="card settings-menu">
        {ROWS.map((r) => (
          <button
            key={r.id}
            className="settings-row"
            onClick={() => setView(r.id)}
          >
            <span className="settings-ico">{r.ico}</span>
            <span className="grow" style={{ textAlign: 'left' }}>
              <span className="settings-label">{r.label}</span>
              <span className="settings-hint">{r.hint}</span>
            </span>
            <span className="settings-chevron">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
