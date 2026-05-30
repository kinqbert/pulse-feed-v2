import { Injectable } from "@nestjs/common";
import { and, count, desc, eq, lt, or } from "drizzle-orm";
import { db } from "../../db/db";
import { activities, activityComments, users } from "../../db/schema";

@Injectable()
export class FeedRepository {
  async getFeedActivities({
    cursor,
    limit,
  }: {
    cursor?: { createdAt: Date; id: string };
    limit: number;
  }) {
    return db
      .select({
        id: activities.id,
        type: activities.type,
        title: activities.title,
        createdAt: activities.createdAt,
        commentsCount: count(activityComments.id),
        actor: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(activities)
      .innerJoin(users, eq(activities.actorId, users.id))
      .leftJoin(
        activityComments,
        eq(activityComments.activityId, activities.id),
      )
      .where(
        cursor
          ? or(
              lt(activities.createdAt, cursor.createdAt),
              and(
                eq(activities.createdAt, cursor.createdAt),
                lt(activities.id, cursor.id),
              ),
            )
          : undefined,
      )
      .groupBy(
        activities.id,
        activities.type,
        activities.title,
        activities.createdAt,
        users.id,
        users.name,
        users.email,
      )
      .orderBy(desc(activities.createdAt), desc(activities.id))
      .limit(limit);
  }
}
