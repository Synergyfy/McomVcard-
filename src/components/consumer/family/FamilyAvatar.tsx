interface FamilyAvatarProps {
    emoji: string
    gradient: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    name?: string
    className?: string
}

const sizeMap = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
}

export default function FamilyAvatar({ emoji, gradient, size = 'md', name, className = '' }: FamilyAvatarProps) {
    return (
        <div className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md ${sizeMap[size]} ${className}`} aria-label={name}>
            <span>{emoji}</span>
        </div>
    )
}
