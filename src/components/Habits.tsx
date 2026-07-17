import { useState } from 'react'
import { useStore } from '../store'
import { eur } from '../logic'
import { uid } from '../seed'
import type { Habit } from '../types'

export default function Habits() {
  const { state, dispatch } = useStore()

  const addHabit = () => {
    const habit: Habit = {
      id: uid(),
      name: 'New habit',
      emoji: '💸',
      value: 5,
      perWeek: 3,
      savePrompt: 'Did you resist this expense today?',
      indulgePrompt: 'Spent on it — was it worth it?',
      active: true,
    }
    dispatch({ type: 'ADD_HABIT', habit })
  }

  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>Habits</h2>
        <div className="muted">Tune what each saved day is worth</div>
      </div>

      {state.habits.map((h) => (
        <HabitRow key={h.id} habit={h} />
      ))}

      <button className="btn block" onClick={addHabit}>
        + Add habit
      </button>

      <div className="card penalize-toggle">
        <div className="row between">
          <div>
            <div style={{ fontWeight: 650 }}>Treats cost the plan</div>
            <div className="faint" style={{ fontSize: 12 }}>
              Subtract the value from your vault when you indulge
            </div>
          </div>
          <Toggle
            on={state.penalizeIndulgence}
            onChange={(v) => dispatch({ type: 'SET_PENALIZE', value: v })}
          />
        </div>
      </div>
    </div>
  )
}

function HabitRow({ habit }: { habit: Habit }) {
  const { dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const patch = (p: Partial<Habit>) =>
    dispatch({ type: 'UPDATE_HABIT', id: habit.id, patch: p })

  return (
    <div className={`card habit-editor ${habit.active ? '' : 'inactive'}`}>
      <div className="row between">
        <button
          className="row grow"
          style={{ gap: 10, textAlign: 'left' }}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="habit-emoji">{habit.emoji}</span>
          <div className="grow">
            <div style={{ fontWeight: 650 }}>{habit.name}</div>
            <div className="faint" style={{ fontSize: 12 }}>
              {eur(habit.value)} per saved day
            </div>
          </div>
        </button>
        <Toggle on={habit.active} onChange={(v) => patch({ active: v })} />
      </div>

      {open && (
        <div className="editor-body fade-in">
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ width: 70 }}>
              <label>Icon</label>
              <input
                value={habit.emoji}
                onChange={(e) => patch({ emoji: e.target.value })}
                maxLength={2}
                style={{ textAlign: 'center' }}
              />
            </div>
            <div className="field grow">
              <label>Name</label>
              <input
                value={habit.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </div>
            <div className="field" style={{ width: 90 }}>
              <label>Value €</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={habit.value}
                onChange={(e) => patch({ value: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="field">
            <label>Times per week</label>
            <input
              type="number"
              min="0"
              max="7"
              step="1"
              value={habit.perWeek ?? 0}
              onChange={(e) => patch({ perWeek: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="field">
            <label>Daily question</label>
            <input
              value={habit.savePrompt}
              onChange={(e) => patch({ savePrompt: e.target.value })}
            />
          </div>
          <div className="field">
            <label>When you treat yourself</label>
            <input
              value={habit.indulgePrompt}
              onChange={(e) => patch({ indulgePrompt: e.target.value })}
            />
          </div>
          <button
            className="btn danger block"
            style={{ marginTop: 12 }}
            onClick={() => dispatch({ type: 'REMOVE_HABIT', id: habit.id })}
          >
            Delete habit
          </button>
        </div>
      )}
    </div>
  )
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      className={`toggle ${on ? 'on' : ''}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    >
      <span className="knob" />
    </button>
  )
}
