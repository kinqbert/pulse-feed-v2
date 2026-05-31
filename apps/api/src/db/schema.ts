import { pgEnum } from "drizzle-orm/pg-core";
import { jsonb } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { primaryKey } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { customType, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ENUMS
export const ActivityType = {
  Comment: "comment",
  Mention: "mention",
  TaskUpdate: "task_update",
  Deployment: "deployment",
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export type ActivityMetadataByType = {
  [ActivityType.Comment]: {
    entityName: string;
  };
  [ActivityType.Mention]: {
    entityName: string;
  };
  [ActivityType.TaskUpdate]: {
    taskName: string;
    previousValue?: string;
    newValue: string;
  };
  [ActivityType.Deployment]: {
    serviceName: string;
    status: "success" | "failed";
  };
};

export type ActivityMetadata<TType extends ActivityType = ActivityType> =
  ActivityMetadataByType[TType];

// UTILS
function enumToPgEnum<T extends Record<string, string>>(obj: T) {
  return Object.values(obj) as [T[keyof T], ...T[keyof T][]];
}

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

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

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: ActivityTypeEnum().notNull(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    metadata: jsonb("metadata").$type<ActivityMetadata>().notNull(),
    searchText: text("search_text").notNull(),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`to_tsvector('simple', search_text)`,
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("activities_created_at_id_idx").on(
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index("activities_actor_id_created_at_id_idx").on(
      table.actorId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index("activities_type_created_at_id_idx").on(
      table.type,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index("activities_search_text_trgm_idx").using(
      "gin",
      table.searchText.op("gin_trgm_ops"),
    ),
    index("activities_search_vector_idx").using("gin", table.searchVector),
  ],
);

export const activityReads = pgTable(
  "activity_reads",
  {
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => [primaryKey({ columns: [table.activityId, table.userId] })],
);

export const activityComments = pgTable(
  "activity_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    content: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("activity_comments_activity_id_idx").on(table.activityId)],
);

export const activityReactions = pgTable(
  "activity_reactions",
  {
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id),
    emoji: text("emoji").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => [
    primaryKey({ columns: [table.activityId, table.emoji, table.userId] }),
  ],
);
