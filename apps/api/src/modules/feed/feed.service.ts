import { Injectable } from "@nestjs/common";
import { FeedActivityDto } from "./feed.dto";
import { FeedRepository } from "./feed.repository";

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  getFeed(): Promise<FeedActivityDto[]> {
    return this.feedRepository.getAllFeedActivities();
  }
}
