import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Toggle } from './Toggle'
import type { BuilderConfig, CanvasBlock } from './types'

export function TemplateBuilder(config: BuilderConfig) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>(config.defaultBlocks)
  const [expandedCat, setExpandedCat] = useState<string>(config.categories[0]?.name ?? '')
  const [templateName, setTemplateName] = useState('')
  const [templateCategory, setTemplateCategory] = useState(config.templateCategories[0] ?? 'General')
  const [layoutPreset, setLayoutPreset] = useState(config.layoutPresets[0] ?? 'Modern')
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [previewMembership, setPreviewMembership] = useState(config.defaultPreviewMembership ?? config.membershipOptions[0] ?? '')
  const [previewPersona, setPreviewPersona] = useState(config.defaultPreviewPersona ?? '')
  const [showQrPanel, setShowQrPanel] = useState(false)
  const [showMembershipPanel, setShowMembershipPanel] = useState(false)
  const [showDynamicRules, setShowDynamicRules] = useState(false)
  const [showFfRules, setShowFfRules] = useState(false)
  const [showBrandingProfiles, setShowBrandingProfiles] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [openPropertyTab, setOpenPropertyTab] = useState('General')
  const [showAuditLog, setShowAuditLog] = useState(false)

  const theme = config.membershipThemes?.[previewMembership]

  const addBlock = (name: string, category: string) => {
    const newBlock: CanvasBlock = { id: Date.now(), name, category, required: false, membership: 'All' }
    setCanvasBlocks(prev => [...prev, newBlock])
    toast.success(`Added ${name}`)
  }

  const removeBlock = (id: number) => {
    setCanvasBlocks(prev => prev.filter(b => b.id !== id))
    if (selectedBlock === String(id)) setSelectedBlock(null)
    toast.success('Block removed')
  }

  const handleValidate = () => {
    let errors: string[] = []
    if (config.onValidate) {
      errors = config.onValidate(canvasBlocks, templateName)
    } else {
      if (!templateName.trim()) errors.push('Template name is required')
      if (canvasBlocks.length === 0) errors.push('Canvas is empty — add at least one block')
    }
    setValidationErrors(errors)
    setShowValidation(true)
    if (errors.length === 0) toast.success('Template validation passed')
    else toast.error(`${errors.length} validation error(s) found`)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unable to load the template.</p>
        <p className="text-xs text-gray-400 mb-4">Please try again.</p>
        <div className="flex gap-2">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Retry</button>
          {config.breadcrumb.length >= 2 && (
            <Link to={config.breadcrumb[config.breadcrumb.length - 2].to ?? '#'} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Back to Templates</Link>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-1 h-96 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="lg:col-span-2 h-96 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="lg:col-span-1 h-96 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Helmet><title>{config.title} - Card Management - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {config.breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>}
            {item.to ? (
              <Link to={item.to} className="hover:text-orange-600">{item.label}</Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Enter template name..."
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 w-64" />
          <select value={templateCategory} onChange={e => setTemplateCategory(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {config.templateCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={layoutPreset} onChange={e => setLayoutPreset(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {config.layoutPresets.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { label: 'Save Draft', icon: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4', action: () => toast.success('Template saved as draft'), cls: 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300' },
            { label: 'Preview', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', action: () => toast.success('Preview opened in new tab'), cls: 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300' },
            { label: 'Validate', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', action: handleValidate, cls: 'border border-blue-200 dark:border-blue-500/30 text-blue-600' },
            { label: 'Publish', icon: 'M5 13l4 4L19 7', action: () => toast.success('Template published — new version created'), cls: 'bg-orange-500 text-white hover:bg-orange-600' },
          ].map(b => (
            <button key={b.label} onClick={b.action} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:bg-opacity-90 ${b.cls}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.icon} /></svg>
              {b.label}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <button onClick={() => toast.success('Template duplicated')} className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-500 border border-gray-200 dark:border-gray-600 hover:bg-gray-50">Duplicate</button>
          <button onClick={() => toast.success('Template exported')} className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-500 border border-gray-200 dark:border-gray-600 hover:bg-gray-50">Export</button>
          <button onClick={() => toast.success('Template archived')} className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-red-500 border border-red-200 dark:border-red-500/30 hover:bg-red-50">Archive</button>
          <button onClick={() => toast('Changes discarded', { icon: '🗑️' })} className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      </div>

      {/* Three-Panel Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ======================== LEFT PANEL — Component Library ======================== */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Component Library</h4>
            <p className="text-[9px] text-gray-400 mt-0.5">Drag or click to add blocks to the canvas</p>
          </div>
          <div className="overflow-y-auto max-h-[580px]">
            {config.categories.map(cat => (
              <div key={cat.name}>
                <button onClick={() => setExpandedCat(expandedCat === cat.name ? '' : cat.name)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b border-gray-50 dark:border-gray-700/50">
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} /></svg>
                  <span className="flex-1 text-left">{cat.name}</span>
                  <span className="text-[9px] text-gray-400">{cat.blocks.length}</span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${expandedCat === cat.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expandedCat === cat.name && (
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/30">
                    {cat.blocks.map(block => {
                      const isOnCanvas = canvasBlocks.some(b => b.name === block.name)
                      return (
                        <div key={block.name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 group">
                          <div className="w-5 h-5 rounded bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={block.icon} /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-medium truncate ${block.comingSoon ? 'text-gray-300 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{block.name}</span>
                              {block.comingSoon && <span className="text-[7px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 shrink-0">CS</span>}
                              {block.supportsMembership && <span className="text-[7px] px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 shrink-0">M</span>}
                            </div>
                            <p className="text-[8px] text-gray-400 truncate">{block.desc}</p>
                          </div>
                          {!block.comingSoon && (
                            <button onClick={() => isOnCanvas ? toast('Already on canvas', { icon: 'ℹ️' }) : addBlock(block.name, cat.name)}
                              className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-medium ${isOnCanvas ? 'bg-green-50 dark:bg-green-500/10 text-green-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-orange-50 hover:text-orange-600 opacity-0 group-hover:opacity-100'}`}>
                              {isOnCanvas ? 'Added' : 'Add'}
                            </button>
                          )}
                          {block.comingSoon && (
                            <span className="text-[8px] text-gray-300 dark:text-gray-600 italic">Soon</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ======================== CENTER — Canvas / Live Preview ======================== */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Preview</h4>
              <span className="text-[9px] text-gray-400">— {layoutPreset} layout{config.membershipThemes ? ` · ${previewMembership}` : ''}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                {(['mobile', 'tablet', 'desktop'] as const).map(m => (
                  <button key={m} onClick={() => setPreviewMode(m)}
                    className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${previewMode === m ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
              {config.previewPersonas && config.previewPersonas.length > 0 && (
                <>
                  <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" />
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                    {config.previewPersonas.map(p => (
                      <button key={p.value} onClick={() => setPreviewPersona(p.value)}
                        className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${previewPersona === p.value ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {config.membershipThemes && (
                <>
                  <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" />
                  <select value={previewMembership} onChange={e => setPreviewMembership(e.target.value)}
                    className="border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 text-[9px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {config.membershipOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className={`flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 flex items-start justify-center ${previewMode === 'mobile' ? 'py-6' : ''}`}>
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all ${
              previewMode === 'mobile' ? 'w-[320px]' : previewMode === 'tablet' ? 'w-[600px]' : 'w-full max-w-[700px]'
            }`}>
              {/* Card Header */}
              {theme ? (
                <div className={`h-24 bg-gradient-to-r ${theme.bg} relative`}>
                  <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl bg-white dark:bg-gray-700 shadow-md flex items-center justify-center ring-2 ring-white dark:ring-gray-600">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div className="absolute top-2 right-3 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[8px] font-semibold">
                    {previewMembership} Member
                  </div>
                  <div className="absolute bottom-2 left-4 text-white">
                    <p className="text-[9px] opacity-80">Membership #</p>
                    <p className="text-xs font-bold">MCOM-000-0001</p>
                  </div>
                </div>
              ) : (
                <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                  <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl bg-white dark:bg-gray-700 shadow-md flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </div>
              )}
              {theme ? (
                <div className="pt-10 px-4 pb-3 flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">John Consumer</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400">{previewMembership} Member</span>
                      <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: theme.accent }} />
                      <span className="text-[8px] px-1 py-0.5 rounded bg-green-50 dark:bg-green-500/10 text-green-600 font-medium">Verified</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-10 px-4 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Business Name</h3>
                  <p className="text-[10px] text-gray-400">Tagline appears here</p>
                </div>
              )}

              {/* Canvas Blocks */}
              <div className="px-4 pb-4 space-y-1.5">
                {canvasBlocks.map(block => (
                  <div key={block.id} onClick={() => setSelectedBlock(String(block.id))}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedBlock === String(block.id)
                        ? 'border-orange-300 dark:border-orange-500/50 bg-orange-50/50 dark:bg-orange-500/5'
                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <button className="text-gray-300 hover:text-gray-500 cursor-grab shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                      </button>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">{block.name}</span>
                      {block.required && <span className="text-[8px] text-red-400 shrink-0">*</span>}
                      {block.membership !== 'All' && (
                        <span className="text-[7px] px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 shrink-0">{block.membership}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toast.success(`${block.name} settings`)} className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                      <button onClick={() => removeBlock(block.id)} className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10">
                        <svg className="w-3 h-3 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Persona Overlay (consumer style) */}
              {config.membershipThemes && previewPersona && (
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-2 py-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span>Viewing as <strong className="text-gray-600 dark:text-gray-300">{previewPersona}</strong></span>
                  </div>
                </div>
              )}

              {/* Empty Canvas */}
              {canvasBlocks.length === 0 && (
                <div className="text-center py-12 px-4">
                  <svg className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                  <p className="text-xs text-gray-400 mb-1">No blocks on canvas</p>
                  <p className="text-[10px] text-gray-400">Add blocks from the Component Library</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================== RIGHT PANEL — Properties ======================== */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {selectedBlock ? (
            <div>
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Block Properties</h4>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">{canvasBlocks.find(b => String(b.id) === selectedBlock)?.name}</span>
              </div>
              <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-2">
                {['General', 'Design', 'Typography', 'Colors', 'Behavior'].map(t => (
                  <button key={t} onClick={() => setOpenPropertyTab(t)}
                    className={`px-2.5 py-2 text-[10px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                      openPropertyTab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}>{t}</button>
                ))}
              </div>
              <div className="p-3 space-y-2.5 overflow-y-auto max-h-[500px]">
                {openPropertyTab === 'General' && (
                  <>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Block Name</label><input type="text" defaultValue={canvasBlocks.find(b => String(b.id) === selectedBlock)?.name} className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Visibility</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Visible</option><option>Hidden</option><option>Membership Only</option><option>Verified Only</option></select></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Requirement</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Optional</option><option>Required</option><option>Read Only</option></select></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Default State</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Expanded</option><option>Collapsed</option><option>Hidden</option></select></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[10px] text-gray-600 dark:text-gray-300">Allow user to edit</span><Toggle on={true} onClick={() => toast.success('Permission toggled')} /></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[10px] text-gray-600 dark:text-gray-300">Show in preview</span><Toggle on={true} onClick={() => toast.success('Preview visibility toggled')} /></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[10px] text-gray-600 dark:text-gray-300">Locked</span><Toggle on={false} onClick={() => toast.success('Lock state toggled')} /></div>
                  </>
                )}
                {openPropertyTab === 'Design' && (
                  <>
                    {[
                      { label: 'Width', value: '100%' }, { label: 'Height', value: 'Auto' },
                      { label: 'Padding', value: '12px' }, { label: 'Margin', value: '4px 0' },
                      { label: 'Border Radius', value: '8px' }, { label: 'Shadow', value: 'Small' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{s.label}</span>
                        <input type="text" defaultValue={s.value} className="w-20 text-right text-[10px] text-gray-700 dark:text-gray-300 bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 rounded px-1 py-0.5" />
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Full width</span><Toggle on={false} onClick={() => toast.success('Width toggled')} /></div>
                      <div className="flex items-center justify-between mt-1"><span className="text-[10px] text-gray-600 dark:text-gray-300">Responsive</span><Toggle on={true} onClick={() => toast.success('Responsive toggled')} /></div>
                    </div>
                  </>
                )}
                {openPropertyTab === 'Typography' && (
                  <>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Font Family</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Inter</option><option>Roboto</option><option>Poppins</option><option>Merriweather</option></select></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Font Size</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>12px</option><option>14px</option><option>16px</option><option>18px</option><option>24px</option></select></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Font Weight</label><div className="flex gap-1">{['Regular', 'Medium', 'Semibold', 'Bold'].map(w => <button key={w} onClick={() => toast.success(`Weight: ${w}`)} className={`px-2 py-1 rounded text-[9px] font-medium border ${w === 'Medium' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'}`}>{w}</button>)}</div></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Line Height</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Tight (1.2)</option><option>Normal (1.5)</option><option>Relaxed (1.75)</option></select></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Alignment</label><div className="flex gap-1">{['Left', 'Center', 'Right'].map(a => <button key={a} onClick={() => toast.success(`Align: ${a}`)} className={`flex-1 px-2 py-1 rounded text-[9px] font-medium border ${a === 'Left' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'}`}>{a}</button>)}</div></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Capitalisation</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>None</option><option>Uppercase</option><option>Lowercase</option><option>Capitalize</option></select></div>
                  </>
                )}
                {openPropertyTab === 'Colors' && (
                  <>
                    {[
                      { label: 'Background', value: '#FFFFFF' },
                      { label: 'Text', value: '#111827' },
                      { label: 'Button', value: '#F97316' },
                      { label: 'Icons', value: '#6B7280' },
                      { label: 'Accent', value: theme?.accent ?? '#F97316' },
                      { label: 'Hover State', value: '#EA580C' },
                    ].map(c => (
                      <div key={c.label} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{c.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-gray-400">{c.value}</span>
                          <span className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: c.value }} />
                          <button onClick={() => toast.success(`Color picker for ${c.label}`)} className="text-[9px] text-orange-500 hover:underline">Edit</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => toast.success('Color scheme saved to block')} className="mt-2 w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Colors</button>
                  </>
                )}
                {openPropertyTab === 'Behavior' && (
                  <>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Click Action</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{config.clickActions.map(a => <option key={a}>{a}</option>)}</select></div>
                    <div><label className="text-[9px] text-gray-500 block mb-0.5">Animation</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{config.animations.map(a => <option key={a}>{a}</option>)}</select></div>
                    <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Auto Expand</span><Toggle on={true} onClick={() => toast.success('Auto expand toggled')} /></div>
                    <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Auto Collapse</span><Toggle on={false} onClick={() => toast.success('Auto collapse toggled')} /></div>
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <label className="text-[9px] text-gray-500 block mb-1">Visibility Rule</label>
                      <div className="flex flex-wrap gap-1">
                        {config.visibilityRules.map(r => (
                          <button key={r} onClick={() => toast.success(`Visibility: ${r}`)}
                            className={`px-2 py-0.5 rounded text-[8px] font-medium border ${r === config.visibilityRules[0] ? 'border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'}`}>{r}</button>
                        ))}
                      </div>
                    </div>
                    {config.membershipOptions.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <label className="text-[9px] text-gray-500 block mb-1">Membership Visibility</label>
                        <div className="flex flex-wrap gap-1">
                          {config.membershipOptions.map(m => (
                            <button key={m} onClick={() => toast.success(`${m} visibility set`)}
                              className={`px-2 py-0.5 rounded text-[8px] font-medium border ${m === previewMembership ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'}`}>{m}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* No block selected */
            <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
              <svg className="w-10 h-10 text-gray-200 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">No block selected</p>
              <p className="text-[10px] text-gray-400">Click a block on the canvas to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* QR Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
          <button onClick={() => setShowQrPanel(!showQrPanel)} className="flex items-center justify-between w-full">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">QR Configuration</h4>
            <svg className={`w-3 h-3 text-gray-400 transition-transform ${showQrPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showQrPanel && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">QR Type</span>
                <select className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[9px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" defaultValue="Dynamic">
                  <option>Static</option><option>Dynamic</option><option>Campaign</option><option>Seasonal</option>
                </select>
              </div>
              <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">QR Position</span>
                <select className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[9px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" defaultValue="Bottom Center">
                  <option>Top Left</option><option>Top Right</option><option>Bottom Left</option><option>Bottom Center</option><option>Bottom Right</option><option>Custom</option>
                </select>
              </div>
              <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">QR Size</span>
                <select className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[9px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" defaultValue="Medium">
                  <option>Small</option><option>Medium</option><option>Large</option><option>Extra Large</option>
                </select>
              </div>
              <div><label className="text-[9px] text-gray-500 block mb-0.5">Default Destination</label><input type="text" defaultValue={`https://mcom.app/card/{id}`} className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[9px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Schedule changes</span><Toggle on={false} onClick={() => toast.success('QR scheduling toggled')} /></div>
              {[
                { label: 'Summer Campaign', date: '1 Jun 2026', dest: 'https://mcom.app/summer' },
                { label: 'Winter Offer', date: '1 Dec 2026', dest: 'https://mcom.app/winter' },
                { label: 'Black Friday', date: '25 Nov 2026', dest: 'https://mcom.app/bf' },
              ].map(s => (
                <div key={s.label} className="p-1.5 rounded bg-gray-50 dark:bg-gray-700/30 text-[9px]">
                  <div className="flex items-center justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">{s.label}</span><span className="text-gray-400">{s.date}</span></div>
                  <p className="text-gray-400 truncate">{s.dest}</p>
                </div>
              ))}
              <button onClick={() => toast.success('QR schedule added')} className="text-[9px] text-orange-500 hover:underline">+ Add Scheduled Destination</button>
            </div>
          )}
        </div>

        {/* Membership Visibility */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
          <button onClick={() => setShowMembershipPanel(!showMembershipPanel)} className="flex items-center justify-between w-full">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Membership Visibility</h4>
            <svg className={`w-3 h-3 text-gray-400 transition-transform ${showMembershipPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showMembershipPanel && (
            <div className="mt-3 space-y-2">
              <p className="text-[9px] text-gray-400">Set default visibility by membership tier:</p>
              <div className="flex flex-wrap gap-1">
                {config.membershipOptions.map(m => (
                  <button key={m} onClick={() => toast.success(`Default visibility: ${m}`)}
                    className={`px-2 py-0.5 rounded text-[8px] font-medium border ${m === previewMembership ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'}`}>{m}</button>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[9px] text-gray-500 mb-1">Block-level overrides:</p>
                <div className="text-[9px] text-gray-400 space-y-1">
                  {canvasBlocks.filter(b => b.membership !== 'All').map(b => (
                    <div key={b.id} className="flex items-center justify-between">
                      <span>{b.name}</span>
                      <span className="text-emerald-600 font-medium">{b.membership}</span>
                    </div>
                  ))}
                  {canvasBlocks.filter(b => b.membership !== 'All').length === 0 && <p>No overrides set</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Display Rules (consumer) */}
        {config.showDynamicRules && config.dynamicRules && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
            <button onClick={() => setShowDynamicRules(!showDynamicRules)} className="flex items-center justify-between w-full">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dynamic Display Rules</h4>
              <svg className={`w-3 h-3 text-gray-400 transition-transform ${showDynamicRules ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showDynamicRules && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[9px] text-gray-400">Define conditional display logic:</p>
                {config.dynamicRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-medium text-gray-700 dark:text-gray-300">{rule.condition}</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        <span className="text-[9px] text-orange-600 font-medium">{rule.action}</span>
                      </div>
                    </div>
                    <Toggle on={true} onClick={() => toast.success(`${rule.condition} rule toggled`)} />
                  </div>
                ))}
                <button onClick={() => toast.success('New dynamic rule added')} className="text-[9px] text-orange-500 hover:underline">+ Add Rule</button>
              </div>
            )}
          </div>
        )}

        {/* Friends & Family Display Rules (consumer) */}
        {config.showFfRules && config.ffDisplayOptions && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
            <button onClick={() => setShowFfRules(!showFfRules)} className="flex items-center justify-between w-full">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">F&F Display Rules</h4>
              <svg className={`w-3 h-3 text-gray-400 transition-transform ${showFfRules ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showFfRules && (
              <div className="mt-3 space-y-2">
                <p className="text-[9px] text-gray-400">Configure Friends & Family display:</p>
                {config.ffDisplayOptions.map(ff => (
                  <div key={ff.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{ff.label}</span>
                    <Toggle on={ff.on} onClick={() => toast.success(`${ff.label} toggled`)} />
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <label className="text-[9px] text-gray-500 block mb-1">Max display items</label>
                  <select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[9px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" defaultValue="3">
                    <option>1</option><option>2</option><option>3</option><option>5</option><option>10</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Second row — Branding, Accessibility, Validation, Audit (3 or 4 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Branding Profiles (consumer) */}
        {config.showBrandingProfiles && config.brandingFields && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
            <button onClick={() => setShowBrandingProfiles(!showBrandingProfiles)} className="flex items-center justify-between w-full">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Branding Profiles</h4>
              <svg className={`w-3 h-3 text-gray-400 transition-transform ${showBrandingProfiles ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showBrandingProfiles && (
              <div className="mt-3 space-y-2">
                <p className="text-[9px] text-gray-400">Override branding per membership tier:</p>
                <div className="flex flex-wrap gap-1">
                  {config.membershipOptions.slice(0, 4).map(m => (
                    <button key={m} onClick={() => toast.success(`Branding profile for ${m} opened`)}
                      className={`px-2 py-0.5 rounded text-[8px] font-medium border ${m === previewMembership ? 'border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'}`}>{m}</button>
                  ))}
                </div>
                <div className="space-y-1.5 text-[10px]">
                  {config.brandingFields.map(b => (
                    <div key={b.label} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">{b.label}</span>
                      <button onClick={() => toast.success(`${b.label} override`)} className="text-[9px] text-orange-500 hover:underline">{b.value === '—' ? 'Set' : b.value}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accessibility (consumer) */}
        {config.showAccessibility && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
            <button onClick={() => setShowAccessibility(!showAccessibility)} className="flex items-center justify-between w-full">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Accessibility</h4>
              <svg className={`w-3 h-3 text-gray-400 transition-transform ${showAccessibility ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showAccessibility && (
              <div className="mt-3 space-y-1.5">
                {[
                  { label: 'Contrast Ratio', value: '4.5:1', pass: true },
                  { label: 'Large Text Mode', on: false },
                  { label: 'High Visibility', on: true },
                  { label: 'Touch Target Sizes', on: true },
                  { label: 'Screen Reader Labels', on: false },
                ].map(a => (
                  <div key={a.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{a.label}</span>
                    {'pass' in a ? (
                      <span className={`text-[9px] font-medium ${a.pass ? 'text-green-600' : 'text-red-500'}`}>{a.pass ? 'Pass' : 'Fail'}</span>
                    ) : (
                      <Toggle on={(a as any).on} onClick={() => toast.success(`${a.label} toggled`)} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Validation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
          <button onClick={() => setShowValidation(!showValidation)} className="flex items-center justify-between w-full">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Validation</h4>
            <svg className={`w-3 h-3 text-gray-400 transition-transform ${showValidation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showValidation && (
            <div className="mt-3">
              {validationErrors.length === 0 ? (
                <div className="flex items-center gap-2 text-[10px] text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Template is valid
                </div>
              ) : (
                <div className="space-y-1">
                  {validationErrors.map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[9px] text-red-600 dark:text-red-400">
                      <svg className="w-3 h-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {err}
                    </div>
                  ))}
                  <button onClick={handleValidate} className="mt-2 px-2 py-1 rounded bg-orange-500 text-white text-[9px] font-medium hover:bg-orange-600">Re-validate</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audit Log & Permissions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
          <button onClick={() => setShowAuditLog(!showAuditLog)} className="flex items-center justify-between w-full">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Audit Log & Permissions</h4>
            <svg className={`w-3 h-3 text-gray-400 transition-transform ${showAuditLog ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showAuditLog && (
            <div className="mt-3 space-y-2">
              <p className="text-[9px] text-gray-500 font-medium">Permissions</p>
              <div className="space-y-0.5 text-[9px] text-gray-400">
                {config.permissions.map(p => (
                  <div key={p.role} className="flex items-center justify-between py-0.5">
                    <span className="text-gray-600 dark:text-gray-300">{p.role}</span>
                    <span className="text-gray-400">{p.level}</span>
                  </div>
                ))}
              </div>
              <hr className="border-gray-100 dark:border-gray-700" />
              <p className="text-[9px] text-gray-500 font-medium">Recent Changes</p>
              <div className="space-y-1 text-[9px]">
                {config.auditEntries.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1 shrink-0" />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300">{a.action}</span>
                      <span className="text-gray-400"> by {a.user} · {a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
