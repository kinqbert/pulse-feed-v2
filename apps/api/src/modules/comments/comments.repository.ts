import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { activityComments, userActivities, users } from "../../db/schema";

@Injectable()
export class CommentsRepository {
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

  private getCommentById(commentId: string) {
    return db
      .select({
        id: activityComments.id,
        activityId: activityComments.activityId,
        content: activityComments.content,
        createdAt: activityComments.createdAt,
        actor: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(activityComments)
      .innerJoin(users, eq(activityComments.actorId, users.id))
      .where(eq(activityComments.id, commentId))
      .limit(1);
  }

  getActivityComments(activityId: string) {
    return db
      .select({
        id: activityComments.id,
        activityId: activityComments.activityId,
        content: activityComments.content,
        createdAt: activityComments.createdAt,
        actor: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(activityComments)
      .innerJoin(users, eq(activityComments.actorId, users.id))
      .where(eq(activityComments.activityId, activityId))
      .orderBy(activityComments.createdAt);
  }

  async createActivityComment({
    activityId,
    actorId,
    content,
  }: {
    activityId: string;
    actorId: string;
    content: string;
  }) {
    const [createdComment] = await db
      .insert(activityComments)
      .values({
        activityId,
        actorId,
        content,
      })
      .returning({
        id: activityComments.id,
      });

    const [comment] = await this.getCommentById(createdComment.id);

    return comment;
  }
}
