import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Player } from '@prisma/client';
import { PaginatedRequestDtoForUser } from '../dto/pagination.dto';
import { UserStats } from '../dto/results/stage.result.dto';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly service: PlayersService) {}

  @Get('')
  @ApiTags('プレイヤー')
  @ApiOperation({ operationId: '一覧検索' })
  @ApiOkResponse()
  @ApiQuery({
    name: 'nickname',
    type: String,
    example: 'みなかみはちみ',
    description: 'ニックネーム',
  })
  findMany(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginatedRequestDtoForUser
  ): Promise<Partial<Player>[]> {
    return this.service.findMany(query);
  }

  @Get(':nsaid')
  @ApiTags('プレイヤー')
  @ApiOperation({ operationId: '検索' })
  @ApiOkResponse({ type: UserStats })
  @ApiNotFoundResponse()
  @ApiParam({
    name: 'nsaid',
    example: '91d160aa84e88da6',
    description: 'ユーザーID',
  })
  find(@Param('nsaid') nsaid: string): Promise<UserStats> {
    return this.service.find(nsaid);
  }
}
