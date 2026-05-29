import { timestamp } from "drizzle-orm/pg-core";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const activityTypeEnum = ["comment", "mention", "reaction"] as const;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type", { enum: activityTypeEnum }).notNull(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  title: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
