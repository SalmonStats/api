import { Controller, Get, ParseBoolPipe, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WavesService } from './waves.service';

@Controller('waves')
export class WavesController {
  constructor(private readonly service: WavesService) { }

  @Get()
  @ApiTags('WAVE記録')
  @ApiOperation({ operationId: 'WAVE記録取得' })
  @ApiQuery({ name: 'start_time', type: "integer", example: 1655575200, required: true })
  @ApiQuery({ name: 'golden_ikura_num', type: "integer", example: 140})
  find(
    @Query('start_time', ParseIntPipe) start_time: number,
    @Query('golden_ikura_num', ParseIntPipe) goldenIkuraNum: number,
  ) {
    return this.service.findWaves(start_time, goldenIkuraNum);
  }
}
