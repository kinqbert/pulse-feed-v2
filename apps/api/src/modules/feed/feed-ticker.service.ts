import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { FeedRealtimeGateway } from "./feed-realtime.gateway";
import { FeedRepository } from "./feed.repository";

const MIN_TICK_DELAY_MS = 10_000;
const MAX_TICK_DELAY_MS = 15_000;

@Injectable()
export class FeedTickerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FeedTickerService.name);
  private timeout: NodeJS.Timeout | undefined;

  constructor(
    private readonly feedRealtimeGateway: FeedRealtimeGateway,
    private readonly feedRepository: FeedRepository,
  ) {}

  onModuleInit() {
    this.scheduleNextTick();
  }

  onModuleDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  private scheduleNextTick() {
    this.timeout = setTimeout(
      () => void this.tick(),
      this.getNextTickDelayMs(),
    );
  }

  private async tick() {
    try {
      await this.feedRepository.createRandomFeedActivity();
    } catch (error: unknown) {
      this.logger.error(
        "Failed to create realtime feed activity",
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.scheduleNextTick();
    }
  }

  private getNextTickDelayMs() {
    return (
      MIN_TICK_DELAY_MS +
      Math.floor(Math.random() * (MAX_TICK_DELAY_MS - MIN_TICK_DELAY_MS + 1))
    );
  }
}
