import { useState } from 'react'
import { Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/ui/PageHeader'
import UserAvatar from '../components/ui/UserAvatar'
import CameraCapture from '../components/CameraCapture'

export default function Social() {
  const { state, setActiveCycle } = useApp()
  const [showCamera, setShowCamera] = useState(false)
  const feedUnlocked = state.todayPhotoSubmitted
  const cyclePosts = state.cyclePosts.filter((p) => p.cycleId === state.activeCycleId)

  return (
    <div className="min-h-screen page-canvas pb-36">
      <PageHeader
        kicker="Social cycles"
        title="Shared proof"
        subtitle="Everyone in your cycle gets the same prompt. Capture live to unlock the feed."
      />

      <div className="px-5 flex gap-2 overflow-x-auto scrollbar-hide">
        {state.cycles.map((cycle) => (
          <button
            key={cycle.id}
            type="button"
            onClick={() => setActiveCycle(cycle.id)}
            className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 tap-scale ${
              state.activeCycleId === cycle.id
                ? 'bg-ink text-white shadow-sm'
                : 'card-premium text-ink-soft'
            }`}
          >
            {cycle.name}
          </button>
        ))}
      </div>

      <div className="px-5 mt-6">
        <div className="challenge-banner rounded-[1.5rem] px-6 py-6 text-white">
          <p className="label-caps text-white/45">Synchronized challenge</p>
          <p className="font-display text-[1.35rem] leading-snug mt-2">{state.dailyPhotoChallenge.prompt}</p>
          <p className="text-xs text-white/45 mt-4 flex items-center gap-2">
            <Clock size={13} strokeWidth={1.75} />
            {state.dailyPhotoChallenge.expiresIn} remaining
          </p>
        </div>
      </div>

      <div className="px-5 mt-6 relative">
        <div
          className={`space-y-4 transition-all duration-700 ${!feedUnlocked ? 'blur-[28px] scale-[0.98] pointer-events-none select-none' : ''}`}
        >
          {cyclePosts.map((post, i) => (
            <div
              key={post.id}
              className="card-premium rounded-[1.25rem] overflow-hidden"
              style={{ marginLeft: i % 2 === 1 ? '1.5rem' : 0 }}
            >
              <div className="aspect-[4/5] relative">
                <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-4 flex items-center gap-3">
                <UserAvatar avatar={post.avatar} friendId={post.friendId} name={post.friendName} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-ink">{post.friendName}</p>
                  <p className="text-[11px] text-muted mt-0.5">{post.timeAgo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!feedUnlocked && (
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="absolute inset-0 flex flex-col items-center justify-end pb-8 tap-scale"
          >
            <div className="feed-blur-overlay absolute inset-0 rounded-[1.25rem]" />
            <span className="relative z-10 btn-dark px-6 py-3.5 text-sm shadow-lg">
              Open camera portal
            </span>
            <span className="relative z-10 text-[11px] text-muted mt-3">Live capture only</span>
          </button>
        )}
      </div>

      {showCamera && (
        <CameraCapture onClose={() => setShowCamera(false)} onSuccess={() => setShowCamera(false)} />
      )}
    </div>
  )
}
