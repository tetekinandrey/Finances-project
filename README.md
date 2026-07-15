# Vault — gamified savings

Save for something real by *not* spending on the small stuff. You pick a goal
(a Leica M6, a trip, whatever), and every day the app asks whether you skipped
the little expenses — coffee, eating out, an U-Bahn ticket, the pricey grocery
run. Each thing you resist gets banked into a locked "vault". When the vault
reaches the goal, it unlocks.

The twist: treating yourself is fine. If you *did* buy the coffee, the app
doesn't scold you — it asks "was it worth it?" so the indulgence stays
intentional and guilt-free. It just costs the plan.

> **Status:** frontend + full logic with fictional values (this repo today).
> A Polkadot testnet layer for the actual locked-savings mechanic comes next —
> see the roadmap below.

## What it does

- **Goal** — name, price, and a motivating image/emoji (default: Leica M6, €3000).
- **Daily check-in** — for each habit: *"I saved"* (bank the value) or
  *"I treated myself"* (guilt-free, was it worth it?). Saving adds to the vault;
  treating subtracts (toggleable).
- **Progress** — a ring shows how much of the goal is banked, plus a locked
  "savings vault" that only unlocks at 100%.
- **Estimates** — "how many coffees left to skip", days-to-goal at your best
  pace, and a projected unlock date.
- **Habits** — fully editable: value, emoji, prompts, add your own.
- **History** — every logged day, per-habit chips, and a vault-vs-goal chart.

All state is stored in `localStorage` — no backend, no account. Use *History →
Generate 14 sample days* to see it populated.

## Tech

- Vite + React + TypeScript
- No runtime dependencies beyond React — logic lives in plain modules so it can
  later be mirrored onto a chain.

```
src/
  types.ts        domain model (Habit, Goal, DayEntry…)
  seed.ts         default goal + habits
  logic.ts        balance, progress, estimates (pure functions)
  store.tsx       reducer + localStorage persistence
  sample.ts       demo history generator
  components/     Home · CheckIn · Habits · GoalSettings · History · ProgressRing
```

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Roadmap — Polkadot layer

The current vault is a number in `localStorage`. The plan is to make it real on
a Polkadot testnet (Westend / Paseo, or a local `substrate-contracts-node`):

1. **Main account → savings account.** Each "saved" day triggers a transfer of
   the fictional-then-real amount from your main account into a savings account.
   Treating yourself transfers back out.
2. **Locked savings.** Funds in the savings account are time/goal-locked (via a
   vesting/escrow pallet or an ink! smart contract) so they can't be spent until
   the goal balance is reached.
3. **Unlock on goal.** When the balance hits the target, the contract releases
   the funds.
4. **Integration.** `@polkadot/api` + a wallet extension (Talisman /
   polkadot-js) wired behind the same `store` interface used today, so the UI
   barely changes.

The domain types in `src/types.ts` are intentionally chain-friendly (signed
amounts, per-day ledgers) to make this migration mechanical.
