import { useState } from "react";
import { Avatar, Badge, Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { getInitials } from "../utils/getInitials";
import { formatActivityDate } from "../utils/formatActivityDate";
import { getActivityLabel, type FeedActivity } from "../api/feed";
import { ActivityComments } from "./ActivityComments";

export const FeedItem = ({ activity }: { activity: FeedActivity }) => {
  const [showComments, setShowComments] = useState(false);
  const hasComments = activity.commentsCount > 0;
  const commentsToggleText = showComments
    ? "Hide comments"
    : `Show ${activity.commentsCount} ${
        activity.commentsCount === 1 ? "comment" : "comments"
      }`;

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
          {hasComments ? (
            <Button
              type="button"
              size="1"
              variant="ghost"
              mt="3"
              onClick={() => setShowComments((current) => !current)}
            >
              {commentsToggleText}
            </Button>
          ) : (
            <Text as="p" size="2" color="gray" mt="3">
              0 comments
            </Text>
          )}
          {showComments ? <ActivityComments activityId={activity.id} /> : null}
        </Box>
      </Flex>
    </Card>
  );
};
