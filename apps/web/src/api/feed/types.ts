const activityLabels = {
  comment: "Comment",
  mention: "Mention",
  task_update: "Task update",
  deployment: "Deploy",
} as const;

export type ActivityType = keyof typeof activityLabels;

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

export type FeedFilters = {
  actorId: string;
  from: string;
  query: string;
  to: string;
  type: ActivityType | "all";
};

export type FeedFilterOptions = {
  actors: ActivityActor[];
};

export type UnreadActivitiesCount = {
  count: number;
};

export const defaultFeedFilters: FeedFilters = {
  actorId: "all",
  from: "",
  query: "",
  to: "",
  type: "all",
};

export const FEED_ACTIVITY_CREATED_EVENT = "feed:activity-created";

export const getActivityLabel = (type: ActivityType) => activityLabels[type];
