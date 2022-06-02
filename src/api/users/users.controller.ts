import { Player, User as UserModel } from '.prisma/client';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { UserData, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('')
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: '一覧取得' })
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
  @ApiOperation({ operationId: '取得' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiParam({ name: 'nsaid', example: '91d160aa84e88da6' })
  find(@Param('nsaid') nsaid: string): Promise<UserData> {
    return this.service.find(nsaid);
  }
}
