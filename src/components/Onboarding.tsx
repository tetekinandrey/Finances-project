import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { eur } from '../logic'
import { DEMO_ADDRESS, mockBalanceFor, uid } from '../seed'
import type { Goal, Habit } from '../types'

const STEPS = ['Goal', 'Items', 'Details', 'Card', 'Done']

interface Preset {
  id: string
  name: string
  emoji: string
  value: number
  perWeek: number
}

const PRESETS: Preset[] = [
  { id: 'coffee', name: 'Coffee out', emoji: '☕', value: 4, perWeek: 5 },
  { id: 'eatout', name: 'Eating out', emoji: '🍽️', value: 10, perWeek: 4 },
  { id: 'transport', name: 'Public transport', emoji: '🚇', value: 2.9, perWeek: 3 },
  { id: 'groceries', name: 'Pricey groceries', emoji: '🛒', value: 10, perWeek: 2 },
  { id: 'bars', name: 'Bars & drinks', emoji: '🍺', value: 12, perWeek: 2 },
  { id: 'taxi', name: 'Taxis & rides', emoji: '🚕', value: 14, perWeek: 1 },
  { id: 'snacks', name: 'Snacks', emoji: '🍫', value: 3, perWeek: 4 },
  { id: 'subs', name: 'Subscriptions', emoji: '📺', value: 10, perWeek: 1 },
  { id: 'shopping', name: 'Impulse shopping', emoji: '🛍️', value: 25, perWeek: 1 },
]

/** Keyword-based cover image (works in a real browser; sandbox blocks it). */
export const coverUrl = (name: string, lock: number): string => {
  const tags = name.trim().split(/\s+/).filter(Boolean).join(',')
  return tags
    ? `https://loremflickr.com/800/500/${encodeURIComponent(tags)}?lock=${lock}`
    : ''
}

