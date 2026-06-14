import { memo, useState } from 'react'

const presets = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-violet-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-cyan-600 text-white',
  'bg-indigo-600 text-white',
  'bg-teal-600 text-white',
]

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-16 w-16 text-xl',
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const Avatar = memo(function Avatar({ name, size = 'md', bgColor, src, className = '' }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(name)
  const hash = name ? name.charCodeAt(0) % presets.length : 0
  const palette = bgColor ?? presets[hash]
  const s = sizeClasses[size] ?? sizeClasses.md

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setImgError(true)}
        className={`shrink-0 rounded-full object-cover ${s} ${className}`}
        aria-hidden
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${palette} ${s} ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  )
})
