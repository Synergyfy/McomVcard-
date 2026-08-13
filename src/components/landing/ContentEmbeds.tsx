/* ------------------------------------------------------------------ */
/*  Landing content embed slots.                                       */
/*                                                                     */
/*  Renders the enabled embeds configured for a landing page, filtered */
/*  to a specific region (hero / body / footer) and placement          */
/*  (top / bottom) so admins can pin widgets anywhere on the page.     */
/*  Two render modes:                                                  */
/*    - 'iframe' → live URL inside a sandboxed <iframe>                */
/*    - 'html'   → raw HTML/JS inside a sandboxed <iframe srcDoc> so   */
/*                 the code executes in isolation without touching the */
/*                 host page                                           */
/*  Admins manage these embeds from the admin Landing Page editor —    */
/*  new widgets can be added/updated without touching the codebase.    */
/* ------------------------------------------------------------------ */

import { useMemo } from 'react'
import { loadContentEmbeds, type EmbedPlacement, type EmbedRegion } from '../../services/contentEmbeds'
import type { LandingPageId } from '../../services/landingSlides'

export default function ContentEmbeds({
  pageId,
  region,
  placement,
}: {
  pageId: LandingPageId
  region: EmbedRegion
  placement: EmbedPlacement
}) {
  const embeds = useMemo(
    () => loadContentEmbeds(pageId).filter((e) => e.region === region && e.placement === placement),
    [pageId, region, placement],
  )

  if (embeds.length === 0) return null

  return (
    <section className={`${region === 'hero' ? 'py-10 md:py-14' : 'py-14 md:py-16'} ${region === 'body' ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-950'}`}>
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {embeds.map((embed) => (
          <div key={embed.id}>
            {embed.label && (
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                {embed.label}
              </h2>
            )}
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
              <iframe
                src={embed.type === 'iframe' ? embed.url : undefined}
                srcDoc={embed.type === 'html' ? embed.html : undefined}
                title={embed.label || 'Embedded content'}
                className="w-full"
                style={{ height: embed.height }}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
