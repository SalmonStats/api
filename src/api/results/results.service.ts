import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import { transpose } from 'mathjs';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import {
  PaginatedDto,
  PaginatedRequestDtoForResult,
} from '../dto/pagination.dto';
import {
  EventType,
  PlayerResult,
  UploadResult,
  UploadResults,
  UploadResults as UploadResultsModel,
  WaterLevel,
} from '../dto/result.request.dto';
import { Result } from '../dto/result.response.dto';
import { Status, UploadStatus, UploadStatuses } from './results.status';

export enum OrderType {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortType {
  GOLDEN_IKURA_NUM = 'golden_ikura_num',
  IKURA_NUM = 'ikura_num',
  SALMON_ID = 'salmon_id',
  PLAY_TIME = 'play_time',
}

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async find(salmonId: number): Promise<Result> {
    const result: Result = plainToClass(
      Result,
      snakecaseKeys(
        await this.prisma.result.findUnique({
          where: {
            salmonId: salmonId,
          },
          include: {
            players: true,
            waves: true,
            jobResult: true,
            schedule: true,
          },
        })
      )
    );

    return result;
  }

  private where(
    request: PaginatedRequestDtoForResult
  ): Prisma.ResultWhereInput {
    if (request.nsaid === undefined) {
      return {
        ikuraNum: {
          gte: request.ikura_num,
        },
        goldenIkuraNum: {
          gte: request.golden_ikura_num,
        },
        startTime: request.start_time,
        jobResult: {
          isClear: request.is_clear,
        },
        noNightWaves: request.night_less,
      };
    } else {
      return {
        ikuraNum: {
          gte: request.ikura_num,
        },
        goldenIkuraNum: {
          gte: request.golden_ikura_num,
        },
        startTime: request.start_time,
        jobResult: {
          isClear: request.is_clear,
        },
        noNightWaves: request.night_less,
        members: {
          has: request.nsaid,
        },
      };
    }
  }

  private order(
    request: PaginatedRequestDtoForResult
  ): Prisma.ResultOrderByWithRelationInput {
    switch (request.sort) {
      case SortType.GOLDEN_IKURA_NUM:
        return {
          goldenIkuraNum: request.order,
        };
      case SortType.IKURA_NUM:
        return {
          ikuraNum: request.order,
        };
      case SortType.PLAY_TIME:
        return {
          playTime: request.order,
        };
      case SortType.SALMON_ID:
        return {
          salmonId: request.order,
        };
    }
  }

