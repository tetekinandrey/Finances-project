import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../store'
import {
  type ChainInfo,
  FAUCET_URL,
  chainInfo,
  enableWallet,
  explorerAccount,
  explorerTx,
  formatToken,
  freeBalance,
  generateVault,
  toChainFormat,
} from '../chain'
import { shortAddress } from '../seed'
import { useTransfer } from '../useTransfer'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

export default function Chain() {
  const { state, dispatch } = useStore()
  const { account, vault } = state
  const send = useTransfer()

  const [info, setInfo] = useState<ChainInfo | null>(null)
  const [netError, setNetError] = useState('')
  const [wallets, setWallets] = useState<InjectedAccountWithMeta[] | null>(null)
  const [walletError, setWalletError] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [mainBal, setMainBal] = useState<bigint | null>(null)
  const [vaultBal, setVaultBal] = useState<bigint | null>(null)
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState('')

  // Connect + read chain metadata, and generate the vault if missing.
  useEffect(() => {
    let alive = true
    const timeout = new Promise<never>((_, rej) =>
      setTimeout(
        () => rej(new Error('Could not reach Paseo — network blocked or offline.')),
        20000,
      ),
    )
    Promise.race([chainInfo(), timeout])
      .then((i) => alive && setInfo(i as ChainInfo))
      .catch((e) => alive && setNetError(String(e?.message ?? e)))
    if (!vault.address) {
      generateVault()
        .then((v) => alive && dispatch({ type: 'SET_VAULT', vault: v }))
        .catch(() => {})
    }
    return () => {
      alive = false
    }
  }, [vault.address, dispatch])

  const refreshBalances = useCallback(async () => {
    if (account.address) freeBalance(account.address).then(setMainBal).catch(() => {})
    if (vault.address) freeBalance(vault.address).then(setVaultBal).catch(() => {})
  }, [account.address, vault.address])

  useEffect(() => {
    refreshBalances()
  }, [refreshBalances, state.transfers.length])

  const fmt = (p: bigint | null) =>
    info && p != null ? formatToken(p, info.decimals, info.token) : '—'

  const connectWallet = async () => {
    setConnecting(true)
    setWalletError('')
    try {
      const accs = await enableWallet()
      setWallets(accs)
      if (accs.length === 0) setWalletError('No accounts found in your wallet.')
    } catch (e) {
      setWalletError(String((e as Error)?.message ?? e))
    } finally {
      setConnecting(false)
    }
  }

  const pickAccount = (a: InjectedAccountWithMeta) => {
    dispatch({
      type: 'SET_ACCOUNT',
      patch: {
        address: a.address,
        label: a.meta.name || 'Wallet account',
        connected: true,
        balanceChecked: true,
      },
    })
    setWallets(null)
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1200)
  }

  const sendTest = async () => {
    setSending(true)
    try {
      await send(4, undefined) // ≈ one coffee
      await refreshBalances()
    } catch (e) {
      alert(`Transfer failed: ${(e as Error)?.message ?? e}`)
    } finally {
      setSending(false)
    }
  }

  const vaultAddr = info ? toChainFormat(vault.address, info.ss58) : vault.address

  return (
    <div className="fade-in stack">
      <div className="checkin-head">
        <h2>Polkadot</h2>
        <div className="muted">Real transfers on the Paseo testnet</div>
      </div>

      {/* Network */}
      <div className="card">
        <div className="row between">
          <span className="muted">Network</span>
          {netError ? (
            <span className="pill" style={{ color: 'var(--danger)' }}>
              ⚠ offline
            </span>
          ) : info ? (
            <span className="pill connected">
              🟢 Paseo · #{info.blockNumber.toLocaleString()}
            </span>
          ) : (
            <span className="pill">Connecting…</span>
          )}
        </div>
        {netError && (
          <div className="faint" style={{ fontSize: 12, marginTop: 8 }}>
            {netError}
          </div>
        )}
      </div>

      {/* Wallet / main account */}
      <div className="section-title">Main account</div>
      <div className="card stack">
        {account.connected ? (
          <>
            <div className="row between">
              <div className="row" style={{ gap: 10 }}>
                <span style={{ fontSize: 20 }}>🔗</span>
                <div>
                  <div style={{ fontWeight: 650 }}>{account.label}</div>
                  <div className="faint" style={{ fontSize: 12 }}>
                    {shortAddress(account.address)}
                  </div>
                </div>
              </div>
              <strong>{fmt(mainBal)}</strong>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button
                className="btn grow"
                onClick={() => copy(account.address, 'main')}
              >
                {copied === 'main' ? 'Copied ✓' : 'Copy address'}
              </button>
              <a
                className="btn grow"
                href={FAUCET_URL}
                target="_blank"
                rel="noreferrer"
              >
                💧 Get test coins
              </a>
            </div>
            <button className="btn ghost" onClick={connectWallet}>
              Switch account
            </button>
          </>
        ) : (
          <>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              Connect a Polkadot wallet (Polkadot.js, Talisman or SubWallet) to
              use as the account funds are transferred from.
            </p>
            <button
              className="btn primary block"
              onClick={connectWallet}
              disabled={connecting}
            >
              {connecting ? 'Connecting…' : 'Connect wallet'}
            </button>
          </>
        )}

        {walletError && (
          <div className="faint" style={{ fontSize: 12, color: 'var(--warn)' }}>
            {walletError}
          </div>
        )}

        {wallets && wallets.length > 0 && (
          <div className="wallet-list fade-in">
            {wallets.map((a) => (
              <button
                key={a.address}
                className="wallet-item"
                onClick={() => pickAccount(a)}
              >
                <div style={{ fontWeight: 600 }}>{a.meta.name}</div>
                <div className="faint" style={{ fontSize: 12 }}>
                  {shortAddress(a.address)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vault */}
      <div className="section-title">Savings vault (on-chain)</div>
      <div className="card stack">
        <div className="row between">
          <div className="row" style={{ gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <div>
              <div style={{ fontWeight: 650 }}>{state.goal.name} vault</div>
              <div className="faint" style={{ fontSize: 12 }}>
                {vault.address ? shortAddress(vaultAddr) : 'creating…'}
              </div>
            </div>
          </div>
          <strong style={{ color: 'var(--accent)' }}>{fmt(vaultBal)}</strong>
        </div>
        {vault.address && (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn grow" onClick={() => copy(vaultAddr, 'vault')}>
              {copied === 'vault' ? 'Copied ✓' : 'Copy address'}
            </button>
            <a
              className="btn grow"
              href={explorerAccount(vaultAddr)}
              target="_blank"
              rel="noreferrer"
            >
              🔎 View on Subscan
            </a>
          </div>
        )}
      </div>

      {/* Transfer */}
      <button
        className="btn primary block lg"
        disabled={!account.connected || !vault.address || sending || !!netError}
        onClick={sendTest}
      >
        {sending ? 'Sending…' : 'Send a test transfer (≈ one coffee)'}
      </button>
      {!account.connected && (
        <div className="faint" style={{ fontSize: 12, textAlign: 'center' }}>
          Connect your wallet first, then fund it from the faucet.
        </div>
      )}

      {/* Transfer log */}
      {state.transfers.length > 0 && (
        <>
          <div className="section-title">Transfers</div>
          <div className="stack">
            {state.transfers.map((t) => (
              <a
                key={t.hash}
                className="card tx-row"
                href={explorerTx(t.hash)}
                target="_blank"
                rel="noreferrer"
              >
                <div className="row between">
                  <span style={{ fontWeight: 600 }}>
                    {info ? formatToken(BigInt(t.planck), info.decimals, info.token) : `${t.euro} €`}
                  </span>
                  <span className={`tx-status ${t.status}`}>{t.status}</span>
                </div>
                <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>
                  {shortAddress(t.from)} → {shortAddress(t.to)} · {t.hash.slice(0, 10)}…
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      <p className="faint onb-note">
        🔐 Testnet prototype. The vault key is generated and stored locally in
        plaintext — never use this with real funds.
      </p>
    </div>
  )
}
