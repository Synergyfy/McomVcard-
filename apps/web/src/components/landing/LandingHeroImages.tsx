/* ------------------------------------------------------------------ */
/*  Animated hero illustrations shared by the three landing heroes.    */
/*  Vector-only (no external assets), matching the home Hero art style. */
/*  Each float or pulse so the hero feels alive without JavaScript.    */
/* ------------------------------------------------------------------ */

export function GeneralHeroImage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 480" fill="none" className="w-full h-auto drop-shadow-2xl animate-floatSlow">
      {/* Background blob — orange to purple mix */}
      <ellipse cx="310" cy="245" rx="185" ry="205" fill="#FB923C" opacity="0.35" />
      <ellipse cx="310" cy="245" rx="155" ry="175" fill="#A855F7" opacity="0.25" />

      {/* Giant membership card */}
      <g transform="rotate(-4 170 120)">
        <rect x="60" y="60" width="360" height="215" rx="22" fill="white" stroke="#E2E8F0" strokeWidth="2.5" className="drop-shadow-xl" />
        <rect x="60" y="60" width="360" height="72" rx="22" fill="url(#gCardGrad)" />
        <rect y="108" width="360" height="24" fill="url(#gCardGrad)" />
        <circle cx="104" cy="96" r="20" fill="white" opacity="0.3" />
        <circle cx="104" cy="96" r="13" fill="white" opacity="0.5" />
        <rect x="140" y="82" width="110" height="8" rx="4" fill="white" />
        <rect x="140" y="96" width="70" height="6" rx="3" fill="white" opacity="0.7" />
        <rect x="92" y="150" width="90" height="10" rx="5" fill="url(#gCardGrad)" />
        <rect x="92" y="170" width="150" height="6" rx="3" fill="#CBD5E1" />
        <rect x="92" y="183" width="120" height="6" rx="3" fill="#CBD5E1" />
        <rect x="92" y="205" width="80" height="6" rx="3" fill="#E2E8F0" />
        <rect x="92" y="218" width="105" height="6" rx="3" fill="#E2E8F0" />
        <g transform="translate(330, 175)">
          <circle cx="26" cy="34" r="24" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M20 27 C26 21 32 15 36 10" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M19 35 C27 27 35 19 41 13" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M17 43 C27 33 39 23 45 17" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Overlapping wallet */}
      <g transform="translate(300, 265) rotate(3)">
        <rect width="235" height="160" rx="20" fill="white" stroke="#E2E8F0" strokeWidth="2.5" className="drop-shadow-xl" />
        <rect width="235" height="40" rx="20" fill="url(#gWalletGrad)" />
        <rect y="20" width="235" height="20" fill="url(#gWalletGrad)" />
        <rect x="20" y="58" width="70" height="12" rx="6" fill="url(#gWalletGrad)" />
        <rect x="20" y="80" width="140" height="6" rx="3" fill="#E2E8F0" />
        <rect x="20" y="94" width="110" height="6" rx="3" fill="#E2E8F0" />
        <rect x="20" y="114" width="60" height="12" rx="6" fill="#10B981" />
        <circle cx="182" cy="80" r="20" fill="#F3E8FF" />
        <text x="182" y="85" textAnchor="middle" fill="#A855F7" fontSize="18" fontWeight="bold">£</text>
      </g>

      {/* Floating reward chip */}
      <g transform="translate(60, 300)">
        <circle r="36" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="2" className="animate-pulse" />
        <path d="M-10 -4 L0 -16 L10 -4 L22 -6 L14 5 L20 16 L8 13 L0 20 L-8 13 L-20 16 L-14 5 L-22 -6 Z" fill="#F59E0B" transform="scale(0.9)" />
      </g>

      {/* Small floating coins */}
      <circle cx="120" cy="130" r="7" fill="#FBBF24" opacity="0.7" className="animate-float" />
      <circle cx="455" cy="150" r="5" fill="#C4B5FD" opacity="0.6" className="animate-float" />
      <circle cx="70" cy="420" r="6" fill="#FDBA74" opacity="0.5" className="animate-ping" />
      <circle cx="470" cy="390" r="9" fill="#A855F7" opacity="0.25" className="animate-float" />

      <defs>
        <linearGradient id="gCardGrad" x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="0.5" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="gWalletGrad" x1="0" y1="0" x2="235" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function BusinessHeroImage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 480" fill="none" className="w-full h-auto drop-shadow-2xl animate-floatSlow">
      {/* Blue background blob */}
      <ellipse cx="320" cy="250" rx="180" ry="200" fill="#3B82F6" opacity="0.4" />
      <ellipse cx="320" cy="250" rx="150" ry="170" fill="#60A5FA" opacity="0.25" />

      {/* Legs */}
      <rect x="218" y="368" width="34" height="85" rx="6" fill="#1E293B" />
      <rect x="260" y="368" width="34" height="85" rx="6" fill="#1E293B" />
      <ellipse cx="235" cy="453" rx="24" ry="11" fill="#0F172A" />
      <ellipse cx="277" cy="453" rx="24" ry="11" fill="#0F172A" />

      {/* Body — suit */}
      <path d="M200 232 C200 210 212 193 236 188 C260 193 272 210 272 232 L276 366 L196 366 Z" fill="#1E293B" />
      <path d="M220 207 L236 202 L252 207 L250 247 L222 247 Z" fill="#F1F5F9" />
      <path d="M233 229 L236 207 L239 229 L236 302 Z" fill="#3B82F6" />

      {/* Left arm handling the tablet */}
      <path d="M196 232 C168 244 130 272 124 306 C120 324 130 332 142 325" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      <path d="M112 296 C112 284 126 274 138 280" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />

      {/* Right arm pointing at stats */}
      <path d="M272 232 C296 250 322 276 330 306 C335 324 323 333 311 326" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      <path d="M342 300 C342 288 330 278 318 284" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />

      {/* Head */}
      <circle cx="236" cy="170" r="44" fill="#FBBF24" />
      <path d="M192 164 C192 136 210 116 236 110 C262 116 280 136 280 164 C280 146 264 130 236 126 C208 130 192 146 192 164 Z" fill="#92400E" />
      <ellipse cx="236" cy="128" rx="28" ry="20" fill="#92400E" />
      <circle cx="223" cy="168" r="4.5" fill="#1E293B" />
      <circle cx="249" cy="168" r="4.5" fill="#1E293B" />
      <circle cx="224.5" cy="167" r="1.8" fill="white" />
      <circle cx="250.5" cy="167" r="1.8" fill="white" />
      <path d="M222 184 C229 193 243 193 250 184" stroke="#92400E" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M216 158 C219 154 226 153 230 156" stroke="#92400E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M242 156 C246 153 253 154 256 158" stroke="#92400E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="192" cy="170" rx="9" ry="11" fill="#FBBF24" />
      <ellipse cx="280" cy="170" rx="9" ry="11" fill="#FBBF24" />

      {/* Analytics tablet the person holds */}
      <g transform="translate(110, 260) rotate(-4)">
        <rect width="118" height="158" rx="14" fill="white" stroke="#E2E8F0" strokeWidth="3" className="drop-shadow-xl" />
        <rect x="8" y="8" width="102" height="142" rx="10" fill="#F0F9FF" />
        <rect x="16" y="16" width="58" height="6" rx="3" fill="#0F172A" />
        <rect x="16" y="30" width="70" height="4" rx="2" fill="#CBD5E1" />
        <rect x="16" y="44" width="86" height="40" rx="6" fill="white" stroke="#BFDBFE" strokeWidth="1" />
        <rect x="22" y="78" width="12" height="0" rx="2" fill="#3B82F6" />
        <rect x="38" y="70" width="12" height="8" rx="2" fill="#60A5FA" />
        <rect x="54" y="62" width="12" height="16" rx="2" fill="#93C5FD" />
        <rect x="70" y="58" width="12" height="20" rx="2" fill="#BFDBFE" />
        <rect x="86" y="66" width="12" height="12" rx="2" fill="#60A5FA" />
        <rect x="16" y="94" width="60" height="6" rx="3" fill="#3B82F6" />
        <rect x="16" y="106" width="86" height="5" rx="2.5" fill="#DBEAFE" />
        <rect x="16" y="116" width="72" height="5" rx="2.5" fill="#DBEAFE" />
        <rect x="22" y="130" width="46" height="10" rx="5" fill="#10B981" />
      </g>

      {/* Giant QR card */}
      <g transform="translate(300, 210) rotate(6)">
        <rect width="180" height="124" rx="18" fill="white" stroke="#E2E8F0" strokeWidth="2.5" className="drop-shadow-xl" />
        <rect x="14" y="12" width="26" height="26" rx="5" fill="none" stroke="#0F172A" strokeWidth="3" />
        <rect x="14" y="12" width="12" height="12" rx="2" fill="#0F172A" />
        <rect x="132" y="12" width="34" height="34" rx="5" fill="none" stroke="#0F172A" strokeWidth="3" />
        <rect x="132" y="12" width="16" height="16" rx="2" fill="#0F172A" />
        <rect x="14" y="82" width="34" height="28" rx="5" fill="none" stroke="#0F172A" strokeWidth="3" />
        <rect x="14" y="82" width="15" height="15" rx="2" fill="#0F172A" />
        <path d="M60 12 h16 v8 h-16 z M60 28 h8 v8 h-8 z M80 24 h8 v8 h-8 z M98 12 h8 v8 h-8 z M60 26 h22 M98 18 h10 M74 46 h8 v8 h-8 z M94 46 h10 v8 h-10 z M60 58 h16 v8 h-16 z M98 58 h8 v8 h-8 z M74 76 h8 v18 h-8 z M60 92 h8 v8 h-8 z M96 96 h10 v4 h-10 z M126 56 h10 v8 h-10 z M150 56 h8 v8 h-8 z M126 76 h16 v10 h-16 z M126 94 h10 v10 h-10 z M150 94 h8 v18 h-8 z" fill="#0F172A" />
      </g>

      {/* Decorative */}
      <circle cx="95" cy="95" r="6" fill="#60A5FA" opacity="0.5" className="animate-pulse" />
      <circle cx="460" cy="105" r="4.5" fill="#60A5FA" opacity="0.4" />
      <polygon points="90,110 96,122 84,122" fill="#3B82F6" opacity="0.45" className="animate-float" />
      <circle cx="92" cy="400" r="5.5" fill="#93C5FD" opacity="0.4" className="animate-ping" />
    </svg>
  )
}

