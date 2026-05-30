import { Injectable } from "@nestjs/common";
import { ActivityCommentDto } from "./comments.dto";
import { CommentsRepository } from "./comments.repository";

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  getActivityComments(activityId: string): Promise<ActivityCommentDto[]> {
    return this.commentsRepository.getActivityComments(activityId);
  }
}
