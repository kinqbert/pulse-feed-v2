import { useCallback, useEffect, useState } from "react";
import {
  defaultFeedFilters,
  type ActivityType,
  type FeedFilters,
  type FeedPeriod,
} from "../api/feed";

const feedFilterSearchParamsChange = "feed-filter-search-params-change";
const feedPeriods = ["all", "24h", "7d", "30d"] satisfies FeedPeriod[];
const activityTypes = [
  "comment",
  "mention",
  "task_update",
  "deployment",
] satisfies ActivityType[];

function isFeedPeriod(value: string): value is FeedPeriod {
  return feedPeriods.includes(value as FeedPeriod);
}

function isActivityType(value: string): value is ActivityType {
  return activityTypes.includes(value as ActivityType);
}

function getFeedFiltersFromSearchParams(): FeedFilters {
  const params = new URLSearchParams(window.location.search);
  const period = params.get("period");
  const type = params.get("type");
  const actorId = params.get("actorId");

  return {
    actorId: actorId || defaultFeedFilters.actorId,
    period:
      period && isFeedPeriod(period) ? period : defaultFeedFilters.period,
    type: type && isActivityType(type) ? type : defaultFeedFilters.type,
  };
}

function writeFeedFiltersToSearchParams(filters: FeedFilters) {
  const url = new URL(window.location.href);

  setFilterSearchParam(url.searchParams, "actorId", filters.actorId);
  setFilterSearchParam(url.searchParams, "period", filters.period);
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

  return {
    filters,
    resetFilters,
    setActorId: (actorId: string) => updateFilters({ ...filters, actorId }),
    setPeriod: (period: FeedPeriod) => updateFilters({ ...filters, period }),
    setType: (type: ActivityType | "all") =>
      updateFilters({ ...filters, type }),
  };
}
