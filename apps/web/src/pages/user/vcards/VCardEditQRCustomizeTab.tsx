import { useState } from 'react'

export default function VCardEditQRCustomizeTab() {
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [size, setSize] = useState(256)
  const [style, setStyle] = useState('square')
  const [hasLogo, setHasLogo] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Customize QR Code</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Design your QR code style. Customers scan this to view your vCard.</p>

      {saved && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          QR code settings saved!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="relative" style={{ width: size / 2, height: size / 2 }}>
            <div className="w-full h-full rounded-xl border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center" style={{ background: bgColor }}>
              <div className="w-3/4 h-3/4 grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className="rounded-[2px]" style={{
                    background: fgColor,
                    opacity: [0, 1, 2, 3, 4, 5, 10, 14, 15, 19, 20, 24].includes(i) ? 1 : Math.random() > 0.5 ? 0.8 : 0.2,
                    borderRadius: style === 'rounded' ? '4px' : style === 'dots' ? '50%' : '2px',
                  }} />
                ))}
              </div>
              {hasLogo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">M</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">QR Code Style</label>
            <div className="flex gap-3">
              {['square', 'rounded', 'dots'].map((s) => (
                <button key={s} onClick={() => setStyle(s)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${style === s ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Foreground Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer" />
                <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Background Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Size: {size}px</label>
            <input type="range" min={128} max={512} step={32} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-orange-500" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-9 h-5 rounded-full transition-colors ${hasLogo ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setHasLogo(!hasLogo)}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${hasLogo ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Show MCOM logo in center</span>
          </label>

          <button onClick={handleSave} className="w-full px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Save QR Code Settings
          </button>
        </div>
      </div>
    </div>
  )
}
