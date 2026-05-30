import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FeedModule } from "./modules/feed/feed.module";
import { CommentsModule } from "./modules/comments/comments.module";

@Module({
  imports: [FeedModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
