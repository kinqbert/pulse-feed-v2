import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class CommentActorDto {
  @IsUUID()
  declare id: string;

  @IsString()
  declare name: string;

  @IsEmail()
  declare email: string;
}

export class ActivityCommentDto {
  @IsUUID()
  declare id: string;

  @IsUUID()
  declare activityId: string;

  @IsString()
  declare content: string;

  @IsDate()
  declare createdAt: Date;

  @ValidateNested()
  @Type(() => CommentActorDto)
  declare actor: CommentActorDto;
}

export class CreateActivityCommentDto {
  @IsUUID()
  declare actorId: string;

  @IsString()
  @IsNotEmpty()
  declare content: string;
}
