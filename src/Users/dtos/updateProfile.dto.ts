import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsString()
  @Length(2, 150)
  @IsOptional()
  firstName?: string;

  @IsString()
  @Length(2, 150)
  @IsOptional()
  lastName?: string;

  @IsString()
  @Length(8, 15)
  @IsOptional()
  phone?: string;

  @IsOptional()
  @Type(() => Number) // Automatically transforms input to a number
  @IsNumber({}, { message: 'Age must be a valid number' })
  age?: number;
}
