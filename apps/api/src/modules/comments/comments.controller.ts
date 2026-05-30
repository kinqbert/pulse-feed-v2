import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ActivityCommentDto, CreateActivityCommentDto } from "./comments.dto";
import { CommentsService } from "./comments.service";

@Controller("activities/:activityId/comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  getActivityComments(
    @Param("activityId") activityId: string,
  ): Promise<ActivityCommentDto[]> {
    return this.commentsService.getActivityComments(activityId);
  }

  @Post()
  createActivityComment(
    @Param("activityId") activityId: string,
    @Body() createCommentDto: CreateActivityCommentDto,
  ): Promise<ActivityCommentDto> {
    return this.commentsService.createActivityComment(
      activityId,
      createCommentDto,
    );
  }
}
