import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import snakecaseKeys from 'snakecase-keys';
import { UserCreateInputDto } from '../dto/users.response';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get(':uid')
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: 'ユーザー取得' })
  @ApiOkResponse({ type: UserCreateInputDto })
  @ApiBadRequestResponse()
  @ApiParam({
    name: 'uid',
    type: 'string',
    required: true,
    example: 'u0ucwsTlP6b2EJNAOZWLKSMbybd2',
  })
  find(@Param() uid: string) {}

  @Post()
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: 'ユーザー追加' })
  @ApiCreatedResponse({ type: UserCreateInputDto })
  @ApiBadRequestResponse()
  async create(
    @Body() request: UserCreateInputDto
  ): Promise<UserCreateInputDto> {
    const result = await this.service.create(request);
    return plainToClass(UserCreateInputDto, snakecaseKeys(result));
  }

  @Put(':uid')
  @ApiTags('ユーザー')
  @ApiOperation({ operationId: 'ユーザー更新' })
  @ApiCreatedResponse({ type: UserCreateInputDto })
  @ApiBadRequestResponse()
  @ApiParam({
    name: 'uid',
    type: 'string',
    required: true,
    example: 'u0ucwsTlP6b2EJNAOZWLKSMbybd2',
  })
  async update(request: UserCreateInputDto): Promise<UserCreateInputDto> {
    const result = await this.service.update(request);
    return plainToClass(UserCreateInputDto, snakecaseKeys(result));
  }
}
