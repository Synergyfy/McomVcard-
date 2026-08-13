import { useState } from 'react'

export default function VCardEditTermsConditionsTab() {
  const [content, setContent] = useState(`## Terms & Conditions

**Last updated:** July 15, 2026

### Acceptance of Terms

By accessing and using this vCard, you accept and agree to be bound by the terms and provision of this agreement.

### Use License

Permission is granted to temporarily use this vCard for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.

### User Obligations

You agree to use this vCard only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the vCard.

### Intellectual Property

All content included on this vCard, such as text, graphics, logos, images, and software, is the property of the card owner or its content suppliers and protected by copyright laws.

### Disclaimer

The materials on this vCard are provided on an 'as is' basis. The card owner makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.

### Limitations

In no event shall the card owner be liable for any damages arising out of the use or inability to use the materials on this vCard.

### Revisions

The card owner may revise these terms of service at any time without notice. By using this vCard you are agreeing to be bound by the then current version of these terms.

### Contact

For questions about these Terms & Conditions, please contact us through your vCard.`)
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Terms & Conditions</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Add terms and conditions to your vCard. This will be visible to visitors.</p>

      {saved && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Terms & conditions saved!
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2 mb-3">
          {['Bold', 'Italic', 'Link', 'Heading', 'List'].map((btn) => (
            <button key={btn} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{btn}</button>
          ))}
        </div>

        <textarea value={content} onChange={(e) => { setContent(e.target.value); setSaved(false) }} rows={18}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{content.length} characters</p>
          <button onClick={handleSave} className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Save Terms & Conditions
          </button>
        </div>
      </div>
    </div>
  )
}
