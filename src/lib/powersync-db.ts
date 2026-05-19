import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver'
import { PowerSyncDatabase, Schema, Table, column } from '@powersync/react-native'
import { OPSqliteOpenFactory } from '@powersync/op-sqlite'
import { testItems } from '@/db/schema'

export const drizzleSchema = {
  test_items: testItems,
}

// PowerSync schema
const powerSyncSchema = new Schema({
  test_items: new Table({
    id: column.text,
    user_id: column.text,
    title: column.text,
    created_at: column.integer,
    updated_at: column.integer,
  }),
})

const powerSyncDbInstance = new PowerSyncDatabase({
  schema: powerSyncSchema,
  database: new OPSqliteOpenFactory({ dbFilename: 'ord.db' }),
})

// Drizzle-wrapped PowerSync database — use this for all queries
export const db = wrapPowerSyncWithDrizzle(powerSyncDbInstance, {
  schema: drizzleSchema,
})

export { powerSyncDbInstance as powerSyncDb }
