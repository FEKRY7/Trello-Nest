import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OTPDto {
  @IsString()
  @IsNotEmpty()
  OTPCode: string;
}

export class ResetDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ValidateNested()
  @Type(() => OTPDto)
  OTP?: OTPDto;

  @IsString()
  @MinLength(5)
  @MaxLength(32)
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @MinLength(5)
  @MaxLength(32)
  @IsNotEmpty()
  confirmNewPassword: string;
}
