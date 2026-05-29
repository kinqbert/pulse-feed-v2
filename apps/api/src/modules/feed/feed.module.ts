import { Module } from "@nestjs/common";
import { FeedController } from "./feed.controller";
import { FeedRepository } from "./feed.repository";
import { FeedService } from "./feed.service";

@Module({
  controllers: [FeedController],
  providers: [FeedRepository, FeedService],
})
export class FeedModule {}
