import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRank } from '../dto/rank.response.dto';
import { RankingService } from './ranking.service';

@Controller('rank')
export class RankingController {
  constructor(private readonly service: RankingService) {}

  @Get('')
  @ApiTags('ランキング')
  @ApiOperation({ operationId: '取得' })
  @ApiQuery({ name: 'nsaid', required: true, type: String })
  @ApiQuery({ name: 'start_time', required: true, type: Number })
  @ApiNotFoundResponse()
  findAll(
    @Query('nsaid') nsaid: string,
    @Query('start_time', ParseIntPipe) start_time: number
  ): Promise<UserRank> {
    return this.service.rank(start_time, nsaid);
  }
}
