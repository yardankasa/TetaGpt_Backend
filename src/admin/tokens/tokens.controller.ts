import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('admin/tokens')
@UseGuards(ApiKeyGuard) // it must protect by that guard key
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }
}
