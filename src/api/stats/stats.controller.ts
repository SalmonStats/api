import { Prisma } from '.prisma/client';
import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import dayjs from 'dayjs';
import { StatsResultsDto as StatsResultsModel } from '../dto/stats.response.dto';
import { ParseOptionalBoolPipe } from '../validation/parse-optional-boolean.pipe';
import { ShiftStats, StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get(':start_time')
  @ApiTags('統計')
  @ApiOperation({ operationId: '統計取得' })
  @ApiParam({
    name: 'start_time',
    description: 'スケジュールID',
    example: 1655575200,
  })
  @ApiNotFoundResponse()
  find(
    @Param('start_time', ParseIntPipe) start_time: number,
  ): Promise<ShiftStats> {
    return this.service.getStats(start_time)
  }
}
