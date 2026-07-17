import { useState } from 'react'
import { useStore } from '../store'
import { eur, formatDate } from '../logic'
import { useTransfer } from '../useTransfer'
import type { DayAction, Habit } from '../types'

export default function Chats({ go }: { go: (tab: string) => void }) {
  const { state } = useStore()
  const [open, setOpen] = useState(false)

  if (open) return <SavingsThread onBack={() => setOpen(false)} />

  if (!state.onboarded)
    return (
      <div className="fade-in stack">
        <div className="checkin-head">
          <h2>Chats</h2>
          <div className="muted">Your saving conversations</div>
        </div>
        <div className="card empty">
          <div style={{ fontSize: 40 }}>💬</div>
          <p className="muted">
            No conversations yet. Open the Vault app in Browse to start saving.
          </p>
          <button className="btn" onClick={() => go('browse')}>
            Go to Browse →
          </button>
        </div>
      </div>
    )

  const active = state.habits.filter((h) => h.active)
  const answeredToday =
    state.entries.find((e) => e.date === todayISOsafe())?.actions.length ?? 0

  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>Chats</h2>
        <div className="muted">Your saving conversations</div>
      </div>

      <button className="chat-list-item" onClick={() => setOpen(true)}>
        <span className="chat-avatar">{state.goal.emoji}</span>
        <span className="grow" style={{ textAlign: 'left', minWidth: 0 }}>
          <span className="chat-list-title">Savings daily check-up</span>
          <span className="chat-list-preview">
            {answeredToday >= active.length && active.length > 0
              ? "All done for today ✌️"
              : 'Coffee or ' + state.goal.name + '? Tap to answer'}
          </span>
        </span>
        <span className="chat-list-badge">
          {answeredToday < active.length ? '●' : ''}
        </span>
      </button>
    </div>
  )
}

function todayISOsafe() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10)
}

function SavingsThread({ onBack }: { onBack: () => void }) {
  const { state, dispatch, today } = useStore()
  const send = useTransfer()

  const active = state.habits.filter((h) => h.active)
  const coffee = state.habits.find((h) => h.id === 'coffee' && h.active)
  const duelHabit = coffee ?? active[0]
  const others = active.filter((h) => h.id !== duelHabit?.id)

  const entryFor = (date: string) => state.entries.find((e) => e.date === date)
  const todayEntry = entryFor(today)
  const answerOf = (h: Habit): DayAction | undefined =>
    todayEntry?.actions.find((a) => a.habitId === h.id)

  const save = (h: Habit) => {
    dispatch({
      type: 'RECORD',
      date: today,
      action: { habitId: h.id, result: 'saved', amount: h.value },
    })
    send(h.value, h.id)?.catch((e) => console.warn('transfer failed', e))
  }
  const treat = (h: Habit) => {
    dispatch({
      type: 'RECORD',
      date: today,
      action: {
        habitId: h.id,
        result: 'indulged',
        amount: state.penalizeIndulgence ? -h.value : 0,
      },
    })
  }

  const doneCount = active.filter((h) => answerOf(h)).length
  const allDone = doneCount === active.length && active.length > 0
  const bankedToday = todayEntry?.actions.reduce((s, a) => s + a.amount, 0) ?? 0

  // Past days (most recent 6, excluding today) for scrollback.
  const past = state.entries
    .filter((e) => e.date !== today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-6)

  return (
    <div className="fade-in chat-screen">
      <div className="chat-head">
        <button className="chat-back" onClick={onBack}>
          ←
        </button>
        <span className="chat-avatar sm">{state.goal.emoji}</span>
        <div>
          <div className="chat-head-title">Savings daily check-up</div>
          <div className="faint" style={{ fontSize: 12 }}>
            one question a day
          </div>
        </div>
      </div>

      <div className="chat-thread">
        <Bubble who="app">
          Every day you resist, you get closer to your {state.goal.name}. Let&rsquo;s
          go 💪
        </Bubble>

        {past.map((e) => {
          const net = e.actions.reduce((s, a) => s + a.amount, 0)
          const saved = e.actions.filter((a) => a.result === 'saved').length
          return (
            <div key={e.date} className="chat-group">
              <div className="chat-day">{formatDate(e.date)}</div>
              <Bubble who="me">
                {saved}/{e.actions.length} resisted · banked{' '}
                <strong>{eur(net)}</strong>
              </Bubble>
            </div>
          )
        })}

        <div className="chat-day">Today</div>

        {duelHabit && (
          <>
            <Bubble who="app">
              {duelHabit.emoji} {duelHabit.name} or {state.goal.emoji}{' '}
              {state.goal.name}?
            </Bubble>
            {answerOf(duelHabit) ? (
              <Bubble who="me">
                {answerOf(duelHabit)!.result === 'saved'
                  ? `${state.goal.emoji} ${state.goal.name} — banked €${duelHabit.value}`
                  : `${duelHabit.emoji} treated myself`}
              </Bubble>
            ) : (
              <div className="chat-choices">
                <button className="chat-choice treat" onClick={() => treat(duelHabit)}>
                  {duelHabit.emoji} {duelHabit.name}
                </button>
                <button className="chat-choice save" onClick={() => save(duelHabit)}>
                  {state.goal.emoji} {state.goal.name}
                  <span className="chat-choice-sub">+{eur(duelHabit.value)}</span>
                </button>
              </div>
            )}
          </>
        )}

        {others.length > 0 && (
          <Bubble who="app">And the other villains today? 😈</Bubble>
        )}

        {others.map((h) => {
          const a = answerOf(h)
          return (
            <div key={h.id} className="chat-group">
              {a ? (
                <Bubble who="me">
                  {a.result === 'saved'
                    ? `${h.emoji} skipped ${h.name.toLowerCase()} — +${eur(h.value)}`
                    : `${h.emoji} treated myself`}
                </Bubble>
              ) : (
                <div className="chat-villain">
                  <span className="chat-villain-name">
                    {h.emoji} {h.name}
                  </span>
                  <div className="chat-villain-btns">
                    <button className="chat-mini save" onClick={() => save(h)}>
                      Skip +{eur(h.value)}
                    </button>
                    <button className="chat-mini treat" onClick={() => treat(h)}>
                      Treat
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {allDone && (
          <Bubble who="app">
            That&rsquo;s it for today ✌️ You banked{' '}
            <strong style={{ color: bankedToday >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
              {eur(bankedToday)}
            </strong>
            . See you tomorrow!
          </Bubble>
        )}
      </div>
    </div>
  )
}

function Bubble({ who, children }: { who: 'app' | 'me'; children: React.ReactNode }) {
  return <div className={`bubble bubble-${who}`}>{children}</div>
}
