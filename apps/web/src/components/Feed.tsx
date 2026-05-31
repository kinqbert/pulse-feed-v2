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
import { useFeedInfiniteQuery } from "../api/feed";
import { useFeedFiltersSearchParams } from "../hooks/useFeedFiltersSearchParams";
import { useFeedRealtimeActivities } from "../hooks/useFeedRealtimeActivities";
import { useFeedScrollOnPrepend } from "../hooks/usePreserveFeedScrollOnPrepend";
import { FeedFilters } from "./FeedFilters";
import { FeedItem } from "./FeedItem";

export const Feed = () => {
  useFeedRealtimeActivities();
  const { filters } = useFeedFiltersSearchParams();
  const feedQuery = useFeedInfiniteQuery(filters);
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
    activities,
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
              <Heading size="8" mb="2">
                Feed
              </Heading>
              <Text as="p" color="gray">
                Latest activity across comments, mentions, tasks, and deploys.
              </Text>
              <FeedFilters />
            </Box>
          </Flex>

          {feedQuery.isPending ? (
            <Flex align="center" justify="center" py="6">
              <Spinner size="3" />
            </Flex>
          ) : null}

          {feedQuery.isError ? (
            <Callout.Root color="red" role="alert">
              <Callout.Text>
                Could not load the feed. Check that the API is running.
              </Callout.Text>
            </Callout.Root>
          ) : null}

          {shouldShowEmptyState ? (
            <Card size="3">
              <Text color="gray">No feed activity yet.</Text>
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
            {hasNextPage ? (
              <Button
                type="button"
                variant="surface"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage ? "Loading..." : "Load more activities"}
              </Button>
            ) : (
              <Text color="gray">You've scrolled to the end! Congrats!</Text>
            )}
          </Flex>
        </Flex>
      </Container>
    </Section>
  );
};
