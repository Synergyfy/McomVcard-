/* ------------------------------------------------------------------ */
/*  Consumer landing hero — consumer-only story.                       */
/*                                                                     */
/*  Renders the admin-configurable LandingSlider for the /consumer     */
/*  landing page. Slides are edited from the admin Landing Page        */
/*  editor.                                                            */
/* ------------------------------------------------------------------ */

import LandingSlider from './LandingSlider'

export default function ConsumerHero() {
  return <LandingSlider pageId="consumer" />
}
