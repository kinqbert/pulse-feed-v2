import { Injectable } from "@nestjs/common";
import { count, desc, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { activities, activityComments, users } from "../../db/schema";

@Injectable()
export class FeedRepository {
  async getAllFeedActivities() {
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
      .groupBy(
        activities.id,
        activities.type,
        activities.title,
        activities.createdAt,
        users.id,
        users.name,
        users.email,
      )
      .orderBy(desc(activities.createdAt));
  }
}
