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

/**
 * The funding account. Today it holds a pasted/demo address; in phase 2 this
 * maps to a real Polkadot account. Saved funds move from here into a locked,
 * per-goal "item vault".
 */
export interface Account {
  address: string
  label: string
  connected: boolean
  /** Available funds in the account (mocked until phase 2). */
  balance: number
  /** Whether the balance has been fetched/verified. */
  balanceChecked: boolean
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

export type TxStatus = 'pending' | 'inBlock' | 'finalized' | 'failed'

/** A record of one on-chain transfer (main account → vault). */
export interface TxRecord {
  hash: string
  from: string
  to: string
  /** Amount in plancks, stored as a string (bigint isn't JSON-safe). */
  planck: string
  euro: number
  status: TxStatus
  ts: number
  habitId?: string
}

/** App-generated, testnet-only vault keypair. */
export interface Vault {
  address: string
  /** Plaintext mnemonic — acceptable for a testnet prototype only. */
  mnemonic: string
}

export interface AppState {
  goal: Goal
  habits: Habit[]
  entries: DayEntry[]
  /** How treating yourself affects the plan. */
  penalizeIndulgence: boolean
  /** Funding account (main account → locked item vault). */
  account: Account
  /** Whether the first-run setup wizard has been completed. */
  onboarded: boolean
  /** On-chain vault that receives saved funds on the Paseo testnet. */
  vault: Vault
  /** How many test tokens one euro of savings maps to on-chain. */
  tokensPerEuro: number
  /** Log of on-chain transfers. */
  transfers: TxRecord[]
}
