import { useState } from "react";
import { Box, Button, Text } from "@radix-ui/themes";
import { formatRelativeDate } from "../utils/formatRelativeDate";
import { type ActivityType, type FeedActivity } from "../api/feed";
import { ActivityComments } from "./ActivityComments";

const contentTitleStyles = {
  margin: 0,
  lineHeight: 1.45,
};

type ActivityContentProps = {
  activity: FeedActivity;
};

const CommentActivityContent = ({ activity }: ActivityContentProps) => {
  if (activity.type !== "comment") {
    return null;
  }

  return (
    <Text as="p" size="3" style={contentTitleStyles}>
      <Text weight="bold">{activity.actor.name}</Text> commented on{" "}
      <Text weight="bold">{activity.metadata.entityName}</Text>.
    </Text>
  );
};

const MentionActivityContent = ({ activity }: ActivityContentProps) => {
  if (activity.type !== "mention") {
    return null;
  }

  return (
    <Text as="p" size="3" style={contentTitleStyles}>
      <Text weight="bold">{activity.actor.name}</Text> mentioned you on{" "}
      <Text weight="bold">{activity.metadata.entityName}</Text>.
    </Text>
  );
};

const TaskUpdateActivityContent = ({ activity }: ActivityContentProps) => {
  if (activity.type !== "task_update") {
    return null;
  }

  return (
    <Text as="p" size="3" style={contentTitleStyles}>
      <Text weight="bold">{activity.actor.name}</Text> updated{" "}
      <Text weight="bold">{activity.metadata.taskName}</Text> to{" "}
      <Text weight="bold">{activity.metadata.newValue}</Text>.
    </Text>
  );
};

const DeploymentActivityContent = ({ activity }: ActivityContentProps) => {
  if (activity.type !== "deployment") {
    return null;
  }

  return (
    <Text as="p" size="3" style={contentTitleStyles}>
      <Text weight="bold">{activity.actor.name}</Text> deployed{" "}
      <Text weight="bold">{activity.metadata.serviceName}</Text> with status{" "}
      <Text weight="bold">{activity.metadata.status}</Text>.
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
  const ActivityContent = activityContentByType[activity.type];

  return (
    <Box
      className="feed-timeline__item"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "24px minmax(0, 1fr)",
        columnGap: 0,
        paddingBottom: "18px",
      }}
    >
      <Text
        as="p"
        size="2"
        color="gray"
        style={{
          position: "absolute",
          top: 0,
          right: "calc(100% + 12px)",
          width: "96px",
          margin: 0,
          lineHeight: 1.2,
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {formatRelativeDate(activity.createdAt)}
      </Text>
      <Box
        aria-hidden="true"
        style={{
          position: "relative",
          zIndex: 1,
          width: "9px",
          height: "8px",
          marginTop: "5px",
          marginLeft: "6px",
          borderRadius: "50%",
          background: "var(--gray-8)",
          boxShadow: "0 0 0 3px var(--gray-2)",
        }}
      />
      <Box style={{ paddingLeft: "4px" }}>
        <Box>
          <ActivityContent activity={activity} />
          <Button
            type="button"
            onClick={() => setShowComments((current) => !current)}
            style={{
              marginTop: "6px",
              padding: 0,
              border: 0,
              color: "var(--teal-11)",
              background: "transparent",
              fontSize: "10px",
              lineHeight: 1.4,
              font: "inherit",
              cursor: "pointer",
            }}
          >
            {showComments ? "Hide comments" : "Show comments"}
          </Button>
          {showComments ? <ActivityComments activityId={activity.id} /> : null}
        </Box>
      </Box>

      <Box
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "10px",
          width: "1px",
          background: "var(--gray-5)",
        }}
      />
    </Box>
  );
};
