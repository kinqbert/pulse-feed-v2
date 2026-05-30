import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./client";

const activityLabels = {
  comment: "Comment",
  mention: "Mention",
  task_update: "Task update",
  deployment: "Deploy",
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

export type CommentMetadata = {
  entityName: string;
};

export type MentionMetadata = {
  entityName: string;
};

export type TaskUpdateMetadata = {
  taskName: string;
  previousValue?: string;
  newValue: string;
};

export type DeploymentMetadata = {
  serviceName: string;
  status: "success" | "failed";
};

type BaseFeedActivity = {
  id: string;
  createdAt: string;
  actor: ActivityActor;
  commentsCount: number;
};

export type FeedActivity =
  | (BaseFeedActivity & {
      type: "comment";
      metadata: CommentMetadata;
    })
  | (BaseFeedActivity & {
      type: "mention";
      metadata: MentionMetadata;
    })
  | (BaseFeedActivity & {
      type: "task_update";
      metadata: TaskUpdateMetadata;
    })
  | (BaseFeedActivity & {
      type: "deployment";
      metadata: DeploymentMetadata;
    });

export type FeedPage = {
  items: FeedActivity[];
  nextCursor: string | null;
};

export type FeedPeriod = "all" | "24h" | "7d" | "30d";

export type FeedFilters = {
  actorId: string;
  period: FeedPeriod;
  type: ActivityType | "all";
};

export type FeedFilterOptions = {
  actors: ActivityActor[];
};

export const getActivityLabel = (type: ActivityType) => activityLabels[type];

async function fetchFeedPage({
  actorId,
  cursor,
  limit = 30,
  period,
  type,
}: {
  actorId?: string;
  cursor?: string;
  limit?: number;
  period?: FeedPeriod;
  type?: ActivityType;
}): Promise<FeedPage> {
  const response = await api.get<FeedPage>("/feed", {
    params: {
      actorId,
      cursor,
      limit,
      period,
      type,
    },
  });

  return response.data;
}

export function useFeedInfiniteQuery(filters: FeedFilters) {
  return useInfiniteQuery({
    queryKey: ["feed", filters] as const,
    queryFn: ({ pageParam }) =>
      fetchFeedPage({
        actorId: filters.actorId === "all" ? undefined : filters.actorId,
        cursor: pageParam || undefined,
        period: filters.period === "all" ? undefined : filters.period,
        type: filters.type === "all" ? undefined : filters.type,
      }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

async function fetchFeedFilterOptions(): Promise<FeedFilterOptions> {
  const response = await api.get<FeedFilterOptions>("/feed/filters");

  return response.data;
}

export function useFeedFilterOptionsQuery() {
  return useQuery({
    queryKey: ["feed", "filters"] as const,
    queryFn: fetchFeedFilterOptions,
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
