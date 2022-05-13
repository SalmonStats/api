import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Result as ResultModel } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PaginatedRequestDtoForResult } from 'src/dto/pagination.dto';
import {
  BossCounts,
  EventType,
  PlayerResult,
  Result as UploadedResultModel,
  Results as UploadedResultsModel,
  WaterLevel,
} from '../dto/result.request.dto';
import dayjs from 'dayjs';
const { transpose } = require('matrix-transpose');

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async find(salmonId: number): Promise<ResultModel> {
    return this.prisma.result
      .findUnique({
        where: {
          salmonId: salmonId,
        },
        rejectOnNotFound: true,
      })
      .catch((error) => {
        throw new NotFoundException();
      });
  }

  async findMany(query: PaginatedRequestDtoForResult): Promise<ResultModel[]> {
    return this.prisma.result.findMany({
      take: Number(query.limit),
      skip: Number(query.offset),
    });
  }

  countingArrayValue(value: BossCounts) {
    return Object.values(value).map((x) => {
      return x.count;
    });
  }

  // 同じリザルトを別の人がアップロードしたときにプレイヤーデータを更新する
  // 基本的には同じはずだが、回線落ちしたときなどの対策
  async updatePlayerResult() {}

  // 同じリザルトを別の人がアップロードしたときにバイトデータをアップデートする
  // 基本的には同じはずだが、回線落ちしたときなどの対策
  async updateWaveResult() {}

  // 重複しているリザルトIDを返す
  // 新規リザルトであればnullを返す
  async getResultSalmonId(result: UploadedResultModel): Promise<number> {
    const members: string[] = result.other_results
      .concat([result.my_result])
      .map((player) => player.pid)
      .sort();
    try {
      return (
        await this.prisma.result.findFirst({
          where: {
            playTime: {
              lte: dayjs(result.play_time).add(10, 'second').toDate(),
              gte: dayjs(result.play_time).subtract(10, 'second').toDate(),
            },
            members: {
              equals: members,
            },
          },
        })
      ).salmonId;
    } catch (error) {
      return null;
    }
  }

  async createResult(result: UploadedResultModel): Promise<number> {
    const boss_counts: number[] = Object.values(result.boss_counts).map(
      (value) => value.count,
    );
    const players: PlayerResult[] = result.other_results.concat([
      result.my_result,
    ]);
    const boss_kill_counts = transpose(
      players.map((player) =>
        Object.values(player.boss_kill_counts).map((value) => value.count),
      ),
    ).map((value) => value.reduce((prev, next) => prev + next, 0));
    const members = players.map((player) => player.pid).sort();
    await this.prisma.result.create({
      data: {
        bossCounts: boss_counts,
        bossKillCounts: boss_kill_counts,
        dangerRate: result.danger_rate,
        endTime: result.end_time,
        playTime: result.play_time,
        startTime: result.start_time,
        jobResult: {
          create: {
            failureReason: result.job_result.failure_reason,
            failureWave: result.job_result.failure_wave,
            isClear: result.job_result.is_clear,
          },
        },
        players: {
          create: players.map((player) => {
            return {
              name: player.name,
              nsaid: player.pid,
              bossKillCounts: Object.values(player.boss_kill_counts).map(
                (value) => value.count,
              ),
              deadCount: player.dead_count,
              helpCount: player.help_count,
              goldenIkuraNum: player.golden_ikura_num,
              ikuraNum: player.ikura_num,
              style: player.player_type.style,
              species: player.player_type.species,
              specialId: player.special.id,
              weaponList: player.weapon_list.map((value) => value.id),
              specialCounts: player.special_counts,
              jobId: result.my_result.pid == player.pid ? result.job_id : null,
              jobScore:
                result.my_result.pid == player.pid ? result.job_score : null,
              kumaPoint:
                result.my_result.pid == player.pid ? result.kuma_point : null,
              jobRate:
                result.my_result.pid == player.pid ? result.job_rate : null,
              gradeId:
                result.my_result.pid == player.pid ? result.grade.id : null,
              gradePoint:
                result.my_result.pid == player.pid ? result.grade_point : null,
              gradePointDelta:
                result.my_result.pid == player.pid
                  ? result.grade_point_delta
                  : null,
            };
          }),
        },
        members: members,
        waves: {
          create: result.wave_details.map((wave) => {
            return {
              waveId: result.wave_details.indexOf(wave),
              eventType: Object.values(EventType).indexOf(wave.event_type.key),
              waterLevel: Object.values(WaterLevel).indexOf(
                wave.water_level.key,
              ),
              goldenIkuraNum: wave.golden_ikura_num,
              goldenIkuraPopNum: wave.golden_ikura_pop_num,
              ikuraNum: wave.ikura_num,
              quotaNum: wave.quota_num,
              failureReason:
                result.job_result.failure_wave ==
                result.wave_details.indexOf(wave)
                  ? result.job_result.failure_reason.valueOf()
                  : null,
              isClear: !(
                result.job_result.failure_wave ==
                result.wave_details.indexOf(wave)
              ),
            };
          }),
        },
      },
    });
    return 0;
  }

  async updateResult(
    salmonId: number,
    result: UploadedResultModel,
  ): Promise<number> {
    try {
      return (
        await this.prisma.result.update({
          where: {
            salmonId: salmonId,
          },
          data: {
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
          },
        })
      ).salmonId;
    } catch (error) {
      throw new InternalServerErrorException(null, 'Could not update result.');
    }
  }

  async create(request: UploadedResultsModel) {
    request.results.forEach(async (result) => {
      const salmonId = await this.getResultSalmonId(result);
      if (salmonId === null) {
        console.log('Create result');
        this.createResult(result);
      } else {
        console.log('Update result');
        this.updateResult(salmonId, result);
      }
    });
  }
}
