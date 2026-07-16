import { useStore } from './store'
import {
  chainInfo,
  ensureAboveEd,
  euroToPlanck,
  freeBalance,
  transfer,
} from './chain'

/**
 * Returns a `send` function that moves the euro-equivalent of a saved amount
 * from the connected main account into the on-chain vault. No-ops (returns
 * null) when the wallet isn't connected or the vault doesn't exist yet.
 */
export function useTransfer() {
  const { state, dispatch } = useStore()

  return async function send(euro: number, habitId?: string) {
    const { account, vault, tokensPerEuro } = state
    if (!account.connected || !account.address || !vault.address) return null

    const info = await chainInfo()
    const want = euroToPlanck(euro, tokensPerEuro, info.decimals)
    const destFree = await freeBalance(vault.address)
    const planck = ensureAboveEd(want, destFree, info.existentialDeposit)

    let added = false
    return transfer(account.address, vault.address, planck, (status, hash) => {
      if (!hash) return
      if (!added) {
        added = true
        dispatch({
          type: 'ADD_TRANSFER',
          tx: {
            hash,
            from: account.address,
            to: vault.address,
            planck: planck.toString(),
            euro,
            status,
            ts: Date.now(),
            habitId,
          },
        })
      } else {
        dispatch({ type: 'UPDATE_TRANSFER', hash, status })
      }
    })
  }
}
