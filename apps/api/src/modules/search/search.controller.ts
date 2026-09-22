import { Controller, Get, Query } from '@nestjs/common';
import { PERMISSIONS } from '@bace/shared';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @RequirePermissions(
    PERMISSIONS.ACCOUNT_READ,
    PERMISSIONS.CONTACT_READ,
    PERMISSIONS.LEAD_READ,
    PERMISSIONS.DEAL_READ,
  )
  search(@Query('q') q = '') {
    return this.searchService.search(q);
  }
}
