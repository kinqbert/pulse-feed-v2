import { defineConfig } from 'drizzle-kit';
import { CONFIG } from './src/lib/config';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: CONFIG.DATABASE_URL,
  },
});
