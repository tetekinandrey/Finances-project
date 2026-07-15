import { useStore } from '../store'
import { balance, eur } from '../logic'

export default function GoalSettings() {
  const { state, dispatch } = useStore()
  const { goal } = state

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
