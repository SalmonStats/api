import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WavesService } from './waves.service';

@Controller('waves')
export class WavesController {
  constructor(private readonly service: WavesService) { }

  @Get(":start_time")
  @ApiTags('WAVE記録')
  @ApiOperation({ operationId: 'WAVE記録取得' })
  @ApiParam({ name: 'start_time', type: "integer", example: 1655575200, required: true })
  find(
    @Param('start_time', ParseIntPipe) start_time: number,
  ) {
    return this.service.findWaves(start_time);
  }
}
