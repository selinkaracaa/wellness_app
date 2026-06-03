import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CHECK_IN_QUESTIONS, FRIENDS } from '../data/mockData'
import GlassCard from '../components/ui/GlassCard'
import UserAvatar from '../components/ui/UserAvatar'
import { QuestionSymbol } from '../components/ui/OptionSymbol'

const ACTIVITY_TINTS = ['card-tint-lavender', 'card-tint-peach', 'card-tint-sage', 'card-tint-white'] as const

function friendStreak(friendId: string): number {
  return FRIENDS.find((f) => f.id === friendId)?.streak ?? 0
}

export default function Social() {
  const { state, likeActivity, tryItYourself } = useApp()
  const navigate = useNavigate()

  const questionMap = Object.fromEntries(CHECK_IN_QUESTIONS.map((q) => [q.key, q]))

  const storyRow = [
    { name: 'You', avatar: state.avatar, streak: state.streak, friendId: undefined as string | undefined },
    ...state.friendActivities
      .filter((a, i, arr) => arr.findIndex((b) => b.friendId === a.friendId) === i)
      .slice(0, 5)
      .map((a) => ({
        name: a.friendName.split(' ')[0],
        avatar: a.avatar,
        streak: friendStreak(a.friendId),
        friendId: a.friendId,
      })),
  ]

  return (
    <div className="min-h-screen page-canvas pb-32">
      <div className="px-5 pt-14">
        <h1 className="text-[1.65rem] font-bold text-ink leading-tight">Friends</h1>
        <p className="text-muted font-medium mt-1">{state.friendActivities.length} updates today</p>
      </div>

      <div className="px-5 mt-6 space-y-6">
        <GlassCard className="card-tint-peach p-4">
          <p className="label-caps mb-3">Circle</p>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {storyRow.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <UserAvatar avatar={f.avatar} friendId={f.friendId} name={f.name} size="lg" />
                <p className="text-xs font-bold text-ink">{f.name}</p>
                <p className="text-[10px] font-semibold text-muted">{f.streak}d streak</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
          {state.friendActivities.map((activity, i) => {
            const question = questionMap[activity.questionKey]
            const tint = ACTIVITY_TINTS[i % ACTIVITY_TINTS.length]
            return (
              <GlassCard key={activity.id} className={`${tint} p-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar avatar={activity.avatar} friendId={activity.friendId} name={activity.friendName} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-ink">{activity.friendName}</p>
                    <p className="text-xs text-muted font-medium">{activity.timeAgo}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start glass-frosted rounded-2xl p-3">
                  <QuestionSymbol questionKey={activity.questionKey} size="md" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink leading-relaxed">{activity.answer}</p>
                    {question && <p className="text-xs text-muted mt-1">{question.label}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => likeActivity(activity.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold tap-scale ${
                      activity.liked ? 'text-sage' : 'text-muted'
                    }`}
                  >
                    <Heart size={16} fill={activity.liked ? 'currentColor' : 'none'} />
                    {activity.likes}
                  </button>
                  {!state.todayCheckedIn && (
                    <button
                      type="button"
                      onClick={() => {
                        tryItYourself(activity.questionKey)
                        navigate('/checkin')
                      }}
                      className="btn-lime text-xs py-2 px-3 tap-scale"
                    >
                      Try this question
                    </button>
                  )}
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
