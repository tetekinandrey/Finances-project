import { useState } from 'react'
import { useStore } from '../store'
import { eur, formatDate } from '../logic'
import type { DayAction, Habit } from '../types'

export default function CheckIn() {
  const { today } = useStore()
  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>Today&rsquo;s check-in</h2>
        <div className="muted">{formatDate(today)} · daily habits</div>
      </div>
      <CheckInSection />
    </div>
  )
}

export function CheckInSection() {
  const { state, dispatch, today } = useStore()
  const active = state.habits.filter((h) => h.active)
  const entry = state.entries.find((e) => e.date === today)
  const answers = new Map(
    entry?.actions.map((a) => [a.habitId, a]) ?? [],
  )

  const todayTotal = entry?.actions.reduce((s, a) => s + a.amount, 0) ?? 0
  const doneCount = answers.size
  const allDone = doneCount === active.length && active.length > 0

  return (
    <>
      <div className="card checkin-summary">
        <div className="row between">
          <span className="muted">Banked today</span>
          <span
            className="checkin-total"
            style={{ color: todayTotal >= 0 ? 'var(--accent)' : 'var(--danger)' }}
          >
            {todayTotal >= 0 ? '+' : ''}
            {eur(todayTotal)}
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${active.length ? (doneCount / active.length) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="faint" style={{ fontSize: 12 }}>
          {doneCount}/{active.length} answered
        </div>
      </div>

      {active.map((h) => (
        <HabitCard
          key={h.id}
          habit={h}
          answer={answers.get(h.id)}
          onSave={() =>
            dispatch({
              type: 'RECORD',
              date: today,
              action: { habitId: h.id, result: 'saved', amount: h.value },
            })
          }
          onIndulge={(worthIt, note) =>
            dispatch({
              type: 'RECORD',
              date: today,
              action: {
                habitId: h.id,
                result: 'indulged',
                amount: state.penalizeIndulgence ? -h.value : 0,
                worthIt,
                note,
              },
            })
          }
          onClear={() =>
            dispatch({ type: 'CLEAR_DAY_HABIT', date: today, habitId: h.id })
          }
        />
      ))}

      {allDone && (
        <div className="card done-banner fade-in">
          ✅ All done for today. Come back tomorrow!
        </div>
      )}
    </>
  )
}

function HabitCard({
  habit,
  answer,
  onSave,
  onIndulge,
  onClear,
}: {
  habit: Habit
  answer?: DayAction
  onSave: () => void
  onIndulge: (worthIt: boolean, note?: string) => void
  onClear: () => void
}) {
  const [treating, setTreating] = useState(false)
  const [note, setNote] = useState('')

  if (answer) {
    const saved = answer.result === 'saved'
    return (
      <div className={`card habit-answered ${saved ? 'good' : 'treat'}`}>
        <div className="row between">
          <div className="row" style={{ gap: 10 }}>
            <span className="habit-emoji">{habit.emoji}</span>
            <div>
              <div style={{ fontWeight: 650 }}>{habit.name}</div>
              <div className="faint" style={{ fontSize: 12 }}>
                {saved
                  ? 'Saved — added to your vault'
                  : answer.worthIt
                    ? 'Treated yourself — and it was worth it 💚'
                    : 'Treated yourself'}
              </div>
            </div>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <span
              style={{
                fontWeight: 700,
                color: saved ? 'var(--accent)' : 'var(--danger)',
              }}
            >
              {answer.amount >= 0 ? '+' : ''}
              {eur(answer.amount)}
            </span>
            <button className="icon-btn" title="Undo" onClick={onClear}>
              ↺
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card habit-card">
      <div className="row" style={{ gap: 12, marginBottom: 4 }}>
        <span className="habit-emoji">{habit.emoji}</span>
        <div className="grow">
          <div style={{ fontWeight: 650 }}>{habit.savePrompt}</div>
          <div className="faint" style={{ fontSize: 12 }}>
            worth {eur(habit.value)}
          </div>
        </div>
      </div>

      {!treating ? (
        <div className="row" style={{ gap: 10, marginTop: 10 }}>
          <button className="btn primary grow" onClick={onSave}>
            Yes — I saved {eur(habit.value)}
          </button>
          <button className="btn grow" onClick={() => setTreating(true)}>
            I treated myself
          </button>
        </div>
      ) : (
        <div className="treat-box fade-in">
          <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>
            {habit.indulgePrompt} No guilt — you earned it.
          </div>
          <input
            placeholder="Optional: what did you enjoy?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <div className="row" style={{ gap: 10 }}>
            <button
              className="btn grow"
              onClick={() => onIndulge(true, note || undefined)}
            >
              💚 Worth it
            </button>
            <button
              className="btn grow"
              onClick={() => onIndulge(false, note || undefined)}
            >
              🤔 Not really
            </button>
          </div>
          <button
            className="btn ghost block"
            style={{ marginTop: 8 }}
            onClick={() => setTreating(false)}
          >
            Back
          </button>
        </div>
      )}
    </div>
  )
}
