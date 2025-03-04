import { 
    IsEmail, 
    IsEnum, 
    IsInt, 
    IsNotEmpty, 
    IsOptional, 
    IsString, 
    Length, 
    MinLength, 
    MaxLength, 
    Matches, 
    Validate 
} from 'class-validator';
import { GenderType } from 'src/untils/enums';
import { Match } from '../decorators/match.decorator'; // Custom validator

export class RegisterDto {
    
    @IsString()
    @Length(2, 150)
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @Length(2, 150)
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @MaxLength(250)
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    password: string;

    @IsString()
    @MinLength(5)
    @Match('password', { message: 'Passwords do not match' })
    confirmPassword: string;

    @IsOptional()
    @IsEnum(GenderType)
    gender?: GenderType;

    @IsString()
    @Length(8, 15)
    @IsNotEmpty()
    phone: string;

    @IsInt({ message: 'Age must be a valid integer' })
    @IsNotEmpty()
    age: number;
}


// @Matches(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$'), {
//     message: 'Confirm password must match the password and have at least one letter and one number',
// })