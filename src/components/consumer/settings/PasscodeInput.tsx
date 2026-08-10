interface PasscodeInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export default function PasscodeInput({ value, onChange, placeholder = '6-digit passcode', className = '' }: PasscodeInputProps) {
    const handleChange = (raw: string) => {
        onChange(raw.replace(/\D/g, '').slice(0, 6))
    }
    return (
        <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]*"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={className}
        />
    )
}
