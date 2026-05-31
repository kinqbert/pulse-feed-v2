import type { ACTIVITY_LABELS } from "../constants";

export type ActivityType = keyof typeof ACTIVITY_LABELS;

export type ActivityActor = {
  id: string;
  name: string;
  email: string;
};

export type ActivityReaction = {
  emoji: string;
  count: number;
  hasReacted: boolean;
};

export type CommentMetadata = {
  entityName: string;
};

export type MentionMetadata = {
  entityName: string;
};

export type TaskUpdateMetadata = {
  taskName: string;
  previousValue?: string;
  newValue: string;
};

export type DeploymentMetadata = {
  serviceName: string;
  status: "success" | "failed";
};

type BaseFeedActivity = {
  id: string;
  createdAt: string;
  commentsCount: number;
  isRead: boolean;
  reactions: ActivityReaction[];
  actor: ActivityActor;
};

export type FeedActivity =
  | (BaseFeedActivity & {
      type: "comment";
      metadata: CommentMetadata;
    })
  | (BaseFeedActivity & {
      type: "mention";
      metadata: MentionMetadata;
    })
  | (BaseFeedActivity & {
      type: "task_update";
      metadata: TaskUpdateMetadata;
    })
  | (BaseFeedActivity & {
      type: "deployment";
      metadata: DeploymentMetadata;
    });

export type FeedPage = {
  items: FeedActivity[];
  nextCursor: string | null;
};
