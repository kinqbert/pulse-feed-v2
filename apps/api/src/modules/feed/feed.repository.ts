import { Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { activities, users } from "../../db/schema";

@Injectable()
export class FeedRepository {
  async getAllFeedActivities() {
    return db
      .select({
        id: activities.id,
        type: activities.type,
        title: activities.title,
        createdAt: activities.createdAt,
        actor: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(activities)
      .innerJoin(users, eq(activities.actorId, users.id))
      .orderBy(desc(activities.createdAt));
  }
}
