import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { randomBytes } from 'crypto'; // for generate random tokens

@Injectable()
export class TokensService {
  constructor(private prisma: PrismaService) {}

  async create(createTokenDto: CreateTokenDto) {
    const { openAiAccountId, durationInDays } = createTokenDto;

    // 1. we are test the openai account exists or not
    const account = await this.prisma.openAiAccount.findUnique({
      where: { id: openAiAccountId },
    });

    if (!account) {
      throw new NotFoundException(`OpenAI Account with ID ${openAiAccountId} not found.`);
    }

    // 2. generate a safe token
    const token = randomBytes(32).toString('hex');

    // 3. calculate expire date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationInDays);

    // 4. save new token at the db
    return this.prisma.authToken.create({
      data: {
        token,
        expiresAt,
        openAiAccountId,
      },
    });
  }
}
