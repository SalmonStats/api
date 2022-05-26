import { Prisma } from '.prisma/client';
import {
  Controller,
  Get,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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

  @Get('')
  @ApiTags('統計')
  @ApiOperation({ operationId: '統計取得' })
  @ApiQuery({ name: 'nsaid', description: 'プレイヤーID' })
  @ApiQuery({ name: 'start_time', description: 'スケジュールID' })
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
    @Query('start_time', ParseIntPipe) start_time: number,
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
    return response;
  }
}
