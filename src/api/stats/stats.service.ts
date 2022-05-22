import { Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import { IkuraStats as IkuraStatsModel } from '../dto/stats.response.dto';

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
    nsaid?: string,
    type?: StatsType
  ) {
    // nsaid未指定かつtypeが指定されていれば計算不可なのでundefinedを返す
    if (nsaid === undefined) {
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
}
