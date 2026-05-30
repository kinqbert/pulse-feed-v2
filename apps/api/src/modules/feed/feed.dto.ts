import { Type } from "class-transformer";
import {
  IsDate,
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

export const FeedPeriod = {
  All: "all",
  Last24Hours: "24h",
  Last7Days: "7d",
  Last30Days: "30d",
} as const;

export type FeedPeriod = (typeof FeedPeriod)[keyof typeof FeedPeriod];

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

  @IsEnum(FeedPeriod)
  @IsOptional()
  declare period?: FeedPeriod;

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

export class FeedActivityDto {
  @IsUUID()
  declare id: string;

  @IsEnum(ActivityType)
  declare type: ActivityType;

  @IsObject()
  declare metadata: ActivityMetadata;

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
