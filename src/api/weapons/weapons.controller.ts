import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SuppliedWeapon, WeaponsService } from './weapons.service';

@Controller('weapons')
export class WeaponsController {
  constructor(private readonly service: WeaponsService) {}

  @Get(':start_time')
  @ApiTags('シフト記録')
  @ApiOperation({ operationId: '支給ブキ数記録取得' })
  @ApiParam({
    name: 'start_time',
    type: 'integer',
    example: 1656201600,
    required: true,
  })
  find(
    @Param('start_time', ParseIntPipe) start_time: number
  ): Promise<SuppliedWeapon[]> {
    return this.service.find(start_time);
  }
}