import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import {
  getStartOfDay,
  getStartOfNextDay,
  type FeedActivity,
  type FeedFilters,
  type FeedPage,
  type UnreadActivitiesCount,
} from "../api/feed";
import { useSocketEvent, useSocketManagerEvent } from "../lib/sockets";
import { FEED_ACTIVITY_CREATED_EVENT } from "../constants";

function matchesFilters(activity: FeedActivity, filters: FeedFilters) {
  if (filters.actorId !== "all" && activity.actor.id !== filters.actorId) {
    return false;
  }

  if (filters.type !== "all" && activity.type !== filters.type) {
    return false;
  }

  const searchText = [
    activity.type,
    activity.actor.name,
    ...Object.values(activity.metadata),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const query = filters.query.trim().toLowerCase().replace(/\s+/g, " ");

  if (query && !searchText.includes(query)) {
    return false;
  }

  const createdAt = new Date(activity.createdAt);

  if (filters.from && createdAt < getStartOfDay(filters.from)) {
    return false;
  }

  if (filters.to && createdAt >= getStartOfNextDay(filters.to)) {
    return false;
  }

  return true;
}

export function useFeedRealtimeActivities() {
  const queryClient = useQueryClient();

  useSocketEvent<FeedActivity>(FEED_ACTIVITY_CREATED_EVENT, (activity) => {
    const feedQueries = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        query.queryKey[0] === "feed" && query.queryKey[1] !== "filters",
    });

    for (const query of feedQueries) {
      const filters = query.queryKey[1] as FeedFilters | undefined;

      if (!filters || !matchesFilters(activity, filters)) {
        continue;
      }

      queryClient.setQueryData<InfiniteData<FeedPage>>(
        query.queryKey,
        (data) => {
          if (
            !data ||
            data.pages.some((page) =>
              page.items.some((item) => item.id === activity.id),
            )
          ) {
            return data;
          }

          return {
            ...data,
            pages: data.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    items: [activity, ...page.items],
                  }
                : page,
            ),
          };
        },
      );
    }

    queryClient.setQueryData<UnreadActivitiesCount>(
      ["unread-activities-count"],
      (data) => (data ? { count: data.count + 1 } : data),
    );
  });

  useSocketManagerEvent("reconnect", () => {
    void queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "feed" && query.queryKey[1] !== "filters",
      refetchType: "active",
    });
    void queryClient.invalidateQueries({
      queryKey: ["unread-activities-count"],
      refetchType: "active",
    });
  });
}
