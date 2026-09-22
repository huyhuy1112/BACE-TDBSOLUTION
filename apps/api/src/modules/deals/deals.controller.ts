import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { PERMISSIONS } from '@bace/shared';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { DealsService } from './deals.service';
import { CreateDealDto, MoveDealDto } from './dto/deal.dto';

@Controller()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('pipelines')
  @RequirePermissions(PERMISSIONS.DEAL_READ)
  listPipelines() {
    return this.dealsService.listPipelines();
  }

  @Get('deals/board')
  @RequirePermissions(PERMISSIONS.DEAL_READ)
  board(@Query('pipelineId') pipelineId?: string) {
    return this.dealsService.board(pipelineId);
  }

  @Get('deals')
  @RequirePermissions(PERMISSIONS.DEAL_READ)
  list(@Query('pipelineId') pipelineId?: string) {
    return this.dealsService.listDeals(pipelineId);
  }

  @Post('deals')
  @RequirePermissions(PERMISSIONS.DEAL_WRITE)
  create(
    @Body() dto: CreateDealDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.dealsService.create(dto, req.user.userId);
  }

  @Patch('deals/:id/move')
  @RequirePermissions(PERMISSIONS.DEAL_WRITE)
  move(@Param('id') id: string, @Body() dto: MoveDealDto) {
    return this.dealsService.move(id, dto);
  }
}
