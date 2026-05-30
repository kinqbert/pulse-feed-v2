import { useEffect } from "react";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import {
  FEED_ACTIVITY_CREATED_EVENT,
  type FeedActivity,
  type FeedFilters,
  type FeedPage,
} from "../api/feed";
import { socket } from "../lib/sockets";

function matchesFilters(activity: FeedActivity, filters: FeedFilters) {
  if (filters.actorId !== "all" && activity.actor.id !== filters.actorId) {
    return false;
  }

  if (filters.type !== "all" && activity.type !== filters.type) {
    return false;
  }

  return true;
}

export function useFeedRealtimeActivities() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleActivityCreated = (activity: FeedActivity) => {
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
            if (!data) {
              return data;
            }

            const alreadyExists = data.pages.some((page) =>
              page.items.some((item) => item.id === activity.id),
            );

            if (alreadyExists) {
              return data;
            }

            return {
              ...data,
              pages: data.pages.map((page, index) =>
                index === 0
                  ? { ...page, items: [activity, ...page.items] }
                  : page,
              ),
            };
          },
        );
      }
    };

    socket.on(FEED_ACTIVITY_CREATED_EVENT, handleActivityCreated);

    return () => {
      socket.off(FEED_ACTIVITY_CREATED_EVENT, handleActivityCreated);
    };
  }, [queryClient]);
}
