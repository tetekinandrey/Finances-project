import { useState } from 'react'
import { useStore } from '../store'
import { eur } from '../logic'
import { DEMO_ADDRESS, shortAddress, uid } from '../seed'
import type { Goal, Habit } from '../types'

const STEPS = ['Goal', 'Items', 'Account', 'Review']

export default function Onboarding() {
  const { state, dispatch } = useStore()
  const [step, setStep] = useState(0)
  const { goal, account } = state
  const activeItems = state.habits.filter((h) => h.active).length

  const canNext =
    step === 0
      ? goal.name.trim().length > 0 && goal.targetPrice > 0
      : step === 1
        ? activeItems > 0
        : step === 2
          ? account.connected && account.address.trim().length > 0
          : true

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else dispatch({ type: 'COMPLETE_ONBOARDING' })
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
          <span className="pill">Setup {step + 1}/{STEPS.length}</span>
        </div>

        <div className="onb-dots">
          {STEPS.map((s, i) => (
            <span key={s} className={`onb-dot ${i <= step ? 'on' : ''}`} />
          ))}
        </div>

        <div className="onb-body fade-in" key={step}>
          {step === 0 && <GoalStep />}
          {step === 1 && <ItemsStep />}
          {step === 2 && <AccountStep />}
          {step === 3 && <ReviewStep />}
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

  return (
    <>
      <h1 className="onb-title">What are you saving for?</h1>
      <p className="muted onb-sub">
        Pick the one thing that will keep you motivated.
      </p>

      <div className="onb-preview">
        {goal.imageUrl ? (
          <img src={goal.imageUrl} alt={goal.name} />
        ) : (
          <div className="onb-preview-emoji">{goal.emoji || '🎯'}</div>
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
      <div className="row" style={{ gap: 10 }}>
        <div className="field" style={{ width: 84 }}>
          <label>Emoji</label>
          <input
            value={goal.emoji}
            maxLength={2}
            style={{ textAlign: 'center' }}
            onChange={(e) => set({ emoji: e.target.value })}
          />
        </div>
        <div className="field grow">
          <label>Target price €</label>
          <input
            type="number"
            min="0"
            value={goal.targetPrice || ''}
            placeholder="3000"
            onChange={(e) => set({ targetPrice: Number(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="field">
        <label>Image URL (optional)</label>
        <input
          value={goal.imageUrl}
          placeholder="https://…"
          onChange={(e) => set({ imageUrl: e.target.value })}
        />
      </div>
    </>
  )
}

function ItemsStep() {
  const { state, dispatch } = useStore()

  const addItem = () =>
    dispatch({
      type: 'ADD_HABIT',
      habit: {
        id: uid(),
        name: '',
        emoji: '💸',
        value: 5,
        savePrompt: 'Did you resist this expense today?',
        indulgePrompt: 'Spent on it — was it worth it?',
        active: true,
      },
    })

  const patch = (id: string, p: Partial<Habit>) =>
    dispatch({ type: 'UPDATE_HABIT', id, patch: p })

  return (
    <>
      <h1 className="onb-title">What will you save on?</h1>
      <p className="muted onb-sub">
        Each day you skip one of these, its value goes to your vault. Keep the
        ones that fit, tweak the amounts, or add your own.
      </p>

      <div className="stack">
        {state.habits.map((h) => (
          <div key={h.id} className={`onb-item ${h.active ? 'on' : ''}`}>
            <input
              className="onb-item-emoji"
              value={h.emoji}
              maxLength={2}
              onChange={(e) => patch(h.id, { emoji: e.target.value })}
            />
            <input
              className="onb-item-name"
              value={h.name}
              placeholder="Item name"
              onChange={(e) => patch(h.id, { name: e.target.value })}
            />
            <div className="onb-item-val">
              <input
                type="number"
                min="0"
                step="0.1"
                value={h.value || ''}
                onChange={(e) =>
                  patch(h.id, { value: Number(e.target.value) || 0 })
                }
              />
              <span className="onb-item-cur">€</span>
            </div>
            <Toggle
              on={h.active}
              onChange={(v) => patch(h.id, { active: v })}
            />
          </div>
        ))}
      </div>

      <button className="btn block" style={{ marginTop: 12 }} onClick={addItem}>
        + Add your own
      </button>
    </>
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

function AccountStep() {
  const { state, dispatch } = useStore()
  const { account, goal } = state

  const connectDemo = () =>
    dispatch({
      type: 'SET_ACCOUNT',
      patch: { address: DEMO_ADDRESS, label: 'Demo account', connected: true },
    })

  const onAddress = (address: string) =>
    dispatch({
      type: 'SET_ACCOUNT',
      patch: {
        address,
        label: account.label || 'Polkadot account',
        connected: address.trim().length > 0,
      },
    })

  return (
    <>
      <h1 className="onb-title">Connect your account</h1>
      <p className="muted onb-sub">
        This is the account your funds come from. Every euro you save moves into
        a locked <strong>{goal.name || 'goal'} vault</strong> inside it — you
        can&rsquo;t spend it until you hit {eur(goal.targetPrice || 0)}.
      </p>

      <div className="field">
        <label>Account address</label>
        <input
          value={account.address}
          placeholder="5Grwva…  (Polkadot address)"
          onChange={(e) => onAddress(e.target.value)}
        />
      </div>

      <button className="btn block" onClick={connectDemo}>
        ⚡ Use a demo account
      </button>

      {account.connected && (
        <div className="onb-account-card fade-in">
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
            <span className="pill connected">Connected</span>
          </div>
        </div>
      )}

      <p className="faint onb-note">
        🔒 Testnet only for now — no real funds move. Real Polkadot transfers
        come in a later update.
      </p>
    </>
  )
}

function ReviewStep() {
  const { state } = useStore()
  const { goal, account } = state
  const items = state.habits.filter((h) => h.active)
  return (
    <>
      <h1 className="onb-title">You&rsquo;re all set</h1>
      <p className="muted onb-sub">
        Here&rsquo;s your plan. You can change any of it later.
      </p>

      <div className="onb-review-card">
        <div className="row between">
          <span className="muted">Saving for</span>
          <strong>
            {goal.emoji} {goal.name}
          </strong>
        </div>
        <div className="row between">
          <span className="muted">Target</span>
          <strong>{eur(goal.targetPrice)}</strong>
        </div>
        <div className="row between">
          <span className="muted">Saving on</span>
          <strong>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </strong>
        </div>
        <div className="row between">
          <span className="muted">Account</span>
          <strong>{shortAddress(account.address)}</strong>
        </div>
        <div className="row between">
          <span className="muted">Item vault</span>
          <span className="pill">🔒 {goal.name} · €0 locked</span>
        </div>
      </div>

      <p className="faint onb-note">
        Each day, mark what you skipped — the value moves into your locked
        vault. Reach {eur(goal.targetPrice)} and it unlocks.
      </p>
    </>
  )
}
