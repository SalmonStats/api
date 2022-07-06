import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VersionsService } from './versions.service';

@Controller('versions')
export class VersionsController {
  constructor(private readonly service: VersionsService) {}

  @Get()
  @ApiTags('バージョン')
  @ApiOperation({ operationId: 'バージョン取得' })
  version() {
    return {
      version: process.env.API_VER,
      author: '@tkgling',
    };
  }
}
