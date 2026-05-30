import { BadRequestException, Injectable } from "@nestjs/common";
import { ActivityCommentDto, CreateActivityCommentDto } from "./comments.dto";
import { CommentsRepository } from "./comments.repository";

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  getActivityComments(activityId: string): Promise<ActivityCommentDto[]> {
    return this.commentsRepository.getActivityComments(activityId);
  }

  createActivityComment(
    activityId: string,
    createCommentDto: CreateActivityCommentDto,
  ): Promise<ActivityCommentDto> {
    const content = createCommentDto.content.trim();

    if (!content) {
      throw new BadRequestException("Comment content is required");
    }

    return this.commentsRepository.createActivityComment({
      activityId,
      actorId: createCommentDto.actorId,
      content,
    });
  }
}
