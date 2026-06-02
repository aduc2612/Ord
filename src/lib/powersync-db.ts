import {
  wrapPowerSyncWithDrizzle,
  DrizzleAppSchema,
} from "@powersync/drizzle-driver";
import { PowerSyncDatabase } from "@powersync/react-native";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite";
import { tasks, projects, tags, taskTags, notes } from "@/db/schema";

// Drizzle schema used for queries and auto-generating the PowerSync schema
export const drizzleSchema = {
  tasks,
  projects,
  tags,
  task_tags: taskTags,
  notes,
};

// Auto-generate the PowerSync schema from Drizzle definitions.
// This eliminates the need to maintain a separate manual PowerSync schema,
// preventing dual-schema drift.
const powerSyncSchema = new DrizzleAppSchema(drizzleSchema);

const powerSyncDbInstance = new PowerSyncDatabase({
  schema: powerSyncSchema,
  database: new OPSqliteOpenFactory({ dbFilename: "ord.db" }),
});

// Drizzle-wrapped PowerSync database — use this for all queries
export const db = wrapPowerSyncWithDrizzle(powerSyncDbInstance, {
  schema: drizzleSchema,
});

export { powerSyncDbInstance as powerSyncDb };
