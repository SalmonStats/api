import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise, Result } from '@prisma/client';
import dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';
import {
  RestorePlayer,
  RestoreResult,
  RestoreResults,
  RestoreSchedule,
  RestoreWave,
} from '../dto/restore.request.dto';
import { PlayerResult, UploadResult } from '../dto/result.request.dto';
import { FailureReason, JobResult } from '../dto/result.response.dto';
import { Status, UploadStatus } from '../results/results.status';

@Injectable()
export class RestoreService {
  constructor(private readonly prisma: PrismaService) {}

  async restore(results: RestoreResult[]): Promise<UploadStatus[]> {
    const response = await this.prisma.$transaction(
      results.map((result) => this.create(result))
    );

    return response.map(
      (result) => new UploadStatus(result.salmonId, Status.Created)
    );
  }

  upsert(results: RestoreResult[]): Promise<UploadStatus[]> {
    const response = Promise.all(
      results.map(async (result) => {
        const salmonId: number = await this.getSalmonId(result);
        if (salmonId === null) {
          const resultId: number = (await this.create(result)).salmonId;
          return new UploadStatus(resultId, Status.Created);
        }
        return new UploadStatus(salmonId, Status.Updated);
      })
    );
    return response;
  }

  // リザルトIDを取得する
  private async getSalmonId(result: RestoreResult): Promise<number> {
    return (
      (
        await this.prisma.result.findFirst({
          where: {
            playTime: {
              lte: dayjs(result.play_time).add(10, 'second').toDate(),
              gte: dayjs(result.play_time).subtract(10, 'second').toDate(),
            },
            members: {
              equals: result.members,
            },
          },
        })
      )?.salmonId ?? null
    );
  }

  private create(result: RestoreResult): PrismaPromise<Result> {
    const failureReason: string = result.job_result.failure_reason;
    const failureWave: number = result.job_result.failure_wave;
    return this.prisma.result.create({
      data: {
        bossCounts: result.boss_counts,
        bossKillCounts: result.boss_kill_counts,
        goldenIkuraNum: result.golden_ikura_num,
        noNightWaves: result.no_night_waves,
        ikuraNum: result.ikura_num,
        dangerRate: result.danger_rate,
        playTime: result.play_time,
        members: result.members,
        players: this.players(result.players),
        waves: this.waves(result.waves, failureReason, failureWave),
        jobResult: this.jobResult(result.job_result),
        schedule: {
          connect: {
            startTime: result.start_time,
          },
        },
      },
    });
  }

  private createPlayer(
    player: RestorePlayer
  ): Prisma.PlayerCreateWithoutResultInput {
    return {
      nsaid: player.nsaid,
      bossKillCounts: player.boss_kill_counts,
      deadCount: player.dead_count,
      goldenIkuraNum: player.golden_ikura_num,
      helpCount: player.help_count,
      ikuraNum: player.ikura_num,
      jobId: player.job_id,
      jobScore: player.job_score,
      jobRate: player.job_rate,
      kumaPoint: player.kuma_point,
      gradeId: player.grade_id,
      gradePoint: player.grade_point,
      gradePointDelta: player.grade_point_delta,
      name: player.name,
      species: player.species,
      style: player.style,
      specialId: player.special_id,
      specialCounts: player.special_counts,
      weaponList: player.weapon_list,
    };
  }

  private players(
    players: RestorePlayer[]
  ): Prisma.PlayerCreateNestedManyWithoutResultInput {
    return {
      createMany: {
        data: players.map((player) => this.createPlayer(player)),
      },
    };
  }

  private createWave(
    wave: RestoreWave,
    index: number,
    failureReason: string,
    isClear: boolean
  ): Prisma.WaveCreateWithoutResultInput {
    return {
      waveId: index,
      eventType: wave.event_type,
      waterLevel: wave.water_level,
      goldenIkuraNum: wave.golden_ikura_num,
      ikuraNum: wave.ikura_num,
      goldenIkuraPopNum: wave.golden_ikura_pop_num,
      quotaNum: wave.quota_num,
      failureReason: failureReason,
      isClear: isClear,
    };
  }
  private waves(
    waves: RestoreWave[],
    failureReason: string,
    failureWave: number
  ): Prisma.WaveCreateNestedManyWithoutResultInput {
    return {
      createMany: {
        data: waves.map((wave, index) => {
          const reason: string =
            index + 1 == failureWave ? failureReason : null;
          const isClear: boolean = !(failureWave == index + 1);
          return this.createWave(wave, index, reason, isClear);
        }),
      },
    };
  }

  private jobResult(
    result: JobResult
  ): Prisma.JobResultCreateNestedOneWithoutResultInput {
    return {
      create: {
        failureReason: result.failure_reason,
        failureWave: result.failure_wave,
        isClear: result.is_clear,
      },
    };
  }
}