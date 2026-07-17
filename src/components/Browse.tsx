import { useState } from 'react'
import { useStore } from '../store'
import BrowsedApp from './BrowsedApp'

export default function Browse() {
  const { state } = useStore()
  const [open, setOpen] = useState(false)

  if (open) return <BrowsedApp onClose={() => setOpen(false)} />

  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>Browse</h2>
        <div className="muted">Apps you can open</div>
      </div>

      <button className="app-launcher" onClick={() => setOpen(true)}>
        <span className="app-favicon">
          <span className="app-favicon-dot" />
        </span>
        <span className="app-launcher-meta">
          <span className="app-launcher-name">Vault</span>
          <span className="app-launcher-sub">
            {state.onboarded
              ? 'Tap to open · saving for ' + state.goal.name
              : 'Tap to set up your savings'}
          </span>
        </span>
        <span className="app-launcher-go">↗</span>
      </button>
    </div>
  )
}
