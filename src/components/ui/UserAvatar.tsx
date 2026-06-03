import PhotoImage from './PhotoImage'
import { IMAGES, friendAvatar, isAvatarUrl } from '../../design/images'

interface UserAvatarProps {
  avatar: string
  friendId?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
}

export default function UserAvatar({ avatar, friendId, name = 'User', size = 'md', className = '' }: UserAvatarProps) {
  const src = friendId
    ? friendAvatar(friendId)
    : isAvatarUrl(avatar)
      ? avatar
      : IMAGES.user.default

  return (
    <div className={`${sizeMap[size]} rounded-full overflow-hidden ring-2 ring-white/80 shrink-0 ${className}`}>
      <PhotoImage src={src} alt={name} rounded="full" className="w-full h-full" />
    </div>
  )
}
