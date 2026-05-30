import { db, pool } from "./db";
import { activities, activityComments, ActivityType, users } from "./schema";

const USER_COUNT = 20;
const ACTIVITY_COUNT = 10000;
const MAX_COMMENTS_PER_ACTIVITY = 3;
const ACTIVITY_BATCH_SIZE = 250;
const COMMENT_BATCH_SIZE = 500;

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

const activityTemplates: Record<ActivityType, string[]> = {
  [ActivityType.Comment]: [
    "commented on the launch checklist",
    "left feedback on the weekly update",
    "added context to the design review",
    "replied to the customer thread",
    "shared notes from the planning session",
  ],
  [ActivityType.Mention]: [
    "mentioned the support team in a triage note",
    "mentioned product in a release discussion",
    "mentioned design in a handoff thread",
    "mentioned engineering in an incident follow-up",
    "mentioned operations in a rollout update",
  ],
  [ActivityType.Reaction]: [
    "reacted to the sprint recap",
    "reacted to a milestone announcement",
    "reacted to the incident summary",
    "reacted to the product demo",
    "reacted to a dashboard update",
  ],
};

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

async function seed() {
  const runId = Date.now().toString(36);

  const seededUsers = await db
    .insert(users)
    .values(
      Array.from({ length: USER_COUNT }, (_, index) => {
        const name = characterNames[index % characterNames.length];

        return {
          name,
          email: `seed+${runId}-${index + 1}@example.test`,
        };
      }),
    )
    .returning({
      id: users.id,
      name: users.name,
    });

  const activityValues = Array.from({ length: ACTIVITY_COUNT }, () => {
    const type = randomItem(Object.values(ActivityType));
    const actor = randomItem(seededUsers);
    const title = `${actor.name} ${randomItem(activityTemplates[type])}`;

    return {
      type,
      actorId: actor.id,
      title,
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
    `Seeded ${seededUsers.length} users, ${seededActivities.length} activities, and ${commentValues.length} comments.`,
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
