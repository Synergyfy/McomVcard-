/* ------------------------------------------------------------------ */
/*  General MCOM VCard hero — the main landing intro.                  */
/*                                                                     */
/*  Renders the admin-configurable LandingSlider. Slides (badge,       */
/*  heading, copy, CTAs, image, theme) are edited from the admin       */
/*  Landing Page editor — no code changes needed.                      */
/* ------------------------------------------------------------------ */

import LandingSlider from './LandingSlider'

export default function GeneralHero() {
  return <LandingSlider pageId="general" />
}
