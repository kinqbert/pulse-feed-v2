import { useLayoutEffect as useEffect } from "react";

type FeedScrollActivity = {
  id: string;
};

// this hook is responsible for controlling when to scroll down and when not to after new activity arrives
//
// to put it simply, if user can see the top of the list, we'll append activity and scroll the list will go down
// if not, the activity will get prepended and the page will be automatically scrolled up by the size of new activity item, in this case user won't notice anything.
//
// this should be used because of user wants to mark some activity as read and then new one arrives, user can accidentaly mark other activity as read
//
// in perfect case, this should be calculated automatically and not hardcoded at 120px
export function useFeedScrollOnPrepend({
  activities,
  scrollMargin,
}: {
  activities: FeedScrollActivity[];
  scrollMargin: number;
}) {
  useEffect(() => {
    const isReadingBelowFeedTop = window.scrollY > scrollMargin;

    if (isReadingBelowFeedTop) {
      const insertedSize = Math.max(0, 120);

      if (insertedSize > 0) {
        window.scrollBy(0, insertedSize);
      }
    }
  }, [activities, scrollMargin]);
}
