import { TrackingBlock } from '@/types'
import { useAnalyticsStore } from '@/store/analytics-store'
import { usePomodoroStore } from '@/store/pomodoro-store'

export const storeLifecycle = {
  onBlockTracked: (block: TrackingBlock) => {
    // Only dispatch cross-store actions if methods exist or adapt to what's available
    const analyticsState = useAnalyticsStore.getState()
    if (analyticsState.queueEvent) {
      analyticsState.queueEvent(block as any)
    }
    
    // Attempt pomodoro link if supported
    // const pomodoroState = usePomodoroStore.getState()
    // if (pomodoroState.linkBlock) { pomodoroState.linkBlock(block.id) }
  },
  onSessionCompleted: (session: any) => {
    // analyticsStore.getState().logSession(session)
  }
}
