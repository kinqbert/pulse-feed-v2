import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../client";
import { updateFeedActivities } from "./cache";

function invalidateUnreadActivitiesCount(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: ["unread-activities-count"],
  });
}

async function markActivityRead(activityId: string): Promise<void> {
  await api.patch(`/feed/${activityId}/read`);
}

export function useMarkActivityReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markActivityRead,
    onSuccess: (_data, activityId) => {
      updateFeedActivities(queryClient, (activity) =>
        activity.id === activityId ? { ...activity, isRead: true } : activity,
      );
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
      updateFeedActivities(queryClient, (activity) => ({
        ...activity,
        isRead: true,
      }));
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
      updateFeedActivities(queryClient, (activity) =>
        activity.id === activityId ? { ...activity, isRead: false } : activity,
      );
      invalidateUnreadActivitiesCount(queryClient);
    },
  });
}
