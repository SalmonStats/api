import { Prisma, PrismaPromise } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NicknameAndIconRequestDto } from '../nickname_and_icon/nickname_and_icon.request';
import {
  NicknameAndIcon,
  NicknameAndIconResponseDto,
} from '../nickname_and_icon/nickname_and_icon.response';
import { NicknameAndIconService } from '../nickname_and_icon/nickname_and_icon.service';

export interface ShiftStats {
  job_results: {
    is_clear: number;
    is_failure: number;
    failure_waves: FailureReason[];
  };
  wave_results: WaveResult[][];
  boss_results: BossResult[];
  weapon_results?: WeaponResult[];
  grade_results: GradeResult[];
}

export interface WeaponResult {
  nsaid: string;
  name: string;
  shifts_worked: number;
  supplied_weapon_counts: number;
  rank: number;
}

export interface FailureReason {
  failure_wave: number;
  time_limit: number;
  wipe_out: number;
}

export interface BossResult {
  boss_counts: number;
  boss_kill_counts: number;
  boss_counts_max: number;
  boss_kill_counts_max: number;
}

export interface JobResult {
  is_clear: number;
  is_failure: number;
  is_failure_wave1_wipe_out: number;
  is_failure_wave1_time_limit: number;
  is_failure_wave2_wipe_out: number;
  is_failure_wave2_time_limit: number;
  is_failure_wave3_wipe_out: number;
  is_failure_wave3_time_limit: number;
}

interface WaveResult {
  golden_ikura_num: number;
  ikura_num: number;
  water_level: number;
  event_type: number;
  count: number;
}

interface GradeResult {
  rank: number;
  nsaid: string;
  name: string;
  thumbnail_url: string;
  grade_point_max: number;
  shift_worked: number;
}

