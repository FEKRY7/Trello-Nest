import { IsString, IsOptional } from 'class-validator';

export class UpdateAttachmentDto {
  @IsString()
  @IsOptional() 
  fileName?: string;

  @IsString()
  @IsOptional() 
  fileType?: string; 
}
