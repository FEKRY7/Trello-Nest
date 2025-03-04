import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCommentReplayDto {
  @IsString()
  @Length(1, 250) 
  @IsNotEmpty()
  replytext: string;
}
