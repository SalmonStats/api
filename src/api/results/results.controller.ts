import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
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
import { Status, UploadStatus, UploadStatuses } from './results.status';
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
  @ApiOkResponse()
  find(@Param('salmon_id', ParseIntPipe) salmon_id: number): Promise<Result> {
    return this.service.find(salmon_id);
  }

  @Get('')
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '一括取得' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  findMany(
    @Query(new ValidationPipe({ transform: true }))
    request: PaginatedRequestDtoForResult
  ): Promise<PaginatedDto<Result>> {
    return this.service.findMany(request);
  }

  @Post('')
  @HttpCode(200)
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '登録' })
  @ApiCreatedResponse({
    type: UploadStatuses,
  })
  @ApiBadRequestResponse()
  create(
    @Body(new ValidationPipe({ transform: true }))
    request: UploadedResultsModel
  ): Promise<UploadStatuses> {
    return this.service.upsert(request);
  }
}
