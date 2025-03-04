import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Put,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JWTPayloadType } from 'src/untils/types';
import { AuthRolesGuard } from 'src/guards/auth.roles.guard';
import { ChangePasswordDto } from './dtos/ChangePassword.dto';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from 'src/untils/enums';
import { ConfirmDto } from './dtos/confirm.dto';
import { ForgotDto } from './dtos/forgot.dto';
import { ResetDto } from './dtos/reset.dto';
import { UpdateProfileDto } from './dtos/updateProfile.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST: /api/users/auth/signup
  @Post('auth/signUp')
  public async registerUser(@Body() Body: RegisterDto) {
    return await this.usersService.SignUp(Body);
  }

  // POST: /api/users/auth/login
  @Post('auth/login')
  public async login(@Body() Body: LoginDto) {
    return await this.usersService.login(Body);
  }

  // GET: /api/users/current-user
  @Get('current-user')
  @UseGuards(AuthGuard)
  public async GetLogginUserProfile(@CurrentUser() payload: JWTPayloadType) {
    return await this.usersService.getCurrentUser(payload.id);
  }

  // PUT: /api/users/confirmEmail
  @Put('/confirmEmail')
  public async confirmEmail(@Body() confirmDto: ConfirmDto) {
    return await this.usersService.ConfirmUser(confirmDto);
  }

  // POST: /api/users/logout
  @Post('/logout')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public async LogOut(@CurrentUser() payload: JWTPayloadType) {
    return await this.usersService.logOut(payload);
  }

  // PUT: /api/users/change-password
  @Put('/change-password')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public async ChangeUserPassword(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: ChangePasswordDto,
  ) {
    return await this.usersService.changeUserPassword(body, payload);
  }

  // POST: /api/users/forgot-password
  @Post('forgot-password')
  public async forgotPassword(@Body() body: ForgotDto) {
    return await this.usersService.forgetPassword(body);
  }

  // POST: /api/users/reset-password
  @Post('reset-password')
  public async resetPassword(@Body() body: ResetDto) {
    return await this.usersService.resetPassword(body);
  }

  // PUT: /api/users/update
  @Put('update')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return await this.usersService.UpdateProfile(payload, updateProfileDto);
  }

  // PATCH: /api/users/softdelete
  @Patch('softdelete')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public async SoftDelete(@CurrentUser() payload: JWTPayloadType) {
    return await this.usersService.softDelete(payload);
  }
}
