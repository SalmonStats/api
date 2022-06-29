import { Prisma, PrismaPromise } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService} from 'src/prisma.service';

export interface ShiftStats {
  job_results: {
    is_clear: number
    is_failure: number;
    failure_waves: FailureReason[]
  };
  wave_results: WaveResult[][];
  boss_counts: number[];
  boss_counts_max: number[];
  boss_kill_counts: number[];
  boss_kill_counts_max: number[];
}

export interface FailureReason {
  failure_wave: number
  time_limit: number
  wipe_out: number
}

export interface Salmonid {
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

export interface JobResult {
  is_clear: number
  is_failure: number
  is_failure_wave1_wipe_out: number
  is_failure_wave1_time_limit: number
  is_failure_wave2_wipe_out: number
  is_failure_wave2_time_limit: number
  is_failure_wave3_wipe_out: number
  is_failure_wave3_time_limit: number
}

export interface WaveResult {
  golden_ikura_num: number;
  ikura_num: number;
  water_level: number;
  event_type: number;
  count: number
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

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
          MAX(boss_counts[1]) as boss_counts_max_3,
          MAX(boss_counts[2]) as boss_counts_max_6,
          MAX(boss_counts[3]) as boss_counts_max_9,
          MAX(boss_counts[4]) as boss_counts_max_12,
          MAX(boss_counts[5]) as boss_counts_max_13,
          MAX(boss_counts[6]) as boss_counts_max_14,
          MAX(boss_counts[7]) as boss_counts_max_15,
          MAX(boss_counts[8]) as boss_counts_max_16,
          MAX(boss_counts[9]) as boss_counts_max_21,
          MAX(boss_kill_counts[1]) as boss_kill_counts_max_3,
          MAX(boss_kill_counts[2]) as boss_kill_counts_max_6,
          MAX(boss_kill_counts[3]) as boss_kill_counts_max_9,
          MAX(boss_kill_counts[4]) as boss_kill_counts_max_12,
          MAX(boss_kill_counts[5]) as boss_kill_counts_max_13,
          MAX(boss_kill_counts[6]) as boss_kill_counts_max_14,
          MAX(boss_kill_counts[7]) as boss_kill_counts_max_15,
          MAX(boss_kill_counts[8]) as boss_kill_counts_max_16,
          MAX(boss_kill_counts[9]) as boss_kill_counts_max_21
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

  private queryBuilderResults(start_time: number): PrismaPromise<JobResult[]>{
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
      MAX(waves.golden_ikura_num) AS golden_ikura_num,
      MAX(waves.ikura_num) AS ikura_num,
      water_level,
      event_type,
      COUNT(*)
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

  async getStats(start_time: number): Promise<ShiftStats> {
    const data = await this.prisma.$transaction([
      this.queryBuilderResults(start_time),
      this.queryBuilder(start_time),
      this.queryBuilderWaves(start_time),
    ])

    const getWaveResult = (water_level: number, event_type: number): WaveResult => {
      const result: WaveResult = data[2].find(wave => wave.water_level === water_level && wave.event_type === event_type);

      if (result === undefined) {
        return {
          golden_ikura_num: 0,
          ikura_num: 0,
          water_level: water_level,
          event_type: event_type,
          count: 0
        }
      }
      return result
    }

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
          }
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
          null
        ],
        [
          getWaveResult(2, 0),
          getWaveResult(2, 1),
          getWaveResult(2, 2),
          getWaveResult(2, 3),
          getWaveResult(2, 4),
          getWaveResult(2, 5),
          null
        ]
      ],
      boss_counts: [
        data[1][0].boss_counts_3,
        data[1][0].boss_counts_6,
        data[1][0].boss_counts_9,
        data[1][0].boss_counts_12,
        data[1][0].boss_counts_13,
        data[1][0].boss_counts_14,
        data[1][0].boss_counts_15,
        data[1][0].boss_counts_16,
        data[1][0].boss_counts_21,
      ],
      boss_kill_counts: [
        data[1][0].boss_kill_counts_3,
        data[1][0].boss_kill_counts_6,
        data[1][0].boss_kill_counts_9,
        data[1][0].boss_kill_counts_12,
        data[1][0].boss_kill_counts_13,
        data[1][0].boss_kill_counts_14,
        data[1][0].boss_kill_counts_15,
        data[1][0].boss_kill_counts_16,
        data[1][0].boss_kill_counts_21,
      ],
      boss_counts_max: [
        data[1][0].boss_counts_max_3,
        data[1][0].boss_counts_max_6,
        data[1][0].boss_counts_max_9,
        data[1][0].boss_counts_max_12,
        data[1][0].boss_counts_max_13,
        data[1][0].boss_counts_max_14,
        data[1][0].boss_counts_max_15,
        data[1][0].boss_counts_max_16,
        data[1][0].boss_counts_max_21,
      ],
      boss_kill_counts_max: [
        data[1][0].boss_kill_counts_max_3,
        data[1][0].boss_kill_counts_max_6,
        data[1][0].boss_kill_counts_max_9,
        data[1][0].boss_kill_counts_max_12,
        data[1][0].boss_kill_counts_max_13,
        data[1][0].boss_kill_counts_max_14,
        data[1][0].boss_kill_counts_max_15,
        data[1][0].boss_kill_counts_max_16,
        data[1][0].boss_kill_counts_max_21,
      ],
    };

    return response;
  }
}
