import { useState } from 'react'
import { useStore } from '../store'
import { balance, eur, formatDate } from '../logic'
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
    state.entries.find((e) => e.date === state.simDate)?.actions.length ?? 0
  const allDone = answeredToday >= active.length && active.length > 0

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
            {allDone
              ? 'Done for now — tap for the next day'
              : 'Coffee or ' + state.goal.name + '? Tap to answer'}
          </span>
        </span>
        <span className="chat-list-badge">{allDone ? '' : '●'}</span>
      </button>
    </div>
  )
}

function SavingsThread({ onBack }: { onBack: () => void }) {
  const { state, dispatch, today } = useStore()
  const send = useTransfer()
  const [askedMore, setAskedMore] = useState<'more' | 'none' | null>(null)

  const day = state.simDate
  const dayLabel = day === today ? 'Today' : formatDate(day)

  const active = state.habits.filter((h) => h.active)
  const coffee = state.habits.find((h) => h.id === 'coffee' && h.active)
  const duelHabit = coffee ?? active[0]
  const others = active.filter((h) => h.id !== duelHabit?.id)

  const dayEntry = state.entries.find((e) => e.date === day)
  const answerOf = (h: Habit): DayAction | undefined =>
    dayEntry?.actions.find((a) => a.habitId === h.id)

  const save = (h: Habit) => {
    dispatch({
      type: 'RECORD',
      date: day,
      action: { habitId: h.id, result: 'saved', amount: h.value },
    })
    send(h.value, h.id)?.catch((e) => console.warn('transfer failed', e))
  }
  const treat = (h: Habit) => {
    dispatch({
      type: 'RECORD',
      date: day,
      action: {
        habitId: h.id,
        result: 'indulged',
        amount: state.penalizeIndulgence ? -h.value : 0,
      },
    })
  }

  const bankedToday = dayEntry?.actions.reduce((s, a) => s + a.amount, 0) ?? 0
  const reached =
    state.goal.targetPrice > 0 && balance(state) >= state.goal.targetPrice

  const nextDay = () => {
    setAskedMore(null)
    dispatch({ type: 'ADVANCE_DAY' })
  }

  // Conversational flow state for today.
  const duelAnswer = duelHabit ? answerOf(duelHabit) : undefined
  const duelAnswered = !!duelAnswer
  const anyOtherAnswered = others.some((h) => answerOf(h))
  const othersAllAnswered = others.length > 0 && others.every((h) => answerOf(h))
  const moreState = askedMore ?? (anyOtherAnswered ? 'more' : null)
  const completed =
    duelAnswered &&
    (others.length === 0 || moreState === 'none' || othersAllAnswered)

  // Past days (before the current sim day) for scrollback.
  const past = state.entries
    .filter((e) => e.date < day)
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
          In this chat you check up daily — stay stoic about your{' '}
          {state.goal.name} savings plan. 🧘
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

        <div className="chat-day">{dayLabel}</div>

        {/* Q1 — what's up today? */}
        {duelHabit && (
          <>
            <Bubble who="app">What&rsquo;s up today?</Bubble>
            {duelAnswer ? (
              <Bubble who="me">
                {duelAnswer.result === 'saved'
                  ? `${state.goal.emoji} ${state.goal.name} — banked €${duelHabit.value}`
                  : `${duelHabit.emoji} ${duelHabit.name}, just this once`}
              </Bubble>
            ) : (
              <div className="chat-choices">
                <button
                  className="chat-choice treat"
                  onClick={() => treat(duelHabit)}
                >
                  {duelHabit.emoji} {duelHabit.name}
                </button>
                <button
                  className="chat-choice save"
                  onClick={() => save(duelHabit)}
                >
                  {state.goal.emoji} {state.goal.name}
                  <span className="chat-choice-sub">+{eur(duelHabit.value)}</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Q2 — any other villains today? (only after Q1 is answered) */}
        {duelAnswered && others.length > 0 && (
          <>
            <Bubble who="app">Any other villains today? 😈</Bubble>

            {moreState === null && (
              <div className="chat-choices">
                <button
                  className="chat-choice treat"
                  onClick={() => setAskedMore('none')}
                >
                  ✌️ No, that&rsquo;s it
                </button>
                <button
                  className="chat-choice save"
                  onClick={() => setAskedMore('more')}
                >
                  😈 There&rsquo;s more
                </button>
              </div>
            )}

            {moreState === 'none' && (
              <Bubble who="me">No, that&rsquo;s it for today</Bubble>
            )}

            {moreState === 'more' && (
              <>
                <Bubble who="me">There&rsquo;s more…</Bubble>
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
                            <button
                              className="chat-mini save"
                              onClick={() => save(h)}
                            >
                              Skip +{eur(h.value)}
                            </button>
                            <button
                              className="chat-mini treat"
                              onClick={() => treat(h)}
                            >
                              Treat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}

        {/* Completion */}
        {completed && (
          <>
            <Bubble who="app">That&rsquo;s it for {dayLabel.toLowerCase()} ✌️</Bubble>
            <Bubble who="app">
              {bankedToday > 0 ? (
                <>
                  💸 <strong>{eur(bankedToday)}</strong> transferred to your{' '}
                  {state.goal.name} savings card in Pocket 🔒
                </>
              ) : bankedToday < 0 ? (
                <>
                  📉 <strong>{eur(-bankedToday)}</strong> came off your{' '}
                  {state.goal.name} card today.
                </>
              ) : (
                <>➖ Nothing moved today — but no slip-ups either.</>
              )}
            </Bubble>

            {reached ? (
              <Bubble who="app">
                🎉 You&rsquo;ve saved the full {eur(state.goal.targetPrice)} —{' '}
                {state.goal.name} unlocked! 🔓
              </Bubble>
            ) : (
              <button className="btn primary block chat-next" onClick={nextDay}>
                → Next day
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Bubble({ who, children }: { who: 'app' | 'me'; children: React.ReactNode }) {
  return <div className={`bubble bubble-${who}`}>{children}</div>
}
