import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Get('')
  @ApiTags('スケジュール')
  @ApiOperation({
    operationId: '取得',
    description: 'スケジュールを取得します',
  })
  findMany() {}

  @Post('')
  @ApiTags('スケジュール')
  @ApiOperation({ operationId: '追加' })
  create() {
    this.service.create();
  }
}
