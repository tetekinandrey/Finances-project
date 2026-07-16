# Vault — gamified savings

Save for something real by *not* spending on the small stuff. You pick a goal
(a Leica M6, a trip, whatever), and every day the app asks whether you skipped
the little expenses — coffee, eating out, an U-Bahn ticket, the pricey grocery
run. Each thing you resist gets banked into a locked "vault". When the vault
reaches the goal, it unlocks.

The twist: treating yourself is fine. If you *did* buy the coffee, the app
doesn't scold you — it asks "was it worth it?" so the indulgence stays
intentional and guilt-free. It just costs the plan.

> **Status:** frontend + full logic with fictional euro values, **plus a live
> Polkadot (Paseo testnet) layer** that moves real test coins from your wallet
> into an app-generated vault account on every save. See "Polkadot layer" below.

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
  types.ts        domain model (Habit, Goal, DayEntry, Account, Vault, TxRecord…)
  seed.ts         default goal + habits + mocked balance helper
  logic.ts        balance, progress, estimates (pure functions)
  store.tsx       reducer + localStorage persistence
  sample.ts       demo history generator
  chain.ts        Polkadot/Paseo service (connect, balances, vault, transfer)
  useTransfer.ts  hook: turn a saved euro into an on-chain transfer
  components/     Home · CheckIn · Habits · GoalSettings · History · Onboarding · Chain
```

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Polkadot layer (Paseo testnet)

The **Chain** tab wires the app to the [Paseo](https://paseo.subscan.io/)
testnet via `@polkadot/api`. Every euro you bank triggers a **real on-chain
transfer** from your wallet account into an app-generated vault account.

How it works:

1. **Connect a wallet.** Connect Polkadot.js / Talisman / SubWallet
   (`@polkadot/extension-dapp`) and pick the account funds come from.
2. **Fund it.** Grab free PAS from the faucet (linked in-app:
   `faucet.polkadot.io`, Paseo network).
3. **Vault account.** The app generates a dedicated sr25519 keypair — the
   locked savings vault. It receives every transfer; its Subscan page is linked
   in-app.
4. **Transfer on save.** Each check-in "I saved" (or the *Send test transfer*
   button) signs a `balances.transferKeepAlive` in your extension and submits
   it. The euro amount maps to PAS via `tokensPerEuro` (default 0.1); the first
   transfer into an empty vault is topped up to the existential deposit.
5. **Track.** The transfer log shows each tx's status (pending → in-block →
   finalized) with a Subscan link.

> ⚠️ **Testnet prototype.** The vault key is generated and stored in
> `localStorage` in plaintext — fine for Paseo test coins, never for real funds.

### Verifying transfers

The bundled preview browser and CI sandboxes block outbound WebSockets, so the
live chain must be exercised in a normal browser:

```bash
npm run dev            # then open http://localhost:5173 in Chrome
```

Install the Polkadot.js extension, create/import a Paseo account, fund it from
the faucet, then open the **Chain** tab → *Connect wallet* → *Send test
transfer*. Confirm the extrinsic on [paseo.subscan.io](https://paseo.subscan.io/).

### Next steps

- **On-chain locking.** Today the "lock" is enforced in the UI. A vesting
  pallet or ink! escrow contract would make it cryptographic.
- **Unlock flow.** The app holds the vault key, so it can already sign the
  vault → main transfer when the goal is reached — a UI for it is the next add.
