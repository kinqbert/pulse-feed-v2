import { type ActivityMetadata, ActivityType } from "../../db/schema";

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

export type ActivityActor = {
  email: string;
  id: string;
  name: string;
};

function randomInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

export function randomItem<T>(items: readonly T[]) {
  return items[randomInt(items.length)];
}

export function buildActivitySearchText({
  actor,
  metadata,
  type,
}: {
  actor: ActivityActor;
  metadata: ActivityMetadata;
  type: ActivityType;
}) {
  return [type, actor.name, ...Object.values(metadata)]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function buildActivityMetadata(type: ActivityType): ActivityMetadata {
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

export function buildRandomActivity(actor: ActivityActor) {
  const type = randomItem(Object.values(ActivityType));
  const metadata = buildActivityMetadata(type);

  return {
    actorId: actor.id,
    isUrgent: Math.random() < 0.2,
    metadata,
    searchText: buildActivitySearchText({ actor, metadata, type }),
    type,
  };
}
