import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import BottomSheet from '../../business/primitives/BottomSheet'
import { consumerService } from '../../../services/consumer'
import {
  paymentsService,
  newIdempotencyKey,
  type WalletSummary,
} from '../../../services/payments'

interface FundCardSheetProps {
  open: boolean
  onClose: () => void
  onFunded?: (balance: number) => void
}

const quickAmounts = [10, 25, 50, 100]
const PENDING_KEY = 'vcard_pending_card_topup'

interface PendingTopUp {
  amount: number
  idempotencyKey: string
}

function loadPendingTopUp(): PendingTopUp | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingTopUp) : null
  } catch {
    return null
  }
}

function clearPendingTopUp() {
  try {
    localStorage.removeItem(PENDING_KEY)
  } catch {
    // ignore
  }
}

/**
 * Fund the VCard card balance from the centralized MCOM Wallet.
 *
 * There is no card form here: customers top up their MCOM Wallet on Central Hub
 * and this sheet only moves existing credits onto the card. Every request
 * carries an idempotency key so a retry cannot debit the wallet twice.
 */
export default function FundCardSheet({ open, onClose, onFunded }: FundCardSheetProps) {
  const [balance, setBalance] = useState(0)
  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [walletError, setWalletError] = useState('')
  const [amount, setAmount] = useState<number>(25)
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [topUpUrl, setTopUpUrl] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState('')

  useEffect(() => {
    if (!open) return
    setCustom('')
    setError('')
    setTopUpUrl('')
    const pending = loadPendingTopUp()
    if (pending) {
      setAmount(pending.amount)
      setCustom(String(pending.amount))
      setIdempotencyKey(pending.idempotencyKey)
    } else {
      setIdempotencyKey('')
    }
    setBusy(false)
    consumerService.getCardBalance().then(setBalance).catch(() => setBalance(0))
    paymentsService
      .getWallet()
      .then(setWallet)
      .catch((err: any) => setWalletError(err?.response?.data?.message || 'Could not load your MCOM Wallet.'))
  }, [open])

  const selected = amount
  const available = wallet?.availableBalance ?? 0
  const walletActive = wallet?.enabled === true && String(wallet.status || '').toUpperCase() === 'ACTIVE'
  const insufficient = walletActive && available + 1e-9 < selected

  const handleConfirm = async () => {
    if (busy) return
    if (!selected || selected <= 0) {
      toast.error('Enter an amount to add')
      return
    }
    if (!walletActive) {
      toast.error('MCOM Wallet payments are unavailable')
      return
    }

    setBusy(true)
    setError('')
    setTopUpUrl('')

    try {
      const key = idempotencyKey || newIdempotencyKey()
      setIdempotencyKey(key)
      localStorage.setItem(PENDING_KEY, JSON.stringify({ amount: selected, idempotencyKey: key }))
      const result = await paymentsService.topUpCard(selected, key)
      toast.success(`£${selected.toFixed(2)} moved from your MCOM Wallet to your card`)
      clearPendingTopUp()
      setBalance(result.cardBalance)
      setWallet((current) =>
        current ? { ...current, balance: result.walletBalance, availableBalance: result.walletBalance } : current,
      )
      onFunded?.(result.cardBalance)
      onClose()
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.error === 'WALLET_INSUFFICIENT_FUNDS') {
        setTopUpUrl(data.topUpUrl || wallet?.topUpUrl || '')
        setError(data.message || 'Your MCOM Wallet balance is too low.')
      } else {
        setError(data?.message || 'Could not move funds. Please try again.')
      }
      if (err?.response?.status && err.response.status < 500) {
        setIdempotencyKey('')
        clearPendingTopUp()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Fund Your Card">
      <div className="mb-5 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 p-5 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Card balance</p>
        <p className="mt-1 text-4xl font-extrabold">£{balance.toFixed(2)}</p>
        <p className="mt-2 text-xs text-white/80">Usable at MCOM Mall, Expo &amp; partner merchants.</p>
      </div>

      <div className="mb-5 flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">MCOM Wallet</p>
          <p className="mt-0.5 text-lg font-extrabold text-gray-900">
            {walletError ? '—' : `${available.toFixed(2)} MCOM`}
          </p>
        </div>
        {wallet?.topUpUrl && (
          <a
            href={wallet.topUpUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-accent-600 underline underline-offset-2"
          >
            Top up
          </a>
        )}
      </div>

      {busy ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-accent-500 border-t-transparent" />
          <p className="text-sm font-bold text-gray-900 dark:text-white">Moving funds from your MCOM Wallet…</p>
          <p className="mt-1 text-xs text-gray-400">£{selected.toFixed(2)}</p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm font-bold text-gray-900 dark:text-white">How much do you want to add?</p>
          <div className="mb-3 grid grid-cols-4 gap-2.5">
            {quickAmounts.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setAmount(q)
                  setCustom('')
                  setIdempotencyKey('')
                  clearPendingTopUp()
                }}
                className={`rounded-2xl border py-3 text-sm font-bold transition-colors ${
                  !custom && amount === q
                    ? 'border-accent-500 bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                    : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                £{q}
              </button>
            ))}
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              Or enter an amount
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              <span className="text-lg font-bold text-gray-400">£</span>
              <input
                type="number"
                min={1}
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value)
                  setAmount(Number(e.target.value))
                  setIdempotencyKey('')
                  clearPendingTopUp()
                }}
                placeholder="0.00"
                className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none placeholder:text-gray-300 dark:text-white dark:placeholder:text-gray-600"
              />
            </div>
          </div>

          {insufficient && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              Not enough MCOM credits.{' '}
              {topUpUrl || wallet?.topUpUrl ? (
                <a
                  href={topUpUrl || wallet?.topUpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline"
                >
                  Top up on Central Hub
                </a>
              ) : null}
            </div>
          )}

          {walletError && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              {walletError}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
              {error}
              {(topUpUrl || wallet?.topUpUrl) && (
                <a
                  href={topUpUrl || wallet?.topUpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 font-bold underline"
                >
                  Top up
                </a>
              )}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={busy || !walletActive || insufficient}
            className="min-h-[46px] w-full rounded-2xl bg-accent-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/25 transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add £{(selected || 0).toFixed(2)} from MCOM Wallet
          </button>
          <p className="mt-3 text-center text-[11px] text-gray-400">
            Funds move instantly from your centralized MCOM Wallet. Top-ups via card or PayPal happen on Central Hub.
          </p>
        </>
      )}
    </BottomSheet>
  )
}
