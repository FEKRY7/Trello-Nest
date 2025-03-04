import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @Length(1, 250)
  @IsNotEmpty()
  text: string; 
}
