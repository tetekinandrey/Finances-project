import { useState } from 'react'
import { useStore } from '../store'
import type { AppState } from '../types'
import { freshHomeState, onboardingState, savedState } from '../sample'

interface Preset {
  label: string
  ico: string
  hint: string
  build: () => AppState
  tab?: string
}

const PRESETS: Preset[] = [
  {
    label: 'Onboarding',
    ico: '🚀',
    hint: 'First-run setup wizard',
    build: onboardingState,
  },
  {
    label: 'Home',
    ico: '🏠',
    hint: 'Set up, nothing saved yet',
    build: freshHomeState,
    tab: 'pocket',
  },
  {
    label: 'Saved',
    ico: '💰',
    hint: 'Two weeks of progress',
    build: savedState,
    tab: 'pocket',
  },
]

export default function StateSimulator({
  setTab,
}: {
  setTab: (tab: string) => void
}) {
  const { dispatch } = useStore()
  const [open, setOpen] = useState(false)

  const pick = (p: Preset) => {
    dispatch({ type: 'IMPORT', state: p.build() })
    if (p.tab) setTab(p.tab)
    setOpen(false)
  }

  return (
    <div className="sim">
      {open && (
        <div className="sim-menu fade-in">
          <div className="sim-title">Simulate state</div>
          {PRESETS.map((p) => (
            <button key={p.label} className="sim-item" onClick={() => pick(p)}>
              <span className="sim-ico">{p.ico}</span>
              <span className="grow" style={{ textAlign: 'left' }}>
                <span className="sim-item-label">{p.label}</span>
                <span className="sim-item-hint">{p.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        className={`sim-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="Simulate app state"
      >
        {open ? '✕' : '🎬'}
      </button>
    </div>
  )
}
