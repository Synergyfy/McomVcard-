export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-3.5 left-0.5' : 'left-0.5'}`} />
    </button>
  )
}
