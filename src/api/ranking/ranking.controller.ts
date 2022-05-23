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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RankingService } from './ranking.service';

@Controller('rank')
export class RankingController {
  constructor(private readonly service: RankingService) {}

  @Get('')
  @ApiTags('ランキング')
  @ApiOperation({ operationId: '取得' })
  @ApiNotFoundResponse()
  findAll(
    @Query('nsaid') nsaid: string,
    @Query('start_time', ParseIntPipe) start_time: number
  ) {
    return this.service.rank(start_time, nsaid);
  }
}
