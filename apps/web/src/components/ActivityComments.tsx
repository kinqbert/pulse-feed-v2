import { Avatar, Box, Flex, Separator, Text } from "@radix-ui/themes";
import { useActivityCommentsQuery } from "../api/feed";
import { formatRelativeDate } from "../utils/formatRelativeDate";
import { getInitials } from "../utils/getInitials";
import { ActivityCommentForm } from "./ActivityCommentForm";

export const ActivityComments = ({ activityId }: { activityId: string }) => {
  const {
    data: comments,
    isLoading,
    isError,
  } = useActivityCommentsQuery(activityId);
  const shouldDisplayEmptyState =
    !isLoading && !isError && comments?.length === 0;

  return (
    <Flex direction="column" gap="3" mt="3">
      <Separator size="4" />
      {isLoading ? (
        <Text size="2" color="gray">
          Loading comments...
        </Text>
      ) : null}
      {isError ? (
        <Text size="2" color="red">
          Could not load comments.
        </Text>
      ) : null}
      {shouldDisplayEmptyState ? (
        <Text size="2" color="gray">
          No comments
        </Text>
      ) : null}
      {comments?.map((comment) => (
        <Flex key={comment.id} gap="3" align="start">
          <Avatar
            size="2"
            radius="full"
            fallback={getInitials(comment.actor.name)}
            color="gray"
          />
          <Box flexGrow="1" minWidth="0">
            <Flex align="baseline" gap="2" wrap="wrap">
              <Text size="2" weight="medium">
                {comment.actor.name}
              </Text>
              <Text size="1" color="gray">
                {formatRelativeDate(comment.createdAt)}
              </Text>
            </Flex>
            <Text as="p" size="2" mt="1">
              {comment.content}
            </Text>
          </Box>
        </Flex>
      ))}
      <ActivityCommentForm activityId={activityId} />
    </Flex>
  );
};
