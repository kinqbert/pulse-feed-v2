import { useCallback, useEffect, useState } from "react";
import {
  defaultFeedFilters,
  type ActivityType,
  type FeedFilters,
} from "../api/feed";

const feedFilterSearchParamsChange = "feed-filter-search-params-change";
const activityTypes = [
  "comment",
  "mention",
  "task_update",
  "deployment",
] satisfies ActivityType[];

function isActivityType(value: string): value is ActivityType {
  return activityTypes.includes(value as ActivityType);
}

function isDateInputValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function getFeedFiltersFromSearchParams(): FeedFilters {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const actorId = params.get("actorId");
  const from = params.get("from");
  const query = params.get("query");
  const to = params.get("to");

  return {
    actorId: actorId || defaultFeedFilters.actorId,
    from: from && isDateInputValue(from) ? from : defaultFeedFilters.from,
    query: query || defaultFeedFilters.query,
    to: to && isDateInputValue(to) ? to : defaultFeedFilters.to,
    type: type && isActivityType(type) ? type : defaultFeedFilters.type,
  };
}

function writeFeedFiltersToSearchParams(filters: FeedFilters) {
  const url = new URL(window.location.href);

  setFilterSearchParam(url.searchParams, "actorId", filters.actorId);
  setFilterSearchParam(url.searchParams, "from", filters.from);
  setFilterSearchParam(url.searchParams, "query", filters.query);
  setFilterSearchParam(url.searchParams, "to", filters.to);
  setFilterSearchParam(url.searchParams, "type", filters.type);

  window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new Event(feedFilterSearchParamsChange));
}

function setFilterSearchParam(
  params: URLSearchParams,
  key: keyof FeedFilters,
  value: string,
) {
  if (value === defaultFeedFilters[key]) {
    params.delete(key);
    return;
  }

  params.set(key, value);
}

export function useFeedFiltersSearchParams() {
  const [filters, setFilters] = useState(getFeedFiltersFromSearchParams);

  useEffect(() => {
    const syncFilters = () => {
      setFilters(getFeedFiltersFromSearchParams());
    };

    window.addEventListener("popstate", syncFilters);
    window.addEventListener(feedFilterSearchParamsChange, syncFilters);

    return () => {
      window.removeEventListener("popstate", syncFilters);
      window.removeEventListener(feedFilterSearchParamsChange, syncFilters);
    };
  }, []);

  const updateFilters = useCallback(
    (nextFilters: FeedFilters) => {
      writeFeedFiltersToSearchParams(nextFilters);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    writeFeedFiltersToSearchParams(defaultFeedFilters);
  }, []);

  const setQuery = useCallback(
    (query: string) => updateFilters({ ...filters, query }),
    [filters, updateFilters],
  );

  return {
    filters,
    resetFilters,
    setActorId: (actorId: string) => updateFilters({ ...filters, actorId }),
    setDateRange: (from: string, to: string) =>
      updateFilters({ ...filters, from, to }),
    setQuery,
    setType: (type: ActivityType | "all") =>
      updateFilters({ ...filters, type }),
  };
}
