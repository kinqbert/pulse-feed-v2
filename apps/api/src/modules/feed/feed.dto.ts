import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
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
}
