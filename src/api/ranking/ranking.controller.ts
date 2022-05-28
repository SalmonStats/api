import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Rank, RankResult } from '../dto/rank.response.dto';
import { RankingService } from './ranking.service';

@Controller('ranks')
export class RankingController {
  constructor(private readonly service: RankingService) {}

  @Get('')
  @ApiTags('ランキング')
  @ApiOperation({ operationId: 'ユーザランク取得' })
  @ApiQuery({ name: 'nsaid', description: 'プレイヤーID' })
  @ApiQuery({ name: 'start_time', description: 'スケジュールID' })
  @ApiOkResponse({ type: Rank })
  @ApiNotFoundResponse()
  findAll(
    @Query('nsaid') nsaid: string,
    @Query('start_time', ParseIntPipe) start_time: number
  ): Promise<Rank> {
    return this.service.rank(start_time, nsaid);
  }

  @Get(':start_time')
  @ApiTags('ランキング')
  @ApiOperation({ operationId: '概要取得' })
  @ApiQuery({ name: 'start_time', description: 'スケジュールID' })
  @ApiOkResponse({ type: Rank })
  @ApiNotFoundResponse()
  find(@Param('start_time', ParseIntPipe) start_time: number): Promise<Rank> {
    // return;
    return this.service.global(start_time);
  }
}
