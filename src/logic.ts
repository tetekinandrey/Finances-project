import type { AppState, DayEntry, Habit } from './types'

export const todayISO = (): string => {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10)
}

export const eur = (n: number): string =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

/** Locked savings balance = sum of every signed action amount. */
export const balance = (state: AppState): number =>
  state.entries.reduce(
    (sum, e) => sum + e.actions.reduce((s, a) => s + a.amount, 0),
    0,
  )

/** Euros you can still bank in a single perfect day. */
export const dailyPotential = (habits: Habit[]): number =>
  habits.filter((h) => h.active).reduce((s, h) => s + h.value, 0)

export const remaining = (state: AppState): number =>
  Math.max(0, state.goal.targetPrice - balance(state))

export const progress = (state: AppState): number => {
  if (state.goal.targetPrice <= 0) return 0
  return Math.max(0, Math.min(1, balance(state) / state.goal.targetPrice))
}

export const isUnlocked = (state: AppState): boolean =>
  balance(state) >= state.goal.targetPrice && state.goal.targetPrice > 0

/** Average net euros banked per recorded day (actual pace). */
export const currentPace = (state: AppState): number => {
  if (state.entries.length === 0) return 0
  const total = balance(state)
  return total / state.entries.length
}

export const findEntry = (
  entries: DayEntry[],
  date: string,
): DayEntry | undefined => entries.find((e) => e.date === date)

export interface Estimates {
  /** Days if you bank the full potential every day. */
  daysAtPotential: number | null
  /** Days at your actual recorded pace. */
  daysAtPace: number | null
  /** How many of this habit you'd need to skip to close the gap. */
  skipsToGoal: (habit: Habit) => number
}

export const estimates = (state: AppState): Estimates => {
  const rem = remaining(state)
  const potential = dailyPotential(state.habits)
  const pace = currentPace(state)
  return {
    daysAtPotential: potential > 0 ? Math.ceil(rem / potential) : null,
    daysAtPace: pace > 0 ? Math.ceil(rem / pace) : null,
    skipsToGoal: (habit) =>
      habit.value > 0 ? Math.ceil(rem / habit.value) : 0,
  }
}

export const addDays = (iso: string, days: number): Date => {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d
}

export const formatDate = (iso: string): string =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
