import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { PERMISSIONS } from '@bace/shared';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ACTIVITY_READ)
  list(@Query('type') type?: ActivityType) {
    return this.activitiesService.list(type);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ACTIVITY_WRITE)
  create(
    @Body() dto: CreateActivityDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.activitiesService.create(dto, req.user.userId);
  }

  @Patch(':id/complete')
  @RequirePermissions(PERMISSIONS.ACTIVITY_WRITE)
  complete(@Param('id') id: string) {
    return this.activitiesService.complete(id);
  }
}
