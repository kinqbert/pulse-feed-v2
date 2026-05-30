import { create } from "zustand";
import type { ActivityType, FeedFilters, FeedPeriod } from "../api/feed";

export const defaultFeedFilters: FeedFilters = {
  actorId: "all",
  period: "all",
  type: "all",
};

type FeedFiltersStore = {
  filters: FeedFilters;
  resetFilters: () => void;
  setActorId: (actorId: string) => void;
  setPeriod: (period: FeedPeriod) => void;
  setType: (type: ActivityType | "all") => void;
};

export const useFeedFiltersStore = create<FeedFiltersStore>((set) => ({
  filters: defaultFeedFilters,
  resetFilters: () =>
    set({
      filters: defaultFeedFilters,
    }),
  setActorId: (actorId) =>
    set((state) => ({
      filters: { ...state.filters, actorId },
    })),
  setPeriod: (period) =>
    set((state) => ({
      filters: { ...state.filters, period },
    })),
  setType: (type) =>
    set((state) => ({
      filters: { ...state.filters, type },
    })),
}));
