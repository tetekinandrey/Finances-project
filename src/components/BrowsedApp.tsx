import { useState } from 'react'
import { useStore } from '../store'
import Home from './Home'
import Settings from './Settings'
import Onboarding from './Onboarding'

type OldTab = 'home' | 'settings'

const NAV: { id: OldTab; label: string; ico: string }[] = [
  { id: 'home', label: 'Home', ico: '🏠' },
  { id: 'settings', label: 'Settings', ico: '⚙️' },
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
              </div>

              {tab === 'home' && <Home />}
              {tab === 'settings' && <Settings />}
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
