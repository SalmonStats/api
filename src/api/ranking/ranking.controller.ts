import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Rank as RankResponse } from '../dto/rank.response.dto';
import { RankingService } from './ranking.service';

@Controller('ranks')
export class RankingController {
  constructor(private readonly service: RankingService) {}

  @Get('')
  @ApiTags('ランキング')
  @ApiOperation({ operationId: 'ユーザランク取得' })
  @ApiQuery({ name: 'nsaid', required: true, type: String })
  @ApiQuery({ name: 'start_time', required: true, type: Number })
  @ApiOkResponse({ type: RankResponse })
  @ApiNotFoundResponse()
  findAll(
    @Query('nsaid') nsaid: string,
    @Query('start_time', ParseIntPipe) start_time: number
  ): Promise<RankResponse> {
    return this.service.rank(start_time, nsaid);
  }

  @Get(':start_time')
  @ApiTags('ランキング')
  @ApiOperation({ operationId: '概要取得' })
  @ApiParam({ name: 'start_time', required: true, type: Number })
  @ApiOkResponse({ type: RankResponse })
  @ApiNotFoundResponse()
  find(
    @Param('start_time', ParseIntPipe) start_time: number
  ): Promise<RankResponse> {
    return this.service.global(start_time);
  }
}
