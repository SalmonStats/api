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
import { StatsService, StatsType } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get(':start_time')
  @ApiTags('統計')
  @ApiOperation({ operationId: '統計取得' })
  @ApiQuery({
    name: 'nsaid',
    description: 'プレイヤーID',
    example: '91d160aa84e88da6',
  })
  @ApiParam({
    name: 'start_time',
    description: 'スケジュールID',
    example: 1655575200,
  })
  @ApiQuery({
    name: 'is_clear',
    description: 'クリアしたかどうか',
    required: false,
  })
  @ApiOkResponse({
    type: StatsResultsModel,
  })
  @ApiNotFoundResponse()
  async getStats(
    @Query('nsaid') nsaid: string,
    @Param('start_time', ParseIntPipe) start_time: number,
    @Query('is_clear', ParseOptionalBoolPipe) is_clear: boolean
  ) {
    const response = new StatsResultsModel();
    response.single = {
      global: await this.service.single(start_time, is_clear, null),
      team: await this.service.single(
        start_time,
        is_clear,
        nsaid,
        StatsType.TEAM
      ),
      player: await this.service.single(
        start_time,
        is_clear,
        nsaid,
        StatsType.SOLO
      ),
      crew: await this.service.single(
        start_time,
        is_clear,
        nsaid,
        StatsType.CREW
      ),
    };
    response.total = {
      global: await this.service.total(start_time, is_clear, null),
      player: await this.service.total(start_time, is_clear, nsaid),
    };
    response.waves = {
      global: await this.service.wave(start_time, is_clear, null),
      player: await this.service.wave(start_time, is_clear, nsaid),
    };

    response.stats = await this.service.stats(start_time)
    return response;
  }
}