export function ConsumerHeroImage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 480" fill="none" className="w-full h-auto drop-shadow-2xl animate-floatSlow">
      {/* Purple/fuchsia background blob */}
      <ellipse cx="310" cy="248" rx="180" ry="200" fill="#7C3AED" opacity="0.4" />
      <ellipse cx="310" cy="248" rx="150" ry="170" fill="#8B5CF6" opacity="0.25" />

      {/* Legs */}
      <rect x="248" y="368" width="32" height="85" rx="6" fill="#1E293B" />
      <rect x="288" y="368" width="32" height="85" rx="6" fill="#1E293B" />
      <ellipse cx="264" cy="453" rx="22" ry="11" fill="#0F172A" />
      <ellipse cx="304" cy="453" rx="22" ry="11" fill="#0F172A" />

      {/* Body — casual top */}
      <path d="M230 232 C230 212 242 198 264 193 C286 198 298 212 298 232 L302 366 L226 366 Z" fill="#1E293B" />
      <path d="M250 205 L264 200 L278 205 L275 222 L253 222 Z" fill="#A855F7" />

      {/* Left arm raised holding phone */}
      <path d="M226 232 C201 222 166 207 148 185 C136 169 139 152 151 147" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
      <path d="M141 157 C141 145 151 137 162 142" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />

      {/* Right arm holding phone */}
      <path d="M298 232 C321 225 351 219 364 207 C376 195 372 179 360 175" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
      <path d="M372 187 C372 177 362 170 352 174" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />

      {/* Head */}
      <circle cx="264" cy="166" r="42" fill="#FBBF24" />
      <path d="M222 160 C222 128 242 108 264 102 C286 108 306 128 306 160 C306 140 290 126 264 122 C238 126 222 140 222 160 Z" fill="#1E293B" />
      <ellipse cx="264" cy="118" rx="24" ry="18" fill="#1E293B" />
      <path d="M291 140 C314 128 331 120 344 108 C350 102 344 96 336 102 C326 110 314 126 298 138" fill="#1E293B" />
      <circle cx="251" cy="164" r="4.5" fill="#1E293B" />
      <circle cx="277" cy="164" r="4.5" fill="#1E293B" />
      <circle cx="252.5" cy="163" r="1.8" fill="white" />
      <circle cx="278.5" cy="163" r="1.8" fill="white" />
      <path d="M250 180 C257 190 271 190 278 180" stroke="#92400E" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M244 154 C247 150 254 148 258 151" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M270 151 C274 148 281 150 284 154" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="222" cy="166" rx="8" ry="10" fill="#FBBF24" />
      <ellipse cx="306" cy="166" rx="8" ry="10" fill="#FBBF24" />

      {/* Phone screen with wallet card */}
      <g transform="translate(115, 100)">
        <rect width="290" height="210" rx="26" fill="white" stroke="#E2E8F0" strokeWidth="3.5" className="drop-shadow-xl" />
        <rect x="104" y="7" width="82" height="7" rx="3.5" fill="#E5E7EB" />
        <rect x="14" y="20" width="262" height="174" rx="18" fill="#FAF5FF" />
        <rect x="14" y="20" width="262" height="44" rx="18" fill="url(#cPhoneTop)" />
        <rect y="40" width="262" height="24" fill="url(#cPhoneTop)" />
        <rect x="32" y="28" width="65" height="6.5" rx="3.25" fill="white" />
        <rect x="32" y="39" width="95" height="4.5" rx="2.25" fill="white" opacity="0.7" />
        <rect x="32" y="76" width="226" height="96" rx="14" fill="white" stroke="#E9D5FF" strokeWidth="1.5" />
        <rect x="32" y="76" width="226" height="26" rx="14" fill="url(#cWalletCard)" />
        <rect y="88" width="226" height="14" fill="url(#cWalletCard)" />
        <rect x="46" y="82" width="70" height="6" rx="3" fill="white" />
        <circle cx="60" cy="122" r="16" fill="#F3E8FF" />
        <text x="60" y="127" textAnchor="middle" fill="#A855F7" fontSize="15" fontWeight="bold">£</text>
        <rect x="84" y="113" width="80" height="7" rx="3.5" fill="#1E293B" />
        <rect x="84" y="125" width="50" height="4.5" rx="2.25" fill="#94A3B8" />
        <rect x="46" y="142" width="110" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="200" y="116" width="40" height="14" rx="6" fill="#10B981" />
        <circle cx="244" cy="64" r="22" fill="#7C3AED" opacity="0.12" className="animate-pulse" />
        <text x="244" y="69" textAnchor="middle" fill="#7C3AED" fontSize="16" fontWeight="bold">✓</text>
      </g>

      {/* Floating cashback chip */}
      <g transform="translate(440, 300)">
        <circle r="34" fill="#F5F3FF" stroke="#C4B5FD" strokeWidth="2" className="animate-float" />
        <text y="11" textAnchor="middle" fill="#7C3AED" fontSize="26" fontWeight="bold">%</text>
        <text y="26" textAnchor="middle" fill="#7C3AED" fontSize="9" fontWeight="bold">CASHBACK</text>
      </g>

      {/* Decorative */}
      <circle cx="92" cy="95" r="5.5" fill="#C4B5FD" opacity="0.5" className="animate-pulse" />
      <circle cx="452" cy="100" r="4.5" fill="#C4B5FD" opacity="0.4" />
      <circle cx="88" cy="408" r="4.5" fill="#8B5CF6" opacity="0.3" className="animate-ping" />
      <polygon points="96,140 102,152 90,152" fill="#EF4444" opacity="0.4" className="animate-float" />

      <defs>
        <linearGradient id="cPhoneTop" x1="0" y1="0" x2="262" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id="cWalletCard" x1="0" y1="0" x2="226" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#C026D3" />
        </linearGradient>
      </defs>
    </svg>
  )
}