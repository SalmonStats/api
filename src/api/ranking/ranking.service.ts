import { Prisma } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import { response } from 'express';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import {
  GlobalRank,
  Rank,
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

  /**
   * 個人のWAVE記録を配列で返す
   * @param arg スケジュールID
   * @return WAVE記録の配列
   */
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

  /**
   * 個人のWAVE記録
   * @param start_time スケジュールID
   * @param nsaid プレイヤーID
   * @param data グローバルのWAVE記録
   * @return UserRankWave
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
   * グローバルのWAVE記録
   * @param start_time スケジュールID
   * @return UserRankWave
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

  /**
   * 指定されたユーザの総合ランク
   * @param start_time スケジュールID
   * @param nsaid プレイヤーID
   * @param no_night 夜WAVEを含むか
   * @return RankIkura
   */
  async ikura(
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

    // グローバルを取得
    const results = await this.ikuras(start_time);
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

  /**
   * グローバルの総合記録を配列で返す
   * @param start_time スケジュールID
   * @return RankBoss[]
   */
  async ikuras(start_time: number): Promise<RankBoss[]> {
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
      return plainToClass(RankBoss, snakecaseKeys(result));
    });
  }

  /**
   * 指定されたユーザのランク
   * @param start_time スケジュールID
   * @param nsaid プレイヤーID
   * @return UserRank
   */
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
        all: await this.ikura(start_time, nsaid, true),
        no_night_waves: await this.ikura(start_time, nsaid, false),
      },
      waves: waves,
    };
    return response;
  }

  /**
   * 指定されたスケジュールのランク
   * @param start_time スケジュールID
   * @return GlobalRank
   */
  async global(start_time: number): Promise<GlobalRank> {
    const startTime = dayjs.unix(start_time).toDate();
    const goldenIkuraRank = await Promise.all(
      [true, false].map(async (no_night) => {
        const results = await this.prisma.result.findMany({
          where: {
            startTime: startTime,
            noNightWaves: no_night,
          },
          select: {
            salmonId: true,
            goldenIkuraNum: true,
            ikuraNum: true,
            members: true,
          },
          distinct: ['members'],
          orderBy: {
            goldenIkuraNum: 'desc',
          },
          take: 10,
        });

        return results.map((result, index) => {
          const data: Rank = plainToClass(Rank, snakecaseKeys(result));
          data.rank = index + 1;
          return data;
        });
      })
    );

    const ikuraRank = await Promise.all(
      [true, false].map(async (no_night) => {
        const results = await this.prisma.result.findMany({
          where: {
            startTime: startTime,
            noNightWaves: no_night,
          },
          select: {
            salmonId: true,
            goldenIkuraNum: true,
            ikuraNum: true,
            members: true,
          },
          distinct: ['members'],
          orderBy: {
            ikuraNum: 'desc',
          },
          take: 10,
        });

        return results.map((result, index) => {
          const data: Rank = plainToClass(Rank, snakecaseKeys(result));
          data.rank = index + 1;
          return data;
        });
      })
    );

    const response: GlobalRank = {
      total: {
        all: {
          golden_ikura_num: goldenIkuraRank[0],
          ikura_num: ikuraRank[0],
        },
        no_night_waves: {
          golden_ikura_num: goldenIkuraRank[1],
          ikura_num: ikuraRank[1],
        },
      },
      waves: null,
    };
    return response;
  }
}
