import { useLayoutEffect, useRef } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";

type FeedScrollActivity = {
  id: string;
};

const FEED_TOP_SCROLL_THRESHOLD_PX = 80;

export function useFeedScrollOnPrepend({
  activities,
  scrollMargin,
  virtualizer,
}: {
  activities: FeedScrollActivity[];
  scrollMargin: number;
  virtualizer: Virtualizer<Window, Element>;
}) {
  const previousFeedSnapshotRef = useRef({
    firstActivityId: null as string | null,
    totalSize: 0,
  });

  useLayoutEffect(() => {
    const firstActivityId = activities[0]?.id ?? null;
    const totalSize = virtualizer.getTotalSize();
    const previousSnapshot = previousFeedSnapshotRef.current;
    const previousFirstActivityIndex = previousSnapshot.firstActivityId
      ? activities.findIndex(
          (activity) => activity.id === previousSnapshot.firstActivityId,
        )
      : -1;

    const didPrependActivities =
      Boolean(previousSnapshot.firstActivityId) &&
      firstActivityId !== previousSnapshot.firstActivityId &&
      previousFirstActivityIndex > 0;
    const isReadingBelowFeedTop =
      window.scrollY > scrollMargin + FEED_TOP_SCROLL_THRESHOLD_PX;

    if (didPrependActivities && isReadingBelowFeedTop) {
      const insertedSize = Math.max(0, totalSize - previousSnapshot.totalSize);

      if (insertedSize > 0) {
        window.scrollBy(0, insertedSize);
      }
    }

    previousFeedSnapshotRef.current = {
      firstActivityId,
      totalSize,
    };
  }, [activities, scrollMargin, virtualizer]);
}
