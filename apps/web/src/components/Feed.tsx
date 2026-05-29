import {
  Box,
  Callout,
  Card,
  Container,
  Flex,
  Heading,
  Section,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { useFeedQuery } from "../api/feed";
import { FeedItem } from "./FeedItem";

function FeedSkeleton() {
  return (
    <Flex direction="column" gap="3">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} size="3">
          <Flex gap="3" align="start">
            <Skeleton width="40px" height="40px" />
            <Box flexGrow="1">
              <Skeleton height="18px" width="45%" mb="2" />
              <Skeleton height="24px" width="80%" mb="3" />
              <Skeleton height="16px" width="30%" />
            </Box>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

export const Feed = () => {
  const feedQuery = useFeedQuery();

  return (
    <Section size="4" className="app-shell">
      <Container size="2">
        <Flex direction="column" gap="5">
          <Flex align="center" justify="between" gap="4" wrap="wrap">
            <Box>
              <Heading size="8" mb="2">
                Feed
              </Heading>
              <Text as="p" color="gray">
                Latest activity across comments, mentions, and reactions.
              </Text>
            </Box>
          </Flex>

          {feedQuery.isLoading ? <FeedSkeleton /> : null}

          {feedQuery.isError ? (
            <Callout.Root color="red" role="alert">
              <Callout.Text>
                Could not load the feed. Check that the API is running.
              </Callout.Text>
            </Callout.Root>
          ) : null}

          {feedQuery.data?.length === 0 ? (
            <Card size="3">
              <Text color="gray">No feed activity yet.</Text>
            </Card>
          ) : null}

          {feedQuery.data && feedQuery.data.length > 0 ? (
            <Flex direction="column" gap="3">
              {feedQuery.data.map((activity) => (
                <FeedItem key={activity.id} activity={activity} />
              ))}
            </Flex>
          ) : null}
        </Flex>
      </Container>
    </Section>
  );
};
