import { useEffect } from 'react'

export function useGroupEvents(groupId, handlers) {
  useEffect(() => {
    // Guard against missing groupId or environments without EventSource (e.g. Node/Vitest)
    if (!groupId || typeof window === 'undefined' || typeof EventSource === 'undefined') return

    const url = `/api/groups/${groupId}/events`
    const es = new EventSource(url)

    es.addEventListener('connected', () => {
      console.log('SSE connected to group', groupId)
    })

    es.addEventListener('viewers', (e) => {
      const { count } = JSON.parse(e.data)
      handlers.onViewers?.(count)
    })

    es.addEventListener('expense_added', (e) => {
      const expense = JSON.parse(e.data)
      handlers.onExpenseAdded?.(expense)
    })

    es.addEventListener('expense_deleted', (e) => {
      const { id } = JSON.parse(e.data)
      handlers.onExpenseDeleted?.(id)
    })

    es.addEventListener('splits_recalculated', () => {
      handlers.onSplitsRecalculated?.()
    })

    es.addEventListener('member_added', (e) => {
      const user = JSON.parse(e.data)
      handlers.onMemberAdded?.(user)
    })

    es.addEventListener('settlement_confirmed', (e) => {
      const confirmation = JSON.parse(e.data)
      handlers.onSettlementConfirmed?.(confirmation)
    })

    es.onerror = () => {
      console.warn('SSE connection lost, will retry...')
    }

    return () => {
      es.close()
    }
  }, [groupId])
}