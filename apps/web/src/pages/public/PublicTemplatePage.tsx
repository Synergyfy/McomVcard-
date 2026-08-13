import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import ScrollingVCard from '../../components/common/ScrollingVCard'
import { loadUserTemplates, getUserTemplate, type StoredTemplate } from '../../services/vcardTemplateStore'

const SEASON_COLORS: Record<string, string> = {
  Spring: 'bg-emerald-50 text-emerald-600',
  Summer: 'bg-amber-50 text-amber-600',
  Autumn: 'bg-orange-50 text-orange-600',
  Winter: 'bg-sky-50 text-sky-600',
}

function resolveTemplate(param?: string): StoredTemplate | undefined {
  if (!param) return undefined
  const id = Number(param)
  if (Number.isFinite(id) && id > 0) {
    const byId = getUserTemplate(id)
    if (byId) return byId
  }
  return loadUserTemplates().find(t => t.templateId === param)
}

export default function PublicTemplatePage() {
  const { templateId } = useParams()
  const [copied, setCopied] = useState(false)
  const stored = resolveTemplate(templateId)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `/${templateId ?? ''}`
  const sections = stored?.builder?.sections ?? []
  const seasons = stored?.builder?.seasons ?? []
  const uses = stored?.builder?.templateUses ?? []
  const typeLabel = stored?.targetType === 'consumer' ? 'Consumer VCard' : 'Business VCard'

  const copyLink = () => {
    try { navigator.clipboard?.writeText(shareUrl) } catch { /* ignore */ }
    setCopied(true)
    toast.success('Link copied — share it anywhere')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Helmet>
        <title>{stored ? `${stored.name} — Public VCard Template` : 'Template Preview'} - MCOM VCard</title>
      </Helmet>

      {!stored || sections.length === 0 ? (
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Template not available</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This template preview isn't available yet. It may have been unpublished, or this is a platform template that hasn't been customized.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Link to="/" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Go to Home</Link>
            <Link to="/templates" className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Browse Templates</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-gray-900 dark:text-white">{stored.name}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-600">{typeLabel}</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">{stored.templateId}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Live preview of the {typeLabel.toLowerCase()} template — hover to scroll, tap to pause.
                </p>
                {(uses.length > 0 || seasons.length > 0) && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                    {uses.map(u => (
                      <span key={u} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{u}</span>
                    ))}
                    {seasons.map(s => (
                      <span key={s} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEASON_COLORS[s] ?? 'bg-gray-100 text-gray-600'}`}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={copyLink}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copied ? 'M5 13l4 4L19 7' : 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'} /></svg>
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div className="flex items-start justify-center">
            <ScrollingVCard sections={sections} widthClass="w-[320px]" heightClass="h-[560px]" />
          </div>

          <div className="flex items-center gap-2 mt-6 text-[11px] text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            <span>Share this link — anyone who opens it sees this exact template content.</span>
          </div>
        </>
      )}
    </div>
  )
}
