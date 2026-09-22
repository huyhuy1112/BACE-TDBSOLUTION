import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { PERMISSIONS } from '@bace/shared';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ACCOUNT_READ)
  list() {
    return this.accountsService.list();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ACCOUNT_READ)
  get(@Param('id') id: string) {
    return this.accountsService.get(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ACCOUNT_WRITE)
  create(
    @Body() dto: CreateAccountDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.accountsService.create(dto, req.user.userId);
  }
}
