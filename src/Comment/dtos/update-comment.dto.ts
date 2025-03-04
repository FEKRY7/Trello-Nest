import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @Length(1, 250)
  @IsOptional()
  text?: string; 
}
