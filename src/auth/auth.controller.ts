import { Controller, Post, Body, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenLoginDto } from './dto/token-login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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


  @Post('logout')
  @UseGuards(JwtAuthGuard) // مطمئن می‌شویم که کاربر برای لاگ‌اوت، لاگین بوده است
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    // در آینده می‌توانیم توکن را در یک blacklist در Redis یا دیتابیس قرار دهیم.
    // فعلاً، فقط یک پیام موفقیت‌آمیز برمی‌گردانیم.
    // مسئولیت اصلی پاک کردن توکن با کلاینت است.
    console.log(`User with token ID ${req.user.authTokenId} has logged out.`);
    return { message: 'Logged out successfully.' };
  }

}
