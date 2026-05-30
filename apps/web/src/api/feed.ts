import { useQuery } from "@tanstack/react-query";

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

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

export type ActivityComment = {
  id: string;
  activityId: string;
  content: string;
  createdAt: string;
  actor: ActivityActor;
};

export type FeedActivity = {
  id: string;
  type: ActivityType;
  title: string;
  createdAt: string;
  actor: ActivityActor;
  commentsCount: number;
};

export const getActivityLabel = (type: ActivityType) => activityLabels[type];

async function fetchFeed(): Promise<FeedActivity[]> {
  const response = await fetch(apiUrl("/feed"));

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

async function fetchActivityComments(
  activityId: string,
): Promise<ActivityComment[]> {
  const response = await fetch(apiUrl(`/activities/${activityId}/comments`));

  if (!response.ok) {
    throw new Error("Activity comments request failed");
  }

  return response.json();
}

export function useActivityCommentsQuery(activityId: string) {
  return useQuery({
    queryKey: ["activities", activityId, "comments"],
    queryFn: () => fetchActivityComments(activityId),
  });
}
