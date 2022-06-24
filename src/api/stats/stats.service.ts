import { Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import math, { mean, max, variance, sum} from 'mathjs';
import snakecaseKeys from 'snakecase-keys';
const { transpose } = require('matrix-transpose');
import { PrismaService } from 'src/prisma.service';
import { IkuraStats as IkuraStatsModel, LegacyStatsDto } from '../dto/stats.response.dto';

export enum StatsType {
  TEAM,
  SOLO,
  CREW,
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async single(
    start_time: number,
    is_clear?: boolean,
    nsaid: string = null,
    type: StatsType = null
  ) {
    // nsaid未指定かつtypeが指定されていれば計算不可なのでundefinedを返す
    if (nsaid === null) {
      return undefined;
    }
    const startTime: Date = dayjs.unix(start_time).toDate();
    const filter: Prisma.PlayerWhereInput = (() => {
      switch (type) {
        case StatsType.TEAM:
          return {
            result: {
              startTime: startTime,
              jobResult: {
                isClear: is_clear,
              },
              members: {
                has: nsaid,
              },
            },
          };
        case StatsType.SOLO:
          return {
            result: {
              startTime: startTime,
              jobResult: {
                isClear: is_clear,
              },
              members: {
                has: nsaid,
              },
            },
            nsaid: nsaid,
          };
        case StatsType.CREW:
          return {
            result: {
              startTime: startTime,
              jobResult: {
                isClear: is_clear,
              },
              members: {
                has: nsaid,
              },
            },
            NOT: {
              nsaid: nsaid,
            },
          };
      }
    })();
    const player = await this.prisma.player.aggregate({
      where: filter,
      _max: {
        ikuraNum: true,
        goldenIkuraNum: true,
        deadCount: true,
        helpCount: true,
      },
      _min: {
        ikuraNum: true,
        goldenIkuraNum: true,
        deadCount: true,
        helpCount: true,
      },
      _avg: {
        ikuraNum: true,
        goldenIkuraNum: true,
        deadCount: true,
        helpCount: true,
      },
      _count: {
        _all: true,
      },
    });
    return plainToClass(IkuraStatsModel, snakecaseKeys(player));
  }

  async wave(start_time: number, is_clear?: boolean, nsaid?: string) {
    if (nsaid === undefined) {
      return undefined;
    }
    const filter: Prisma.WaveWhereInput = (() => {
      if (nsaid === null) {
        return {
          result: {
            startTime: dayjs.unix(start_time).toDate(),
          },
          isClear: is_clear,
        };
      } else {
        return {
          result: {
            startTime: dayjs.unix(start_time).toDate(),
            members: {
              has: nsaid,
            },
          },
          isClear: is_clear,
        };
      }
    })();
    const request: Prisma.WaveGroupByArgs = {
      by: ['eventType', 'waterLevel'],
      where: filter,
      _avg: {
        ikuraNum: true,
        goldenIkuraNum: true,
      },
      _max: {
        ikuraNum: true,
        goldenIkuraNum: true,
      },
      _min: {
        ikuraNum: true,
        goldenIkuraNum: true,
      },
      _count: {
        _all: true,
      },
    };

    return (
      await this.prisma.wave.groupBy({
        by: ['eventType', 'waterLevel'],
        where: request.where,
        _max: request._max,
        _min: request._min,
        _avg: request._avg,
        _count: request._count,
      })
    ).map((wave) => plainToClass(IkuraStatsModel, snakecaseKeys(wave)));
  }

  async total(start_time: number, is_clear?: boolean, nsaid?: string) {
    if (nsaid === undefined) {
      return undefined;
    }
    const startTime: Date = dayjs.unix(start_time).toDate();
    const filter: Prisma.ResultWhereInput = (() => {
      if (nsaid === null) {
        return {
          startTime: startTime,
          jobResult: {
            isClear: is_clear,
          },
        };
      } else {
        return {
          startTime: startTime,
          members: {
            has: nsaid,
          },
        };
      }
    })();
    const request: Prisma.ResultGroupByArgs = {
      by: ['noNightWaves'],
      where: filter,
      _max: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _min: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _avg: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _count: {
        _all: true,
      },
    };

    return (
      await this.prisma.result.groupBy({
        by: request.by,
        where: request.where,
        _max: request._max,
        _min: request._min,
        _avg: request._avg,
        _count: request._count,
      })
    ).map((result) => plainToClass(IkuraStatsModel, snakecaseKeys(result)));
  }

  // 旧Statsのような統計データを取得
  async stats(start_time: number): Promise<LegacyStatsDto> {
    const startMicroTime = performance.now();
    const startTime: Date = dayjs.unix(start_time).toDate();
    // const results = await this.prisma.result.aggregate({
    //   where: {
    //     startTime: startTime,
    //   },
    //   _sum: {
    //     ikuraNum: true,
    //     goldenIkuraNum: true,
    //   },
    // })
    // const jobResults = await this.prisma.jobResult.count({
    //   where: {
    //     startTime: startTime,
    //   }
    // })

    const result = (await this.prisma
      .$queryRaw`WITH results AS(SELECT * FROM results JOIN job_results ON results.salmon_id = job_results.salmon_id WHERE start_time=${startTime})
      SELECT
      COUNT(is_clear=true OR null) is_clear,
      COUNT(is_clear=false OR null) is_failure,
      COUNT(failure_wave=1 AND failure_reason='wipe_out' OR null) is_failure_wave1_wipe_out,
      COUNT(failure_wave=1 AND failure_reason='time_limit' OR null) is_failure_wave1_time_limit,
      COUNT(failure_wave=2 AND failure_reason='wipe_out' OR null) is_failure_wave2_wipe_out,
      COUNT(failure_wave=2 AND failure_reason='time_limit' OR null) is_failure_wave2_time_limit,
      COUNT(failure_wave=3 AND failure_reason='wipe_out' OR null) is_failure_wave3_wipe_out,
      COUNT(failure_wave=3 AND failure_reason='time_limit' OR null) is_failure_wave3_time_limit,
      SUM(boss_counts[1]) as boss_counts_3,
      SUM(boss_counts[2]) as boss_counts_6,
      SUM(boss_counts[3]) as boss_counts_9,
      SUM(boss_counts[4]) as boss_counts_12,
      SUM(boss_counts[5]) as boss_counts_13,
      SUM(boss_counts[6]) as boss_counts_14,
      SUM(boss_counts[7]) as boss_counts_15,
      SUM(boss_counts[8]) as boss_counts_16,
      SUM(boss_counts[9]) as boss_counts_21,
      SUM(boss_kill_counts[1]) as boss_kill_counts_3,
      SUM(boss_kill_counts[2]) as boss_kill_counts_6,
      SUM(boss_kill_counts[3]) as boss_kill_counts_9,
      SUM(boss_kill_counts[4]) as boss_kill_counts_12,
      SUM(boss_kill_counts[5]) as boss_kill_counts_13,
      SUM(boss_kill_counts[6]) as boss_kill_counts_14,
      SUM(boss_kill_counts[7]) as boss_kill_counts_15,
      SUM(boss_kill_counts[8]) as boss_kill_counts_16,
      SUM(boss_kill_counts[9]) as boss_kill_counts_21,
      SUM(golden_ikura_num) as golden_ikura_num_sum,
      AVG(golden_ikura_num) as golden_ikura_num_avg,
      STDDEV(golden_ikura_num) as golden_ikura_num_stddev,
      SUM(ikura_num) as ikura_num_sum,
      AVG(ikura_num) as ikura_num_avg,
      STDDEV(ikura_num) as ikura_num_stddev
      FROM results
      LIMIT 1`)[0];

    const response : LegacyStatsDto= {
      job_result: {
        is_clear: {
          count: Number(result["is_clear"]),
        },
        is_failure: {
          count: Number(result["is_failure"]),
          failure_reason: {
            wipe_out: [
              Number(result["is_failure_wave1_wipe_out"]),
              Number(result["is_failure_wave2_wipe_out"]),
              Number(result["is_failure_wave3_wipe_out"]),
            ],
            time_limit: [
              Number(result["is_failure_wave1_time_limit"]),
              Number(result["is_failure_wave2_time_limit"]),
              Number(result["is_failure_wave3_time_limit"]),
            ]
          }
        },
        golden_ikura_num: {
          sum: Number(result["golden_ikura_num_sum"]),
          avg: Number(result["golden_ikura_num_avg"]),
          sd: Number(result["golden_ikura_num_stddev"]),
        },
        ikura_num: {
          sum: Number(result["ikura_num_sum"]),
          avg: Number(result["ikura_num_avg"]),
          sd: Number(result["ikura_num_stddev"]),
        }
      },
      boss_counts: [
        {
          appearances: Number(result["boss_counts_3"]),
          defeated: Number(result["boss_kill_counts_3"]),
        },
        {
          appearances: Number(result["boss_counts_6"]),
          defeated: Number(result["boss_kill_counts_6"]),
        },
        {
          appearances: Number(result["boss_counts_9"]),
          defeated: Number(result["boss_kill_counts_9"]),
        },
        {
          appearances: Number(result["boss_counts_12"]),
          defeated: Number(result["boss_kill_counts_12"]),
        },
        {
          appearances: Number(result["boss_counts_13"]),
          defeated: Number(result["boss_kill_counts_13"]),
        },
        {
          appearances: Number(result["boss_counts_14"]),
          defeated: Number(result["boss_kill_counts_14"]),
        },
        {
          appearances: Number(result["boss_counts_15"]),
          defeated: Number(result["boss_kill_counts_15"]),
        },
        {
          appearances: Number(result["boss_counts_16"]),
          defeated: Number(result["boss_kill_counts_16"]),
        },
        {
          appearances: Number(result["boss_counts_21"]),
          defeated: Number(result["boss_kill_counts_21"]),
        },
      ],
    }
    return response;
  }
}
