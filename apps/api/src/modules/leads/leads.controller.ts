import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { PERMISSIONS } from '@bace/shared';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.LEAD_READ)
  list(
    @Query('status') status?: LeadStatus,
    @Query('q') q?: string,
  ) {
    return this.leadsService.list(status, q);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.LEAD_READ)
  get(@Param('id') id: string) {
    return this.leadsService.get(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.LEAD_WRITE)
  create(
    @Body() dto: CreateLeadDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.leadsService.create(dto, req.user.userId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.LEAD_WRITE)
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }
}
