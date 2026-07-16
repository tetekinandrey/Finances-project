import { useStore } from '../store'
import { balance, estimates, eur, isUnlocked } from '../logic'
import { useTransfer } from '../useTransfer'
import type { Habit } from '../types'

export default function Home({ go }: { go: (tab: string) => void }) {
  const { state, dispatch, today } = useStore()
  const send = useTransfer()
  const bal = balance(state)
  const unlocked = isUnlocked(state)
  const est = estimates(state)
  const coffee = state.habits.find((h) => h.id === 'coffee' && h.active)
  const eatout = state.habits.find((h) => h.id === 'eatout' && h.active)

  // "N X to skip" stats shown on the home screen.
  const skipStats: { habit: Habit; noun: string }[] = []
  if (coffee) skipStats.push({ habit: coffee, noun: 'coffees' })
  if (eatout) skipStats.push({ habit: eatout, noun: 'lunches out' })

  // The duel: the coffee habit (or the first active one) vs. the goal.
  const duelHabit = coffee ?? state.habits.find((h) => h.active)
  const otherActive = state.habits.filter(
    (h) => h.active && h.id !== duelHabit?.id,
  )
  const todayEntry = state.entries.find((e) => e.date === today)
  const duelAnswer = duelHabit
    ? todayEntry?.actions.find((a) => a.habitId === duelHabit.id)
    : undefined

  const chooseGoal = () => {
    if (!duelHabit) return
    dispatch({
      type: 'RECORD',
      date: today,
      action: { habitId: duelHabit.id, result: 'saved', amount: duelHabit.value },
    })
    send(duelHabit.value, duelHabit.id)?.catch((e) =>
      console.warn('Vault transfer failed:', e),
    )
  }

  const chooseHabit = () => {
    if (!duelHabit) return
    dispatch({
      type: 'RECORD',
      date: today,
      action: {
        habitId: duelHabit.id,
        result: 'indulged',
        amount: state.penalizeIndulgence ? -duelHabit.value : 0,
      },
    })
  }

  return (
    <div className="fade-in stack">
      {/* Goal title on top */}
      <div className="goal-title">
        <div className="ring-goal-label">🎯 Saving for</div>
        <h1>{state.goal.name}</h1>
      </div>

      {/* Saved amount */}
      <div className="card balance-card">
        <div className="balance-amount">{eur(bal)}</div>
        {unlocked ? (
          <div className="ring-sub" style={{ color: 'var(--accent)' }}>
            🎉 unlocked!
          </div>
        ) : (
          <div className="ring-sub">
            saved from {eur(state.goal.targetPrice)} required
          </div>
        )}
      </div>

      {/* "N X to skip" stats */}
      {!unlocked && skipStats.length > 0 && (
        <div
          className="skip-grid"
          style={{ gridTemplateColumns: `repeat(${skipStats.length}, 1fr)` }}
        >
          {skipStats.map((s) => (
            <div key={s.habit.id} className="card skip-tile">
              <div className="skip-num">{est.skipsToGoal(s.habit)}</div>
              <div className="skip-label">
                {s.habit.emoji} {s.noun} to skip
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Playful daily duel: the habit vs. the goal */}
      {!unlocked && duelHabit && (
        <div className="card duel">
          {duelAnswer ? (
            <div className="duel-result fade-in">
              <div className="duel-result-emoji">
                {duelAnswer.result === 'saved'
                  ? state.goal.emoji
                  : duelHabit.emoji}
              </div>
              <div className="duel-result-text">
                That&rsquo;s it for today ✌️
              </div>
            </div>
          ) : (
            <>
              <div className="duel-q">
                {duelHabit.emoji} {duelHabit.name} or {state.goal.emoji}{' '}
                {state.goal.name}?
              </div>
              <div className="duel-row">
                <button className="duel-opt habit" onClick={chooseHabit}>
                  <span className="duel-opt-emoji">{duelHabit.emoji}</span>
                  <span className="duel-opt-name">{duelHabit.name}</span>
                  <span className="duel-opt-sub">treat myself</span>
                </button>
                <span className="duel-vs">or</span>
                <button className="duel-opt goal" onClick={chooseGoal}>
                  <span className="duel-opt-emoji">{state.goal.emoji}</span>
                  <span className="duel-opt-name">{state.goal.name}</span>
                  <span className="duel-opt-sub">+{eur(duelHabit.value)}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {otherActive.length > 0 && (
        <button className="btn ghost block" onClick={() => go('checkin')}>
          Coffee wasn&rsquo;t your only villain today →
        </button>
      )}
    </div>
  )
}
