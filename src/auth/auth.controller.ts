import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenLoginDto } from './dto/token-login.dto';

@Controller('auth') // مسیر این کنترلر /auth خواهد بود
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK) // در صورت موفقیت، کد 200 برگردان
  @Post('login') // مسیر نهایی: POST /auth/login
  loginWithToken(@Body() tokenLoginDto: TokenLoginDto) {
    return this.authService.loginWithToken(tokenLoginDto);
  }
  // Endpoint جدید برای تمدید نشست
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() tokenLoginDto: TokenLoginDto) { 
    // از همان DTO قبلی استفاده می‌کنیم چون ساختار بدنه یکی است
    return this.authService.refreshToken(tokenLoginDto.token);
  }

}
