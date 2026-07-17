import { useState } from 'react'
import { useStore } from '../store'
import Home from './Home'
import CheckIn from './CheckIn'
import History from './History'
import Chain from './Chain'
import Habits from './Habits'
import GoalSettings from './GoalSettings'
import Onboarding from './Onboarding'

type OldTab = 'home' | 'checkin' | 'history' | 'chain' | 'habits' | 'goal'

const NAV: { id: OldTab; label: string; ico: string }[] = [
  { id: 'home', label: 'Home', ico: '🏠' },
  { id: 'checkin', label: 'Check-in', ico: '✅' },
  { id: 'history', label: 'History', ico: '📈' },
  { id: 'chain', label: 'Chain', ico: '🔗' },
  { id: 'habits', label: 'Habits', ico: '⚙️' },
  { id: 'goal', label: 'Goal', ico: '🎯' },
]

export default function BrowsedApp({ onClose }: { onClose: () => void }) {
  const { state } = useStore()
  const [tab, setTab] = useState<OldTab>('home')

  return (
    <div className="browsed">
      {/* Browser chrome */}
      <div className="browsed-bar">
        <button className="browsed-close" onClick={onClose}>
          ✕
        </button>
        <span className="browsed-url">🔒 vault.app</span>
        <span style={{ width: 28 }} />
      </div>

      {!state.onboarded ? (
        <div className="browsed-scroll">
          <Onboarding />
        </div>
      ) : (
        <>
          <div className="browsed-scroll">
            <div className="app">
              <div className="topbar">
                <div className="brand">
                  <span className="dot" />
                  Vault
                </div>
                <span className="pill">classic</span>
              </div>

              {tab === 'home' && <Home go={(t) => setTab(t as OldTab)} />}
              {tab === 'checkin' && <CheckIn />}
              {tab === 'history' && <History />}
              {tab === 'chain' && <Chain />}
              {tab === 'habits' && <Habits />}
              {tab === 'goal' && <GoalSettings />}
            </div>
          </div>

          <nav className="nav browsed-nav">
            <div className="nav-inner">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  className={`nav-btn ${tab === n.id ? 'active' : ''}`}
                  onClick={() => setTab(n.id)}
                >
                  <span className="ico">{n.ico}</span>
                  {n.label}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
