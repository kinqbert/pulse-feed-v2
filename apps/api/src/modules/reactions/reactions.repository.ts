import { Injectable } from "@nestjs/common";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { activityReactions, userActivities } from "../../db/schema";

@Injectable()
export class ReactionsRepository {
  async activityBelongsToUser(activityId: string, userId: string) {
    const [activity] = await db
      .select({
        activityId: userActivities.activityId,
      })
      .from(userActivities)
      .where(
        and(
          eq(userActivities.activityId, activityId),
          eq(userActivities.userId, userId),
        ),
      )
      .limit(1);

    return Boolean(activity);
  }

  async addReaction(activityId: string, emoji: string, userId: string) {
    await db
      .insert(activityReactions)
      .values({
        activityId,
        emoji,
        userId,
      })
      .onConflictDoNothing();
  }

  async removeReaction(activityId: string, emoji: string, userId: string) {
    await db
      .delete(activityReactions)
      .where(
        and(
          eq(activityReactions.activityId, activityId),
          eq(activityReactions.emoji, emoji),
          eq(activityReactions.userId, userId),
        ),
      );
  }

  async getActivityReactions(activityId: string, userId: string) {
    return db
      .select({
        emoji: activityReactions.emoji,
        count: sql<number>`count(*)::int`,
        hasReacted: sql<boolean>`bool_or(${activityReactions.userId} = ${userId})`,
      })
      .from(activityReactions)
      .where(eq(activityReactions.activityId, activityId))
      .groupBy(activityReactions.emoji)
      .orderBy(asc(activityReactions.emoji));
  }
}