  // リザルト一括取得
  async findMany(
    request: PaginatedRequestDtoForResult
  ): Promise<PaginatedDto<Result>> {
    const response = new PaginatedDto<Result>();
    const results = await this.prisma.result.findMany({
      take: request.limit,
      skip: request.offset,
      where: this.where(request),
      include: {
        players: request.include_details,
        waves: request.include_details,
        jobResult: request.include_details,
        schedule: request.include_details,
      },
      orderBy: this.order(request),
    });
    response.total = await this.prisma.result.count({
      where: this.where(request),
    });
    response.limit = request.limit;
    response.offset = request.offset;
    response.results = results.map((result) =>
      plainToClass(Result, snakecaseKeys(result), {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
    );
    return response;
  }

  // 書き込みできるリザルトを返す
  private async creatable(result: UploadResult): Promise<boolean> {
    const salmonId = await this.getSalmonId(result);
    return salmonId === null;
  }

  // 書き込みできるリザルトを返す
  private async updatable(result: UploadResult): Promise<number> {
    const salmonId = await this.getSalmonId(result);
    return salmonId;
  }

  async upsert(request: UploadResultsModel): Promise<UploadStatuses> {
    const results: UploadStatus[] = await Promise.all(
      request.results.map(async (result) => {
        const salmonId = await this.getSalmonId(result);
        if (salmonId == null) {
          const salmonId = (
            await this.prisma.result.create({
              data: this.create(result),
            })
          ).salmonId;
          return new UploadStatus(salmonId, Status.Created);
        } else {
          await this.prisma.result.update({
            where: {
              salmonId: salmonId,
            },
            data: this.update(result, salmonId),
          });
          return new UploadStatus(salmonId, Status.Updated);
        }
      })
    );
    const response = new UploadStatuses();
    response.results = results;
    return response;
  }

  // 登録
  private create(result: UploadResult): Prisma.ResultCreateInput {
    const playerId: string = result.my_result.pid;
    const boss_counts: number[] = Object.values(result.boss_counts).map(
      (value) => value.count
    );
    const players: PlayerResult[] = result.other_results.concat([
      result.my_result,
    ]);
    const boss_kill_counts: number[] = transpose(
      players.map((player) =>
        Object.values(player.boss_kill_counts).map((value) => value.count)
      )
    ).map((value) => value.reduce((prev, next) => prev + next, 0));
    const members: string[] = players.map((player) => player.pid).sort();
    const goldenIkuraNum: number = result.wave_details
      .map((wave) => wave.golden_ikura_num)
      .reduce((prev, next) => prev + next, 0);
    const ikuraNum: number = result.wave_details
      .map((wave) => wave.ikura_num)
      .reduce((prev, next) => prev + next, 0);
    const failureWave: number = result.job_result.failure_wave;
    const failureReason: string = result.job_result.failure_reason;
    const nightLess: boolean = result.wave_details.every(
      (wave) => Object.values(EventType).indexOf(wave.event_type.key) == 0
    );

    return {
      bossCounts: boss_counts,
      bossKillCounts: boss_kill_counts,
      members: members,
      goldenIkuraNum: goldenIkuraNum,
      ikuraNum: ikuraNum,
      noNightWaves: nightLess,
      dangerRate: result.danger_rate,
      playTime: result.play_time,
      jobResult: {
        create: {
          failureReason: result.job_result.failure_reason,
          failureWave: result.job_result.failure_wave,
          isClear: result.job_result.is_clear,
        },
      },
      players: {
        createMany: {
          data: players.map((player) => {
            return {
              name: player.name,
              nsaid: player.pid,
              bossKillCounts: Object.values(player.boss_kill_counts).map(
                (value) => value.count
              ),
              deadCount: player.dead_count,
              helpCount: player.help_count,
              goldenIkuraNum: player.golden_ikura_num,
              ikuraNum: player.ikura_num,
              style: player.player_type.style,
              species: player.player_type.species,
              specialId: player.special.id,
              weaponList: player.weapon_list.map((weapon) => weapon.id),
              specialCounts: player.special_counts,
              jobId: playerId == player.pid ? result.job_id : null,
              jobScore: playerId == player.pid ? result.job_score : null,
              kumaPoint: playerId == player.pid ? result.kuma_point : null,
              gradeId: playerId == player.pid ? result.grade.id : null,
              gradePoint: playerId == player.pid ? result.grade_point : null,
              gradePointDelta:
                playerId == player.pid ? result.grade_point_delta : null,
            };
          }),
        },
      },
      waves: {
        createMany: {
          data: result.wave_details.map((wave, index) => {
            return {
              waveId: index,
              waterLevel: Object.values(WaterLevel).indexOf(
                wave.water_level.key
              ),
              eventType: Object.values(EventType).indexOf(wave.event_type.key),
              goldenIkuraNum: wave.golden_ikura_num,
              goldenIkuraPopNum: wave.golden_ikura_pop_num,
              ikuraNum: wave.ikura_num,
              quotaNum: wave.quota_num,
              failureReason: index + 1 == failureWave ? failureReason : null,
              isClear: !(failureWave == index + 1),
            };
          }),
        },
      },
      schedule: {
        connect: {
          startTime_endTime: {
            startTime: result.start_time,
            endTime: result.end_time,
          },
        },
      },
    };
  }

  // 更新
  private update(
    result: UploadResult,
    salmonId: number
  ): Prisma.ResultUpdateInput {
    return {
      players: {
        update: {
          where: {
            resultId_nsaid: {
              resultId: salmonId,
              nsaid: result.my_result.pid,
            },
          },
          data: {
            jobId: result.job_id,
            jobScore: result.job_score,
            kumaPoint: result.kuma_point,
            jobRate: result.job_rate,
            gradeId: result.grade.id,
            gradePoint: result.grade_point,
            gradePointDelta: result.grade_point_delta,
          },
        },
      },
    };
  }

  private members(result: UploadResult): string[] {
    return result.other_results
      .concat([result.my_result])
      .map((player) => player.pid)
      .sort();
  }

  // 同一リザルトがあるかチェックする
  // あればリザルトID、なければnullを返す
  private async getSalmonId(result: UploadResult): Promise<number> {
    return (
      (
        await this.prisma.result.findFirst({
          where: {
            playTime: {
              lte: dayjs(result.play_time).add(10, 'second').toDate(),
              gte: dayjs(result.play_time).subtract(10, 'second').toDate(),
            },
            members: {
              equals: this.members(result),
            },
          },
        })
      )?.salmonId ?? null
    );
  }
}
