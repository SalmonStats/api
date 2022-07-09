import { Player } from '.prisma/client';
import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedRequestDtoForUser } from '../dto/pagination.dto';
import { UserStats } from '../dto/results/stage.result.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('')
  @ApiTags('ユーザー')
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
  @ApiTags('ユーザー')
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
