import { User as UserModel } from '.prisma/client';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParseOptionalUnsignedIntPipe } from '../validation/parse-optional-unsigned-int.pipe';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('')
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: '一覧取得' })
  @ApiOkResponse()
  findMany(
    @Query('offset', ParseOptionalUnsignedIntPipe)
    skip: number,
    @Query('limit', ParseOptionalUnsignedIntPipe)
    take?: number
  ): Promise<UserModel[]> {
    return this.service.findMany(skip, take);
  }

  @Get(':user_id')
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: '取得' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  find(@Param('nsaid') id: number): Promise<UserModel> {
    return this.service.find(id);
  }
}
