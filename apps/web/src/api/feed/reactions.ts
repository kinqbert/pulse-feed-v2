import {
  type InfiniteData,
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../client";
import { isFeedQuery, updateFeedActivities } from "./cache";
import type { ActivityReaction, FeedPage } from "./types";

export type ToggleActivityReactionInput = {
  activityId: string;
  emoji: string;
  hasReacted: boolean;
};

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
  updateFeedActivities(queryClient, (activity) =>
    activity.id === activityId
      ? {
          ...activity,
          reactions: updateReactions(activity.reactions),
        }
      : activity,
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

  return useMutation({
    mutationFn: toggleActivityReaction,
    async onMutate({ activityId, emoji, hasReacted }) {
      await queryClient.cancelQueries({
        predicate: isFeedQuery,
      });
      const previousFeedQueries = queryClient.getQueriesData<
        InfiniteData<FeedPage>
      >({
        predicate: isFeedQuery,
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