export default function Onboarding() {
  const { state, dispatch } = useStore()
  const [step, setStep] = useState(0)
  const { goal } = state
  const activeItems = state.habits.filter((h) => h.active).length

  const canNext =
    step === 0
      ? goal.name.trim().length > 0 && goal.targetPrice > 0
      : step === 1 || step === 2
        ? activeItems > 0
        : true

  const finish = () => {
    if (!state.account.connected) {
      dispatch({
        type: 'SET_ACCOUNT',
        patch: {
          address: DEMO_ADDRESS,
          label: 'Main account',
          connected: true,
          balance: mockBalanceFor(DEMO_ADDRESS),
          balanceChecked: true,
        },
      })
    }
    dispatch({ type: 'COMPLETE_ONBOARDING' })
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else finish()
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className="onboarding">
      <div className="onb-inner">
        <div className="topbar">
          <div className="brand">
            <span className="dot" />
            Vault
          </div>
          <span className="pill">
            Setup {step + 1}/{STEPS.length}
          </span>
        </div>

        <div className="onb-dots">
          {STEPS.map((s, i) => (
            <span key={s} className={`onb-dot ${i <= step ? 'on' : ''}`} />
          ))}
        </div>

        <div className="onb-body fade-in" key={step}>
          {step === 0 && <GoalStep />}
          {step === 1 && <PickStep />}
          {step === 2 && <DetailsStep />}
          {step === 3 && <CardStep />}
          {step === 4 && <DoneStep />}
        </div>
      </div>

      <div className="onb-actions">
        {step > 0 ? (
          <button className="btn ghost" onClick={back}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button className="btn primary" disabled={!canNext} onClick={next}>
          {step === STEPS.length - 1 ? 'Start saving' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

function GoalStep() {
  const { state, dispatch } = useStore()
  const { goal } = state
  const set = (patch: Partial<Goal>) =>
    dispatch({ type: 'UPDATE_GOAL', goal: patch })

  const [lock, setLock] = useState(1)
  const [mode, setMode] = useState<'auto' | 'cleared'>('auto')
  const [imgErr, setImgErr] = useState(false)

  // Auto-fetch a cover image from the goal name.
  useEffect(() => {
    if (mode === 'auto' && goal.name.trim()) {
      set({ imageUrl: coverUrl(goal.name, lock) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal.name, lock, mode])

  useEffect(() => setImgErr(false), [goal.imageUrl])

  return (
    <>
      <h1 className="onb-title">What are you saving for?</h1>
      <p className="muted onb-sub">
        Type it and we&rsquo;ll pull a cover image automatically.
      </p>

      <div className="onb-cover">
        {goal.imageUrl && !imgErr ? (
          <>
            <img
              src={goal.imageUrl}
              alt={goal.name}
              onError={() => setImgErr(true)}
            />
            <div className="onb-cover-actions">
              <button
                className="onb-cover-btn"
                title="Try another"
                onClick={() => {
                  setMode('auto')
                  setLock((l) => l + 1)
                }}
              >
                🔄
              </button>
              <button
                className="onb-cover-btn"
                title="Remove"
                onClick={() => {
                  setMode('cleared')
                  set({ imageUrl: '' })
                }}
              >
                ✕
              </button>
            </div>
          </>
        ) : (
          <button
            className="onb-cover-empty"
            onClick={() => {
              setMode('auto')
              setLock((l) => l + 1)
            }}
          >
            {goal.name.trim() ? '🔍 Find a cover image' : '📷 Name it first'}
          </button>
        )}
      </div>

      <div className="field">
        <label>Name</label>
        <input
          autoFocus
          value={goal.name}
          placeholder="e.g. Leica M6"
          onChange={(e) => set({ name: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Target price €</label>
        <input
          type="number"
          min="0"
          value={goal.targetPrice || ''}
          placeholder="3000"
          onChange={(e) => set({ targetPrice: Number(e.target.value) || 0 })}
        />
      </div>
    </>
  )
}

function PickStep() {
  const { state, dispatch } = useStore()

  const isOn = (id: string) =>
    state.habits.some((h) => h.id === id && h.active)

  const toggle = (p: Preset) => {
    const existing = state.habits.find((h) => h.id === p.id)
    if (existing) {
      dispatch({ type: 'UPDATE_HABIT', id: p.id, patch: { active: !existing.active } })
    } else {
      dispatch({
        type: 'ADD_HABIT',
        habit: {
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          value: p.value,
          perWeek: p.perWeek,
          savePrompt: `Skipped ${p.name.toLowerCase()}?`,
          indulgePrompt: `Had ${p.name.toLowerCase()} — worth it?`,
          active: true,
        },
      })
    }
  }

  return (
    <>
      <h1 className="onb-title">What will you save on?</h1>
      <p className="muted onb-sub">
        Pick the temptations you want to resist. You&rsquo;ll set the details
        next.
      </p>

      <div className="pill-grid">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className={`cat-pill ${isOn(p.id) ? 'on' : ''}`}
            onClick={() => toggle(p)}
          >
            <span>{p.emoji}</span>
            {p.name}
            {isOn(p.id) && <span className="cat-pill-check">✓</span>}
          </button>
        ))}
      </div>
    </>
  )
}

function DetailsStep() {
  const { state, dispatch } = useStore()
  const active = state.habits.filter((h) => h.active)

  const patch = (id: string, p: Partial<Habit>) =>
    dispatch({ type: 'UPDATE_HABIT', id, patch: p })

  const addItem = () =>
    dispatch({
      type: 'ADD_HABIT',
      habit: {
        id: uid(),
        name: '',
        emoji: '💸',
        value: 5,
        perWeek: 3,
        savePrompt: 'Did you resist this expense today?',
        indulgePrompt: 'Spent on it — was it worth it?',
        active: true,
      },
    })

  return (
    <>
      <h1 className="onb-title">Set the details</h1>
      <p className="muted onb-sub">
        Price and how often you&rsquo;d normally spend — this makes your savings
        estimate accurate.
      </p>

      <div className="stack">
        {active.map((h) => (
          <div key={h.id} className="onb-item on">
            <div className="onb-item-top">
              <input
                className="onb-item-name"
                value={h.name}
                placeholder="Item name"
                onChange={(e) => patch(h.id, { name: e.target.value })}
              />
              <button
                className="onb-item-remove"
                title="Remove"
                onClick={() => patch(h.id, { active: false })}
              >
                ✕
              </button>
            </div>
            <div className="onb-item-bottom">
              <div className="onb-item-field">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={h.value || ''}
                  onChange={(e) =>
                    patch(h.id, { value: Number(e.target.value) || 0 })
                  }
                />
                <span className="onb-item-suffix">€ each</span>
              </div>
              <div className="onb-item-field">
                <input
                  type="number"
                  min="0"
                  max="7"
                  step="1"
                  value={h.perWeek ?? 0}
                  onChange={(e) =>
                    patch(h.id, { perWeek: Number(e.target.value) || 0 })
                  }
                />
                <span className="onb-item-suffix">×/week</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn block" style={{ marginTop: 12 }} onClick={addItem}>
        + Add your own
      </button>
    </>
  )
}

function CardStep() {
  const { state } = useStore()
  const { goal } = state
  const [imgErr, setImgErr] = useState(false)

  return (
    <>
      <h1 className="onb-title">Your {goal.name} card</h1>
      <p className="muted onb-sub">
        Each time you skip an expensive activity, funds move from your main
        account into this locked savings card.
      </p>

      <div className="wallet-card savings onb-cardpreview">
        <div className="wallet-top">
          <span className="wallet-kind">Savings · {goal.name}</span>
          <span className="wallet-chip">🔒</span>
        </div>
        {goal.imageUrl && !imgErr ? (
          <img
            className="onb-cardpreview-img"
            src={goal.imageUrl}
            alt={goal.name}
            onError={() => setImgErr(true)}
          />
        ) : null}
        <div className="wallet-balance">{goal.name}</div>
        <div className="wallet-sub">Goal · {eur(goal.targetPrice)}</div>
      </div>
    </>
  )
}

function DoneStep() {
  const { state } = useStore()
  const { goal } = state
  return (
    <>
      <h1 className="onb-title">Two things are ready 🎉</h1>
      <p className="muted onb-sub">
        That&rsquo;s all — here&rsquo;s what we&rsquo;ve set up for you.
      </p>

      <div className="onb-review-card">
        <div className="row" style={{ gap: 12 }}>
          <span style={{ fontSize: 26 }}>💬</span>
          <span style={{ fontSize: 14 }}>
            <strong>A daily check-up chat</strong>
            <br />
            <span className="muted">Add your entries here every day.</span>
          </span>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <span style={{ fontSize: 26 }}>🪪</span>
          <span style={{ fontSize: 14 }}>
            <strong>A {goal.name} card in your Pocket</strong>
            <br />
            <span className="muted">Where your saved funds are stored.</span>
          </span>
        </div>
      </div>
    </>
  )
}
