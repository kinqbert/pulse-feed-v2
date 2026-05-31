import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { FeedService } from "./feed.service";

const MIN_TICK_DELAY_MS = 10_000;
const MAX_TICK_DELAY_MS = 15_000;

const getRandomTickDelayMs = () =>
  MIN_TICK_DELAY_MS +
  Math.floor(Math.random() * (MAX_TICK_DELAY_MS - MIN_TICK_DELAY_MS + 1));

@Injectable()
export class FeedTickerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FeedTickerService.name);
  private timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly feedService: FeedService) {}

  onModuleInit() {
    this.scheduleNextTick();
  }

  onModuleDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  private scheduleNextTick() {
    this.timeout = setTimeout(() => void this.tick(), getRandomTickDelayMs());
  }

  private async tick() {
    try {
      await this.feedService.createRandomFeedActivity();
    } catch (error: unknown) {
      this.logger.error(
        "Failed to create realtime feed activity",
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.scheduleNextTick();
    }
  }
}
