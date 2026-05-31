import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Box, Button, Flex, Text, TextArea } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateActivityCommentMutation } from "../api/feed";
import { useUserStore } from "../stores/useUserStore";

export const ActivityCommentForm = ({ activityId }: { activityId: string }) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.userId);
  const createCommentMutation = useCreateActivityCommentMutation();
  const trimmedContent = content.trim();

  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    const maxHeight = 128;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    resizeTextarea(event.target);
  };

  const handleContentKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || !trimmedContent || createCommentMutation.isPending) {
      return;
    }

    createCommentMutation.mutate(
      {
        activityId,
        content: trimmedContent,
      },
      {
        onSuccess() {
          setContent("");
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
          void queryClient.invalidateQueries({
            queryKey: ["activities", activityId, "comments"],
          });
          void queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="2">
        <Flex gap="2" align="end">
          <Box flexGrow="1" minWidth="0">
            <TextArea
              ref={textareaRef}
              aria-label="Comment"
              placeholder="Write a comment..."
              size="2"
              rows={1}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleContentKeyDown}
              style={{
                width: "100%",
                minHeight: "32px",
                borderRadius: "var(--radius-2)",
                background: "var(--color-panel-solid)",
              }}
            />
          </Box>
          <Button
            type="submit"
            size="2"
            variant="soft"
            disabled={
              !userId || !trimmedContent || createCommentMutation.isPending
            }
          >
            {createCommentMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </Flex>
        {createCommentMutation.isError ? (
          <Text size="2" color="red">
            Could not post comment.
          </Text>
        ) : null}
        {!userId ? (
          <Text size="2" color="gray">
            Loading user...
          </Text>
        ) : null}
      </Flex>
    </form>
  );
};
