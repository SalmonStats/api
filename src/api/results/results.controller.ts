import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginatedDto,
  PaginatedRequestDtoForResult,
} from '../dto/pagination.dto';
import { UploadResults as UploadedResultsModel } from '../dto/result.request.dto';
import { ResultsService } from './results.service';
import { UploadStatus, UploadStatuses } from './results.status';
import { Result } from '../dto/result.response.dto';

@Controller('results')
@ApiExtraModels(PaginatedDto)
export class ResultsController {
  constructor(private readonly service: ResultsService) {}

  @Get(':salmon_id')
  @ApiParam({ name: 'salmon_id', type: 'integer', description: 'リザルトID' })
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '取得' })
  @ApiNotFoundResponse()
  find() {
    return this.service.find();
  }

  @Get('')
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '一括取得' })
  @ApiNotFoundResponse()
  findMany(
    @Query(new ValidationPipe({ transform: true }))
    request: PaginatedRequestDtoForResult
  ): Promise<PaginatedDto<Result>> {
    return this.service.findMany(request);
  }

  @Post('')
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '登録' })
  @ApiNotFoundResponse()
  create(
    @Body(new ValidationPipe({ transform: true }))
    request: UploadedResultsModel
  ): Promise<UploadStatuses> {
    return this.service.upsert(request);
  }
}
