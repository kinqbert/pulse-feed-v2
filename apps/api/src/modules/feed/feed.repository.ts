import { Injectable } from "@nestjs/common";
import { and, asc, desc, eq, gte, lt, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/db";
import {
  activities,
  activityComments,
  activityReactions,
  type ActivityType,
  userActivities,
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
        sql`${activities.searchText} ilike ${`%${filters.query}%`}`,
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
        isRead: userActivities.isRead,
        isUrgent: activities.isUrgent,
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
      .innerJoin(
        userActivities,
        and(
          eq(userActivities.activityId, activities.id),
          eq(userActivities.userId, userId),
        ),
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(activities.createdAt), desc(activities.id))
      .limit(limit);
  }

  getFeedActors(userId: string) {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .innerJoin(activities, eq(activities.actorId, users.id))
      .innerJoin(
        userActivities,
        and(
          eq(userActivities.activityId, activities.id),
          eq(userActivities.userId, userId),
        ),
      )
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

  async getUnreadActivitiesCount(userId: string) {
    const [result] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(userActivities)
      .where(
        and(
          eq(userActivities.userId, userId),
          eq(userActivities.isRead, false),
        ),
      );

    return result?.count ?? 0;
  }

  async createFeedActivity(
    activity: typeof activities.$inferInsert,
    userIds: string[],
  ) {
    const createdActivity = await db.transaction(async (tx) => {
      const [createdActivity] = await tx
        .insert(activities)
        .values(activity)
        .returning({
          id: activities.id,
          type: activities.type,
          metadata: activities.metadata,
          isUrgent: activities.isUrgent,
          createdAt: activities.createdAt,
        });

      await tx.insert(userActivities).values(
        userIds.map((userId) => ({
          activityId: createdActivity.id,
          userId,
        })),
      );

      return createdActivity;
    });

    return createdActivity;
  }

  async markActivityRead(activityId: string, userId: string) {
    return this.updateActivityReadState(activityId, userId, true);
  }

  async markAllActivitiesRead(userId: string) {
    await db
      .update(userActivities)
      .set({ isRead: true })
      .where(eq(userActivities.userId, userId));
  }

  async markActivityUnread(activityId: string, userId: string) {
    return this.updateActivityReadState(activityId, userId, false);
  }

  private async updateActivityReadState(
    activityId: string,
    userId: string,
    isRead: boolean,
  ) {
    const [updatedActivity] = await db
      .update(userActivities)
      .set({ isRead })
      .where(
        and(
          eq(userActivities.activityId, activityId),
          eq(userActivities.userId, userId),
        ),
      )
      .returning({
        activityId: userActivities.activityId,
      });

    return Boolean(updatedActivity);
  }
}
