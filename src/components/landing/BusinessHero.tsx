/* ------------------------------------------------------------------ */
/*  Business landing hero — business-only story.                       */
/*                                                                     */
/*  Renders the admin-configurable LandingSlider for the /business     */
/*  landing page. Slides are edited from the admin Landing Page        */
/*  editor.                                                            */
/* ------------------------------------------------------------------ */

import LandingSlider from './LandingSlider'

export default function BusinessHero() {
  return <LandingSlider pageId="business" />
}
