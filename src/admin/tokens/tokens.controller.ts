import { Controller, Post, Body, UseGuards, Patch, Param, Get } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { RenewTokenDto } from './dto/renew-token.dto';

@Controller('admin/tokens')
@UseGuards(ApiKeyGuard) // it must protect by that guard key
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.create(createTokenDto);
  }

  @Patch(':token/deactivate') // مسیر: PATCH /admin/tokens/some-long-token-string/deactivate
  deactivate(@Param('token') token: string) {
    return this.tokensService.deactivate(token);
  }


  @Patch(':token/activate') // مسیر: PATCH /admin/tokens/some-long-token-string/activate
  activate(@Param('token') token: string) {
    return this.tokensService.activate(token);
  }

   @Patch(':token/renew') // مسیر: PATCH /admin/tokens/some-long-token-string/renew
  renew(
    @Param('token') token: string,
    @Body() renewTokenDto: RenewTokenDto,
  ) {
    return this.tokensService.renew(token, renewTokenDto);
  }

  @Get(':token') // مسیر -> GET /admin/tokens/some-long-token
  findOne(@Param('token') token: string) {
    return this.tokensService.findOne(token);
  }


}
