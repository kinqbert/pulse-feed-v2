import { Injectable } from "@nestjs/common";
import { and, asc, desc, eq, gte, lt, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/db";
import {
  activities,
  activityReads,
  type ActivityType,
  users,
} from "../../db/schema";

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

    if (filters?.type) {
      whereConditions.push(eq(activities.type, filters.type));
    }

    return db
      .select({
        id: activities.id,
        type: activities.type,
        metadata: activities.metadata,
        isRead: sql<boolean>`${activityReads.activityId} is not null`,
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

    return {
      ...activity,
      isRead: true,
    };
  }
}
