import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver'
import { PowerSyncDatabase, Schema, Table, column } from '@powersync/react-native'
import { OPSqliteOpenFactory } from '@powersync/op-sqlite'
import { tasks, projects, tags, taskTags, notes } from '@/db/schema'

export const drizzleSchema = {
  tasks,
  projects,
  tags,
  task_tags: taskTags,
  notes,
}

// PowerSync schema
const powerSyncSchema = new Schema({
  tasks: new Table({
    id: column.text,
    user_id: column.text,
    title: column.text,
    description: column.text,
    category: column.text,
    project_id: column.text,
    due_date: column.integer,
    completed_at: column.integer,
    updated_at: column.integer,
  }),
  projects: new Table({
    id: column.text,
    user_id: column.text,
    title: column.text,
    description: column.text,
    is_active: column.integer,
    updated_at: column.integer,
  }),
  tags: new Table({
    id: column.text,
    user_id: column.text,
    title: column.text,
    updated_at: column.integer,
  }),
  task_tags: new Table({
    id: column.text,
    user_id: column.text,
    task_id: column.text,
    tag_id: column.text,
    updated_at: column.integer,
  }),
  notes: new Table({
    id: column.text,
    user_id: column.text,
    title: column.text,
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
