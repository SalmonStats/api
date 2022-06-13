import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Schedule } from '@prisma/client';
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
  findMany(): Promise<any[]> { 
    return this.service.findMany();
  }

  @Post('')
  @ApiTags('スケジュール')
  @ApiOperation({ operationId: '追加' })
  create() {
    this.service.create();
  }
}
