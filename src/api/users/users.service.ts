import { Player, PrismaPromise } from '.prisma/client';
import { Injectable, Res } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass, Transform, Type } from 'class-transformer';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import { PaginatedRequestDtoForUser } from '../dto/pagination.dto';
import { Result as CoopResult } from '../dto/result.response.dto';
import { NicknameAndIconRequestDto } from '../nickname_and_icon/nickname_and_icon.request';
import { NicknameAndIcon } from '../nickname_and_icon/nickname_and_icon.response';
import { NicknameAndIconService } from '../nickname_and_icon/nickname_and_icon.service';

class Result {
  constructor(golden_ikura_num, ikura_num) {
    this.golden_ikura_num = golden_ikura_num;
    this.ikura_num = ikura_num;
  }

  golden_ikura_num: number;
  ikura_num: number;
}

class StageResult {
  constructor(result: UserData, stage_id: number, nightless: boolean) {
    if (result === undefined) {
      this.stage_id = stage_id;
      this.nightless = nightless;
      this.grade_point_max = null;
      this.shifts_worked = null;
      this.kuma_point_total = null;
      this.player_results = new Result(null, null);
      this.team_results = new Result(null, null);
      return;
    } else {
      this.stage_id = result.stage_id;
      this.nightless = nightless;
      this.grade_point_max = result.grade_point;
      this.shifts_worked = result.shifts_worked;
      this.kuma_point_total = result.kuma_point;
      this.player_results = new Result(
        result.player_golden_ikura_num,
        result.player_ikura_num
      );
      this.team_results = new Result(result.golden_ikura_num, result.ikura_num);
    }
  }

  @ApiProperty()
  stage_id: number;
  @ApiProperty()
  grade_point_max: number;
  @ApiProperty()
  shifts_worked: number;
  @ApiProperty()
  kuma_point_total: number;
  nightless: boolean;
  @ApiProperty({ type: Result })
  player_results: Result;
  @ApiProperty({ type: Result })
  team_results?: Result;
}

interface UserData {
  stage_id: number;
  player_golden_ikura_num: number;
  player_ikura_num: number;
  golden_ikura_num: number;
  ikura_num: number;
  grade_point: number;
  kuma_point: number;
  shifts_worked: number;
  nightless: boolean;
}

export class UserStats {
  constructor(results: UserData[], nicknameAndIcons: NicknameAndIcon[]) {
    this.shifts_worked = results.reduce(
      (acc, cur) => acc + cur.shifts_worked,
      0
    );
    this.golden_ikura_num = results.reduce(
      (acc, cur) => acc + cur.golden_ikura_num,
      0
    );
    this.ikura_num = results.reduce((acc, cur) => acc + cur.ikura_num, 0);
    this.kuma_point = results.reduce((acc, cur) => acc + cur.kuma_point, 0);
    this.grade_point = Math.max(...results.map((cur) => cur.grade_point));
    this.nickname = nicknameAndIcons[0].nickname;
    this.thumbnail_url = nicknameAndIcons[0].thumbnail_url;

    const getStageResult = (stageId: number, nightless: boolean) => {
      const result = results.find(
        (cur) => cur.stage_id === stageId && cur.nightless === nightless
      );
      return new StageResult(result, stageId, nightless);
    };

    this.stage_results = [
      {
        stage_id: 5000,
        night: getStageResult(5000, false),
        nightless: getStageResult(5000, true),
      },
      {
        stage_id: 5001,
        night: getStageResult(5001, false),
        nightless: getStageResult(5001, true),
      },
      {
        stage_id: 5002,
        night: getStageResult(5002, false),
        nightless: getStageResult(5002, true),
      },
      {
        stage_id: 5003,
        night: getStageResult(5003, false),
        nightless: getStageResult(5003, true),
      },
      {
        stage_id: 5004,
        night: getStageResult(5004, false),
        nightless: getStageResult(5004, true),
      },
    ];
  }

  @ApiProperty()
  nsaid: string;

  @ApiProperty()
  nickname: string;

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

  @ApiProperty({ type: [StageResult] })
  stage_results: StageResults[];

  @ApiProperty({ type: [CoopResult] })
  @Type(() => CoopResult)
  results: CoopResult[];
}

class StageResults {
  stage_id: number;
  night: StageResult;
  nightless: StageResult;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: NicknameAndIconService
  ) {}

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
    const results = await this.prisma.$transaction([this.queryBuilder(nsaid)]);

    const request: NicknameAndIconRequestDto = new NicknameAndIconRequestDto([
      nsaid,
    ]);
    const nicknameAndIcons: NicknameAndIcon[] = (
      await this.service.findMany(request)
    ).nickname_and_icons;

    const response = new UserStats(results[0], nicknameAndIcons);

    return response;
  }
}
