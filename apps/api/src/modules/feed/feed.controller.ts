import { Controller, Get } from "@nestjs/common";
import { FeedActivityDto } from "./feed.dto";
import { FeedService } from "./feed.service";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed(): Promise<FeedActivityDto[]> {
    return this.feedService.getFeed();
  }
}
