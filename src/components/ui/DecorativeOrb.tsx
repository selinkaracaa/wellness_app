interface DecorativeOrbProps {
  size?: number
  className?: string
}

export default function DecorativeOrb({ size = 88, className = '' }: DecorativeOrbProps) {
  return (
    <div
      className={`glass-orb rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: '0 8px 32px rgba(107, 92, 232, 0.25), inset 0 -4px 12px rgba(255,255,255,0.4)',
      }}
      aria-hidden
    />
  )
}
