import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src="/assets/img/new_home_page/MCOM Sample.png"
        alt="MCOM Logo"
        className="h-7 w-auto"
      />
    </Link>
  )
}
