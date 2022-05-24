import { Prisma } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import { response } from 'express';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import {
  RankBoss,
  RankIkura,
  RankWave,
  UserRank,
  UserRankWave,
} from '../dto/rank.response.dto';

enum WaterLevel {
  LOW = 'low',
  NORMAL = 'normal',
  HIGHT = 'high',
}

enum EventType {
  WATERLEVELS = 'water-levels',
  RUSH = 'rush',
  GOLDIESEEKING = 'goldie-seeking',
  GRILLER = 'grilelr',
  FOG = 'fog',
  THEMOTHERSHIP = 'the-mothership',
  COHOCKCHARGE = 'cohock-charge',
}

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async aggregate(
    start_time: number,
    nsaid?: string,
    no_night?: boolean
  ): Promise<RankWave> {
    const startTime: Date = dayjs.unix(start_time).toDate();
    const filter: Prisma.ResultWhereInput = (() => {
      if (nsaid === undefined) {
        return {
          startTime: startTime,
          noNightWaves: no_night,
        };
      } else {
        return {
          startTime: startTime,
          noNightWaves: no_night,
          members: {
            has: nsaid,
          },
        };
      }
    })();
    const result = await this.prisma.result.aggregate({
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
    });
    return plainToClass(RankWave, snakecaseKeys(result));
  }

  async ikura(start_time: number): Promise<RankBoss[]> {
    const startTime: Date = dayjs.unix(start_time).toDate();
    const results = await this.prisma.result.findMany({
      where: {
        startTime: startTime,
      },
      select: {
        bossCounts: true,
        bossKillCounts: true,
        goldenIkuraNum: true,
        ikuraNum: true,
      },
    });
    return results.map((result) => {
      return plainToClass(RankBoss, result);
    });
  }

  /**
   * 個人のWAVE記録を配列で返す
   * @param arg スケジュールID
   * @return WAVE記録の配列
   */
  async wave(
    start_time: number,
    nsaid: string,
    data: UserRankWave
  ): Promise<UserRankWave> {
    const startTime: Date = dayjs.unix(start_time).toDate();
    const waves = await this.prisma.wave.groupBy({
      by: ['eventType', 'waterLevel'],
      where: {
        result: {
          startTime: startTime,
          members: {
            has: nsaid,
          },
        },
      },
      _max: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
    });

    const response = waves.reduce((group, wave) => {
      const { eventType, waterLevel } = wave;
      const { goldenIkuraNum, ikuraNum } = wave._max;
      const waterKey = Object.values(WaterLevel)[waterLevel];
      const eventKey = Object.values(EventType)[eventType];
      const records = data[waterKey][eventKey] as number[];
      const rank = records.findIndex((value) => value == goldenIkuraNum) + 1;
      group[waterKey] = group[waterKey] ?? {};
      group[waterKey][eventKey] = group[waterKey][eventKey] ?? null;
      group[waterKey][eventKey] = {
        golden_ikura_num: {
          rank: rank,
          score: goldenIkuraNum,
        },
        count: records.length,
      };
      return group;
    }, {});

    return plainToClass(UserRankWave, response);
  }

  /**
   * 全員のWAVE記録を配列で返す
   * @param arg スケジュールID
   * @return WAVE記録の配列
   */
  async waves(start_time: number): Promise<UserRankWave> {
    const startTime: Date = dayjs.unix(start_time).toDate();
    const waves = await this.prisma.wave.findMany({
      where: {
        result: {
          startTime: startTime,
        },
      },
      orderBy: {
        goldenIkuraNum: 'desc',
      },
      select: {
        eventType: true,
        waterLevel: true,
        goldenIkuraNum: true,
        ikuraNum: true,
      },
    });

    const response = waves.reduce((group, wave) => {
      const { waterLevel, eventType } = wave;
      const waterKey = Object.values(WaterLevel)[waterLevel];
      const eventKey = Object.values(EventType)[eventType];
      group[waterKey] = group[waterKey] ?? {};
      group[waterKey][eventKey] = group[waterKey][eventKey] ?? [];
      group[waterKey][eventKey].push(wave.goldenIkuraNum);
      return group;
    }, {});
    return plainToClass(UserRankWave, response);
  }

  async total(
    start_time: number,
    nsaid: string,
    no_night?: boolean
  ): Promise<RankIkura> {
    const player = await this.aggregate(start_time, nsaid, no_night);
    // const global = await this.aggregate(start_time);
    const count = await this.prisma.result.count({
      where: {
        startTime: dayjs.unix(start_time).toDate(),
        noNightWaves: no_night,
      },
    });

    // 配列を取得
    const results = await this.ikura(start_time);
    const golden_ikura_num = results
      .map((result) => result.golden_ikura_num)
      .sort((x, y) => y - x);
    const ikura_num = results
      .map((result) => result.ikura_num)
      .sort((x, y) => y - x);

    const response = {
      golden_ikura_num: {
        rank: golden_ikura_num.indexOf(player.max.golden_ikura_num) + 1,
        score: player.max.golden_ikura_num,
      },
      ikura_num: {
        rank: ikura_num.indexOf(player.max.ikura_num) + 1,
        score: player.max.ikura_num,
      },
      count: count,
    };

    return plainToClass(RankIkura, response);
  }

  async rank(start_time: number, nsaid: string): Promise<UserRank> {
    if (nsaid === undefined) {
      throw new BadRequestException();
    }
    // WAVE記録
    const waves: UserRankWave = await this.wave(
      start_time,
      nsaid,
      await this.waves(start_time)
    );

    const response: UserRank = {
      total: {
        all: await this.total(start_time, nsaid, true),
        no_night_waves: await this.total(start_time, nsaid, false),
      },
      waves: waves,
    };
    return response;
  }
}
