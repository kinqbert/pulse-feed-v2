import { Injectable } from "@nestjs/common";
import {
  FeedFilterOptionsDto,
  FeedActivityDto,
  FeedPageDto,
  GetFeedQueryDto,
} from "./feed.dto";
import { buildRandomActivity, randomItem } from "./activity-generator";
import { FeedRealtimeGateway } from "./feed-realtime.gateway";
import { FeedRepository } from "./feed.repository";

const DEFAULT_FEED_LIMIT = 30;
@Injectable()
export class FeedService {
  constructor(
    private readonly feedRealtimeGateway: FeedRealtimeGateway,
    private readonly feedRepository: FeedRepository,
  ) {}

  async getFeed(
    userId: string,
    {
      cursor,
      actorId,
      from,
      limit = DEFAULT_FEED_LIMIT,
      query,
      to,
      type,
    }: GetFeedQueryDto,
  ): Promise<FeedPageDto> {
    const pageSize = limit ?? DEFAULT_FEED_LIMIT;
    const cursorValue = this.parseCursor(cursor);
    const filters = {
      actorId,
      from: from ? new Date(from) : undefined,
      query: query?.trim().toLowerCase().replace(/\s+/g, " ") || undefined,
      to: to ? new Date(to) : undefined,
      type,
    };
    const activities = await this.feedRepository.getFeedActivities({
      cursor: cursorValue,
      filters,
      limit: pageSize + 1,
      userId,
    });
    const items = activities.slice(0, pageSize);
    const hasNextPage = activities.length > pageSize;
    const lastItem = items.at(-1);

    return {
      items,
      nextCursor:
        hasNextPage && lastItem
          ? this.createCursor(lastItem.createdAt, lastItem.id)
          : null,
    };
  }

  async getFeedFilters(): Promise<FeedFilterOptionsDto> {
    const actors = await this.feedRepository.getFeedActors();

    return { actors };
  }

  async createRandomFeedActivity(): Promise<FeedActivityDto | null> {
    const actors = await this.feedRepository.getActivityActors();

    if (actors.length === 0) {
      return null;
    }

    const actor = randomItem(actors);
    const activity = await this.feedRepository.createFeedActivity(
      buildRandomActivity(actor),
    );
    const finalActivity = {
      ...activity,
      actor,
      commentsCount: 0,
      isRead: false,
      reactions: [],
    };

    this.feedRealtimeGateway.emitActivityCreated(finalActivity);

    return finalActivity;
  }

  async markActivityRead(activityId: string, userId: string) {
    await this.feedRepository.markActivityRead(activityId, userId);
  }

  async markAllActivitiesRead(userId: string) {
    await this.feedRepository.markAllActivitiesRead(userId);
  }

  async markActivityUnread(activityId: string, userId: string) {
    await this.feedRepository.markActivityUnread(activityId, userId);
  }

  private createCursor(createdAt: Date, id: string) {
    return `${createdAt.toISOString()}_${id}`;
  }

  private parseCursor(cursor?: string) {
    if (!cursor) {
      return undefined;
    }

    const separatorIndex = cursor.lastIndexOf("_");

    if (separatorIndex === -1) {
      return undefined;
    }

    const createdAt = new Date(cursor.slice(0, separatorIndex));
    const id = cursor.slice(separatorIndex + 1);

    if (Number.isNaN(createdAt.getTime()) || !id) {
      return undefined;
    }

    return { createdAt, id };
  }
}
