import { Box, Text } from "@radix-ui/themes";
import {
  type ActivityReaction,
  useToggleActivityReactionMutation,
} from "../api/feed";

const reactionOptions = ["👍", "🎉", "❤️", "👀", "🚀"];

export const ActivityReactions = ({
  activityId,
  reactions,
  showReactionPicker,
}: {
  activityId: string;
  reactions: ActivityReaction[];
  showReactionPicker: boolean;
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
      {reactions.length > 0 || showReactionPicker ? (
        <Box
          style={{
            display: "flex",
            gap: "6px",
            marginTop: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              type="button"
              aria-pressed={reaction.hasReacted}
              disabled={toggleReactionMutation.isPending}
              onClick={() => toggleReaction(reaction.emoji)}
              style={{
                padding: "2px 7px",
                border: reaction.hasReacted
                  ? "1px solid var(--teal-7)"
                  : "1px solid var(--gray-6)",
                borderRadius: "999px",
                color: "var(--gray-12)",
                background: reaction.hasReacted
                  ? "var(--teal-3)"
                  : "var(--gray-2)",
                cursor: "pointer",
                font: "inherit",
                fontSize: "12px",
              }}
            >
              {reaction.emoji} {reaction.count}
            </button>
          ))}
          {showReactionPicker
            ? reactionOptions
                .filter(
                  (emoji) =>
                    !reactions.some(
                      (reaction) =>
                        reaction.emoji === emoji && reaction.count > 0,
                    ),
                )
                .map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`React with ${emoji}`}
                    disabled={toggleReactionMutation.isPending}
                    onClick={() => toggleReaction(emoji)}
                    style={{
                      padding: "2px 5px",
                      border: "1px solid var(--gray-6)",
                      borderRadius: "999px",
                      background: "transparent",
                      cursor: "pointer",
                      font: "inherit",
                      fontSize: "14px",
                    }}
                  >
                    {emoji}
                  </button>
                ))
            : null}
        </Box>
      ) : null}
      {toggleReactionMutation.isError ? (
        <Text as="p" size="1" color="red" mt="2">
          Could not save reaction. Try again.
        </Text>
      ) : null}
    </>
  );
};
