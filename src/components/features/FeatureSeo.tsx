import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

/* ------------------------------------------------------------------ */
/*  FeatureSeo — unique SEO metadata for each feature page.            */
/*  Uses react-helmet-async (already in the stack) so the admin /      */
/*  backend can later drive these fields without touching pages.       */
/* ------------------------------------------------------------------ */

interface FeatureSeoProps {
  /** Unique page title. */
  title: string
  /** Unique meta description. */
  description: string
  /** Canonical path, e.g. "/features/business". */
  path: string
  /** Optional Open Graph image (URL or public relative path). */
  ogImage?: string
  /** Optional keywords. */
  keywords?: string[]
}

export default function FeatureSeo({ title, description, path, ogImage, keywords }: FeatureSeoProps) {
  const { i18n } = useTranslation()
  const canonical = `https://mcomvcard.app${path}`
  const imgUrl = ogImage ? (ogImage.startsWith('http') ? ogImage : `https://mcomvcard.app${ogImage}`) : undefined
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords?.length ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      {imgUrl && <meta property="og:image" content={imgUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={canonical} />
      <meta property="og:locale" content={i18n.language ?? 'en'} />
    </Helmet>
  )
}