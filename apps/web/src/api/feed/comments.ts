import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { ActivityActor } from "../../types";

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
