import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const SLIDES = [
  {
    key: 'business',
    badge: 'For Businesses',
    title: (
      <>
        Create & Share Your <span className="text-blue-600">Digital Card</span>
      </>
    ),
    desc: 'Transform the way you share contact information. Create stunning digital vCards with customizable templates, appointment scheduling, and NFC sharing.',
    cta: { label: 'Create Your Card', to: '/register', color: 'blue' },
    secondary: { label: 'Learn More', to: '/templates' },
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 480" fill="none" className="w-full h-auto drop-shadow-2xl animate-floatSlow">
        {/* Purple background blob */}
        <ellipse cx="320" cy="250" rx="180" ry="200" fill="#7C3AED" opacity="0.9" />
        <ellipse cx="320" cy="250" rx="150" ry="170" fill="#8B5CF6" opacity="0.5" />

        {/* Legs */}
        <rect x="260" y="370" width="34" height="85" rx="6" fill="#1E293B" />
        <rect x="302" y="370" width="34" height="85" rx="6" fill="#1E293B" />
        <ellipse cx="277" cy="455" rx="24" ry="11" fill="#0F172A" />
        <ellipse cx="319" cy="455" rx="24" ry="11" fill="#0F172A" />

        {/* Body - suit */}
        <path d="M242 235 C242 212 254 195 278 190 C302 195 314 212 314 235 L318 370 L238 370 Z" fill="#1E293B" />
        {/* Shirt */}
        <path d="M262 210 L278 205 L294 210 L292 250 L264 250 Z" fill="#F1F5F9" />
        {/* Tie */}
        <path d="M275 232 L278 210 L281 232 L278 305 Z" fill="#EF4444" />

        {/* Left arm holding card */}
        <path d="M238 235 C210 248 175 278 170 310 C167 328 176 335 188 328" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
        <path d="M160 300 C160 288 172 278 184 284" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />

        {/* Right arm holding card */}
        <path d="M314 235 C338 252 362 278 368 308 C372 325 360 334 348 327" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
        <path d="M374 296 C374 284 362 274 350 280" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />

        {/* Giant business card */}
        <g transform="translate(105, 250) rotate(-5)">
          <rect width="320" height="195" rx="18" fill="white" stroke="#E2E8F0" strokeWidth="2.5" className="drop-shadow-xl" />
          <rect width="320" height="65" rx="18" fill="#3B82F6" />
          <rect y="47" width="320" height="18" fill="#3B82F6" />
          <circle cx="42" cy="32" r="18" fill="white" opacity="0.3" />
          <circle cx="42" cy="32" r="12" fill="white" opacity="0.5" />
          <rect x="70" y="23" width="90" height="7" rx="3.5" fill="white" />
          <rect x="70" y="35" width="55" height="5" rx="2.5" fill="white" opacity="0.7" />
          <rect x="32" y="80" width="65" height="9" rx="4.5" fill="#3B82F6" />
          <rect x="32" y="96" width="130" height="5.5" rx="2.75" fill="#E5E7EB" />
          <rect x="32" y="108" width="95" height="5.5" rx="2.75" fill="#E5E7EB" />
          <rect x="32" y="125" width="65" height="5.5" rx="2.75" fill="#CBD5E1" />
          <rect x="32" y="137" width="85" height="5.5" rx="2.75" fill="#CBD5E1" />
          <g transform="translate(245, 95)">
            <circle cx="28" cy="38" r="22" fill="#EEF2FF" stroke="#3B82F6" strokeWidth="1.5" />
            <path d="M22 32 C28 26 34 20 38 14" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M20 40 C28 32 36 24 42 18" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M18 48 C28 38 40 28 45 22" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* Head */}
        <circle cx="278" cy="172" r="44" fill="#FBBF24" />
        {/* Hair */}
        <path d="M234 166 C234 138 252 118 278 112 C304 118 322 138 322 166 C322 148 306 132 278 128 C250 132 234 148 234 166 Z" fill="#92400E" />
        <ellipse cx="278" cy="130" rx="28" ry="20" fill="#92400E" />
        {/* Eyes */}
        <circle cx="265" cy="170" r="4.5" fill="#1E293B" />
        <circle cx="291" cy="170" r="4.5" fill="#1E293B" />
        <circle cx="266.5" cy="169" r="1.8" fill="white" />
        <circle cx="292.5" cy="169" r="1.8" fill="white" />
        {/* Smile */}
        <path d="M264 186 C271 195 285 195 292 186" stroke="#92400E" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        {/* Eyebrows */}
        <path d="M258 160 C261 156 268 155 272 158" stroke="#92400E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M284 158 C288 155 295 156 298 160" stroke="#92400E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* Ears */}
        <ellipse cx="234" cy="172" rx="9" ry="11" fill="#FBBF24" />
        <ellipse cx="322" cy="172" rx="9" ry="11" fill="#FBBF24" />

        {/* Decorative elements */}
        <circle cx="80" cy="85" r="6" fill="#60A5FA" opacity="0.5" className="animate-pulse" />
        <circle cx="460" cy="110" r="4.5" fill="#60A5FA" opacity="0.4" />
        <circle cx="95" cy="410" r="5.5" fill="#93C5FD" opacity="0.4" className="animate-ping" />
        <polygon points="100,50 106,62 94,62" fill="#EF4444" opacity="0.4" className="animate-float" />
      </svg>
    ),
  },
  {
    key: 'consumer',
    badge: 'For Customers',
    title: (
      <>
        Save & Connect with <span className="text-purple-600">One Tap</span>
      </>
    ),
    desc: 'Your MCOMVCard comes through participating businesses. Find a business, connect, and receive your card — then create or sign in to your MCOM account to access it.',
    cta: { label: 'Connect with a Business', to: '/find-a-business', color: 'purple' },
    secondary: { label: 'Sign Up for Business', to: '/register' },
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 480" fill="none" className="w-full h-auto drop-shadow-2xl animate-floatSlow">
        {/* Purple background blob */}
        <ellipse cx="310" cy="250" rx="180" ry="200" fill="#7C3AED" opacity="0.9" />
        <ellipse cx="310" cy="250" rx="150" ry="170" fill="#8B5CF6" opacity="0.5" />

        {/* Legs */}
        <rect x="252" y="370" width="32" height="85" rx="6" fill="#1E293B" />
        <rect x="292" y="370" width="32" height="85" rx="6" fill="#1E293B" />
        <ellipse cx="268" cy="455" rx="22" ry="11" fill="#0F172A" />
        <ellipse cx="308" cy="455" rx="22" ry="11" fill="#0F172A" />

        {/* Body - casual */}
        <path d="M234 235 C234 215 246 200 268 195 C290 200 302 215 302 235 L306 370 L230 370 Z" fill="#1E293B" />
        <path d="M254 208 L268 203 L282 208 L279 225 L257 225 Z" fill="#3B82F6" />

        {/* Left arm - raised holding phone */}
        <path d="M230 235 C205 225 170 210 152 188 C140 172 143 155 155 150" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
        <path d="M145 160 C145 148 155 140 166 145" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />

        {/* Right arm - holding phone */}
        <path d="M302 235 C325 228 355 222 368 210 C380 198 376 182 364 178" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
        <path d="M376 190 C376 180 366 173 356 177" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />

        {/* Giant phone */}
        <g transform="translate(115, 105)">
          <rect width="300" height="215" rx="26" fill="white" stroke="#E2E8F0" strokeWidth="3.5" className="drop-shadow-xl" />
          <rect x="108" y="7" width="85" height="7" rx="3.5" fill="#E5E7EB" />
          <rect x="14" y="20" width="272" height="178" rx="18" fill="#F5F3FF" />
          <rect x="14" y="20" width="272" height="44" rx="18" fill="#8B5CF6" />
          <rect y="40" width="272" height="24" fill="#8B5CF6" />
          <rect x="32" y="28" width="65" height="6.5" rx="3.25" fill="white" />
          <rect x="32" y="39" width="95" height="4.5" rx="2.25" fill="white" opacity="0.7" />
          <rect x="32" y="75" width="236" height="110" rx="14" fill="white" stroke="#DDD6FE" strokeWidth="1.5" />
          <circle cx="64" cy="105" r="17" fill="#DDD6FE" />
          <circle cx="64" cy="102" r="12" fill="#C4B5FD" />
          <rect x="90" y="95" width="65" height="7" rx="3.5" fill="#1E293B" />
          <rect x="90" y="107" width="45" height="4.5" rx="2.25" fill="#94A3B8" />
          <rect x="32" y="132" width="105" height="5" rx="2.5" fill="#E5E7EB" />
          <rect x="32" y="143" width="85" height="5" rx="2.5" fill="#E5E7EB" />
          <rect x="32" y="162" width="65" height="10" rx="5" fill="#8B5CF6" />
          <rect x="210" y="162" width="35" height="10" rx="5" fill="#10B981" />
          <circle cx="252" cy="82" r="24" fill="#8B5CF6" opacity="0.15" />
          <circle cx="252" cy="82" r="16" fill="#8B5CF6" opacity="0.25" className="animate-pulse" />
          <text x="252" y="88" textAnchor="middle" fill="#8B5CF6" fontSize="18" fontWeight="bold">✓</text>
        </g>

        {/* Head */}
        <circle cx="268" cy="168" r="42" fill="#FBBF24" />
        <path d="M226 162 C226 130 246 110 268 104 C290 110 310 130 310 162 C310 142 294 128 268 124 C242 128 226 142 226 162 Z" fill="#1E293B" />
        <ellipse cx="268" cy="120" rx="24" ry="18" fill="#1E293B" />
        <path d="M295 142 C318 130 335 122 348 110 C354 104 348 98 340 104 C330 112 318 128 302 140" fill="#1E293B" />
        <circle cx="255" cy="166" r="4.5" fill="#1E293B" />
        <circle cx="281" cy="166" r="4.5" fill="#1E293B" />
        <circle cx="256.5" cy="165" r="1.8" fill="white" />
        <circle cx="282.5" cy="165" r="1.8" fill="white" />
        <path d="M254 182 C261 192 275 192 282 182" stroke="#92400E" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M248 156 C251 152 258 150 262 153" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M274 153 C278 150 285 152 288 156" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="226" cy="168" rx="8" ry="10" fill="#FBBF24" />
        <ellipse cx="310" cy="168" rx="8" ry="10" fill="#FBBF24" />

        {/* Decorative elements */}
        <circle cx="78" cy="82" r="5.5" fill="#C4B5FD" opacity="0.5" className="animate-pulse" />
        <circle cx="450" cy="95" r="4.5" fill="#C4B5FD" opacity="0.4" />
        <circle cx="92" cy="405" r="4.5" fill="#8B5CF6" opacity="0.3" className="animate-ping" />
        <polygon points="95,55 101,67 89,67" fill="#EF4444" opacity="0.4" className="animate-float" />
      </svg>
    ),
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length), [])
  const next = useCallback(() => setCurrent((p) => (p + 1) % SLIDES.length), [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative overflow-hidden">
      {/* Purple wave background */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect width="1440" height="600" fill="white" />
          <path d="M700 0 C900 0 1050 80 1200 150 C1350 220 1440 300 1440 400 C1440 520 1350 600 1200 600 L1440 600 L1440 0 Z" fill="#7C3AED" opacity="0.85" />
          <path d="M800 0 C950 50 1100 120 1250 200 C1400 280 1440 350 1440 420 C1440 530 1360 600 1250 600 L1440 600 L1440 0 Z" fill="#8B5CF6" opacity="0.4" />
          <path d="M650 0 C850 30 1000 100 1150 180 C1300 260 1440 340 1440 440 C1440 560 1320 600 1150 600 L1440 600 L1440 0 Z" fill="#6D28D9" opacity="0.15" />
        </svg>
      </div>

      {/* Decorative dots grid */}
      <div className="absolute top-16 right-8 lg:right-20 opacity-20">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          {[...Array(16)].map((_, i) => (
            <circle key={i} cx={(i % 4) * 18 + 6} cy={Math.floor(i / 4) * 18 + 6} r="2.5" fill="#8B5CF6" />
          ))}
        </svg>
      </div>

      {/* Floating decorative shapes */}
      <div className="absolute top-20 left-[15%] animate-float opacity-60">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <polygon points="10,2 18,18 2,18" stroke="#EF4444" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="absolute top-32 left-[8%] animate-floatSlow opacity-50">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="#F97316" strokeWidth="2.5" fill="none" />
        </svg>
      </div>
      <div className="absolute bottom-24 left-[25%] animate-floatSlow opacity-50">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#F97316" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="absolute bottom-16 right-[30%] animate-float opacity-40">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <circle cx="4" cy="4" r="3" fill="#8B5CF6" />
        </svg>
      </div>

      <div className="absolute -bottom-0 left-0 right-0 h-16 bg-white" style={{ borderRadius: '50% 50% 0 0' }} />

      <div className="max-w-7xl mx-auto px-4 w-full relative z-10 py-16 md:py-20">
        <div className="relative group/slider">
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.key}
              className={`transition-all duration-700 ease-in-out ${idx === current ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 absolute inset-0 pointer-events-none'}`}
              style={{ display: idx === current || idx === (current + 1) % SLIDES.length ? '' : 'none' }}
            >
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
                <div className="flex-1 text-center lg:text-left">
                  <div className={`inline-block px-5 py-1.5 text-sm font-medium rounded-full mb-5 animate-fadeInUp ${slide.key === 'business' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {slide.badge}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-5">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-gray-500 mb-7 max-w-lg mx-auto lg:mx-0">
                    {slide.desc}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <Link
                      to={slide.cta.to}
                      className={`inline-block px-8 py-3 text-white font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${slide.key === 'business' ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-200'}`}
                    >
                      {slide.cta.label}
                    </Link>
                    <Link
                      to={slide.secondary.to}
                      className="inline-block px-8 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                    >
                      {slide.secondary.label}
                    </Link>
                  </div>
                </div>

                <div className="flex-1 flex justify-center lg:justify-end">
                  <div className="relative w-80 md:w-[420px] lg:w-[520px]">
                    {slide.svg}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-6 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all z-20 opacity-0 group-hover/slider:opacity-100 pointer-events-none group-hover/slider:pointer-events-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-6 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all z-20 opacity-0 group-hover/slider:opacity-100 pointer-events-none group-hover/slider:pointer-events-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2.5 mt-8">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`transition-all duration-300 rounded-full ${idx === current ? 'w-8 h-2.5 bg-blue-600' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
