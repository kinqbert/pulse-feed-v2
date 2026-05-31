import { Injectable } from "@nestjs/common";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "../../db/db";
import {
  activities,
  activityComments,
  activityReactions,
  activityReads,
  type ActivityType,
  users,
} from "../../db/schema";

type ActivityReactionSummary = {
  emoji: string;
  count: number;
  hasReacted: boolean;
};

const getCommentsCount = () =>
  sql<number>`(select count(*)::int from ${activityComments} where ${activityComments.activityId} = ${activities.id})`;

const getReactionSummaries = (userId: string) =>
  sql<ActivityReactionSummary[]>`coalesce((
    select json_agg(
      json_build_object(
        'emoji', reaction_summary.emoji,
        'count', reaction_summary.count,
        'hasReacted', reaction_summary.has_reacted
      )
      order by reaction_summary.emoji
    )
    from (
      select
        ${activityReactions.emoji} as emoji,
        count(*)::int as count,
        bool_or(${activityReactions.userId} = ${userId}) as has_reacted
      from ${activityReactions}
      where ${activityReactions.activityId} = ${activities.id}
      group by ${activityReactions.emoji}
    ) reaction_summary
  ), '[]'::json)`;

@Injectable()
export class FeedRepository {
  async getFeedActivities({
    cursor,
    filters,
    limit,
    userId,
  }: {
    cursor?: { createdAt: Date; id: string };
    filters?: {
      actorId?: string;
      from?: Date;
      query?: string;
      to?: Date;
      type?: ActivityType;
    };
    limit: number;
    userId: string;
  }) {
    const whereConditions: SQL[] = [];

    if (cursor) {
      const cursorCondition = or(
        lt(activities.createdAt, cursor.createdAt),
        and(
          eq(activities.createdAt, cursor.createdAt),
          lt(activities.id, cursor.id),
        ),
      );

      if (cursorCondition) {
        whereConditions.push(cursorCondition);
      }
    }

    if (filters?.actorId) {
      whereConditions.push(eq(activities.actorId, filters.actorId));
    }

    if (filters?.from) {
      whereConditions.push(gte(activities.createdAt, filters.from));
    }

    if (filters?.query) {
      whereConditions.push(
        sql`(
          ${activities.searchText} ilike ${`%${filters.query}%`}
          or word_similarity(${filters.query}, ${activities.searchText}) > 0.5
        )`,
      );
    }

    if (filters?.to) {
      whereConditions.push(lt(activities.createdAt, filters.to));
    }

    if (filters?.type) {
      whereConditions.push(eq(activities.type, filters.type));
    }

    return db
      .select({
        id: activities.id,
        type: activities.type,
        metadata: activities.metadata,
        isRead: sql<boolean>`${activityReads.activityId} is not null`,
        commentsCount: getCommentsCount(),
        reactions: getReactionSummaries(userId),
        createdAt: activities.createdAt,
        actor: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(activities)
      .innerJoin(users, eq(activities.actorId, users.id))
      .leftJoin(
        activityReads,
        and(
          eq(activityReads.activityId, activities.id),
          eq(activityReads.userId, userId),
        ),
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(activities.createdAt), desc(activities.id))
      .limit(limit);
  }

  getFeedActors() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .innerJoin(activities, eq(activities.actorId, users.id))
      .groupBy(users.id, users.name, users.email)
      .orderBy(asc(users.name), asc(users.email));
  }

  getActivityActors() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .orderBy(asc(users.name), asc(users.email));
  }

  async createFeedActivity(activity: typeof activities.$inferInsert) {
    const [createdActivity] = await db
      .insert(activities)
      .values(activity)
      .returning({
        id: activities.id,
        type: activities.type,
        metadata: activities.metadata,
        createdAt: activities.createdAt,
      });

    return createdActivity;
  }

  async markActivityRead(activityId: string, userId: string) {
    const [activity] = await db
      .select({
        id: activities.id,
      })
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);

    if (!activity) {
      return undefined;
    }

    await db
      .insert(activityReads)
      .values({
        activityId,
        userId,
      })
      .onConflictDoNothing();
  }

  async markAllActivitiesRead(userId: string) {
    const unreadActivities = await db
      .select({
        activityId: activities.id,
      })
      .from(activities)
      .leftJoin(
        activityReads,
        and(
          eq(activityReads.activityId, activities.id),
          eq(activityReads.userId, userId),
        ),
      )
      .where(isNull(activityReads.activityId));

    if (unreadActivities.length === 0) {
      return;
    }

    await db
      .insert(activityReads)
      .values(
        unreadActivities.map(({ activityId }) => ({
          activityId,
          userId,
        })),
      )
      .onConflictDoNothing();
  }

  async markActivityUnread(activityId: string, userId: string) {
    const [activity] = await db
      .select({
        id: activities.id,
      })
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);

    if (!activity) {
      return undefined;
    }

    await db
      .delete(activityReads)
      .where(
        and(
          eq(activityReads.activityId, activityId),
          eq(activityReads.userId, userId),
        ),
      );
  }
}
