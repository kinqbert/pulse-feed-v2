import { drizzle } from "drizzle-orm/node-postgres";
import { CONFIG } from "../lib/config";

import * as schema from "./schema";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: CONFIG.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, {
  schema,
  casing: "snake_case",
});
