import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateActivityReactionDto } from "./reactions.dto";
import { ReactionsRepository } from "./reactions.repository";

@Injectable()
export class ReactionsService {
  constructor(private readonly reactionsRepository: ReactionsRepository) {}

  async addReaction(
    activityId: string,
    userId: string,
    createReactionDto: CreateActivityReactionDto,
  ) {
    await this.ensureActivityBelongsToUser(activityId, userId);
    const emoji = createReactionDto.emoji.trim();

    if (!emoji) {
      throw new BadRequestException("Emoji is required");
    }

    await this.reactionsRepository.addReaction(activityId, emoji, userId);

    return this.reactionsRepository.getActivityReactions(activityId, userId);
  }

  async removeReaction(activityId: string, emoji: string, userId: string) {
    await this.ensureActivityBelongsToUser(activityId, userId);
    await this.reactionsRepository.removeReaction(activityId, emoji, userId);

    return this.reactionsRepository.getActivityReactions(activityId, userId);
  }

  private async ensureActivityBelongsToUser(
    activityId: string,
    userId: string,
  ) {
    if (
      !(await this.reactionsRepository.activityBelongsToUser(
        activityId,
        userId,
      ))
    ) {
      throw new NotFoundException("Activity not found");
    }
  }
}
