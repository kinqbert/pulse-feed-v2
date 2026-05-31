import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserId } from "../../common/decorators/user-id.decorator";
import { ActivityCommentDto, CreateActivityCommentDto } from "./comments.dto";
import { CommentsService } from "./comments.service";

@Controller("activities/:activityId/comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  getActivityComments(
    @Param("activityId") activityId: string,
    @UserId() userId: string,
  ): Promise<ActivityCommentDto[]> {
    return this.commentsService.getActivityComments(activityId, userId);
  }

  @Post()
  createActivityComment(
    @Param("activityId") activityId: string,
    @UserId() actorId: string,
    @Body() createCommentDto: CreateActivityCommentDto,
  ): Promise<ActivityCommentDto> {
    return this.commentsService.createActivityComment(
      activityId,
      actorId,
      createCommentDto,
    );
  }
}
