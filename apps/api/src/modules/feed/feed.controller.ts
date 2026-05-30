import { Controller, Get, Query, ValidationPipe } from "@nestjs/common";
import { FeedFilterOptionsDto, FeedPageDto, GetFeedQueryDto } from "./feed.dto";
import { FeedService } from "./feed.service";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get("filters")
  getFeedFilters(): Promise<FeedFilterOptionsDto> {
    return this.feedService.getFeedFilters();
  }

  @Get()
  getFeed(
    @Query(new ValidationPipe({ transform: true }))
    query: GetFeedQueryDto,
  ): Promise<FeedPageDto> {
    return this.feedService.getFeed(query);
  }
}
