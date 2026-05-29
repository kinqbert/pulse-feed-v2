import { pgEnum } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

// ENUMS
export const ActivityType = {
  Comment: "comment",
  Mention: "mention",
  Reaction: "reaction",
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

// UTILS
function enumToPgEnum<T extends Record<string, string>>(obj: T) {
  return Object.values(obj) as [T[keyof T], ...T[keyof T][]];
}

// CORE TABLES
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const ActivityTypeEnum = pgEnum(
  "activity_type_enum",
  enumToPgEnum(ActivityType),
);

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: ActivityTypeEnum().notNull(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  title: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
