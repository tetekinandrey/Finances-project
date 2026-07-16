import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import Home from './components/Home'
import CheckIn from './components/CheckIn'
import Habits from './components/Habits'
import GoalSettings from './components/GoalSettings'
import History from './components/History'
import Onboarding from './components/Onboarding'
import Chain from './components/Chain'
import StateSimulator from './components/StateSimulator'
import { shortAddress } from './seed'
import './app.css'

type Tab = 'home' | 'checkin' | 'history' | 'chain' | 'habits' | 'goal'

const NAV: { id: Tab; label: string; ico: string }[] = [
  { id: 'home', label: 'Home', ico: '🏠' },
  { id: 'checkin', label: 'Check-in', ico: '✅' },
  { id: 'history', label: 'History', ico: '📈' },
  { id: 'chain', label: 'Chain', ico: '🔗' },
  { id: 'habits', label: 'Habits', ico: '⚙️' },
  { id: 'goal', label: 'Goal', ico: '🎯' },
]

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}

function Shell() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('home')

  if (!state.onboarded)
    return (
      <>
        <Onboarding />
        <StateSimulator setTab={(t) => setTab(t as Tab)} />
      </>
    )

  return (
    <>
      <div className="app">
        <div className="topbar">
          <div className="brand">
            <span className="dot" />
            Vault
          </div>
          <span className={`pill ${state.account.connected ? 'connected' : ''}`}>
            {state.account.connected
              ? `🔗 ${shortAddress(state.account.address)}`
              : 'Polkadot · testnet soon'}
          </span>
        </div>

        {tab === 'home' && <Home go={(t) => setTab(t as Tab)} />}
        {tab === 'checkin' && <CheckIn />}
        {tab === 'history' && <History />}
        {tab === 'chain' && <Chain />}
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

      <StateSimulator setTab={(t) => setTab(t as Tab)} />
    </>
  )
}
