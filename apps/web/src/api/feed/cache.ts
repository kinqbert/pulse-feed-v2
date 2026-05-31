import { type InfiniteData, type QueryClient } from "@tanstack/react-query";
import type { FeedPage } from "./types";

export const isFeedQuery = (query: { queryKey: readonly unknown[] }) =>
  query.queryKey[0] === "feed" && query.queryKey[1] !== "filters";

export function updateFeedActivities(
  queryClient: QueryClient,
  updateActivity: (
    activity: FeedPage["items"][number],
  ) => FeedPage["items"][number],
) {
  queryClient.setQueriesData<InfiniteData<FeedPage>>(
    {
      predicate: isFeedQuery,
    },
    (data) => {
      if (!data) {
        return data;
      }

      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map(updateActivity),
        })),
      };
    },
  );
}
