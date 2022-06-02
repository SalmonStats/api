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

@ApiTags('ランキング')
@Controller('ranks')
export class RankingController {
  constructor(private readonly service: RankingService) {}

  @Get(':start_time')
  @ApiOperation({
    operationId: '各種ランキング取得',
    description: 'シフトごとのいろんな記録を取得',
  })
  findShiftRank(@Param('start_time', ParseIntPipe) start_time: number) {
    return this.service.shiftRank(start_time);
  }

  @Get(':start_time/users')
  @ApiOperation({
    operationId: 'ユーザランキング取得',
    description: 'シフトでの自チームのイクラ獲得ランキング',
  })
  @ApiQuery({
    name: 'nsaid',
    description: 'プレイヤーID',
    example: '91d160aa84e88da6',
  })
  @ApiParam({
    name: 'start_time',
    description: 'スケジュールID',
    example: 1654020000,
  })
  @ApiOkResponse({ type: Rank })
  @ApiNotFoundResponse()
  findAll(
    @Query('nsaid') nsaid: string,
    @Param('start_time', ParseIntPipe) start_time: number
  ): Promise<Rank> {
    return this.service.rank(start_time, nsaid);
  }

  @Get(':start_time/teams')
  @ApiOperation({
    operationId: 'チームランキング取得',
    description: 'シフトでのチームごとのイクラ獲得ランキング(WAVE記録は非対応)',
  })
  @ApiParam({
    name: 'start_time',
    description: 'スケジュールID',
    example: 1654020000,
  })
  @ApiOkResponse({ type: Rank })
  @ApiNotFoundResponse()
  find(@Param('start_time', ParseIntPipe) start_time: number): Promise<Rank> {
    // return;
    return this.service.global(start_time);
  }
}
