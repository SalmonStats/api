import { Player, User as UserModel } from '.prisma/client';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
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
import { PaginatedRequestDtoForUser } from '../dto/pagination.dto';
import { UsersRequestDto } from '../dto/users.request.dto';
import { UsersService, UserStats } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('')
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: '一覧検索' })
  @ApiOkResponse()
  @ApiQuery({ name: 'nickname', type: String, example: 'みなかみはちみ' })
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
  @ApiParam({ name: 'nsaid', example: '91d160aa84e88da6' })
  find(@Param('nsaid') nsaid: string): Promise<UserStats> {
    return this.service.find(nsaid);
  }

  @Post(':nsaid')
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: '登録' })
  @ApiOkResponse({})
  @ApiNotFoundResponse()
  create(
    @Body(new ValidationPipe({ transform: true }))
    request: UsersRequestDto
  ) {
    this.service.create(request);
  }
}
