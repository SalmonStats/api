import { User as UserModel } from '.prisma/client';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { query } from 'express';
import { PaginatedRequestDto } from '../dto/pagination.dto';
import { ParseOptionalUnsignedIntPipe } from '../validation/parse-optional-unsigned-int.pipe';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('')
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: '一覧取得' })
  @ApiOkResponse()
  findMany(@Query() query: PaginatedRequestDto): Promise<UserModel[]> {
    return this.service.findMany(query);
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
