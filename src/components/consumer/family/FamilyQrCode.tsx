interface FamilyQrCodeProps {
    value: string
    size?: 'sm' | 'md' | 'lg'
}

const cellSize = { sm: 7, md: 9, lg: 11 } as const
const gridClass = { sm: 'grid-cols-7', md: 'grid-cols-9', lg: 'grid-cols-11' } as const

export default function FamilyQrCode({ value, size = 'md' }: FamilyQrCodeProps) {
    const cells = cellSize[size]
    const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const matrix: boolean[][] = []
    for (let r = 0; r < cells; r++) {
        const row: boolean[] = []
        for (let c = 0; c < cells; c++) {
            row.push(((seed * (r + 3) + c * 7 + r * c * 11) % 3) !== 0)
        }
        matrix.push(row)
    }
    return (
        <div className={`grid ${gridClass[size]} gap-[3px] p-2.5 bg-white rounded-2xl shadow-sm`}>
            {matrix.flat().map((on, i) => (
                <div key={i} className={`aspect-square rounded-[2px] ${on ? 'bg-gray-900' : 'bg-transparent'}`} />
            ))}
        </div>
    )
}
