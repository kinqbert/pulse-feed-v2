import { Avatar, Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import { getInitials } from "../utils/getInitials";
import { formatActivityDate } from "../utils/formatActivityDate";
import { getActivityLabel, type FeedActivity } from "../api/feed";

export const FeedItem = ({ activity }: { activity: FeedActivity }) => {
  return (
    <Card size="3" className="feed-card">
      <Flex gap="3" align="start">
        <Avatar
          size="3"
          radius="full"
          fallback={getInitials(activity.actor.name)}
          color="teal"
        />
        <Box flexGrow="1" minWidth="0">
          <Flex align="center" justify="between" gap="3" mb="2">
            <Box minWidth="0">
              <Text as="p" weight="medium" truncate>
                {activity.actor.name}
              </Text>
              <Text as="p" size="1" color="gray" truncate>
                {activity.actor.email}
              </Text>
            </Box>
            <Badge color="amber" variant="soft">
              {getActivityLabel(activity.type)}
            </Badge>
          </Flex>
          <Text as="p" size="4" weight="medium" mb="3">
            {activity.title}
          </Text>
          <Text as="p" size="2" color="gray">
            {formatActivityDate(activity.createdAt)}
          </Text>
        </Box>
      </Flex>
    </Card>
  );
};
