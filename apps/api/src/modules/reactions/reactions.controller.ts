import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { UserId } from "../../common/decorators/user-id.decorator";
import { CreateActivityReactionDto } from "./reactions.dto";
import { ReactionsService } from "./reactions.service";

@Controller("activities/:activityId/reactions")
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  addReaction(
    @Param("activityId", new ParseUUIDPipe()) activityId: string,
    @UserId(new ParseUUIDPipe()) userId: string,
    @Body() createReactionDto: CreateActivityReactionDto,
  ) {
    return this.reactionsService.addReaction(
      activityId,
      userId,
      createReactionDto,
    );
  }

  @Delete(":emoji")
  removeReaction(
    @Param("activityId", new ParseUUIDPipe()) activityId: string,
    @Param("emoji") emoji: string,
    @UserId(new ParseUUIDPipe()) userId: string,
  ) {
    return this.reactionsService.removeReaction(activityId, emoji, userId);
  }
}
