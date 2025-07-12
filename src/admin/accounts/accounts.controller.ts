import { Controller, Post, Body, UseGuards, Patch, Param, ParseUUIDPipe, Get, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';


@Controller('admin/accounts')
@UseGuards(ApiKeyGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Patch(':id') 
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, updateAccountDto);
  }

 @Get() // مسیر -> GET /admin/accounts
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id') // مسیر -> GET /admin/accounts/some-uuid
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.findOne(id);
  }

  @Delete(':id') // مسیر -> DELETE /admin/accounts/some-uuid
  @HttpCode(HttpStatus.OK) // برای پاسخ موفق، کد 200 برگردان
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.remove(id);
  }
}
