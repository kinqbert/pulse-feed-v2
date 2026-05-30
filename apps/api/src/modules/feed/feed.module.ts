import { Module } from "@nestjs/common";
import { FeedController } from "./feed.controller";
import { FeedRealtimeGateway } from "./feed-realtime.gateway";
import { FeedRepository } from "./feed.repository";
import { FeedService } from "./feed.service";
import { FeedTickerService } from "./feed-ticker.service";

@Module({
  controllers: [FeedController],
  providers: [
    FeedRealtimeGateway,
    FeedRepository,
    FeedService,
    FeedTickerService,
  ],
})
export class FeedModule {}
