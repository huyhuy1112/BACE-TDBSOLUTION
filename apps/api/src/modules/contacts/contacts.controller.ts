import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { PERMISSIONS } from '@bace/shared';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CONTACT_READ)
  list() {
    return this.contactsService.list();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CONTACT_READ)
  get(@Param('id') id: string) {
    return this.contactsService.get(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CONTACT_WRITE)
  create(
    @Body() dto: CreateContactDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.contactsService.create(dto, req.user.userId);
  }
}
