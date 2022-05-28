import { Prisma, Result as ResultModel } from '.prisma/client';
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
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiPaginatedResponse,
  PaginatedDto,
  PaginatedRequestDtoForResult,
} from '../dto/pagination.dto';
import { Results as UploadedResultsModel } from '../dto/result.request.dto';
import { ResultsService } from './results.service';
import { UploadResults } from './results.status';
import { Result as ResultDto } from '../dto/result.response.dto';

@Controller('results')
@ApiExtraModels(PaginatedDto)
export class ResultsController {
  constructor(private readonly service: ResultsService) {}

  /**
   * 指定されたリザルトID
   * @param salmon_id リザルトID
   * @return ResultDto
   */
  @Get(':salmon_id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiParam({ name: 'salmon_id', type: 'integer', description: 'リザルトID' })
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '取得' })
  @ApiOkResponse({ type: ResultDto })
  @ApiNotFoundResponse()
  find(@Param('salmon_id', ParseIntPipe) salmonId: number): Promise<ResultDto> {
    return this.service.find(salmonId);
  }

  /**
   * 指定されたリザルトID
   * @return ResultDto[]
   */
  @Get('')
  @ApiTags('リザルト')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ operationId: '一括取得' })
  @ApiPaginatedResponse(ResultDto)
  findMany(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginatedRequestDtoForResult
  ): Promise<PaginatedDto<ResultDto>> {
    const filter: Prisma.ResultWhereInput = (() => {
      if (query.nsaid === undefined) {
        return {
          goldenIkuraNum: {
            gte: query.golden_ikura_num,
          },
          ikuraNum: {
            gte: query.ikura_num,
          },
          noNightWaves: query.no_night_waves,
          jobResult: {
            isClear: query.is_clear,
          },
          startTime: query.start_time,
        };
      } else {
        return {
          goldenIkuraNum: {
            gte: query.golden_ikura_num,
          },
          ikuraNum: {
            gte: query.ikura_num,
          },
          noNightWaves: query.no_night_waves,
          jobResult: {
            isClear: query.is_clear,
          },
          startTime: query.start_time,
          members: {
            has: query.nsaid,
          },
        };
      }
    })();
    const request: Prisma.ResultFindManyArgs = {
      where: filter,
      orderBy: {
        salmonId: query.order ? 'asc' : 'desc',
      },
      include: {
        players: true,
        jobResult: true,
        waves: true,
        schedule: true,
      },
      skip: query.offset,
      take: query.limit,
    };
    return this.service.findMany(request);
  }

  /**
   * 指定されたリザルトID
   * @return UploadResults
   */
  @Post('')
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '登録' })
  @ApiOkResponse({ type: UploadResults })
  @ApiBadRequestResponse()
  create(
    @Body(new ValidationPipe({ transform: true }))
    request: UploadedResultsModel
  ): Promise<UploadResults> {
    return this.service.create(request);
  }

  @Put(':salmon_id')
  @ApiParam({ name: 'salmon_id', type: 'integer', description: 'リザルトID' })
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '更新' })
  @ApiNotFoundResponse()
  update() {}

  @Delete(':salmon_id')
  @ApiParam({ name: 'salmon_id', type: 'integer', description: 'リザルトID' })
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '削除' })
  @ApiNotFoundResponse()
  delete() {}
}
