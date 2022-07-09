import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServerStatusResponseDto } from '../dto/server.response.dto';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly service: SystemService) {}

  @Get()
  @ApiTags('システム')
  @ApiOperation({ operationId: 'サーバー情報' })
  @ApiOkResponse({ type: ServerStatusResponseDto })
  find() {
    return this.service.getSystemInfo();
  }
}