interface Salmonid {
  boss_counts_3: number;
  boss_counts_6: number;
  boss_counts_9: number;
  boss_counts_12: number;
  boss_counts_13: number;
  boss_counts_14: number;
  boss_counts_15: number;
  boss_counts_16: number;
  boss_counts_21: number;
  boss_counts_max_3: number;
  boss_counts_max_6: number;
  boss_counts_max_9: number;
  boss_counts_max_12: number;
  boss_counts_max_13: number;
  boss_counts_max_14: number;
  boss_counts_max_15: number;
  boss_counts_max_16: number;
  boss_counts_max_21: number;
  boss_kill_counts_3: number;
  boss_kill_counts_6: number;
  boss_kill_counts_9: number;
  boss_kill_counts_12: number;
  boss_kill_counts_13: number;
  boss_kill_counts_14: number;
  boss_kill_counts_15: number;
  boss_kill_counts_16: number;
  boss_kill_counts_21: number;
  boss_kill_counts_max_3: number;
  boss_kill_counts_max_6: number;
  boss_kill_counts_max_9: number;
  boss_kill_counts_max_12: number;
  boss_kill_counts_max_13: number;
  boss_kill_counts_max_14: number;
  boss_kill_counts_max_15: number;
  boss_kill_counts_max_16: number;
  boss_kill_counts_max_21: number;
}

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: NicknameAndIconService
  ) {}

  private queryBuilder(start_time: number): PrismaPromise<Salmonid[]> {
    return this.prisma.$queryRaw<Salmonid[]>`
      WITH results AS (
        SELECT 
          SUM(boss_counts[1])::INT as boss_counts_3, 
          SUM(boss_counts[2])::INT as boss_counts_6, 
          SUM(boss_counts[3])::INT as boss_counts_9, 
          SUM(boss_counts[4])::INT as boss_counts_12, 
          SUM(boss_counts[5])::INT as boss_counts_13, 
          SUM(boss_counts[6])::INT as boss_counts_14, 
          SUM(boss_counts[7])::INT as boss_counts_15, 
          SUM(boss_counts[8])::INT as boss_counts_16, 
          SUM(boss_counts[9])::INT as boss_counts_21, 
          SUM(boss_kill_counts[1])::INT as boss_kill_counts_3, 
          SUM(boss_kill_counts[2])::INT as boss_kill_counts_6, 
          SUM(boss_kill_counts[3])::INT as boss_kill_counts_9, 
          SUM(boss_kill_counts[4])::INT as boss_kill_counts_12, 
          SUM(boss_kill_counts[5])::INT as boss_kill_counts_13, 
          SUM(boss_kill_counts[6])::INT as boss_kill_counts_14, 
          SUM(boss_kill_counts[7])::INT as boss_kill_counts_15, 
          SUM(boss_kill_counts[8])::INT as boss_kill_counts_16, 
          SUM(boss_kill_counts[9])::INT as boss_kill_counts_21,
          MAX(boss_counts[1])::INT as boss_counts_max_3,
          MAX(boss_counts[2])::INT as boss_counts_max_6,
          MAX(boss_counts[3])::INT as boss_counts_max_9,
          MAX(boss_counts[4])::INT as boss_counts_max_12,
          MAX(boss_counts[5])::INT as boss_counts_max_13,
          MAX(boss_counts[6])::INT as boss_counts_max_14,
          MAX(boss_counts[7])::INT as boss_counts_max_15,
          MAX(boss_counts[8])::INT as boss_counts_max_16,
          MAX(boss_counts[9])::INT as boss_counts_max_21,
          MAX(boss_kill_counts[1])::INT as boss_kill_counts_max_3,
          MAX(boss_kill_counts[2])::INT as boss_kill_counts_max_6,
          MAX(boss_kill_counts[3])::INT as boss_kill_counts_max_9,
          MAX(boss_kill_counts[4])::INT as boss_kill_counts_max_12,
          MAX(boss_kill_counts[5])::INT as boss_kill_counts_max_13,
          MAX(boss_kill_counts[6])::INT as boss_kill_counts_max_14,
          MAX(boss_kill_counts[7])::INT as boss_kill_counts_max_15,
          MAX(boss_kill_counts[8])::INT as boss_kill_counts_max_16,
          MAX(boss_kill_counts[9])::INT as boss_kill_counts_max_21
        FROM 
          results 
        WHERE 
          results.start_time = TO_TIMESTAMP(${start_time})
      ) 
      SELECT 
        * 
      FROM 
        results;
    `;
  }

  private queryBuilderResults(start_time: number): PrismaPromise<JobResult[]> {
    return this.prisma.$queryRaw<JobResult[]>`
    WITH results AS (
      SELECT
      COUNT(is_clear=true OR null)::INT is_clear,
      COUNT(is_clear=false OR null)::INT is_failure,
      COUNT(failure_wave=1 AND failure_reason='wipe_out' OR null)::INT is_failure_wave1_wipe_out,
      COUNT(failure_wave=1 AND failure_reason='time_limit' OR null)::INT is_failure_wave1_time_limit,
      COUNT(failure_wave=2 AND failure_reason='wipe_out' OR null)::INT is_failure_wave2_wipe_out,
      COUNT(failure_wave=2 AND failure_reason='time_limit' OR null)::INT is_failure_wave2_time_limit,
      COUNT(failure_wave=3 AND failure_reason='wipe_out' OR null)::INT is_failure_wave3_wipe_out,
      COUNT(failure_wave=3 AND failure_reason='time_limit' OR null)::INT is_failure_wave3_time_limit
      FROM
      results
      INNER JOIN
      job_results
      ON
      results.salmon_id = job_results.salmon_id
      WHERE
      results.start_time = TO_TIMESTAMP(${start_time})
    )
    SELECT
    *
    FROM
    results;
    `;
  }

  private queryBuilderWaves(start_time: number): PrismaPromise<WaveResult[]> {
    return this.prisma.$queryRaw<WaveResult[]>`
    WITH results AS (
      SELECT
      MAX(waves.golden_ikura_num)::INT AS golden_ikura_num,
      MAX(waves.ikura_num)::INT AS ikura_num,
      water_level,
      event_type,
      COUNT(*)::INT
      FROM
      waves
      INNER JOIN
      results
      ON
      waves."resultId" = results.salmon_id
      WHERE
      results.start_time = TO_TIMESTAMP(${start_time})
      GROUP BY
      event_type,
      water_level
      ORDER BY
      water_level,
      event_type
    )   
    SELECT
    *   
    FROM
    results;
  `;
  }

  private queryBuilderWeapons(
    start_time: number,
    limit: number
  ): PrismaPromise<WeaponResult[]> {
    return this.prisma.$queryRaw<WeaponResult[]>`
    WITH results AS (
      SELECT
      DISTINCT supplied_weapon, MIN(job_id) AS job_id, nsaid, MIN(name) AS name
      FROM 
        (
        SELECT 
        * 
        FROM
            players 
            INNER JOIN results ON players."resultId" = results.salmon_id
        WHERE
        job_id IS NOT NULL
        AND start_time = TO_TIMESTAMP(${start_time})
        ) AS results,
      UNNEST(weapon_list) AS supplied_weapon
      GROUP BY
      supplied_weapon, nsaid
      ORDER BY
      nsaid
    )
    SELECT
    nsaid,
    MIN(name) AS name,
    MAX(job_id) - MIN(job_id) + 1 AS shifts_worked,
    COUNT(*)::INT AS supplied_weapon_counts,
    RANK() OVER(ORDER BY COUNT(*) DESC)::INT
    FROM 
    results
    GROUP BY
    nsaid
    ORDER BY
    rank,
    shifts_worked
    LIMIT ${limit}
    `;
  }

  private queryBuilderGrades(start_time: number): PrismaPromise<GradeResult[]> {
    return this.prisma.$queryRaw<GradeResult[]>`
    WITH results AS (
      SELECT
      nsaid,
      MIN(name) AS name,
      grade_point_max,
      job_id_first,
        (MIN(job_id) FILTER (WHERE grade_point = grade_point_max)) AS job_id_last
        FROM (        
          SELECT
          nsaid,
        name,
          grade_point,
          job_id,
          MAX(grade_point) OVER(PARTITION BY nsaid) AS grade_point_max,
          MIN(grade_point) OVER(PARTITION BY nsaid) AS grade_point_min,
        MIN(job_id) FILTER (WHERE grade_point <= 420) OVER(PARTITION BY nsaid) AS job_id_first
          FROM
          players
          INNER JOIN
          results
          ON
          players."resultId" = results.salmon_id
          WHERE
          start_time = TO_TIMESTAMP(${start_time})
          AND job_id IS NOT NULL
          ORDER BY
          nsaid,
          job_id
          ) AS results
        GROUP BY
        nsaid,
        grade_point_max,
      job_id_first
    )
    SELECT
    RANK() OVER(ORDER BY grade_point_max DESC, job_id_last - job_id_first)::INT,
    nsaid,
    name,
    grade_point_max,
    job_id_last - job_id_first + 1 AS shifts_worked
    FROM
    results
    ORDER BY
    rank,
    nsaid
    LIMIT 100;
    `;
  }

  async getStats(start_time: number): Promise<ShiftStats> {
    const data = await this.prisma.$transaction([
      this.queryBuilderResults(start_time),
      this.queryBuilder(start_time),
      this.queryBuilderWaves(start_time),
      this.queryBuilderWeapons(start_time, 100),
      this.queryBuilderGrades(start_time),
    ]);

    const members: string[] = [
      ...new Set(
        data[4]
          .map((member) => member.nsaid)
          .concat(data[3].map((member) => member.nsaid))
      ),
    ];
    // 画像情報を取得
    // 最高取得件数が200件なので一括で取得できるはず（多分100x4まで対応)
    const request = new NicknameAndIconRequestDto(members);
    const nicknameAndIcons: NicknameAndIcon[] = (
      await this.service.findMany(request)
    ).nickname_and_icons;

    // 評価ランキングのデータを上書き
    const getPlayerThumbnailURL = (nsaid: string): string | null => {
      const player = nicknameAndIcons.find((player) => player.nsa_id === nsaid);
      return player.thumbnail_url;
    };

    // 画像データの上書き
    const gradeResultMembers = data[4].map((member) => {
      const thumbnailURL = getPlayerThumbnailURL(member.nsaid);
      member['thumbnail_url'] = thumbnailURL;
      return member;
    });

    const weaponResultMembers = data[3].map((member) => {
      const thumbnailURL = getPlayerThumbnailURL(member.nsaid);
      member['thumbnail_url'] = thumbnailURL;
      return member;
    });

    // WAVEの情報を取得
    const getWaveResult = (
      water_level: number,
      event_type: number
    ): WaveResult => {
      const result: WaveResult = data[2].find(
        (wave) =>
          wave.water_level === water_level && wave.event_type === event_type
      );

      if (result === undefined) {
        return {
          golden_ikura_num: 0,
          ikura_num: 0,
          water_level: water_level,
          event_type: event_type,
          count: 0,
        };
      }
      return result;
    };

    const response: ShiftStats = {
      job_results: {
        is_clear: data[0][0].is_clear,
        is_failure: data[0][0].is_failure,
        failure_waves: [
          {
            failure_wave: 1,
            time_limit: data[0][0].is_failure_wave1_time_limit,
            wipe_out: data[0][0].is_failure_wave1_wipe_out,
          },
          {
            failure_wave: 2,
            time_limit: data[0][0].is_failure_wave2_time_limit,
            wipe_out: data[0][0].is_failure_wave2_wipe_out,
          },
          {
            failure_wave: 3,
            time_limit: data[0][0].is_failure_wave3_time_limit,
            wipe_out: data[0][0].is_failure_wave3_wipe_out,
          },
        ],
      },
      wave_results: [
        [
          getWaveResult(0, 0),
          null,
          null,
          null,
          getWaveResult(0, 4),
          getWaveResult(0, 5),
          getWaveResult(0, 6),
        ],
        [
          getWaveResult(1, 0),
          getWaveResult(1, 1),
          getWaveResult(1, 2),
          getWaveResult(1, 3),
          getWaveResult(1, 4),
          getWaveResult(1, 5),
          null,
        ],
        [
          getWaveResult(2, 0),
          getWaveResult(2, 1),
          getWaveResult(2, 2),
          getWaveResult(2, 3),
          getWaveResult(2, 4),
          getWaveResult(2, 5),
          null,
        ],
      ],
      boss_results: [
        {
          boss_counts: data[1][0].boss_counts_3,
          boss_kill_counts: data[1][0].boss_kill_counts_3,
          boss_counts_max: data[1][0].boss_counts_max_3,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_3,
        },
        {
          boss_counts: data[1][0].boss_counts_6,
          boss_kill_counts: data[1][0].boss_kill_counts_6,
          boss_counts_max: data[1][0].boss_counts_max_6,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_6,
        },
        {
          boss_counts: data[1][0].boss_counts_9,
          boss_kill_counts: data[1][0].boss_kill_counts_9,
          boss_counts_max: data[1][0].boss_counts_max_9,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_9,
        },
        {
          boss_counts: data[1][0].boss_counts_12,
          boss_kill_counts: data[1][0].boss_kill_counts_12,
          boss_counts_max: data[1][0].boss_counts_max_12,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_12,
        },
        {
          boss_counts: data[1][0].boss_counts_13,
          boss_kill_counts: data[1][0].boss_kill_counts_13,
          boss_counts_max: data[1][0].boss_counts_max_13,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_13,
        },
        {
          boss_counts: data[1][0].boss_counts_14,
          boss_kill_counts: data[1][0].boss_kill_counts_14,
          boss_counts_max: data[1][0].boss_counts_max_14,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_14,
        },
        {
          boss_counts: data[1][0].boss_counts_15,
          boss_kill_counts: data[1][0].boss_kill_counts_15,
          boss_counts_max: data[1][0].boss_counts_max_15,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_15,
        },
        {
          boss_counts: data[1][0].boss_counts_16,
          boss_kill_counts: data[1][0].boss_kill_counts_16,
          boss_counts_max: data[1][0].boss_counts_max_16,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_16,
        },
        {
          boss_counts: data[1][0].boss_counts_21,
          boss_kill_counts: data[1][0].boss_kill_counts_21,
          boss_counts_max: data[1][0].boss_counts_max_21,
          boss_kill_counts_max: data[1][0].boss_kill_counts_max_21,
        },
      ],
      weapon_results: weaponResultMembers,
      grade_results: gradeResultMembers,
    };

    return response;
  }
}
