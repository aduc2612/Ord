import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

let _db: ReturnType<typeof drizzle>;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    if (!_db) {
      const expo = SQLite.openDatabaseSync('ord.db');
      _db = drizzle(expo);
    }
    return _db[prop as keyof ReturnType<typeof drizzle>];
  },
});
