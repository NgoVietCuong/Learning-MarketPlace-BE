import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/app/guards/role.guard';
import { Public } from 'src/app/decorators/public';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifySignUpDto } from './dto/verify-signup.dto';
import { SendResetEmailDto } from './dto/send-reset-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResendVerifyEmailDto } from './dto/resend-verify-email.dto';
import { VerifyResetPasswordDto } from './dto/verify-reset-password.dto';


@Public()
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up' })
  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @ApiOperation({ summary: 'Verify email' })
  @Post('verify-signup')
  async verifySignUp(@Body() body: VerifySignUpDto) {
    return this.authService.verifySignUp(body);
  }

  @ApiOperation({ summary: 'Resend email to verify' })
  @Post('resend-verify-email')
  async resendVerifyEmail(@Body() body: ResendVerifyEmailDto) {
    return this.authService.resendVerifyEmail(body);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @ApiOperation({ summary: 'Login with google' })
  @Post('google-login')
  async loginByGoogle(@Body() body: GoogleLoginDto) {
    return this.authService.loginByGoogle(body);
  }

  @ApiOperation({ summary: 'Send email to reset password' })
  @Post('send-reset-email')
  async sendResetEmail(@Body() body: SendResetEmailDto) {
    return this.authService.sendResetEmail(body);
  }

  @ApiOperation({ summary: 'Verify code to reset password' })
  @Post('verify-reset-password')
  async verifyResetPassword(@Body() body: VerifyResetPasswordDto) {
    return this.authService.verifyResetPassword(body);
  }

  @ApiOperation({ summary: 'Update password' })
  @Post('update-password')
  async updatePassword(@Body() body: UpdatePasswordDto) {
    return this.authService.updatePassword(body);
  }

  @ApiOperation({ summary: 'Get new access token'})
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body);
  }

  @UseGuards(RoleGuard)
  @AllowAccess()
  @ApiOperation({ summary: 'Logout'})
  @Post('logout')
  async logout() {
    return this.authService.logout();
  }
}
