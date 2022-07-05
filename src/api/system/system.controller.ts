import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly service: SystemService) {}

  @Get()
  @ApiTags('システム')
  @ApiOperation({ operationId: 'サーバー情報' })
  find() {
    return this.service.getSystemInfo();
  }
}
