import type { AppState, Habit } from './types'
import { todayISO } from './logic'

export const uid = (): string =>
  'id-' + Math.random().toString(36).slice(2, 10)

const defaultHabits: Habit[] = [
  {
    id: 'coffee',
    name: 'Coffee out',
    emoji: '☕',
    value: 4,
    savePrompt: 'Skipped buying coffee today?',
    indulgePrompt: 'Enjoyed a coffee — was it worth it?',
    active: true,
  },
  {
    id: 'eatout',
    name: 'Eating out',
    emoji: '🍽️',
    value: 10,
    savePrompt: 'Cooked at home instead of eating out?',
    indulgePrompt: 'Ate out today — was it worth it?',
    active: true,
  },
  {
    id: 'transport',
    name: 'U-Bahn ticket',
    emoji: '🚇',
    value: 2.9,
    savePrompt: 'Walked or biked instead of buying a ticket?',
    indulgePrompt: 'Took the U-Bahn — was it worth it?',
    active: true,
  },
  {
    id: 'groceries',
    name: 'Smart groceries',
    emoji: '🛒',
    value: 10,
    savePrompt: 'Shopped at Lidl / Aldi / Penny instead of Rewe / Edeka?',
    indulgePrompt: 'Shopped at the pricey store — was it worth it?',
    active: true,
  },
]

export const defaultState: AppState = {
  goal: {
    name: 'Leica M6',
    imageUrl: '',
    emoji: '📷',
    targetPrice: 3000,
  },
  habits: defaultHabits,
  entries: [],
  penalizeIndulgence: true,
  account: {
    address: '',
    label: '',
    connected: false,
    balance: 0,
    balanceChecked: false,
  },
  onboarded: false,
  vault: { address: '', mnemonic: '' },
  tokensPerEuro: 0.1,
  transfers: [],
  simDate: todayISO(),
}

/** A well-known Polkadot test address, used for the "demo account" button. */
export const DEMO_ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'

export const shortAddress = (a: string): string =>
  a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a

/**
 * Deterministic mocked balance for an address (~€800–€6,300, with cents).
 * Stands in for a real on-chain balance query until phase 2.
 */
export function mockBalanceFor(address: string): number {
  let h = 0
  for (let i = 0; i < address.length; i++) h = (h * 31 + address.charCodeAt(i)) >>> 0
  const euros = 800 + (h % 5500)
  const cents = h % 100
  return euros + cents / 100
}
