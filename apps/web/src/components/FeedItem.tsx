import { useState } from "react";
import { Box, Text } from "@radix-ui/themes";
import { formatRelativeDate } from "../utils/formatRelativeDate";
import {
  type ActivityType,
  type FeedActivity,
  useMarkActivityReadMutation,
} from "../api/feed";
import { ActivityComments } from "./ActivityComments";

const contentTitleStyles = {
  margin: 0,
  color: "var(--gray-12)",
  lineHeight: 1.5,
};

const timelineActionStyles = {
  padding: 0,
  border: 0,
  color: "var(--teal-11)",
  background: "transparent",
  font: "inherit",
  fontSize: "12px",
  lineHeight: 1.4,
  cursor: "pointer",
};

const underlineTimelineAction = (
  event: React.MouseEvent<HTMLButtonElement>,
) => {
  event.currentTarget.style.textDecoration = "underline";
};

const removeTimelineActionUnderline = (
  event: React.MouseEvent<HTMLButtonElement>,
) => {
  event.currentTarget.style.textDecoration = "none";
};

const transitionStyles = {
  transition:
    "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease",
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

export const FeedItem = ({
  activity,
  isFirst = false,
  isLast = false,
}: {
  activity: FeedActivity;
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  const [showComments, setShowComments] = useState(false);
  const markActivityReadMutation = useMarkActivityReadMutation();
  const ActivityContent = activityContentByType[activity.type];

  return (
    <Box
      className="feed-timeline__item"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "28px minmax(0, 1fr)",
        columnGap: 0,
        paddingBottom: "14px",
      }}
    >
      <Box
        aria-label={activity.isRead ? "Read activity" : "Unread activity"}
        role="status"
        style={{
          position: "relative",
          zIndex: 1,
          width: activity.isRead ? "9px" : "12px",
          height: activity.isRead ? "9px" : "12px",
          marginTop: "14px",
          marginLeft: activity.isRead ? "6px" : "4.5px",
          border: activity.isRead ? "2px solid var(--gray-7)" : 0,
          borderRadius: "50%",
          background: activity.isRead ? "var(--gray-2)" : "var(--teal-9)",
          boxShadow: activity.isRead
            ? "0 0 0 3px var(--gray-2)"
            : "0 0 0 3px var(--teal-3), 0 0 0 5px var(--gray-2)",
          ...transitionStyles,
        }}
      />
      <Box style={{ paddingLeft: "6px" }}>
        <Box
          style={{
            border: activity.isRead
              ? "1px solid var(--gray-5)"
              : "1px solid var(--teal-6)",
            borderRadius: "6px",
            background: activity.isRead ? "var(--gray-1)" : "var(--teal-2)",
            padding: "10px 12px",
            ...transitionStyles,
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "5px",
            }}
          >
            <Text
              as="p"
              size="2"
              color="gray"
              style={{
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {formatRelativeDate(activity.createdAt)}
            </Text>
            {!activity.isRead ? (
              <Text
                as="span"
                size="1"
                style={{
                  color: "var(--teal-11)",
                  fontWeight: 600,
                  lineHeight: 1,
                  ...transitionStyles,
                }}
              >
                New
              </Text>
            ) : null}
          </Box>
          <ActivityContent activity={activity} />
          <Box
            style={{
              display: "flex",
              gap: "14px",
              marginTop: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {!activity.isRead ? (
              <button
                type="button"
                disabled={markActivityReadMutation.isPending}
                onClick={() => markActivityReadMutation.mutate(activity.id)}
                onMouseEnter={underlineTimelineAction}
                onMouseLeave={removeTimelineActionUnderline}
                style={timelineActionStyles}
              >
                Mark as read
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowComments((current) => !current)}
              onMouseEnter={underlineTimelineAction}
              onMouseLeave={removeTimelineActionUnderline}
              style={timelineActionStyles}
            >
              {showComments
                ? "Hide comments"
                : `Show comments (${activity.commentsCount})`}
            </button>
          </Box>
          {showComments ? <ActivityComments activityId={activity.id} /> : null}
        </Box>
      </Box>

      <Box
        style={{
          position: "absolute",
          top: isFirst ? "20px" : 0,
          bottom: isLast ? "calc(100% - 20px)" : 0,
          left: "10px",
          width: "1px",
          background: "var(--gray-6)",
        }}
      />
    </Box>
  );
};
