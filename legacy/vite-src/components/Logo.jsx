import { Link } from 'react-router-dom'

export default function Logo({ className = '', compact = false, light = false }) {
  return (
    <Link
      to="/"
      className={`group inline-flex flex-col leading-none tracking-tight ${className}`}
      aria-label="Pilar Informa — inicio"
    >
      <span
        className={`font-extrabold uppercase transition-colors ${
          light ? 'text-paper group-hover:text-teal-soft' : 'text-ink group-hover:text-teal'
        } ${compact ? 'text-[13px]' : 'text-sm md:text-[15px]'}`}
      >
        Pilar
      </span>
      <span
        className={`font-display font-semibold ${
          light ? 'text-teal-soft' : 'text-teal'
        } ${compact ? 'text-lg' : 'text-xl md:text-[1.65rem]'}`}
      >
        Informa
      </span>
    </Link>
  )
}
