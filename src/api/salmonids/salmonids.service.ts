import { Injectable } from '@nestjs/common';
import { PrismaPromise, Wave } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

export interface SalmonidTotal {
  job_results: {
    is_clear: number
    is_failure: number
    failure_wave: {
      time_limit: number,
      wipe_out: number
    }[]
  }
  wave_results: WaveResult[]
  boss_counts: number[]
  boss_counts_max: number[]
  boss_kill_counts: number[]
  boss_kill_counts_max: number[]
}

interface Salmonid {
  boss_counts_3: number
  boss_counts_6: number
  boss_counts_9: number
  boss_counts_12: number
  boss_counts_13: number
  boss_counts_14: number
  boss_counts_15: number
  boss_counts_16: number
  boss_counts_21: number
  boss_counts_max_3: number
  boss_counts_max_6: number
  boss_counts_max_9: number
  boss_counts_max_12: number
  boss_counts_max_13: number
  boss_counts_max_14: number
  boss_counts_max_15: number
  boss_counts_max_16: number
  boss_counts_max_21: number
  boss_kill_counts_3: number
  boss_kill_counts_6: number
  boss_kill_counts_9: number
  boss_kill_counts_12: number
  boss_kill_counts_13: number
  boss_kill_counts_14: number
  boss_kill_counts_15: number
  boss_kill_counts_16: number
  boss_kill_counts_21: number
  boss_kill_counts_max_3: number
  boss_kill_counts_max_6: number
  boss_kill_counts_max_9: number
  boss_kill_counts_max_12: number
  boss_kill_counts_max_13: number
  boss_kill_counts_max_14: number
  boss_kill_counts_max_15: number
  boss_kill_counts_max_16: number
  boss_kill_counts_max_21: number
}

interface JobResult {
  failure_wave: number
  failure_reason: string
  is_clear: boolean
  count: number
}

interface WaveResult {
  golden_ikura_num: number
  ikura_num: number
  water_level: number
  event_type: number
}


@Injectable()
export class SalmonidsService {
  constructor(private readonly prisma: PrismaService) { }
  
  private queryBuilder(start_time: number): PrismaPromise<Salmonid> {
    return this.prisma.$queryRaw`
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

  private queryBuilderResults(start_time: number): PrismaPromise<JobResult[]> {
    return this.prisma.$queryRaw`
    WITH results AS (
      SELECT
      failure_reason,
      failure_wave,
      is_clear,
      COUNT(*)::INT
      FROM
      results
      INNER JOIN
      job_results
      ON
      results.salmon_id = job_results.salmon_id
      WHERE
      results.start_time = TO_TIMESTAMP(${start_time})
      GROUP BY
      failure_reason,
      failure_wave,
      is_clear
    )
    SELECT
    *
    FROM
    results
    ORDER BY
    failure_wave;
    `;
  }

  private queryBuilderWaves(start_time: number): PrismaPromise<WaveResult[]> {
    return this.prisma.$queryRaw`
    WITH results AS (
      SELECT
      MAX(waves.golden_ikura_num) AS golden_ikura_num,
      MAX(waves.ikura_num) AS ikura_num,
      water_level,
      event_type
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

  async find(start_time: number): Promise<SalmonidTotal> {
    const response = await this.prisma.$transaction([
      this.queryBuilder(start_time),
      this.queryBuilderResults(start_time),
      this.queryBuilderWaves(start_time)
    ])
    
    return {
      job_results: {
        is_clear: response[1].filter((x) => x.is_clear === true)[0].count,
        is_failure: response[1]
          .filter((x) => x.is_clear === false)
          .reduce((acc, cur) => acc + cur.count, 0),
        failure_wave: [
          {
            time_limit: response[1].filter(
              (x) => x.failure_reason === 'time_limit' && x.failure_wave == 1
            )[0].count,
            wipe_out: response[1].filter(
              (x) => x.failure_reason === 'wipe_out' && x.failure_wave == 1
            )[0].count,
          },
          {
            time_limit: response[1].filter(
              (x) => x.failure_reason === 'time_limit' && x.failure_wave == 2
            )[0].count,
            wipe_out: response[1].filter(
              (x) => x.failure_reason === 'wipe_out' && x.failure_wave == 2
            )[0].count,
          },
          {
            time_limit: response[1].filter(
              (x) => x.failure_reason === 'time_limit' && x.failure_wave == 3
            )[0].count,
            wipe_out: response[1].filter(
              (x) => x.failure_reason === 'wipe_out' && x.failure_wave == 3
            )[0].count,
          },
        ],
      },
      wave_results: response[2],
      boss_counts: [
        response[0][0].boss_counts_3,
        response[0][0].boss_counts_6,
        response[0][0].boss_counts_9,
        response[0][0].boss_counts_12,
        response[0][0].boss_counts_13,
        response[0][0].boss_counts_14,
        response[0][0].boss_counts_15,
        response[0][0].boss_counts_16,
        response[0][0].boss_counts_21,
      ],
      boss_kill_counts: [
        response[0][0].boss_kill_counts_3,
        response[0][0].boss_kill_counts_6,
        response[0][0].boss_kill_counts_9,
        response[0][0].boss_kill_counts_12,
        response[0][0].boss_kill_counts_13,
        response[0][0].boss_kill_counts_14,
        response[0][0].boss_kill_counts_15,
        response[0][0].boss_kill_counts_16,
        response[0][0].boss_kill_counts_21,
      ],
      boss_counts_max: [
        response[0][0].boss_counts_max_3,
        response[0][0].boss_counts_max_6,
        response[0][0].boss_counts_max_9,
        response[0][0].boss_counts_max_12,
        response[0][0].boss_counts_max_13,
        response[0][0].boss_counts_max_14,
        response[0][0].boss_counts_max_15,
        response[0][0].boss_counts_max_16,
        response[0][0].boss_counts_max_21,
      ],
      boss_kill_counts_max: [
        response[0][0].boss_kill_counts_max_3,
        response[0][0].boss_kill_counts_max_6,
        response[0][0].boss_kill_counts_max_9,
        response[0][0].boss_kill_counts_max_12,
        response[0][0].boss_kill_counts_max_13,
        response[0][0].boss_kill_counts_max_14,
        response[0][0].boss_kill_counts_max_15,
        response[0][0].boss_kill_counts_max_16,
        response[0][0].boss_kill_counts_max_21,
      ],
    };
  }
}
