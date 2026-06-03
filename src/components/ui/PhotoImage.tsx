import { useState } from 'react'

interface PhotoImageProps {
  src: string
  alt: string
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'
}

const roundedMap = {
  none: '',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  '2xl': 'rounded-[1.25rem]',
  full: 'rounded-full',
}

export default function PhotoImage({ src, alt, className = '', rounded = 'lg' }: PhotoImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-[#F5E0C8] via-[#E8C49A] to-[#D4956A] ${roundedMap[rounded]} ${className}`}
        role="img"
        aria-label={alt}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${roundedMap[rounded]} ${className}`}
    />
  )
}
