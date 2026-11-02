import type { WalletSummary } from '../../services/payments'

interface WalletPayPanelProps {
  amount: number
  currency?: string
  wallet: WalletSummary | null
  walletError?: string
  paying?: boolean
  disabled?: boolean
  error?: string
  onPay: () => void
  onRetryWallet?: () => void
}

function money(amount: number, currency?: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
  return `${symbol}${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * The single payment surface for the app: shows the centralized MCOM Wallet
 * balance and charges it. There are no card fields here — cards and PayPal are
 * handled by Central Hub when the customer tops up their wallet.
 */
export default function WalletPayPanel({
  amount,
  currency,
  wallet,
  walletError,
  paying,
  disabled,
  error,
  onPay,
  onRetryWallet,
}: WalletPayPanelProps) {
  const balance = wallet?.availableBalance ?? 0
  const isFree = amount <= 0
  const walletActive = wallet?.enabled === true && String(wallet.status || '').toUpperCase() === 'ACTIVE'
  const insufficient = !isFree && walletActive && balance + 1e-9 < amount

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment method</p>
          <h3 className="mt-1 text-base font-extrabold text-gray-900">MCOM Wallet</h3>
          <p className="mt-1 text-xs text-gray-500">
            Pay instantly from your centralized MCOM credits. 1 MCOM = £1.00.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
          Central Hub
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Available</p>
          <p className="mt-1 text-lg font-extrabold text-gray-900">
            {walletError ? '—' : `${balance.toFixed(2)} MCOM`}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Due now</p>
          <p className="mt-1 text-lg font-extrabold text-gray-900">{money(amount, currency)}</p>
        </div>
      </div>

      {walletError && (
        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
          {walletError}
          {onRetryWallet && (
            <button type="button" onClick={onRetryWallet} className="ml-2 font-bold underline">
              Retry
            </button>
          )}
        </div>
      )}

      {wallet?.enabled === false && (
        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
          Wallet payments are not configured on this environment.
        </div>
      )}

      {wallet?.enabled === true && !walletActive && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          Your MCOM Wallet is {wallet.status?.toLowerCase() || 'unavailable'}. Contact MCOM support before paying.
        </div>
      )}

      {insufficient && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          Your wallet balance is too low for this payment.{' '}
          {wallet?.topUpUrl && (
            <a
              href={wallet.topUpUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline underline-offset-2"
            >
              Top up on Central Hub
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600">{error}</div>
      )}

      <button
        type="button"
        onClick={onPay}
        disabled={paying || disabled || (!isFree && !walletActive) || insufficient}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {paying
          ? 'Paying from MCOM Wallet…'
          : isFree
            ? 'Activate free plan'
            : insufficient
              ? 'Top up your wallet to continue'
              : `Pay ${money(amount, currency)} from MCOM Wallet`}
      </button>

      <p className="mt-3 text-center text-[11px] text-gray-400">
        Charged server-side by MCOM Pay. Need more credits?{' '}
        {wallet?.topUpUrl ? (
          <a
            href={wallet.topUpUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-blue-600 hover:underline"
          >
            Top up your wallet
          </a>
        ) : (
          'Top up from your Central Hub wallet.'
        )}
      </p>
    </div>
  )
}
