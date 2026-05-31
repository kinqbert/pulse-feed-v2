import { db, pool } from "./db";
import { sql } from "drizzle-orm";
import {
  activities,
  activityComments,
  activityReactions,
  type ActivityMetadata,
  ActivityType,
  userActivities,
  users,
} from "./schema";
import { buildActivitySearchText } from "../modules/feed/activity-generator";

const USER_COUNT = 20;
const ACTIVITY_COUNT = 10000;
const MAX_COMMENTS_PER_ACTIVITY = 3;
const ACTIVITY_BATCH_SIZE = 250;
const COMMENT_BATCH_SIZE = 500;
const ACTIVITY_REACTION_BATCH_SIZE = 500;
const USER_ACTIVITY_BATCH_SIZE = 500;

const characterNames = [
  "Walter White",
  "Jesse Pinkman",
  "Skyler White",
  "Hank Schrader",
  "Marie Schrader",
  "Saul Goodman",
  "Mike Ehrmantraut",
  "Gus Fring",
  "Hector Salamanca",
  "Tuco Salamanca",
  "Skinny Pete",
  "Steven Gomez",
];

const entityNames = [
  "launch checklist",
  "weekly update",
  "design review",
  "customer thread",
  "planning session",
];

const taskNames = [
  "QA handoff",
  "Release notes",
  "Incident follow-up",
  "Billing audit",
  "Dashboard refresh",
];

const taskStatuses = ["Backlog", "In progress", "Blocked", "In review", "Done"];

const serviceNames = ["web", "api", "worker", "billing", "notifications"];

const deploymentStatuses: Array<
  ActivityMetadata<typeof ActivityType.Deployment>["status"]
> = ["success", "failed"];

const commentContents = [
  "Better call Saul!",
  "Yeah Mr. White! Yeah, science!",
  "You're the goddamn Iron Chef.",
  "No half measures.",
  "Say my name.",
  "Magnets!",
  "Someone has to protect this family.",
  "You got me.",
  "I am the one who knocks.",
];

const reactionEmojis = ["👍", "🎉", "❤️", "👀", "🚀"];

function randomInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

function randomItem<T>(items: readonly T[]) {
  return items[randomInt(items.length)];
}

function chunk<T>(items: readonly T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function randomDateWithinLastDays(days: number) {
  const now = Date.now();
  const offset = randomInt(days * 24 * 60 * 60 * 1000);

  return new Date(now - offset);
}

function buildActivityMetadata(type: ActivityType): ActivityMetadata {
  switch (type) {
    case ActivityType.Comment:
    case ActivityType.Mention:
      return {
        entityName: randomItem(entityNames),
      };
    case ActivityType.TaskUpdate: {
      const previousValue = randomItem(taskStatuses);
      const newValue = randomItem(
        taskStatuses.filter((status) => status !== previousValue),
      );

      return {
        taskName: randomItem(taskNames),
        previousValue,
        newValue,
      };
    }
    case ActivityType.Deployment:
      return {
        serviceName: randomItem(serviceNames),
        status: randomItem(deploymentStatuses),
      };
  }
}

async function seed() {
  const seededUsers = await db
    .insert(users)
    .values(
      Array.from({ length: USER_COUNT }, (_, index) => {
        const name = characterNames[index % characterNames.length];

        return {
          name,
          email: `seed-${index + 1}@example.test`,
        };
      }),
    )
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: sql`excluded.name`,
      },
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

  const activityValues = Array.from({ length: ACTIVITY_COUNT }, () => {
    const type = randomItem(Object.values(ActivityType));
    const actor = randomItem(seededUsers);
    const metadata = buildActivityMetadata(type);

    return {
      type,
      actorId: actor.id,
      metadata,
      searchText: buildActivitySearchText({ actor, metadata, type }),
      createdAt: randomDateWithinLastDays(45),
    };
  });

  const seededActivities: { id: string; createdAt: Date }[] = [];

  for (const batch of chunk(activityValues, ACTIVITY_BATCH_SIZE)) {
    const createdActivities = await db
      .insert(activities)
      .values(batch)
      .returning({
        id: activities.id,
        createdAt: activities.createdAt,
      });

    seededActivities.push(...createdActivities);
  }

  const firstUser = seededUsers[0];

  if (!firstUser) {
    throw new Error("At least one seeded user is required");
  }

  const userActivityValues = seededActivities.flatMap((activity) =>
    seededUsers.map((user) => ({
      activityId: activity.id,
      userId: user.id,
      isRead: user.id === firstUser.id,
    })),
  );

  for (const batch of chunk(userActivityValues, USER_ACTIVITY_BATCH_SIZE)) {
    await db.insert(userActivities).values(batch).onConflictDoNothing();
  }

  const activityReactionValues = seededActivities.flatMap((activity) => {
    const reactionsCount = randomInt(4);

    return Array.from({ length: reactionsCount }, () => ({
      activityId: activity.id,
      emoji: randomItem(reactionEmojis),
      userId: randomItem(seededUsers).id,
    }));
  });

  for (const batch of chunk(
    activityReactionValues,
    ACTIVITY_REACTION_BATCH_SIZE,
  )) {
    await db.insert(activityReactions).values(batch).onConflictDoNothing();
  }

  const commentValues = seededActivities.flatMap((activity) => {
    const commentsCount = randomInt(MAX_COMMENTS_PER_ACTIVITY + 1);

    return Array.from({ length: commentsCount }, (_, commentIndex) => ({
      activityId: activity.id,
      actorId: randomItem(seededUsers).id,
      content: randomItem(commentContents),
      createdAt: new Date(
        activity.createdAt.getTime() + (commentIndex + 1) * 60 * 1000,
      ),
    }));
  });

  for (const batch of chunk(commentValues, COMMENT_BATCH_SIZE)) {
    await db.insert(activityComments).values(batch);
  }

  console.log(
    `Seeded ${seededUsers.length} users, ${seededActivities.length} activities, ${userActivityValues.length} user activities, ${activityReactionValues.length} reactions, and ${commentValues.length} comments.`,
  );
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
