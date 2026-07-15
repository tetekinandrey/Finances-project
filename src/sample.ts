import type { AppState, DayEntry } from './types'
import { todayISO } from './logic'

/**
 * Deterministic-ish sample history for demoing the flow.
 * Fills the last 14 days with a believable mix of saved / indulged actions.
 */
export function makeSampleHistory(state: AppState): AppState {
  const active = state.habits.filter((h) => h.active)
  const entries: DayEntry[] = []
  const base = new Date(todayISO() + 'T00:00:00')

  for (let d = 14; d >= 1; d--) {
    const day = new Date(base)
    day.setDate(day.getDate() - d)
    const date = day.toISOString().slice(0, 10)

    const actions = active
      // On any given day you tend to answer most, not all, habits.
      .filter((_, i) => (d + i) % 4 !== 0)
      .map((h, i) => {
        // Mostly saving, with the occasional guilt-free treat.
        const saved = (d * 7 + i * 3) % 5 !== 0
        return {
          habitId: h.id,
          result: saved ? ('saved' as const) : ('indulged' as const),
          amount: saved
            ? h.value
            : state.penalizeIndulgence
              ? -h.value
              : 0,
          worthIt: saved ? undefined : (d + i) % 2 === 0,
        }
      })

    if (actions.length) entries.push({ date, actions })
  }

  return { ...state, entries }
}
