import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
  RestorePlayer,
  RestoreResult,
  RestoreResults as RestoreResultsModel,
  RestoreSchedule,
  RestoreWave,
} from '../dto/restore.request.dto';
import { UploadResults as UploadResultsModel } from '../dto/result.request.dto';
import { JobResult } from '../dto/result.response.dto';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  find() {}

  findMany() {}

  create(request: UploadResultsModel | RestoreResultsModel) {
    return this.restore(request as RestoreResultsModel);
  }

  private restore(request: RestoreResultsModel) {
    const results: RestoreResult[] = request.results;
    return this.prisma.result.createMany({
      data: [],
      skipDuplicates: true,
    });
  }

  private result(result: RestoreResult): Prisma.ResultCreateInput {
    return {
      bossCounts: result.boss_counts,
      bossKillCounts: result.boss_kill_counts,
      goldenIkuraNum: result.golden_ikura_num,
      noNightWaves: result.no_night_waves,
      ikuraNum: result.ikura_num,
      dangerRate: result.danger_rate,
      playTime: result.play_time,
      members: result.members,
      players: this.players(result.players),
      waves: this.waves(result.waves),
      jobResult: this.jobResult(result.job_result),
      schedule: this.schedule(result.schedule),
    };
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
    waves: RestoreWave[]
  ): Prisma.WaveCreateNestedManyWithoutResultInput {
    return {
      createMany: {
        // 仮調整
        data: waves.map((wave, index) => {
          return this.createWave(wave, index, null, true);
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

  private schedule(
    schedule: RestoreSchedule
  ): Prisma.ScheduleCreateOrConnectWithoutResultsInput {
    return {
      where: {
        startTime: schedule.start_time,
      },
      create: {
        startTime: schedule.start_time,
        stageId: schedule.stage_id,
        endTime: schedule.end_time,
        weaponList: schedule.weapon_list,
        rareWeapon: null,
      },
    };
  }
}
