import { Avatar, Box, Flex, Separator, Text } from "@radix-ui/themes";
import { useActivityCommentsQuery } from "../api/feed";
import { formatActivityDate } from "../utils/formatActivityDate";
import { getInitials } from "../utils/getInitials";

export const ActivityComments = ({ activityId }: { activityId: string }) => {
  const commentsQuery = useActivityCommentsQuery(activityId);

  return (
    <Flex direction="column" gap="3" mt="3">
      <Separator size="4" />
      {commentsQuery.isLoading ? (
        <Text size="2" color="gray">
          Loading comments...
        </Text>
      ) : null}
      {commentsQuery.isError ? (
        <Text size="2" color="red">
          Could not load comments.
        </Text>
      ) : null}
      {commentsQuery.data?.map((comment) => (
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
                {formatActivityDate(comment.createdAt)}
              </Text>
            </Flex>
            <Text as="p" size="2" mt="1">
              {comment.content}
            </Text>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};
