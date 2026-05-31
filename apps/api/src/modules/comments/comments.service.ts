import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ActivityCommentDto, CreateActivityCommentDto } from "./comments.dto";
import { CommentsRepository } from "./comments.repository";

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async getActivityComments(
    activityId: string,
    userId: string,
  ): Promise<ActivityCommentDto[]> {
    await this.ensureActivityBelongsToUser(activityId, userId);

    return this.commentsRepository.getActivityComments(activityId);
  }

  async createActivityComment(
    activityId: string,
    actorId: string,
    createCommentDto: CreateActivityCommentDto,
  ): Promise<ActivityCommentDto> {
    await this.ensureActivityBelongsToUser(activityId, actorId);
    const content = createCommentDto.content.trim();

    if (!content) {
      throw new BadRequestException("Comment content is required");
    }

    return this.commentsRepository.createActivityComment({
      activityId,
      actorId,
      content,
    });
  }

  private async ensureActivityBelongsToUser(
    activityId: string,
    userId: string,
  ) {
    if (
      !(await this.commentsRepository.activityBelongsToUser(activityId, userId))
    ) {
      throw new NotFoundException("Activity not found");
    }
  }
}
