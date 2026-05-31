import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Callout,
  Card,
  Container,
  Flex,
  Heading,
  Section,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
  useFeedInfiniteQuery,
  useUnreadActivitiesCountQuery,
} from "../api/feed";
import { useFeedFiltersSearchParams } from "../hooks/useFeedFiltersSearchParams";
import { useFeedRealtimeActivities } from "../hooks/useFeedRealtimeActivities";
import { useFeedScrollOnPrepend } from "../hooks/usePreserveFeedScrollOnPrepend";
import { FeedFilters } from "./FeedFilters";
import { FeedItem } from "./FeedItem";

export const Feed = () => {
  useFeedRealtimeActivities();
  const { filters } = useFeedFiltersSearchParams();
  const feedQuery = useFeedInfiniteQuery(filters);
  const unreadActivitiesCountQuery = useUnreadActivitiesCountQuery();
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = feedQuery;

  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  const activities = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data?.pages],
  );

  const virtualizer = useWindowVirtualizer({
    count: activities.length,
    estimateSize: () => 120,
    getItemKey: (index) => activities[index]?.id ?? index,
    overscan: 5,
    scrollMargin,
  });

  useEffect(() => {
    const updateScrollMargin = () => {
      if (!listRef.current) {
        return;
      }

      setScrollMargin(
        listRef.current.getBoundingClientRect().top + window.scrollY,
      );
    };

    updateScrollMargin();
    window.addEventListener("resize", updateScrollMargin);

    return () => {
      window.removeEventListener("resize", updateScrollMargin);
    };
  }, [activities.length]);

  useFeedScrollOnPrepend({
    activitiesLength: activities.length,
    scrollMargin,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const shouldShowEmptyState =
    !feedQuery.isPending && !feedQuery.isError && activities.length === 0;

  return (
    <Section>
      <Container size="2">
        <Flex direction="column">
          <Flex align="center" justify="between" gap="4" wrap="wrap" mb="4">
            <Box width="100%">
              <Flex align="baseline" gap="3" mb="2">
                <Heading size="8">Pulse Feed V2</Heading>
                {unreadActivitiesCountQuery.data ? (
                  <Text size="2" color="teal" weight="bold">
                    {unreadActivitiesCountQuery.data.count} unread
                  </Text>
                ) : null}
                {unreadActivitiesCountQuery.isError ? (
                  <Button
                    type="button"
                    size="1"
                    variant="ghost"
                    disabled={unreadActivitiesCountQuery.isFetching}
                    onClick={() => void unreadActivitiesCountQuery.refetch()}
                  >
                    {unreadActivitiesCountQuery.isFetching
                      ? "Retrying unread count..."
                      : "Retry unread count"}
                  </Button>
                ) : null}
              </Flex>
              <Text as="p" color="gray">
                Latest activity across comments, mentions, tasks, and deploys.
                New activity arrives every 10 to 15 seconds.
              </Text>
              <FeedFilters />
            </Box>
          </Flex>

          {feedQuery.isPending ? (
            <Flex align="center" justify="center" py="6">
              <Spinner size="3" />
            </Flex>
          ) : null}

          {feedQuery.isError && !feedQuery.isFetchNextPageError ? (
            <Callout.Root color="red" role="alert">
              <Flex align="center" justify="between" gap="3" wrap="wrap">
                <Callout.Text>
                  Could not load the feed. Check that the API is running.
                </Callout.Text>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  disabled={feedQuery.isFetching}
                  onClick={() => void feedQuery.refetch()}
                >
                  {feedQuery.isFetching ? "Retrying..." : "Retry"}
                </Button>
              </Flex>
            </Callout.Root>
          ) : null}

          {shouldShowEmptyState ? (
            <Card size="3">
              <Text color="gray">
                {filters.query
                  ? "No activities match your search."
                  : filters.actorId !== "all" ||
                      filters.from ||
                      filters.to ||
                      filters.type !== "all"
                    ? "No activities match your filters."
                    : "No feed activity yet."}
              </Text>
            </Card>
          ) : null}

          {activities.length > 0 ? (
            <Box ref={listRef}>
              <Box
                position="relative"
                width="100%"
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                }}
              >
                {virtualItems.map((virtualRow) => {
                  const activity = activities[virtualRow.index];

                  return (
                    <Box
                      key={virtualRow.key}
                      ref={virtualizer.measureElement}
                      data-index={virtualRow.index}
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      style={{
                        transform: `translateY(${
                          virtualRow.start - scrollMargin
                        }px)`,
                      }}
                    >
                      {activity && (
                        <FeedItem
                          activity={activity}
                          isFirst={virtualRow.index === 0}
                          isLast={virtualRow.index === activities.length - 1}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : null}

          <Flex align="center" justify="center">
            {hasNextPage && (
              <Button
                type="button"
                variant="surface"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage ? "Loading..." : "Load more activities"}
              </Button>
            )}
          </Flex>
          {feedQuery.isFetchNextPageError ? (
            <Flex align="center" justify="center" gap="2" mt="2">
              <Text size="2" color="red">
                Could not load more activities.
              </Text>
              <Button
                type="button"
                size="1"
                variant="soft"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage ? "Retrying..." : "Retry"}
              </Button>
            </Flex>
          ) : null}
        </Flex>
      </Container>
    </Section>
  );
};
