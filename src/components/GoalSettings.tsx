import { useStore } from '../store'
import { balance, eur } from '../logic'
import { DEMO_ADDRESS, mockBalanceFor, shortAddress } from '../seed'

export default function GoalSettings() {
  const { state, dispatch } = useStore()
  const { goal, account } = state

  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>Your goal</h2>
        <div className="muted">What are you saving for?</div>
      </div>

      <div className="goal-preview card">
        {goal.imageUrl ? (
          <img src={goal.imageUrl} alt={goal.name} />
        ) : (
          <div className="goal-hero-emoji small">{goal.emoji}</div>
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {goal.name || 'Untitled goal'}
          </div>
          <div className="muted">{eur(goal.targetPrice)}</div>
        </div>
      </div>

      <div className="card">
        <div className="field">
          <label>Goal name</label>
          <input
            value={goal.name}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_GOAL', goal: { name: e.target.value } })
            }
            placeholder="e.g. Leica M6"
          />
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ width: 80 }}>
            <label>Emoji</label>
            <input
              value={goal.emoji}
              maxLength={2}
              style={{ textAlign: 'center' }}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_GOAL', goal: { emoji: e.target.value } })
              }
            />
          </div>
          <div className="field grow">
            <label>Target price €</label>
            <input
              type="number"
              min="0"
              value={goal.targetPrice}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_GOAL',
                  goal: { targetPrice: Number(e.target.value) || 0 },
                })
              }
            />
          </div>
        </div>
        <div className="field">
          <label>Motivating image URL (optional)</label>
          <input
            value={goal.imageUrl}
            placeholder="https://…"
            onChange={(e) =>
              dispatch({ type: 'UPDATE_GOAL', goal: { imageUrl: e.target.value } })
            }
          />
        </div>
      </div>

      <div className="section-title">Account</div>
      <div className="card stack">
        {account.connected ? (
          <>
            <div className="row between">
              <div className="row" style={{ gap: 10 }}>
                <span style={{ fontSize: 20 }}>🔗</span>
                <div>
                  <div style={{ fontWeight: 650 }}>{account.label}</div>
                  <div className="faint" style={{ fontSize: 12 }}>
                    {shortAddress(account.address)}
                  </div>
                </div>
              </div>
              <button
                className="btn ghost"
                onClick={() =>
                  dispatch({
                    type: 'SET_ACCOUNT',
                    patch: {
                      address: '',
                      label: '',
                      connected: false,
                      balance: 0,
                      balanceChecked: false,
                    },
                  })
                }
              >
                Disconnect
              </button>
            </div>
            <div
              className="row between"
              style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}
            >
              <span className="muted">Available balance</span>
              <strong>{eur(account.balance)}</strong>
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label>Account address</label>
              <input
                value={account.address}
                placeholder="5Grwva…  (Polkadot address)"
                onChange={(e) => {
                  const address = e.target.value
                  const has = address.trim().length > 0
                  dispatch({
                    type: 'SET_ACCOUNT',
                    patch: {
                      address,
                      label: account.label || 'Polkadot account',
                      connected: has,
                      balance: has ? mockBalanceFor(address) : 0,
                      balanceChecked: has,
                    },
                  })
                }}
              />
            </div>
            <button
              className="btn block"
              onClick={() =>
                dispatch({
                  type: 'SET_ACCOUNT',
                  patch: {
                    address: DEMO_ADDRESS,
                    label: 'Demo account',
                    connected: true,
                    balance: mockBalanceFor(DEMO_ADDRESS),
                    balanceChecked: true,
                  },
                })
              }
            >
              ⚡ Use a demo account
            </button>
          </>
        )}
        <div
          className="row between"
          style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}
        >
          <span className="muted">🔒 {goal.name || 'Goal'} vault</span>
          <strong>{eur(balance(state))} locked</strong>
        </div>
      </div>

      <div className="section-title">Data</div>
      <div className="card">
        <div className="row between" style={{ marginBottom: 12 }}>
          <span className="muted">Current vault balance</span>
          <strong>{eur(balance(state))}</strong>
        </div>
        <button
          className="btn danger block"
          onClick={() => {
            if (
              confirm(
                'Reset everything — goal, habits and all logged days — back to defaults?',
              )
            ) {
              dispatch({ type: 'RESET' })
            }
          }}
        >
          Reset all data
        </button>
      </div>
    </div>
  )
}
