import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Result } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import { IkuraStats } from '../dto/stats.response.dto';

import { schedules } from './coop.json';
export type CoopSchedule = typeof import('./coop.json');

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyResults(
    request: Prisma.ScheduleFindUniqueArgs
  ): Promise<Result[]> {
    try {
      const schedule = await this.prisma.schedule.findUnique({
        where: request.where,
        include: {
          results: true,
        },
        rejectOnNotFound: true,
      });
      return schedule.results;
    } catch {
      throw new NotFoundException();
    }
  }

  async statsBossCounts(start_time: number) {
    const stats = await this.prisma.player.aggregate({
      where: {
        result: {
          startTime: dayjs.unix(start_time).toDate(),
        },
      },
      _avg: {
        helpCount: true,
        deadCount: true,
        ikuraNum: true,
        goldenIkuraNum: true,
      },
    });
  }

  async statsWaves(start_time: number): Promise<IkuraStats[]> {
    const waves = await this.prisma.wave.groupBy({
      by: ['eventType', 'waterLevel'],
      where: {
        isClear: true,
        result: {
          schedule: {
            startTime: dayjs.unix(start_time).toDate(),
          },
        },
      },
      _count: {
        _all: true,
      },
      _avg: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _min: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _max: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
    });
    const stats = waves.map((wave) => {
      const data = snakecaseKeys(wave);
      return plainToClass(IkuraStats, data);
    });
    return stats;
  }

  async statsResults(start_time: number) {
    const results = await this.prisma.result.groupBy({
      by: ['noNightWaves'],
      where: {
        startTime: dayjs.unix(start_time).toDate(),
        jobResult: {
          isClear: true,
        },
      },
      _count: {
        _all: true,
      },
      _avg: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _max: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _min: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
    });

    return results.map((result) => {
      const data = snakecaseKeys(result);
      return plainToClass(IkuraStats, data);
    });
  }

  async find(): Promise<void> {}

  async create() {}
}
