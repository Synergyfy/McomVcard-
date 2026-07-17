import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../types'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      aria-label="Select language"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.native}
        </option>
      ))}
    </select>
  )
}
