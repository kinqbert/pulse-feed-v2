import { Module } from "@nestjs/common";
import { ReactionsController } from "./reactions.controller";
import { ReactionsRepository } from "./reactions.repository";
import { ReactionsService } from "./reactions.service";

@Module({
  controllers: [ReactionsController],
  providers: [ReactionsRepository, ReactionsService],
})
export class ReactionsModule {}
