import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateActivityReactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  declare emoji: string;
}
