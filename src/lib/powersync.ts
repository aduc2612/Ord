import { supabase } from './supabase'
import type { PowerSyncBackendConnector, PowerSyncCredentials } from '@powersync/react-native'
import { AbstractPowerSyncDatabase, UpdateType } from '@powersync/react-native'
import { powerSyncDb } from './powersync-db'

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL ?? ''

interface SupabaseResultError {
  code?: string
  status?: number
}

function isPermanentError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const err = error as SupabaseResultError
  return err.code === '42501' || err.status === 400
}

export const connector: PowerSyncBackendConnector = {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) throw error ?? new Error('No active session')
    return {
      endpoint: POWERSYNC_URL,
      token: session.access_token,
      expiresAt: new Date((session.expires_at ?? 0) * 1000),
    }
  },

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction()
    if (!transaction) return

    for (const op of transaction.crud) {
      const { op: opType, table, opData, id } = op
      try {
        let result: { error: unknown }
        if (opType === UpdateType.PUT) {
          result = await supabase.from(table).upsert({ ...opData, id } as Record<string, unknown>)
        } else if (opType === UpdateType.PATCH) {
          result = await supabase.from(table).update(opData ?? {}).eq('id', id)
        } else {
          result = await supabase.from(table).delete().eq('id', id)
        }
        if (result.error) throw result.error
      } catch (error: unknown) {
        if (isPermanentError(error)) {
          console.error('Permanent upload error, skipping operation:', id, error)
          continue
        }
        throw error
      }
    }
    await transaction.complete()
  },
}

export { powerSyncDb }
