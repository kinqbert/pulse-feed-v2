import { useQuery } from "@tanstack/react-query";

const activityLabels = {
  comment: "Comment",
  mention: "Mention",
  reaction: "Reaction",
} as const;

export type ActivityType = keyof typeof activityLabels;

export type ActivityActor = {
  id: string;
  name: string;
  email: string;
};

export type FeedActivity = {
  id: string;
  type: ActivityType;
  title: string;
  createdAt: string;
  actor: ActivityActor;
};

export const getActivityLabel = (type: ActivityType) => activityLabels[type];

async function fetchFeed(): Promise<FeedActivity[]> {
  const response = await fetch("/feed");

  if (!response.ok) {
    throw new Error("Feed request failed");
  }

  return response.json();
}

export function useFeedQuery() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
  });
}
