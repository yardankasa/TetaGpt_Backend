import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { TokensModule } from './tokens/tokens.module';
import { DashboardModule } from './dashboard/dashboard.module'; // 1. Import کنید

@Module({
  imports: [AccountsModule, TokensModule, DashboardModule] // 2. اینجا اضافه کنید
})
export class AdminModule {}
