import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadType } from 'src/untils/types';
import { Token } from 'src/Token/token.entity';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from './otpGenerator.provider';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  // /**
  //  * Creates a new user in the database.
  //  * @param registerDto The user's registration data.
  //  * @returns JWT (access token)
  //  */

  public async SignUp(registerDto: RegisterDto) {
    const { firstName, lastName, email, password, phone, age, gender } =
      registerDto;

    // Check if email already exists
    const isEmailExist = await this.usersRepository.findOne({
      where: { email },
    });
    if (isEmailExist) {
      throw new NotFoundException(
        'Email already exists, please choose another one.',
      );
    }

    const hashedPassword = await this.hashPassword(password);

    // Encrypt Phone
    const encryptedPhone = CryptoJS.AES.encrypt(
      phone,
      process.env.CRYPTOKEY,
    ).toString();
 
    // Generate random OTP
    const OTP = this.otpService.generateOTP();

    // Check if email was sent successfully
    let emailSent = false;
    try {
      await this.mailService.sendOtpEmailTemplate(email, OTP.OTPCode);
      emailSent = true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      emailSent = false;
    }

    // Create new user
    const newUser = this.usersRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: encryptedPhone,
      OTP: { OTPCode: OTP.OTPCode }, // Ensure OTP format is correct
      age,
      gender,
    });

    // Save user first before sending OTP
    await this.usersRepository.save(newUser);

    return {
      message: 'User successfully registered',
      newUser,
      emailSent: emailSent
        ? 'Email sent successfully'
        : 'There is someting Wrong with Email Sender',
    };
  }

  // /**
  //  * Log In user
  //  * @param loginDto The user's login data.
  //  * @returns JWT (access token)
  //  */

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
 
    const isEmailExist = await this.usersRepository.findOne({
      where: { email },
    });
    if (!isEmailExist) throw new NotFoundException('Email is wrong');

    const isPasswordValid = await bcrypt.compare(
      password,
      isEmailExist.password,
    );
    if (!isPasswordValid) throw new NotFoundException('Password is wrong');

    if (!isEmailExist.confirmEmail) {
      throw new NotFoundException("Confirm Your Email First");
    }

    // Check if the account is deleted
    if (isEmailExist.isDeleted) {
      throw new NotFoundException("Not registered email or deleted account");
    }

    const payload: JWTPayloadType = {
      id: isEmailExist.id,
      role: isEmailExist.role,
      name: `${isEmailExist.firstName} ${isEmailExist.lastName}`,
      email: isEmailExist.email
    };
    const token = await this.generateJWT(payload);
    const AccessToken = this.tokenRepository.create({
      token,
      user: isEmailExist.id,
    });
    await this.tokenRepository.save(AccessToken);

    isEmailExist.isLoggedIn = true;
    await this.usersRepository.save(isEmailExist);

    return { message: 'Sign-in successful', token: `Bearer ${token}` };
  }

  /**
   *  Hashes the password.
   * @param password  The password to hash.
   * @returns  Hashed password.
   */
  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  /**
   *  Generates JWT token from payload.
   * @param payload  The user's payload.  This should contain the user's id and user type.  For example: { id: 1, userType: 'admin' }.  The JWT library automatically generates
   * @returns  JWT token.
   */
  public generateJWT(payload: JWTPayloadType) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '2h', // Set the token expiration time to 2 hours
    });
  }  
}
