import { Prisma, Result as ResultModel } from '.prisma/client';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
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
  PaginatedRequestDto,
  PaginatedRequestDtoForResult,
} from '../dto/pagination.dto';
import { Results as UploadedResultsModel } from '../dto/result.request.dto';
import { ResultsService } from './results.service';
import { UploadResult, UploadResults } from './results.status';
import { Result as ResultDto } from '../dto/result.response.dto';
import dayjs from 'dayjs';

@Controller('results')
@ApiExtraModels(PaginatedDto)
export class ResultsController {
  constructor(private readonly service: ResultsService) {}

  @Get(':salmon_id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiParam({ name: 'salmon_id', type: 'integer', description: 'リザルトID' })
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '取得' })
  @ApiNotFoundResponse()
  find(@Param('salmon_id', ParseIntPipe) salmonId: number): Promise<ResultDto> {
    return this.service.find(salmonId);
  }

  @Get('')
  @ApiTags('リザルト')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ operationId: '一括取得' })
  @ApiPaginatedResponse(ResultDto)
  findMany(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginatedRequestDtoForResult
  ): Promise<PaginatedDto<ResultDto>> {
    const request: Prisma.ResultFindManyArgs = {
      where: {
        goldenIkuraNum: {
          gte: query.golden_ikura_num,
        },
        ikuraNum: {
          gte: query.ikura_num,
        },
        noNightWaves: {
          equals: query.no_night_waves,
        },
        jobResult: {
          isClear: {
            equals: query.is_clear,
          },
        },
      },
      include: {
        players: true,
        waves: true,
        jobResult: true,
        schedule: true,
      },
      skip: query.offset,
      take: query.limit,
    };
    return this.service.findMany(request);
  }

  @Get('schedules/:start_time')
  @ApiTags('リザルト一覧')
  @ApiOperation({ operationId: 'スケジュール指定' })
  @ApiNotFoundResponse()
  async findManyByScheduleId(
    @Param('start_time', ParseIntPipe) start_time: number,
    @Query(new ValidationPipe({ transform: true }))
    query: PaginatedRequestDtoForResult
  ): Promise<PaginatedDto<ResultDto>> {
    const request: Prisma.ResultFindManyArgs = {
      where: {
        goldenIkuraNum: {
          gte: query.golden_ikura_num,
        },
        ikuraNum: {
          gte: query.ikura_num,
        },
        noNightWaves: {
          equals: query.no_night_waves,
        },
        jobResult: {
          isClear: {
            equals: query.is_clear,
          },
        },
        schedule: {
          startTime: {
            equals: dayjs.unix(start_time).toDate(),
          },
        },
      },
      include: {
        players: true,
        waves: true,
        jobResult: true,
        schedule: true,
      },
      skip: query.offset,
      take: query.limit,
    };
    return this.service.findMany(request);
  }

  @Get('users/:nsaid')
  @ApiTags('リザルト一覧')
  @ApiOperation({ operationId: 'プレイヤー指定' })
  @ApiNotFoundResponse()
  findManyByUser(
    @Param('nsaid') nsaid: string,
    @Query(new ValidationPipe({ transform: true }))
    query: PaginatedRequestDtoForResult
  ): Promise<PaginatedDto<ResultDto>> {
    const request: Prisma.ResultFindManyArgs = {
      where: {
        goldenIkuraNum: {
          gte: query.golden_ikura_num,
        },
        ikuraNum: {
          gte: query.ikura_num,
        },
        noNightWaves: {
          equals: query.no_night_waves,
        },
        members: {
          has: nsaid,
        },
        jobResult: {
          isClear: {
            equals: query.is_clear,
          },
        },
      },
      include: {
        players: true,
        waves: true,
        jobResult: true,
        schedule: true,
      },
      skip: query.offset,
      take: query.limit,
    };
    return this.service.findMany(request);
  }

  @Post('')
  @ApiTags('リザルト')
  @ApiOperation({ operationId: '登録' })
  @ApiOkResponse()
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
