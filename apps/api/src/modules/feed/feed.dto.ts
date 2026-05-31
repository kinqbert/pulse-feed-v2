import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { type ActivityMetadata, ActivityType } from "../../db/schema";

export class GetFeedQueryDto {
  @IsString()
  @IsOptional()
  declare cursor?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  declare limit?: number;

  @IsDateString()
  @IsOptional()
  declare from?: string;

  @IsDateString()
  @IsOptional()
  declare to?: string;

  @IsUUID()
  @IsOptional()
  declare actorId?: string;

  @IsEnum(ActivityType)
  @IsOptional()
  declare type?: ActivityType;
}

export class ActivityActorDto {
  @IsUUID()
  declare id: string;

  @IsString()
  declare name: string;

  @IsEmail()
  declare email: string;
}

export class ActivityReactionDto {
  @IsString()
  declare emoji: string;

  @IsInt()
  declare count: number;

  @IsBoolean()
  declare hasReacted: boolean;
}

export class FeedActivityDto {
  @IsUUID()
  declare id: string;

  @IsEnum(ActivityType)
  declare type: ActivityType;

  @IsObject()
  declare metadata: ActivityMetadata;

  @IsBoolean()
  declare isRead: boolean;

  @IsInt()
  declare commentsCount: number;

  @ValidateNested({ each: true })
  @Type(() => ActivityReactionDto)
  declare reactions: ActivityReactionDto[];

  @IsDate()
  declare createdAt: Date;

  @ValidateNested()
  @Type(() => ActivityActorDto)
  declare actor: ActivityActorDto;
}

export class FeedPageDto {
  @ValidateNested({ each: true })
  @Type(() => FeedActivityDto)
  declare items: FeedActivityDto[];

  @IsString()
  @IsOptional()
  declare nextCursor: string | null;
}

export class FeedFilterOptionsDto {
  @ValidateNested({ each: true })
  @Type(() => ActivityActorDto)
  declare actors: ActivityActorDto[];
}
