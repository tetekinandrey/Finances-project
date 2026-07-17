import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import Chats from './components/Chats'
import Pocket from './components/Pocket'
import Browse from './components/Browse'
import Settings from './components/Settings'
import StateSimulator from './components/StateSimulator'
import { shortAddress } from './seed'
import './app.css'

type Tab = 'chats' | 'pocket' | 'browse' | 'settings'

const NAV: { id: Tab; label: string; ico: string }[] = [
  { id: 'chats', label: 'Chats', ico: '💬' },
  { id: 'pocket', label: 'Pocket', ico: '🪪' },
  { id: 'browse', label: 'Browse', ico: '🧭' },
  { id: 'settings', label: 'Settings', ico: '⚙️' },
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
  const [tab, setTab] = useState<Tab>(state.onboarded ? 'pocket' : 'browse')

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
              : 'Polkadot · testnet'}
          </span>
        </div>

        {tab === 'chats' && <Chats go={(t) => setTab(t as Tab)} />}
        {tab === 'pocket' && <Pocket go={(t) => setTab(t as Tab)} />}
        {tab === 'browse' && <Browse />}
        {tab === 'settings' && <Settings />}
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
