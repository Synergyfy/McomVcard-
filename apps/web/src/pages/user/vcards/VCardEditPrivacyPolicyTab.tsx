import { useState } from 'react'

export default function VCardEditPrivacyPolicyTab() {
  const [content, setContent] = useState(`## Privacy Policy

**Last updated:** July 15, 2026

### Information We Collect

We collect information you provide directly to us, such as when you create an account, fill out a form, or contact us for support.

### How We Use Your Information

We use the information we collect to provide, maintain, and improve our services, to process transactions, and to send you technical notices and support messages.

### Information Sharing

We do not sell or share your personal information with third parties except as described in this policy or with your consent.

### Data Security

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

### Your Rights

You have the right to access, correct, or delete your personal information. You may contact us at any time to exercise these rights.

### Contact Us

If you have any questions about this Privacy Policy, please contact us through your vCard.`)
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Privacy Policy</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Add a privacy policy page to your vCard. This will be visible to visitors.</p>

      {saved && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Privacy policy saved!
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
            Save Privacy Policy
          </button>
        </div>
      </div>
    </div>
  )
}
