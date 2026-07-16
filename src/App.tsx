import { useState } from 'react'
import { StoreProvider } from './store'
import Home from './components/Home'
import Habits from './components/Habits'
import GoalSettings from './components/GoalSettings'
import History from './components/History'
import './app.css'

type Tab = 'home' | 'history' | 'habits' | 'goal'

const NAV: { id: Tab; label: string; ico: string }[] = [
  { id: 'home', label: 'Today', ico: '🏠' },
  { id: 'history', label: 'History', ico: '📈' },
  { id: 'habits', label: 'Habits', ico: '⚙️' },
  { id: 'goal', label: 'Goal', ico: '🎯' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <StoreProvider>
      <div className="app">
        <div className="topbar">
          <div className="brand">
            <span className="dot" />
            Vault
          </div>
          <span className="pill">Polkadot · testnet soon</span>
        </div>

        {tab === 'home' && <Home />}
        {tab === 'history' && <History />}
        {tab === 'habits' && <Habits />}
        {tab === 'goal' && <GoalSettings />}
      </div>

      <nav className="nav">
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
    </StoreProvider>
  )
}
