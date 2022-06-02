import { Prisma } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToClass, Transform } from 'class-transformer';
import dayjs from 'dayjs';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import {
  Rank,
  RankDetail,
  RankIkuras,
  RankResult,
  RankWave,
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

class ShiftStatsParam {
  @Transform((params) => Number(params.value.toFixed(2)))
  golden_ikura_num: number;

  @Transform((params) => Number(params.value.toFixed(2)))
  ikura_num: number;

  @Transform((params) => Number(params.value.toFixed(2)))
  dead_count: number;

  @Transform((params) => Number(params.value.toFixed(2)))
  help_count: number;
}

export class ShiftStatsDto {
  nsaid: string;
  sum: ShiftStatsParam;
  avg: ShiftStatsParam;
  max: ShiftStatsParam;
  @Transform((params) => params.value['all'])
  count: number;
}

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async shiftRank(start_time: number) {
    const results = await this.prisma.player.groupBy({
      by: ['nsaid'],
      where: {
        result: {
          startTime: dayjs.unix(start_time).toDate(),
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _avg: {
        goldenIkuraNum: true,
        ikuraNum: true,
        deadCount: true,
        helpCount: true,
      },
      _max: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      orderBy: {
        _count: {
          nsaid: 'desc',
        },
      },
      skip: 0,
      take: 100,
    });

    return results.map((result) =>
      plainToClass(ShiftStatsDto, snakecaseKeys(result))
    );
  }

  private filter(
    start_time: number,
    nsaid?: string,
    no_night_waves?: boolean
  ): Prisma.ResultWhereInput {
    return {
      startTime: dayjs.unix(start_time).toDate(),
      noNightWaves: no_night_waves,
      members: {
        has: nsaid ?? null,
      },
    };
  }

  /**
   * 個人のTotal記録を配列で返す
   * @param arg スケジュールID
   * @return RankDetail
   */
  private async aggregate(
    start_time: number,
    nsaid?: string,
    no_night?: boolean
  ): Promise<RankDetail> {
    const result = await this.prisma.result.aggregate({
      where: this.filter(start_time, nsaid, no_night),
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

    return plainToClass(RankDetail, snakecaseKeys(result));
  }

  /**
   * 個人のWAVE記録
   * @param start_time スケジュールID
   * @param nsaid プレイヤーID
   * @param data グローバルのWAVE記録
   * @return RankWave
   */
  async wave(start_time: number, nsaid: string): Promise<RankWave> {
    const startTime: Date = dayjs.unix(start_time).toDate();
    // グローバル記録
    const data = await this.waves(start_time);
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

    const response: RankWave = plainToClass(
      RankWave,
      waves.reduce((group, wave) => {
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
            golden_ikura_num: goldenIkuraNum,
            ikura_num: ikuraNum,
          },
          count: records.length,
        };
        return group;
      }, {})
    );

    return response;
  }

  /**
   * グローバルのWAVE記録
   * @param start_time スケジュールID
   * @return UserRankWave
   */
  private async waves(start_time: number): Promise<RankWave> {
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
    return plainToClass(RankWave, response);
  }

  /**
   * 指定されたユーザの総合ランク
   * @param start_time スケジュールID
   * @param nsaid プレイヤーID
   * @param no_night 夜WAVEを含むか
   * @return RankIkura
   */
  private async ikura(
    start_time: number,
    nsaid: string,
    no_night_waves?: boolean
  ): Promise<RankIkuras> {
    const player = await this.aggregate(start_time, nsaid, no_night_waves);
    // const global = await this.aggregate(start_time);

    // グローバル記録
    const results = await this.ikuras(start_time, no_night_waves);
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
      count: results.length,
    };

    return plainToClass(RankIkuras, response);
  }

  /**
   * グローバルの総合記録を配列で返す
   * @param start_time スケジュールID
   * @return RankBoss[]
   */
  private async ikuras(
    start_time: number,
    no_night_waves: boolean
  ): Promise<RankResult[]> {
    const startTime: Date = dayjs.unix(start_time).toDate();
    const results = await this.prisma.result.findMany({
      where: {
        startTime: startTime,
        noNightWaves: no_night_waves,
      },
      select: {
        bossCounts: true,
        bossKillCounts: true,
        goldenIkuraNum: true,
        ikuraNum: true,
      },
    });

    return results.map((result) => {
      return plainToClass(RankResult, snakecaseKeys(result));
    });
  }

  /**
   * 指定されたユーザのランク
   * @param start_time スケジュールID
   * @param nsaid プレイヤーID
   * @return UserRank
   */
  async rank(start_time: number, nsaid: string): Promise<Rank> {
    if (nsaid === undefined) {
      throw new BadRequestException();
    }
    // WAVE記録
    const waves: RankWave = await this.wave(start_time, nsaid);

    const response: Rank = {
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
  async global(start_time: number): Promise<Rank> {
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
          const data: RankResult = plainToClass(
            RankResult,
            snakecaseKeys(result)
          );
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
          const data: RankResult = plainToClass(
            RankResult,
            snakecaseKeys(result)
          );
          data.rank = index + 1;
          return data;
        });
      })
    );

    const response: Rank = {
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
