import { Injectable, NotFoundException } from "@nestjs/common";
import {
  FeedFilterOptionsDto,
  FeedPageDto,
  FeedPeriod,
  GetFeedQueryDto,
} from "./feed.dto";
import { FeedRepository } from "./feed.repository";

const DEFAULT_FEED_LIMIT = 30;
const FEED_PERIODS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async getFeed({
    cursor,
    actorId,
    limit = DEFAULT_FEED_LIMIT,
    period,
    type,
  }: GetFeedQueryDto): Promise<FeedPageDto> {
    const pageSize = limit ?? DEFAULT_FEED_LIMIT;
    const cursorValue = this.parseCursor(cursor);
    const filters = {
      actorId,
      from: this.getPeriodStart(period),
      type,
    };
    const activities = await this.feedRepository.getFeedActivities({
      cursor: cursorValue,
      filters,
      limit: pageSize + 1,
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

  async markActivityRead(activityId: string) {
    const activity = await this.feedRepository.markActivityRead(activityId);

    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    return activity;
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

  private getPeriodStart(period?: FeedPeriod) {
    if (!period || period === FeedPeriod.All) {
      return undefined;
    }

    return new Date(Date.now() - FEED_PERIODS[period]);
  }
}
