import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./client";

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

export type CreateActivityCommentInput = {
  activityId: string;
  content: string;
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
  const response = await api.get<FeedActivity[]>("/feed");

  return response.data;
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
  const response = await api.get<ActivityComment[]>(
    `/activities/${activityId}/comments`,
  );

  return response.data;
}

export function useActivityCommentsQuery(activityId: string) {
  return useQuery({
    queryKey: ["activities", activityId, "comments"],
    queryFn: () => fetchActivityComments(activityId),
  });
}

async function createActivityComment({
  activityId,
  content,
}: CreateActivityCommentInput): Promise<ActivityComment> {
  const response = await api.post<ActivityComment>(
    `/activities/${activityId}/comments`,
    {
      content,
    },
  );

  return response.data;
}

export function useCreateActivityCommentMutation() {
  return useMutation({
    mutationFn: createActivityComment,
  });
}
