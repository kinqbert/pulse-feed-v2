import { Controller, Get, Param } from "@nestjs/common";
import { ActivityCommentDto } from "./comments.dto";
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
}
