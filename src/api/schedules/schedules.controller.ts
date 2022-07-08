import {
  Controller,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  PaginatedDto,
  PaginatedRequestDtoForSchedule,
} from '../dto/pagination.dto';
import { Schedule } from '../dto/schedules.response.dto';
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
  findMany(
    @Query(new ValidationPipe({ transform: true }))
    request: PaginatedRequestDtoForSchedule
  ): Promise<PaginatedDto<Schedule>> {
    return this.service.findMany(request);
  }

  @Get(':start_time')
  @ApiTags('スケジュール')
  @ApiOperation({
    operationId: '統計取得',
    description: 'スケジュールのリザルト統計を取得します',
  })
  find(): Promise<number> {
    return this.service.find(0);
  }

  @Post('')
  @ApiTags('スケジュール')
  @ApiOperation({ operationId: '追加' })
  create() {
    this.service.create();
  }
}
