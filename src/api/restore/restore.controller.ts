import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import dayjs from 'dayjs';
import { RestoreResult, RestoreResults } from '../dto/restore.request.dto';
import { UploadResults } from '../dto/result.request.dto';
import { UploadStatus } from '../results/results.status';
import { RestoreService } from './restore.service';

@Controller('restore')
export class RestoreController {
  constructor(private readonly service: RestoreService) {}

  @Post('')
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '復元' })
  @ApiNotFoundResponse()
  create(
    @Body(new ValidationPipe({ transform: true }))
    request: RestoreResults
  ): Promise<UploadStatus[]> {
    const results: RestoreResult[] = request.results.sort(
      (a, b) => dayjs(a.play_time).unix() - dayjs(b.play_time).unix()
    );
    return this.service.restore(results);
  }
}
