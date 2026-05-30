import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { ActivityType } from "../../db/schema";

export class ActivityActorDto {
  @IsUUID()
  declare id: string;

  @IsString()
  declare name: string;

  @IsEmail()
  declare email: string;
}

export class FeedActivityDto {
  @IsUUID()
  declare id: string;

  @IsEnum(ActivityType)
  declare type: ActivityType;

  @IsString()
  declare title: string;

  @IsDate()
  declare createdAt: Date;

  @ValidateNested()
  @Type(() => ActivityActorDto)
  declare actor: ActivityActorDto;

  @IsInt()
  declare commentsCount: number;
}

export class FeedPageDto {
  @ValidateNested({ each: true })
  @Type(() => FeedActivityDto)
  declare items: FeedActivityDto[];

  @IsString()
  @IsOptional()
  declare nextCursor: string | null;
}
