import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    // --- بخش اصلاح شده اینجاست ---
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in environment variables. Please check your .env file.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // حالا ما مطمئنیم که jwtSecret یک string است
    });
  }

  async validate(payload: { sub: string; accountId: string }) {
    const authToken = await this.prisma.authToken.findUnique({
      where: { id: payload.sub },
    });

    if (!authToken || !authToken.isActive) {
      throw new UnauthorizedException('Token is no longer valid.');
    }
    
    return { authTokenId: payload.sub, openAiAccountId: payload.accountId };
  }
}
