import { Controller, Get } from '@nestjs/common';
import { PERMISSIONS } from '@bace/shared';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  summary() {
    return this.dashboardService.summary();
  }
}
