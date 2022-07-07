import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { re, transpose } from 'mathjs';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import {
  RestorePlayer,
  RestoreResult,
  RestoreResults as RestoreResultsModel,
  RestoreSchedule,
  RestoreWave,
} from '../dto/restore.request.dto';
import {
  EventType,
  PlayerResult,
  UploadResult,
  UploadResults,
  UploadResults as UploadResultsModel,
  WaterLevel,
} from '../dto/result.request.dto';
import { JobResult } from '../dto/result.response.dto';
import { Status, UploadStatus } from './results.status';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  find() {}

  findMany() {}

  upsert(request: UploadResultsModel): Promise<UploadStatus[]> {
    const results = Promise.all(
      request.results.map(async (result) => {
        const salmonId = await this.getSalmonId(result);
        if (salmonId === null) {
          return await this.create(result);
        } else {
          return await this.update(result, salmonId);
        }
      })
    );
    return results;
  }

  private async create(result: UploadResult): Promise<UploadStatus> {
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

    const salmonId: number = (
      await this.prisma.result.create({
        data: {
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
                  gradId: playerId == player.pid ? result.grade.id : null,
                  gradePoint:
                    playerId == player.pid ? result.grade_point : null,
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
                  eventType: Object.values(EventType).indexOf(
                    wave.event_type.key
                  ),
                  goldenIkuraNum: wave.golden_ikura_num,
                  goldenIkuraPopNum: wave.golden_ikura_pop_num,
                  ikuraNum: wave.ikura_num,
                  quotaNum: wave.quota_num,
                  failureReason:
                    index + 1 == failureWave ? failureReason : null,
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
        },
      })
    ).salmonId;
    return new UploadStatus(salmonId, Status.Created);
  }

  private async update(
    result: UploadResult,
    salmonId: number
  ): Promise<UploadStatus> {
    const updatedId: number = (
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
    )?.salmonId;
    return new UploadStatus(updatedId, Status.Updated);
  }

  // 同一リザルトがあるかチェックする
  // あればリザルトID、なければnullを返す
  private async getSalmonId(result: UploadResult): Promise<number> {
    const members: string[] = result.other_results
      .concat([result.my_result])
      .map((player) => player.pid)
      .sort();
    return (
      (
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
      )?.salmonId ?? null
    );
  }

  // private restore(request: RestoreResultsModel): Promise<UploadResult>[] {
  //   const results: RestoreResult[] = request.results;
  //   const response = results.map(async (result) => {
  //     const salmonId = await this.getSalmonId(result);
  //     if (salmonId === undefined) {
  //       console.log('Created', salmonId);
  //       const response = await this.prisma.result.create({
  //         data: this.result(result),
  //       });
  //       return new UploadResult(response.salmonId, Status.Created);
  //     } else {
  //       console.log('Updated', salmonId);
  //       const response = await this.prisma.result.update({
  //         where: { salmonId: salmonId },
  //         data: this.result(result),
  //       });
  //       return new UploadResult(response.salmonId, Status.Created);
  //     }
  //   });
  //   return response;
  // }

  // // リザルトIDを取得する
  // private async getSalmonId(result: RestoreResult): Promise<number> {
  //   return (
  //     await this.prisma.result.findFirst({
  //       where: {
  //         playTime: {
  //           lte: dayjs(result.play_time).add(10, 'second').toDate(),
  //           gte: dayjs(result.play_time).subtract(10, 'second').toDate(),
  //         },
  //         members: {
  //           equals: result.members,
  //         },
  //       },
  //     })
  //   )?.salmonId;
  // }

  // private update(salmonId: number, result: RestoreResult) {
  //   const player: PlayerResult =
  //   this.prisma.result.update({
  //     where: {
  //       salmonId: salmonId,
  //     },
  //     data: {
  //       players: {
  //         update: {
  //           where: {
  //             resultId_nsaid: {
  //               resultId: salmonId,
  //               nsaid:
  //             }
  //           },
  //           data: {
  //             jobId: player,
  //           }
  //         }
  //       }
  //     },
  //   });
  // }

  // private result(result: RestoreResult): Prisma.ResultCreateInput {
  //   return {
  //     bossCounts: result.boss_counts,
  //     bossKillCounts: result.boss_kill_counts,
  //     goldenIkuraNum: result.golden_ikura_num,
  //     noNightWaves: result.no_night_waves,
  //     ikuraNum: result.ikura_num,
  //     dangerRate: result.danger_rate,
  //     playTime: result.play_time,
  //     members: result.members,
  //     players: this.players(result.players),
  //     waves: this.waves(result.waves),
  //     schedule: {
  //       connect: {
  //         startTime: result.start_time,
  //       },
  //     },
  //     jobResult: this.jobResult(result.job_result),
  //   };
  // }

  // private createPlayer(
  //   player: RestorePlayer
  // ): Prisma.PlayerCreateWithoutResultInput {
  //   return {
  //     nsaid: player.nsaid,
  //     bossKillCounts: player.boss_kill_counts,
  //     deadCount: player.dead_count,
  //     goldenIkuraNum: player.golden_ikura_num,
  //     helpCount: player.help_count,
  //     ikuraNum: player.ikura_num,
  //     jobId: player.job_id,
  //     jobScore: player.job_score,
  //     jobRate: player.job_rate,
  //     kumaPoint: player.kuma_point,
  //     gradeId: player.grade_id,
  //     gradePoint: player.grade_point,
  //     gradePointDelta: player.grade_point_delta,
  //     name: player.name,
  //     species: player.species,
  //     style: player.style,
  //     specialId: player.special_id,
  //     specialCounts: player.special_counts,
  //     weaponList: player.weapon_list,
  //   };
  // }

  // private players(
  //   players: RestorePlayer[]
  // ): Prisma.PlayerCreateNestedManyWithoutResultInput {
  //   return {
  //     createMany: {
  //       data: players.map((player) => this.createPlayer(player)),
  //     },
  //   };
  // }

  // private createWave(
  //   wave: RestoreWave,
  //   index: number,
  //   failureReason: string,
  //   isClear: boolean
  // ): Prisma.WaveCreateWithoutResultInput {
  //   return {
  //     waveId: index,
  //     eventType: wave.event_type,
  //     waterLevel: wave.water_level,
  //     goldenIkuraNum: wave.golden_ikura_num,
  //     ikuraNum: wave.ikura_num,
  //     goldenIkuraPopNum: wave.golden_ikura_pop_num,
  //     quotaNum: wave.quota_num,
  //     failureReason: failureReason,
  //     isClear: isClear,
  //   };
  // }

  // private waves(
  //   waves: RestoreWave[]
  // ): Prisma.WaveCreateNestedManyWithoutResultInput {
  //   return {
  //     createMany: {
  //       // 仮調整
  //       data: waves.map((wave, index) => {
  //         return this.createWave(wave, index, null, true);
  //       }),
  //     },
  //   };
  // }

  // private jobResult(
  //   result: JobResult
  // ): Prisma.JobResultCreateNestedOneWithoutResultInput {
  //   return {
  //     create: {
  //       failureReason: result.failure_reason,
  //       failureWave: result.failure_wave,
  //       isClear: result.is_clear,
  //     },
  //   };
  // }

  // private schedule(
  //   schedule: RestoreSchedule
  // ): Prisma.ScheduleCreateOrConnectWithoutResultsInput {
  //   return {
  //     where: {
  //       startTime: schedule.start_time,
  //     },
  //     create: {
  //       startTime: schedule.start_time,
  //       stageId: schedule.stage_id,
  //       endTime: schedule.end_time,
  //       weaponList: schedule.weapon_list,
  //       rareWeapon: null,
  //     },
  //   };
  // }
}
