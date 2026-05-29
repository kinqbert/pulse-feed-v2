import { drizzle } from 'drizzle-orm/node-postgres';
import { CONFIG } from '../lib/config';

import * as schema from './schema';

export const db = drizzle(CONFIG.DATABASE_URL, {
  schema,
  casing: 'snake_case',
});
