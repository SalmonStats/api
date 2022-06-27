import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Total } from '../waves/waves.service';
import { TotalsService } from './totals.service';

@Controller('totals')
export class TotalsController {
  constructor(private readonly service: TotalsService) {}

  @Get(':start_time')
  @ApiTags('納品記録')
  @ApiOperation({ operationId: '総合記録取得' })
  @ApiParam({
    name: 'start_time',
    type: 'integer',
    example: 1655575200,
    required: true,
  })
  @ApiQuery({
    name: 'nightless',
    type: 'boolean',
    example: false,
    required: true,
  })
  find(
    @Param('start_time', ParseIntPipe) start_time: number,
    @Query('nightless', ParseBoolPipe) nightless: boolean
  ): Promise<Total[]> {
    return this.service.find(start_time, nightless, 100, 140);
  }
}
