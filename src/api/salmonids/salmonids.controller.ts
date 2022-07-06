import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SalmonidsService, SalmonidTotal } from './salmonids.service';

@Controller('salmonids')
export class SalmonidsController {
  constructor(private readonly service: SalmonidsService) {}

  @Get(':start_time')
  @ApiTags('シフト記録')
  @ApiOperation({ operationId: 'オオモノ数記録取得' })
  @ApiParam({
    name: 'start_time',
    type: 'integer',
    example: 1656201600,
    required: true,
  })
  find(
    @Param('start_time', ParseIntPipe) start_time: number
  ): Promise<SalmonidTotal> {
    return this.service.find(start_time);
  }
}
