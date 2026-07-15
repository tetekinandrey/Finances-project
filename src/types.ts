// Domain model for the gamified savings app.
// Everything here is storage-agnostic so the same shapes can later be mirrored
// onto a Polkadot testnet (main account -> locked savings account).

export type ActionResult = 'saved' | 'indulged'

export interface Habit {
  id: string
  name: string
  emoji: string
  /** Euros moved to savings each time you resist this expense. */
  value: number
  /** Yes/no question shown at the daily check-in. */
  savePrompt: string
  /** Supportive line shown when you treat yourself instead. */
  indulgePrompt: string
  active: boolean
}

export interface Goal {
  name: string
  /** Optional motivating image (URL). Falls back to an emoji hero. */
  imageUrl: string
  emoji: string
  targetPrice: number
}

/** One answered habit on a given day. */
export interface DayAction {
  habitId: string
  result: ActionResult
  /** Signed euros: +value when saved, -value when indulged. */
  amount: number
  /** Optional reflection captured when treating yourself. */
  note?: string
  /** Was the treat worth it? Only meaningful when result === 'indulged'. */
  worthIt?: boolean | null
}

export interface DayEntry {
  /** ISO date, YYYY-MM-DD (local). */
  date: string
  actions: DayAction[]
}

export interface AppState {
  goal: Goal
  habits: Habit[]
  entries: DayEntry[]
  /** How treating yourself affects the plan. */
  penalizeIndulgence: boolean
}
