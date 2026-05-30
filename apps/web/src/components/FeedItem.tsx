import { useState } from "react";
import { Avatar, Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { getInitials } from "../utils/getInitials";
import { formatActivityDate } from "../utils/formatActivityDate";
import { type ActivityType, type FeedActivity } from "../api/feed";
import { ActivityComments } from "./ActivityComments";

type ActivityContentProps = {
  activity: FeedActivity;
};

const CommentActivityContent = ({ activity }: ActivityContentProps) => {
  if (activity.type !== "comment") {
    return null;
  }

  return (
    <Text as="p" size="3" mb="3">
      <Text weight="medium">{activity.actor.name}</Text> commented on{" "}
      <Text weight="medium">{activity.metadata.entityName}</Text>.
    </Text>
  );
};

const MentionActivityContent = ({ activity }: ActivityContentProps) => {
  if (activity.type !== "mention") {
    return null;
  }

  return (
    <Text as="p" size="3" mb="3">
      <Text weight="medium">{activity.actor.name}</Text> mentioned you on{" "}
      <Text weight="medium">{activity.metadata.entityName}</Text>.
    </Text>
  );
};

const TaskUpdateActivityContent = ({ activity }: ActivityContentProps) => {
  if (activity.type !== "task_update") {
    return null;
  }

  return (
    <Text as="p" size="3" mb="3">
      <Text weight="medium">{activity.actor.name}</Text> updated{" "}
      <Text weight="medium">{activity.metadata.taskName}</Text> to{" "}
      <Text weight="medium">{activity.metadata.newValue}</Text>.
    </Text>
  );
};

const DeploymentActivityContent = ({ activity }: ActivityContentProps) => {
  if (activity.type !== "deployment") {
    return null;
  }

  return (
    <Text as="p" size="3" mb="3">
      <Text weight="medium">{activity.actor.name}</Text> deployed{" "}
      <Text weight="medium">{activity.metadata.serviceName}</Text> with status{" "}
      <Text weight="medium">{activity.metadata.status}</Text>.
    </Text>
  );
};

const activityContentByType: Record<
  ActivityType,
  React.FC<ActivityContentProps>
> = {
  comment: CommentActivityContent,
  mention: MentionActivityContent,
  task_update: TaskUpdateActivityContent,
  deployment: DeploymentActivityContent,
};

export const FeedItem = ({ activity }: { activity: FeedActivity }) => {
  const [showComments, setShowComments] = useState(false);
  const hasComments = activity.commentsCount > 0;
  const commentsToggleText = showComments
    ? "Hide comments"
    : `Show ${activity.commentsCount} ${
        activity.commentsCount === 1 ? "comment" : "comments"
      }`;
  const ActivityContent = activityContentByType[activity.type];

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
          <Flex align="center" justify="end" gap="3" mb="2">
            <Text as="p" size="2" color="gray">
              {formatActivityDate(activity.createdAt)}
            </Text>
          </Flex>
          <ActivityContent activity={activity} />
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
