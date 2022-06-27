import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WavesService } from './waves.service';

@Controller('waves')
export class WavesController {
  constructor(private readonly service: WavesService) {}

  @Get(':start_time')
  @ApiTags('納品記録')
  @ApiOperation({ operationId: 'WAVE記録取得' })
  @ApiParam({
    name: 'start_time',
    type: 'integer',
    example: 1655575200,
    required: true,
  })
  @ApiQuery({
    name: 'water_level',
    type: 'integer',
    example: 1,
    required: true,
  })
  @ApiQuery({
    name: 'event_type',
    type: 'integer',
    example: 0,
    required: true,
  })
  find(
    @Param('start_time', ParseIntPipe) start_time: number,
    @Query('event_type', ParseIntPipe) event_type: number,
    @Query('water_level', ParseIntPipe) water_level: number,
  ) {
    return this.service.find(start_time, event_type, water_level);
  }
}
