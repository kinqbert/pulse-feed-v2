import { Injectable } from "@nestjs/common";
import { FeedPageDto } from "./feed.dto";
import { FeedRepository } from "./feed.repository";

const DEFAULT_FEED_LIMIT = 30;
const MAX_FEED_LIMIT = 1000;

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async getFeed({
    cursor,
    limit = DEFAULT_FEED_LIMIT,
  }: {
    cursor?: string;
    limit?: number;
  }): Promise<FeedPageDto> {
    const pageSize = Math.min(Math.max(limit, 1), MAX_FEED_LIMIT);
    const cursorValue = this.parseCursor(cursor);
    const activities = await this.feedRepository.getFeedActivities({
      cursor: cursorValue,
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
