import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type {
  ActivityType,
  FeedFilterOptions,
  FeedFilters,
  FeedPage,
  UnreadActivitiesCount,
} from "./types";

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
