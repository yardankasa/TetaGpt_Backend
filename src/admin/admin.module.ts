import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [AccountsModule, TokensModule]
})
export class AdminModule {}
