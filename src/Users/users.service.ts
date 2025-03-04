import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from 'src/untils/types';
import { AuthProvider } from './auth.provider';
import { ChangePasswordDto } from './dtos/ChangePassword.dto';
import * as bcrypt from 'bcryptjs';
import * as otpGenerator from 'otp-generator';
import { Token } from 'src/Token/token.entity';
import { ConfirmDto } from './dtos/confirm.dto';
import { ForgotDto } from './dtos/forgot.dto';
import { OtpService } from './otpGenerator.provider';
import { MailService } from 'src/mail/mail.service';
import { ResetDto } from './dtos/reset.dto';
import { UpdateProfileDto } from './dtos/updateProfile.dto';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Creates a new user in the database.
   * @param registerDto The user's registration data.
   * @returns JWT (access token)
   */

  public async SignUp(registerDto: RegisterDto) {
    return await this.authProvider.SignUp(registerDto);
  }

  /**
   * Log In user
   * @param loginDto The user's login data.
   * @returns JWT (access token)
   */

  public async login(loginDto: LoginDto) {
    return await this.authProvider.login(loginDto);
  }

  /**
   *  Get user by id.
   * @param id id of the user.
   * @returns User.
   */
  public async getCurrentUser(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    } else {
      return user;
    }
  }

  public async ConfirmUser(confirmDto: ConfirmDto) {
    const { email, otp } = confirmDto;

    // Find the user by email
    const user = await this.usersRepository.findOne({ where: { email } });

    // Check if the user exists
    if (!user) {
      throw new NotFoundException('This Email Does Not Exist');
    }

    // Check if the email is already confirmed
    if (user.confirmEmail) {
      throw new BadRequestException(
        'This Email Is Already Confirmed. Please Go To Login Page',
      );
    }

    // Check if the OTP exists
    if (!user.OTP) {
      throw new BadRequestException('Invalid OTP');
    }

    // Verify if the provided OTP matches the stored OTP
    if (user.OTP.OTPCode !== otp) {
      throw new BadRequestException('OTP does not match');
    }

    // Generate a new OTP (if necessary, for the next step)
    const newOTP = otpGenerator.generate(10);

    // Update user confirmation status and OTP
    user.confirmEmail = true;
    user.OTP = newOTP; // Update OTP with new generated one (optional)

    // Save the updated user record
    const confirmUser = await this.usersRepository.save(user);

    return { message: 'Email successfully confirmed', confirmUser };
  }

  public async logOut(payload: JWTPayloadType) {
    const user = await this.getCurrentUser(payload.id);
    user.isLoggedIn = false;
    await this.usersRepository.save(user);
    return { message: 'User logged out successfully' };
  }

  public async changeUserPassword(
    changePasswordDto: ChangePasswordDto,
    payload: JWTPayloadType,
  ) {
    const { oldPassword, newPassword, ConfirmNewPassword } = changePasswordDto;

    const user = await this.getCurrentUser(payload.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.password,
    );
    if (isSameAsOldPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    // Validate that newPassword and ConfirmNewPassword match
    if (newPassword !== ConfirmNewPassword) {
      throw new NotFoundException('New password and confirmation do not match');
    }

    user.password = await this.authProvider.hashPassword(newPassword);
    await this.usersRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  public async forgetPassword(forgotDto: ForgotDto) {
    const { email } = forgotDto;
    const isValidEmail = await this.usersRepository.findOne({
      where: { email },
    });
    if (!isValidEmail) throw new NotFoundException('Email is wrong');

    // Check if the maximum number of OTPs has been sent
    if ((isValidEmail.OTPSentTimes ?? 0) >= Number(process.env.MAXOTPSMS)) {
      throw new BadRequestException(
        'OTP already sent. Please check your email.',
      );
    }

    // Generate OTP with a time limit
    const OTP = this.otpService.generatorLimitTimeOTP();
    console.log('Generated OTP (for debugging):', OTP);

    // Store OTP in user document and increment sent times
    isValidEmail.OTP = OTP;
    isValidEmail.OTPSentTimes = (isValidEmail.OTPSentTimes || 0) + 1;

    // Check if email was sent successfully
    let emailSent = false;
    try {
      await this.mailService.sendOtpResetPasswordEmailTemplate(
        email,
        OTP.OTPCode,
      );
      emailSent = true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      emailSent = false;
    }

    await this.usersRepository.save(isValidEmail);

    return {
      message: 'OTP sent. Check your email.',
      emailSent: emailSent
        ? 'Email sent successfully'
        : 'There is someting Wrong with Email Sender',
    };
  }

  public async resetPassword(resetDto: ResetDto) {
    const { email, OTP, newPassword, confirmNewPassword } = resetDto;

    // Check if user exists
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Email is incorrect');

    // Ensure OTP exists before accessing it
    if (!user.OTP || user.OTP.OTPCode !== OTP.OTPCode) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check if OTP is expired
    if (user.OTP.expireDate < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match',
      );
    }

    // Hash the new password
    const hashedPassword = await this.authProvider.hashPassword(newPassword);

    // Update user's password and reset related fields
    user.password = hashedPassword;
    user.isLoggedIn = false; // Force logout from all sessions
    user.OTPSentTimes = 0; // Reset OTP counter
    user.OTP = null; // Clear OTP instead of generating a new one

    await this.usersRepository.save(user);
    return { message: 'Password changed successfully' };
  }

  public async UpdateProfile(
    payload: JWTPayloadType,
    updateProfileDto: UpdateProfileDto,
  ) {
    const { firstName, lastName, age } = updateProfileDto;
    let { phone } = updateProfileDto; // Change `const` to `let`

    // Check if at least one field is provided for the update
    if (!firstName && !lastName && !age && !phone) {
      throw new NotFoundException(
        'At least one field must be provided for update.',
      );
    }

    const user = await this.getCurrentUser(payload.id);
    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    // Encrypt phone number if provided
    if (phone) {
      phone = CryptoJS.AES.encrypt(phone, process.env.CRYPTOKEY).toString();
    }

    // Create an object with only the provided fields
    const updatedData: Partial<User> = {};
    if (firstName) updatedData.firstName = firstName;
    if (lastName) updatedData.lastName = lastName;
    if (age) updatedData.age = age;
    if (phone) updatedData.phone = phone;

    await this.usersRepository.update(payload.id, updatedData);

    return { message: 'Profile updated successfully' };
  }

  public async softDelete(payload: JWTPayloadType) {
    const user = await this.getCurrentUser(payload.id);

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    user.isLoggedIn = false;
    user.isDeleted = true;

    await this.usersRepository.save(user);

    return { message: 'User has been soft deleted successfully.' };
  }

  public async getToken(token: string) {
    const tokenDb = await this.tokenRepository.findOneBy({
      token,
      isValied: true,
    });
    if (!tokenDb) {
      throw new NotFoundException('Expired or invalid token');
    }
  }
}
