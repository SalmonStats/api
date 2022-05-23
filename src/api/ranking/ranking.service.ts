import { Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import { response } from 'express';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import { RankResponseDto } from '../dto/rank.response.dto';

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async aggregate(start_time: number, nsaid?: string) {
    const startTime: Date = dayjs.unix(start_time).toDate();
    const filter: Prisma.ResultWhereInput = (() => {
      if (nsaid === undefined) {
        return {
          startTime: startTime,
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
    return plainToClass(RankResponseDto, snakecaseKeys(result));
  }

  async ikura(start_time: number) {
    const startTime: Date = dayjs.unix(start_time).toDate();
    const result = this.prisma.result.findMany({
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
    return result;
  }

  async wave(start_time: number) {
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

    return waves.reduce((group, wave) => {
      const { waterLevel, eventType } = wave;
      const waterKey = Object.values(WaterLevel)[waterLevel];
      const eventKey = Object.values(EventType)[eventType];
      group[waterKey] = group[waterKey] ?? {};
      group[waterKey][eventKey] = group[waterKey][eventKey] ?? [];
      group[waterKey][eventKey].push(wave.goldenIkuraNum);
      return group;
    }, {});
  }

  async rank(start_time: number, nsaid: string) {
    // 全体と個人の最高値を取得
    const player = await this.aggregate(start_time, nsaid);
    const global = await this.aggregate(start_time);

    // 配列を取得
    const results = await this.ikura(start_time);
    const golden_ikura_num = results
      .map((result) => result.goldenIkuraNum)
      .sort((x, y) => y - x);
    const ikura_num = results
      .map((result) => result.ikuraNum)
      .sort((x, y) => y - x);

    // WAVE記録
    const waves = await this.wave(start_time);
    return waves;

    const response = {
      total: {
        golden_ikura_num: {
          rank: golden_ikura_num.indexOf(player.max.golden_ikura_num) + 1,
          score: player.max.golden_ikura_num,
          max: global.max.golden_ikura_num,
          avg: global.avg.golden_ikura_num,
        },
        ikura_num: {
          rank: ikura_num.indexOf(player.max.ikura_num) + 1,
          score: player.max.ikura_num,
          max: player.max.ikura_num,
          avg: player.avg.ikura_num,
        },
        count: global.count,
      },
      waves: {},
    };
    return response;
  }
}
