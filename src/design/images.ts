/** Warm editorial photography — cohesive earth/luxury mood */

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`

export const IMAGES = {
  hero: {
    home: '/images/hero-home.png',
    profile: '/images/hero-checkin.png',
    checkin: '/images/hero-checkin.png',
    social: '/images/hero-energy.png',
    challenges: '/images/hero-energy.png',
  },
  user: {
    default: u('photo-1534528741775-53994a69daeb', 400),
  },
  friends: {
    f1: u('photo-1438761681033-6461ffad8d80', 200),
    f2: u('photo-1500648767791-00dcc994a43e', 200),
    f3: u('photo-1539575250167-5889ecd5af17', 200),
    f4: u('photo-1506794778202-cad84cf45f1d', 200),
    f5: u('photo-1544005313-94ddf0286df2', 200),
  },
  /** One hero image per category — used on home summary & social */
  categories: {
    water: u('photo-1559827260-dc66d52bef19', 400),
    activity: u('photo-1534438327276-14e5300c3a48', 400),
    nutrition: u('photo-1512621776951-a57141f2eefd', 400),
    sleep: u('photo-1631049301164-da64c126d8be', 400),
    screen: u('photo-1493612276216-ee3925520721', 400),
    mood: u('photo-1506126613408-eca07ce68773', 400),
  },
  misc: {
    complete: u('photo-1544367567-0f2fcb009e0b', 500),
    streak: u('photo-1571019614242-c5c5dee9f50e', 400),
    trophy: u('photo-1461896836934-ffe607f279ce', 500),
    checkinCta: u('photo-1544367567-0f2fcb009e0b', 500),
  },
} as const

export function friendAvatar(friendId: string): string {
  return IMAGES.friends[friendId as keyof typeof IMAGES.friends] ?? IMAGES.user.default
}

export function categoryImage(key: string): string {
  return IMAGES.categories[key as keyof typeof IMAGES.categories] ?? IMAGES.misc.complete
}

export function isAvatarUrl(avatar: string): boolean {
  return avatar.startsWith('http')
}
