import { Player, PrismaPromise } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass, Transform } from 'class-transformer';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import {
  PaginatedRequestDto,
  PaginatedRequestDtoForUser,
} from '../dto/pagination.dto';
import { Result as CoopResult } from '../dto/result.response.dto';

interface Result {
  golden_ikura_num: number
  ikura_num: number
}

interface StageResult {
  stage_id: number
  grade_point_max: number
  shifts_worked: number
  kuma_point_total: number
  player_results: Result
  team_results: Result
}

export interface UserData {
  stage_id: number
  player_golden_ikura_num: number
  player_ikura_num: number
  golden_ikura_num: number
  ikura_num: number
  grade_point: number
  kuma_point: number
  shifts_worked: number
  nightless: boolean
}

export class UserStats {
  constructor(results: UserData[]) {
    this.shifts_worked = results.reduce((acc, cur) => acc + cur.shifts_worked, 0);
    this.golden_ikura_num = results.reduce((acc, cur) => acc + cur.golden_ikura_num, 0);
    this.ikura_num = results.reduce((acc, cur) => acc + cur.ikura_num, 0);
    this.kuma_point = results.reduce((acc, cur) => acc + cur.kuma_point, 0);
    this.grade_point = Math.max(...results.map((cur) => cur.grade_point));
    console.log(results)
  }
  
  @ApiProperty()
  nsaid: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  thumbnail_url: string;
  
  @ApiProperty()
  shifts_worked: number;

  @ApiProperty()
  golden_ikura_num: number;

  @ApiProperty()
  ikura_num: number;

  @ApiProperty()
  dead_count: number;

  @ApiProperty()
  kuma_point: number;

  @ApiProperty()
  help_count: number;

  @ApiProperty()
  grade_id: number;

  @ApiProperty()
  grade_point: number;
  
  @ApiProperty()
  stage_results: StageResult[];

  @ApiProperty()
  results: CoopResult[];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    query: PaginatedRequestDtoForUser
  ): Promise<Partial<Player>[]> {
    return await this.prisma.player.findMany({
      where: {
        OR: [
          {
            name: {
              startsWith: query.nickname,
            },
          },
          {
            name: {
              endsWith: query.nickname,
            },
          },
        ],
      },
      distinct: ['nsaid'],
      select: {
        nsaid: true,
        name: true,
      },
      skip: query.offset,
      take: query.limit,
    });
  }

  private queryBuilder(nsaid: string): PrismaPromise<UserData[]> {
    return this.prisma.$queryRaw<UserData[]>`
    WITH results AS (
      SELECT
      nsaid,
      players.golden_ikura_num AS player_golden_ikura_num,
      players.ikura_num AS player_ikura_num,
      results.golden_ikura_num,
      results.ikura_num,
      grade_point,
      players.boss_kill_counts,
      dead_count,
      help_count,
      stage_id,
      results.start_time,
      kuma_point,
      no_night_waves
      FROM
      players
      INNER JOIN
      results
      ON
      players."resultId" = results.salmon_id
      INNER JOIN
      schedules
      ON
      results.start_time = schedules.start_time
      WHERE
      nsaid = ${nsaid}
    )
    SELECT
    stage_id,
    MAX(player_golden_ikura_num) AS player_golden_ikura_num,
    MAX(player_ikura_num) AS player_ikura_num,
    MAX(golden_ikura_num) AS golden_ikura_num,
    MAX(ikura_num) AS ikura_num,
    MAX(grade_point) AS grade_point,
    COUNT(*)::INT AS shifts_worked,
    SUM(kuma_point)::INT AS kuma_point,
    no_night_waves AS nightless
    FROM
    results
    GROUP BY
    stage_id,
    no_night_waves
    ORDER BY
    no_night_waves,
    stage_id
    `;
  }

  async find(nsaid: string): Promise<UserStats> {
    const results = await this.prisma.$transaction([
      this.queryBuilder(nsaid),
    ])

    return new UserStats(results[0])
  }
}
