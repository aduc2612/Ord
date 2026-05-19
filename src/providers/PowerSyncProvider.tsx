import { PropsWithChildren, useEffect, useState } from 'react'
import { PowerSyncContext } from '@powersync/react-native'
import { powerSyncDb } from '@/lib/powersync'
import { connector } from '@/lib/powersync'
import { supabase } from '@/lib/supabase'

export function PowerSyncProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let isFirstCallback = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        powerSyncDb.connect(connector)
      } else {
        powerSyncDb.disconnectAndClear()
      }
      if (isFirstCallback) {
        isFirstCallback = false
        setIsReady(true)
      }
    })

    return () => {
      subscription.unsubscribe()
      powerSyncDb.disconnect()
    }
  }, [])

  if (!isReady) return null

  return (
    <PowerSyncContext.Provider value={powerSyncDb}>
      {children}
    </PowerSyncContext.Provider>
  )
}
