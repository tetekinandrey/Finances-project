import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  Account,
  AppState,
  DayAction,
  Goal,
  Habit,
  TxRecord,
  TxStatus,
  Vault,
} from './types'
import { defaultState } from './seed'
import { findEntry, todayISO } from './logic'

const STORAGE_KEY = 'finances-savings-v1'

type Action =
  | { type: 'RECORD'; date: string; action: DayAction }
  | { type: 'CLEAR_DAY_HABIT'; date: string; habitId: string }
  | { type: 'UPDATE_GOAL'; goal: Partial<Goal> }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; id: string; patch: Partial<Habit> }
  | { type: 'REMOVE_HABIT'; id: string }
  | { type: 'SET_PENALIZE'; value: boolean }
  | { type: 'SET_ACCOUNT'; patch: Partial<Account> }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'SET_VAULT'; vault: Vault }
  | { type: 'ADD_TRANSFER'; tx: TxRecord }
  | { type: 'UPDATE_TRANSFER'; hash: string; status: TxStatus }
  | { type: 'RESET' }
  | { type: 'IMPORT'; state: AppState }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'RECORD': {
      const entries = state.entries.slice()
      const existing = findEntry(entries, action.date)
      if (existing) {
        const actions = existing.actions.filter(
          (a) => a.habitId !== action.action.habitId,
        )
        actions.push(action.action)
        const idx = entries.indexOf(existing)
        entries[idx] = { ...existing, actions }
      } else {
        entries.push({ date: action.date, actions: [action.action] })
      }
      entries.sort((a, b) => a.date.localeCompare(b.date))
      return { ...state, entries }
    }
    case 'CLEAR_DAY_HABIT': {
      const entries = state.entries
        .map((e) =>
          e.date === action.date
            ? { ...e, actions: e.actions.filter((a) => a.habitId !== action.habitId) }
            : e,
        )
        .filter((e) => e.actions.length > 0)
      return { ...state, entries }
    }
    case 'UPDATE_GOAL':
      return { ...state, goal: { ...state.goal, ...action.goal } }
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] }
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id ? { ...h, ...action.patch } : h,
        ),
      }
    case 'REMOVE_HABIT':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) }
    case 'SET_PENALIZE':
      return { ...state, penalizeIndulgence: action.value }
    case 'SET_ACCOUNT':
      return { ...state, account: { ...state.account, ...action.patch } }
    case 'COMPLETE_ONBOARDING':
      // Drop half-added items with no name so they don't render as blank cards.
      return {
        ...state,
        onboarded: true,
        habits: state.habits.filter((h) => h.name.trim().length > 0),
      }
    case 'SET_VAULT':
      return { ...state, vault: action.vault }
    case 'ADD_TRANSFER':
      return { ...state, transfers: [action.tx, ...state.transfers] }
    case 'UPDATE_TRANSFER':
      return {
        ...state,
        transfers: state.transfers.map((t) =>
          t.hash === action.hash ? { ...t, status: action.status } : t,
        ),
      }
    case 'RESET':
      return defaultState
    case 'IMPORT':
      return action.state
    default:
      return state
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<AppState>
    // Existing installs predate onboarding — treat them as already set up.
    return { ...defaultState, ...parsed, onboarded: parsed.onboarded ?? true }
  } catch {
    return defaultState
  }
}

interface Ctx {
  state: AppState
  dispatch: React.Dispatch<Action>
  today: string
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors */
    }
  }, [state])

  return (
    <StoreContext.Provider value={{ state, dispatch, today: todayISO() }}>
      {children}
    </StoreContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): Ctx {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
