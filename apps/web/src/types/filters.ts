import type { ActivityActor, ActivityType } from "./activities";

export type FeedFilters = {
  actorId: string;
  from: string;
  query: string;
  to: string;
  type: ActivityType | "all";
};

export type FeedFilterOptions = {
  actors: ActivityActor[];
};

export const defaultFeedFilters: FeedFilters = {
  actorId: "all",
  from: "",
  query: "",
  to: "",
  type: "all",
};
