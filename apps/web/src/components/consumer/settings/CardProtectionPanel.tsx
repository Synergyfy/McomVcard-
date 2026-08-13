import { useState, useEffect } from 'react'
import { cardProtectionService, PROTECTED_SECTION_LABELS, ACCESS_EXPIRY_LABELS, isValidPasscode, PASSCODE_LENGTH } from '../../../services/cardProtection'
import type { CardProtectionState, ProtectedSectionKey, AccessExpiry } from '../../../services/cardProtection'
import PasscodeInput from './PasscodeInput'

interface CardProtectionPanelProps {
    cardId: string
    title?: string
    description?: string
}

type Notice = { type: 'success' | 'error'; text: string } | null

const EXPIRY_OPTIONS: AccessExpiry[] = ['never', 'today', 'week', 'month']

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" aria-label={label} />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-accent-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
        </label>
    )
}

export function SectionRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} label={label} />
        </div>
    )
}

export const inputClass = 'w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none'

export const passcodeClass = 'tracking-[0.4em] text-center font-bold'

export default function CardProtectionPanel({ cardId, title = 'Protect My Shared Card', description = 'Require a passcode to open this shared card' }: CardProtectionPanelProps) {
    const [state, setState] = useState<CardProtectionState | null>(null)
    const [enabled, setEnabled] = useState(false)
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [notice, setNotice] = useState<Notice>(null)
    const [saving, setSaving] = useState(false)

    const [showChange, setShowChange] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNew, setConfirmNew] = useState('')
    const [changeSaving, setChangeSaving] = useState(false)

    const [showDisableConfirm, setShowDisableConfirm] = useState(false)
    const [disableSaving, setDisableSaving] = useState(false)

    useEffect(() => {
        cardProtectionService.getState(cardId).then((s) => {
            setState(s)
            setEnabled(s.enabled)
        })
    }, [cardId])

    const flash = (n: Notice) => {
        setNotice(n)
        setTimeout(() => setNotice(null), 3000)
    }

    const handleToggle = async (value: boolean) => {
        if (value) {
            setEnabled(true)
        } else if (state?.hasPassword) {
            setShowDisableConfirm(true)
        } else {
            await handleDisable()
        }
    }

    const handleSave = async () => {
        if (!isValidPasscode(password) || password !== confirm || saving) return
        setSaving(true)
        const expiry = state?.accessExpiry || 'never'
        const s = await cardProtectionService.enable(cardId, password, expiry)
        setState(s)
        setEnabled(true)
        setPassword('')
        setConfirm('')
        setSaving(false)
        flash({ type: 'success', text: 'Card protection enabled' })
    }

    const handleDisable = async () => {
        if (disableSaving) return
        setDisableSaving(true)
        const s = await cardProtectionService.disable(cardId)
        setState(s)
        setEnabled(false)
        setPassword('')
        setConfirm('')
        setShowDisableConfirm(false)
        setDisableSaving(false)
        setShowChange(false)
        flash({ type: 'success', text: 'Card protection disabled' })
    }

    const handleChangePassword = async () => {
        if (!isValidPasscode(newPassword) || newPassword !== confirmNew || changeSaving) return
        if (currentPassword !== '' && !(await cardProtectionService.verify(cardId, currentPassword))) {
            flash({ type: 'error', text: 'Current passcode is incorrect' })
            return
        }
        setChangeSaving(true)
        const s = await cardProtectionService.changePassword(cardId, newPassword)
        setState(s)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNew('')
        setShowChange(false)
        setChangeSaving(false)
        flash({ type: 'success', text: 'Passcode updated successfully' })
    }

    const handleSectionToggle = async (key: ProtectedSectionKey, value: boolean) => {
        if (!state) return
        const s = await cardProtectionService.setSections(cardId, { [key]: value })
        setState(s)
    }

    const handleExpiryChange = async (expiry: AccessExpiry) => {
        if (!state) return
        const s = await cardProtectionService.updateAccess(cardId, expiry)
        setState(s)
        if (expiry === 'never') flash({ type: 'success', text: 'Access set to never expire' })
        else flash({ type: 'success', text: `Temporary access set to ${ACCESS_EXPIRY_LABELS[expiry].toLowerCase()}` })
    }

    if (!state) {
        return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    return (
        <div className="space-y-5 max-w-2xl">
            {/* Card Protection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    </div>
                    <Toggle checked={enabled} onChange={handleToggle} label={title} />
                </div>

                {enabled && !state.hasPassword && (
                    <div className="mt-5 space-y-4 pt-5 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Passcode <span className="text-red-500">*</span></span>
                            <PasscodeInput value={password} onChange={setPassword} placeholder="6-digit passcode" className={`${inputClass} ${passcodeClass} mt-1`} />
                            {password !== '' && !isValidPasscode(password) && (
                                <p className="text-xs text-red-500 mt-1.5">Passcode must be {PASSCODE_LENGTH} digits</p>
                            )}
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Confirm Passcode <span className="text-red-500">*</span></span>
                            <PasscodeInput value={confirm} onChange={setConfirm} placeholder="Re-enter passcode" className={`${inputClass} ${passcodeClass} mt-1`} />
                            {confirm !== '' && password !== confirm && (
                                <p className="text-xs text-red-500 mt-1.5">Passcodes do not match</p>
                            )}
                        </div>
                        <ExpirySelector value={state.accessExpiry} onChange={handleExpiryChange} />
                        <button
                            onClick={handleSave}
                            disabled={!isValidPasscode(password) || password !== confirm || saving}
                            className="w-full h-12 rounded-2xl bg-accent-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-transform"
                        >
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {/* Password management when enabled */}
            {enabled && state.hasPassword && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <p className="text-base font-semibold text-gray-900 dark:text-white mb-4">Passcode Management</p>

                    <ExpirySelector value={state.accessExpiry} onChange={handleExpiryChange} />

                    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                        {!showChange ? (
                            <button
                                onClick={() => setShowChange(true)}
                                className="w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Change Passcode
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Current Passcode</span>
                                    <PasscodeInput value={currentPassword} onChange={setCurrentPassword} placeholder="Current passcode" className={`${inputClass} ${passcodeClass} mt-1`} />
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">New Passcode</span>
                                    <PasscodeInput value={newPassword} onChange={setNewPassword} placeholder="New passcode" className={`${inputClass} ${passcodeClass} mt-1`} />
                                    {newPassword !== '' && !isValidPasscode(newPassword) && (
                                        <p className="text-xs text-red-500 mt-1.5">Passcode must be {PASSCODE_LENGTH} digits</p>
                                    )}
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Confirm New Passcode</span>
                                    <PasscodeInput value={confirmNew} onChange={setConfirmNew} placeholder="Re-enter new passcode" className={`${inputClass} ${passcodeClass} mt-1`} />
                                    {confirmNew !== '' && newPassword !== confirmNew && (
                                        <p className="text-xs text-red-500 mt-1.5">Passcodes do not match</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setShowChange(false); setCurrentPassword(''); setNewPassword(''); setConfirmNew('') }}
                                        className="flex-1 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 active:scale-[0.99] transition-transform"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={!isValidPasscode(newPassword) || newPassword !== confirmNew || changeSaving}
                                        className="flex-1 h-12 rounded-2xl bg-accent-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-transform"
                                    >
                                        {changeSaving ? 'Updating…' : 'Update Passcode'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                        {!showDisableConfirm ? (
                            <button
                                onClick={() => setShowDisableConfirm(true)}
                                className="w-full h-12 rounded-2xl border border-red-200 dark:border-red-500/30 text-red-500 font-semibold active:scale-[0.99] transition-transform"
                            >
                                Disable Protection
                            </button>
                        ) : (
                            <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 p-4">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Disable protection? Anyone with this link can open the card freely.</p>
                                <div className="flex gap-3 mt-3">
                                    <button
                                        onClick={() => setShowDisableConfirm(false)}
                                        className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDisable}
                                        disabled={disableSaving}
                                        className="flex-1 h-11 rounded-xl bg-red-500 text-white font-bold disabled:opacity-60"
                                    >
                                        {disableSaving ? 'Disabling…' : 'Disable'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Protected sections */}
            {enabled && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">Protected Sections</p>
                    <p className="text-sm text-gray-500 mt-0.5 mb-2">Choose which sections require the passcode. Identity and contact stay public.</p>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {(Object.keys(PROTECTED_SECTION_LABELS) as ProtectedSectionKey[]).map((key) => (
                            <SectionRow
                                key={key}
                                label={PROTECTED_SECTION_LABELS[key]}
                                desc={state.protectedSections[key] ? 'Passcode required' : 'Visible to everyone'}
                                checked={state.protectedSections[key]}
                                onChange={(v) => handleSectionToggle(key, v)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Info notice */}
            <div className="rounded-2xl bg-accent-50 dark:bg-accent-500/10 border border-accent-100 dark:border-accent-500/20 p-4 flex gap-3">
                <svg className="w-5 h-5 shrink-0 text-accent-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-accent-700 dark:text-accent-300">
                    When enabled, anyone opening this shared card must enter the 6-digit passcode. The top of the card — photo, name and basic contact — stays visible so sharing stays easy.
                </p>
            </div>

            {notice && (
                <div className={`fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white animate-fadeIn ${notice.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notice.text}
                </div>
            )}
        </div>
    )
}

export function ExpirySelector({ value, onChange }: { value: AccessExpiry; onChange: (v: AccessExpiry) => void }) {
    return (
        <div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Temporary Access</span>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 mb-2">When should access expire? "Today" removes access tomorrow.</p>
            <div className="grid grid-cols-4 gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                {EXPIRY_OPTIONS.map((key) => (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                            value === key
                                ? 'bg-white dark:bg-gray-800 text-accent-600 dark:text-accent-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {ACCESS_EXPIRY_LABELS[key]}
                    </button>
                ))}
            </div>
        </div>
    )
}
