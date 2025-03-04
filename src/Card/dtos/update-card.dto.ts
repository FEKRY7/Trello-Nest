import { Type } from 'class-transformer';
import { IsString, IsOptional, Length, IsDateString, MinDate, IsDate, IsInt } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @Length(1, 150) 
  @IsOptional()
  title?: string;  

  @IsString()
  @Length(1, 250) 
  @IsOptional() 
  description?: string;

  @IsInt() 
  @IsOptional()
  assignTo?: string;  

  @IsDate()
  @MinDate(new Date()) 
  @Type(() => Date)
  @IsOptional() 
  deadline?: string;
}
