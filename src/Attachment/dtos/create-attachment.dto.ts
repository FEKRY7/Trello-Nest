import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @Length(1, 250) 
  @IsNotEmpty()
  fileName: string;  

  @IsString()
  @Length(1, 250) 
  @IsNotEmpty()
  fileType: string;  
}
