import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./client";

// todo -- split all of this into different files

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

export type ActivityReaction = {
  emoji: string;
  count: number;
  hasReacted: boolean;
};

export type ToggleActivityReactionInput = {
  activityId: string;
  emoji: string;
  hasReacted: boolean;
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
  commentsCount: number;
  isRead: boolean;
  reactions: ActivityReaction[];
  actor: ActivityActor;
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

export type FeedFilters = {
  actorId: string;
  from: string;
  query: string;
  to: string;
  type: ActivityType | "all";
};

export const defaultFeedFilters: FeedFilters = {
  actorId: "all",
  from: "",
  query: "",
  to: "",
  type: "all",
};

export const FEED_ACTIVITY_CREATED_EVENT = "feed:activity-created";

export type FeedFilterOptions = {
  actors: ActivityActor[];
};

export type UnreadActivitiesCount = {
  count: number;
};

export const getActivityLabel = (type: ActivityType) => activityLabels[type];

async function fetchFeedPage({
  actorId,
  cursor,
  from,
  limit = 30,
  query,
  to,
  type,
}: {
  actorId?: string;
  cursor?: string;
  from?: string;
  limit?: number;
  query?: string;
  to?: string;
  type?: ActivityType;
}): Promise<FeedPage> {
  const response = await api.get<FeedPage>("/feed", {
    params: {
      actorId,
      cursor,
      from,
      limit,
      query,
      to,
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
        from: filters.from
          ? getStartOfDay(filters.from).toISOString()
          : undefined,
        query: filters.query || undefined,
        to: filters.to
          ? getStartOfNextDay(filters.to).toISOString()
          : undefined,
        type: filters.type === "all" ? undefined : filters.type,
      }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });
}

export function getStartOfDay(date: string) {
  return new Date(`${date}T00:00:00`);
}

export function getStartOfNextDay(date: string) {
  const nextDay = getStartOfDay(date);

  nextDay.setDate(nextDay.getDate() + 1);

  return nextDay;
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

async function fetchUnreadActivitiesCount(): Promise<UnreadActivitiesCount> {
  const response = await api.get<UnreadActivitiesCount>("/feed/unread-count");

  return response.data;
}

export function useUnreadActivitiesCountQuery() {
  return useQuery({
    queryKey: ["unread-activities-count"] as const,
    queryFn: fetchUnreadActivitiesCount,
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

async function markActivityRead(activityId: string): Promise<void> {
  await api.patch(`/feed/${activityId}/read`);
}

function updateActivityReadState(
  queryClient: QueryClient,
  activityId: string,
  isRead: boolean,
) {
  queryClient.setQueriesData<InfiniteData<FeedPage>>(
    {
      predicate: (query) =>
        query.queryKey[0] === "feed" && query.queryKey[1] !== "filters",
    },
    (data) => {
      if (!data) {
        return data;
      }

      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((activity) =>
            activity.id === activityId ? { ...activity, isRead } : activity,
          ),
        })),
      };
    },
  );
}

function invalidateUnreadActivitiesCount(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: ["unread-activities-count"],
  });
}

export function useMarkActivityReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markActivityRead,
    onSuccess: (_data, activityId) => {
      updateActivityReadState(queryClient, activityId, true);
      invalidateUnreadActivitiesCount(queryClient);
    },
  });
}

async function markAllActivitiesRead(): Promise<void> {
  await api.patch("/feed/read-all");
}

export function useMarkAllActivitiesReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllActivitiesRead,
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<FeedPage>>(
        {
          predicate: (query) =>
            query.queryKey[0] === "feed" && query.queryKey[1] !== "filters",
        },
        (data) => {
          if (!data) {
            return data;
          }

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((activity) => ({
                ...activity,
                isRead: true,
              })),
            })),
          };
        },
      );
      invalidateUnreadActivitiesCount(queryClient);
    },
  });
}

async function markActivityUnread(activityId: string): Promise<void> {
  await api.delete(`/feed/${activityId}/read`);
}

export function useMarkActivityUnreadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markActivityUnread,
    onSuccess: (_data, activityId) => {
      updateActivityReadState(queryClient, activityId, false);
      invalidateUnreadActivitiesCount(queryClient);
    },
  });
}

async function toggleActivityReaction({
  activityId,
  emoji,
  hasReacted,
}: ToggleActivityReactionInput): Promise<ActivityReaction[]> {
  if (hasReacted) {
    const response = await api.delete<ActivityReaction[]>(
      `/activities/${activityId}/reactions/${encodeURIComponent(emoji)}`,
    );

    return response.data;
  }

  const response = await api.post<ActivityReaction[]>(
    `/activities/${activityId}/reactions`,
    {
      emoji,
    },
  );

  return response.data;
}

function updateActivityReactions(
  queryClient: QueryClient,
  activityId: string,
  updateReactions: (reactions: ActivityReaction[]) => ActivityReaction[],
) {
  queryClient.setQueriesData<InfiniteData<FeedPage>>(
    {
      predicate: (query) =>
        query.queryKey[0] === "feed" && query.queryKey[1] !== "filters",
    },
    (data) => {
      if (!data) {
        return data;
      }

      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((activity) =>
            activity.id === activityId
              ? {
                  ...activity,
                  reactions: updateReactions(activity.reactions),
                }
              : activity,
          ),
        })),
      };
    },
  );
}

function optimisticallyToggleReaction(
  reactions: ActivityReaction[],
  emoji: string,
  hasReacted: boolean,
) {
  if (hasReacted) {
    return reactions.flatMap((reaction) => {
      if (reaction.emoji !== emoji) {
        return reaction;
      }

      return reaction.count > 1
        ? { ...reaction, count: reaction.count - 1, hasReacted: false }
        : [];
    });
  }

  const existingReaction = reactions.find(
    (reaction) => reaction.emoji === emoji,
  );

  if (!existingReaction) {
    return [...reactions, { emoji, count: 1, hasReacted: true }];
  }

  return reactions.map((reaction) =>
    reaction.emoji === emoji
      ? { ...reaction, count: reaction.count + 1, hasReacted: true }
      : reaction,
  );
}

export function useToggleActivityReactionMutation() {
  const queryClient = useQueryClient();
  const feedQueryPredicate = (query: { queryKey: readonly unknown[] }) =>
    query.queryKey[0] === "feed" && query.queryKey[1] !== "filters";

  return useMutation({
    mutationFn: toggleActivityReaction,
    async onMutate({ activityId, emoji, hasReacted }) {
      await queryClient.cancelQueries({
        predicate: feedQueryPredicate,
      });
      const previousFeedQueries = queryClient.getQueriesData<
        InfiniteData<FeedPage>
      >({
        predicate: feedQueryPredicate,
      });

      updateActivityReactions(queryClient, activityId, (reactions) =>
        optimisticallyToggleReaction(reactions, emoji, hasReacted),
      );

      return { previousFeedQueries };
    },
    onError: (_error, _input, context) => {
      for (const [queryKey, data] of context?.previousFeedQueries ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSuccess: (reactions, { activityId }) => {
      updateActivityReactions(queryClient, activityId, () => reactions);
    },
  });
}
