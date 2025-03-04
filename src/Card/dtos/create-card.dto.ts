import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, Length, IsDate, MinDate, IsEnum, IsInt } from 'class-validator';
import { StatusType } from 'src/untils/enums';

export class CreateCardDto {
  @IsString()
  @Length(1, 150)
  @IsNotEmpty()
  title: string;

  @IsString()
  @Length(1, 250)
  @IsNotEmpty()
  description: string;

  @IsInt() // Ensures assignTo is a valid integer (user ID)
  @IsNotEmpty()
  assignTo: number;

  @IsDate()
  @MinDate(new Date()) // Ensures deadline is in the future
  @Type(() => Date)
  deadline: Date;

  @IsEnum(StatusType) // Ensures status is a valid enum value
  @IsNotEmpty()
  status: StatusType;
}
