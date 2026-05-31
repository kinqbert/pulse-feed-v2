import { Box, Button, Flex, Popover, Text } from "@radix-ui/themes";
import {
  type ActivityReaction,
  useToggleActivityReactionMutation,
} from "../api/feed";

const reactionOptions = ["👍", "🎉", "❤️", "👀", "🚀"];

const reactionButtonStyle = {
  border: "1px solid var(--gray-6)",
  borderRadius: "999px",
  color: "var(--gray-12)",
  background: "var(--gray-2)",
  cursor: "pointer",
  font: "inherit",
};

export const ActivityReactions = ({
  activityId,
  reactions,
}: {
  activityId: string;
  reactions: ActivityReaction[];
}) => {
  const toggleReactionMutation = useToggleActivityReactionMutation();
  const toggleReaction = (emoji: string) => {
    const reaction = reactions.find(
      (currentReaction) => currentReaction.emoji === emoji,
    );

    toggleReactionMutation.mutate({
      activityId,
      emoji,
      hasReacted: reaction?.hasReacted ?? false,
    });
  };

  return (
    <>
      <Box
        style={{
          display: "flex",
          gap: "6px",
          marginTop: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Popover.Root>
          <Popover.Trigger>
            <button
              type="button"
              aria-label="Add reaction"
              style={{
                ...reactionButtonStyle,
                width: "26px",
                height: "24px",
                padding: 0,
                color: "var(--gray-10)",
                background: "transparent",
                fontSize: "15px",
                lineHeight: 1,
              }}
            >
              ☺
            </button>
          </Popover.Trigger>
          <Popover.Content side="top" align="start" size="1">
            <Box
              style={{
                display: "flex",
                gap: "4px",
              }}
            >
              {reactionOptions.map((emoji) => (
                <Popover.Close key={emoji}>
                  <button
                    type="button"
                    aria-label={`React with ${emoji}`}
                    disabled={toggleReactionMutation.isPending}
                    onClick={() => toggleReaction(emoji)}
                    style={{
                      padding: "0px 4px",
                      border: 0,
                      borderRadius: "var(--radius-2)",
                      background: "transparent",
                      cursor: "pointer",
                      font: "inherit",
                      fontSize: "16px",
                    }}
                  >
                    {emoji}
                  </button>
                </Popover.Close>
              ))}
            </Box>
          </Popover.Content>
        </Popover.Root>
        {reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            type="button"
            aria-pressed={reaction.hasReacted}
            disabled={toggleReactionMutation.isPending}
            onClick={() => toggleReaction(reaction.emoji)}
            style={{
              ...reactionButtonStyle,
              padding: "2px 7px",
              border: reaction.hasReacted
                ? "1px solid var(--teal-7)"
                : reactionButtonStyle.border,
              background: reaction.hasReacted
                ? "var(--teal-3)"
                : reactionButtonStyle.background,
              fontSize: "12px",
            }}
          >
            {reaction.emoji} {reaction.count}
          </button>
        ))}
      </Box>
      {toggleReactionMutation.isError ? (
        <Flex align="center" gap="2" mt="2">
          <Text as="p" size="1" color="red">
            Could not save reaction.
          </Text>
          {toggleReactionMutation.variables ? (
            <Button
              type="button"
              size="1"
              variant="ghost"
              disabled={toggleReactionMutation.isPending}
              onClick={() =>
                toggleReactionMutation.mutate(toggleReactionMutation.variables)
              }
            >
              {toggleReactionMutation.isPending ? "Retrying..." : "Retry"}
            </Button>
          ) : null}
        </Flex>
      ) : null}
    </>
  );
};
