import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { runInThisContext } from 'vm';
import { StatsResult } from '../dto/stats.response.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Get(':start_time/stats')
  @ApiTags('スケジュール')
  @ApiOperation({ operationId: '取得' })
  @ApiOkResponse({
    type: StatsResult,
  })
  @ApiNotFoundResponse()
  async findStat(@Param('start_time', ParseIntPipe) start_time: number) {
    const request: Prisma.ScheduleFindUniqueArgs = {
      where: {
        startTime: dayjs.unix(start_time).toDate(),
      },
    };
    const results = await this.service.findManyResults(request);
    console.log(results.length);
    return results;
  }

  @Get('')
  @ApiTags('スケジュール')
  @ApiOperation({
    operationId: '取得',
    description: 'スケジュールを取得します',
  })
  findMany() {}

  @Post('')
  @ApiTags('スケジュール')
  @ApiOperation({ operationId: '追加' })
  create() {
    this.service.create();
  }
}
