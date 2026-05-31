import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  ValidationPipe,
} from "@nestjs/common";
import { UserId } from "../../common/decorators/user-id.decorator";
import { FeedFilterOptionsDto, FeedPageDto, GetFeedQueryDto } from "./feed.dto";
import { FeedService } from "./feed.service";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get("filters")
  getFeedFilters(
    @UserId(new ParseUUIDPipe()) userId: string,
  ): Promise<FeedFilterOptionsDto> {
    return this.feedService.getFeedFilters(userId);
  }

  @Get("unread-count")
  getUnreadActivitiesCount(
    @UserId(new ParseUUIDPipe()) userId: string,
  ): Promise<{ count: number }> {
    return this.feedService.getUnreadActivitiesCount(userId);
  }

  @Get()
  getFeed(
    @UserId() userId: string,
    @Query(new ValidationPipe({ transform: true }))
    query: GetFeedQueryDto,
  ): Promise<FeedPageDto> {
    return this.feedService.getFeed(userId, query);
  }

  @Patch("read-all")
  markAllActivitiesRead(@UserId(new ParseUUIDPipe()) userId: string) {
    return this.feedService.markAllActivitiesRead(userId);
  }

  @Patch(":activityId/read")
  markActivityRead(
    @UserId(new ParseUUIDPipe()) userId: string,
    @Param("activityId", new ParseUUIDPipe()) activityId: string,
  ) {
    return this.feedService.markActivityRead(activityId, userId);
  }

  @Delete(":activityId/read")
  markActivityUnread(
    @UserId(new ParseUUIDPipe()) userId: string,
    @Param("activityId", new ParseUUIDPipe()) activityId: string,
  ) {
    return this.feedService.markActivityUnread(activityId, userId);
  }
}
