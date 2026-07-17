import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C14.5 0 10 3 7 7C4 11 2 16 2 16L8 20C8 20 10 15 13 12C16 9 18 8 20 8C22 8 24 9 27 12C30 15 32 20 32 20L38 16C38 16 36 11 33 7C30 3 25.5 0 20 0Z" fill="url(#paint0_linear)"/>
        <path d="M20 28C25.5 28 30 25 33 21C36 17 38 12 38 12L32 8C32 8 30 13 27 16C24 19 22 20 20 20C18 20 16 19 13 16C10 13 8 8 8 8L2 12C2 12 4 17 7 21C10 25 14.5 28 20 28Z" fill="url(#paint1_linear)"/>
        <defs>
          <linearGradient id="paint0_linear" x1="2" y1="0" x2="38" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F8CFF"/>
            <stop offset="1" stopColor="#6C63FF"/>
          </linearGradient>
          <linearGradient id="paint1_linear" x1="2" y1="8" x2="38" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF8C42"/>
            <stop offset="1" stopColor="#FF6B6B"/>
          </linearGradient>
        </defs>
      </svg>
    </Link>
  )
}
