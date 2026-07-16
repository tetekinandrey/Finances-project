import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import {
  cryptoWaitReady,
  encodeAddress,
  mnemonicGenerate,
} from '@polkadot/util-crypto'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

// --- Paseo testnet -----------------------------------------------------------

export const PASEO_ENDPOINTS = [
  'wss://rpc.ibp.network/paseo',
  'wss://paseo.dotters.network',
  'wss://paseo.rpc.amforc.com',
]

export const SUBSCAN = 'https://paseo.subscan.io'
export const FAUCET_URL = 'https://faucet.polkadot.io/?network=paseo'

export const explorerTx = (hash: string) => `${SUBSCAN}/extrinsic/${hash}`
export const explorerAccount = (addr: string) => `${SUBSCAN}/account/${addr}`

// --- Connection --------------------------------------------------------------

let apiPromise: Promise<ApiPromise> | null = null

export function getApi(): Promise<ApiPromise> {
  if (!apiPromise) {
    const provider = new WsProvider(PASEO_ENDPOINTS)
    apiPromise = ApiPromise.create({ provider })
  }
  return apiPromise
}

export interface ChainInfo {
  decimals: number
  token: string
  ss58: number
  existentialDeposit: bigint
  blockNumber: number
}

export async function chainInfo(): Promise<ChainInfo> {
  const api = await getApi()
  const header = await api.rpc.chain.getHeader()
  return {
    decimals: api.registry.chainDecimals[0] ?? 10,
    token: api.registry.chainTokens[0] ?? 'PAS',
    ss58: api.registry.chainSS58 ?? 42,
    existentialDeposit: BigInt(api.consts.balances.existentialDeposit.toString()),
    blockNumber: header.number.toNumber(),
  }
}

export async function freeBalance(address: string): Promise<bigint> {
  const api = await getApi()
  const acc = await api.query.system.account(address)
  const free = (acc as unknown as { data: { free: { toString(): string } } })
    .data.free
  return BigInt(free.toString())
}

// --- Amount helpers ----------------------------------------------------------

/** Convert a euro amount to plancks at the given rate (tokens per €1). */
export function euroToPlanck(
  euro: number,
  tokensPerEuro: number,
  decimals: number,
): bigint {
  const microTokens = Math.round(euro * tokensPerEuro * 1_000_000)
  return (BigInt(microTokens) * 10n ** BigInt(decimals)) / 1_000_000n
}

export function formatToken(
  planck: bigint,
  decimals: number,
  token?: string,
  maxFrac = 4,
): string {
  const neg = planck < 0n
  const p = neg ? -planck : planck
  const base = 10n ** BigInt(decimals)
  const whole = (p / base).toString()
  const frac = (p % base)
    .toString()
    .padStart(decimals, '0')
    .slice(0, maxFrac)
    .replace(/0+$/, '')
  const num = `${neg ? '-' : ''}${whole}${frac ? '.' + frac : ''}`
  return token ? `${num} ${token}` : num
}

// --- Vault keypair (app-generated, testnet only) -----------------------------

export interface VaultKeys {
  address: string
  mnemonic: string
}

export async function generateVault(): Promise<VaultKeys> {
  await cryptoWaitReady()
  const mnemonic = mnemonicGenerate()
  const keyring = new Keyring({ type: 'sr25519' })
  const pair = keyring.addFromMnemonic(mnemonic)
  return { address: pair.address, mnemonic }
}

/** Re-encode any address into the chain's ss58 format for display. */
export function toChainFormat(address: string, ss58: number): string {
  try {
    return encodeAddress(address, ss58)
  } catch {
    return address
  }
}

// --- Wallet extension --------------------------------------------------------

export async function enableWallet(): Promise<InjectedAccountWithMeta[]> {
  const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp')
  const extensions = await web3Enable('Vault Savings')
  if (extensions.length === 0) {
    throw new Error(
      'No Polkadot wallet extension found. Install Polkadot.js, Talisman or SubWallet.',
    )
  }
  return web3Accounts()
}

export type TxStatus = 'pending' | 'inBlock' | 'finalized' | 'failed'

export interface TransferResult {
  hash: string
  status: TxStatus
}

/**
 * Sign (via the extension) and submit a real transfer from `from` to `to`.
 * Reports status via the callback and resolves once finalized.
 */
export async function transfer(
  from: string,
  to: string,
  planck: bigint,
  onStatus: (status: TxStatus, hash?: string) => void,
): Promise<TransferResult> {
  const api = await getApi()
  const { web3FromAddress } = await import('@polkadot/extension-dapp')
  const injector = await web3FromAddress(from)
  const tx = api.tx.balances.transferKeepAlive(to, planck)

  return new Promise<TransferResult>((resolve, reject) => {
    let hash = ''
    tx.signAndSend(
      from,
      { signer: injector.signer },
      (result) => {
        hash = tx.hash.toHex()
        if (result.dispatchError) {
          onStatus('failed', hash)
          reject(new Error('Transaction failed on-chain'))
          return
        }
        if (result.status.isReady || result.status.isBroadcast) {
          onStatus('pending', hash)
        } else if (result.status.isInBlock) {
          onStatus('inBlock', hash)
        } else if (result.status.isFinalized) {
          onStatus('finalized', hash)
          resolve({ hash, status: 'finalized' })
        }
      },
    ).catch((err) => {
      onStatus('failed', hash)
      reject(err)
    })
  })
}

/** Smallest sensible on-chain amount: the greater of `want` and the ED buffer. */
export function ensureAboveEd(
  want: bigint,
  destFree: bigint,
  ed: bigint,
): bigint {
  // A brand-new destination must receive at least the existential deposit.
  if (destFree === 0n && want < ed) return ed
  return want
}
