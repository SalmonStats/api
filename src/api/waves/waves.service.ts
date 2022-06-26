import { Injectable } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

export interface TotalResponse {
  total: Total[][]
  waves: Total[][][]
}

export interface Total {
  water_level?: number;
  event_type?: number;
  nightless?: boolean;
  golden_ikura_num: number;
  rank: number;
  members: string[];
}

@Injectable()
export class WavesService {
  constructor(private readonly prisma: PrismaService) {}

  queryBuilder(
    start_time: number,
    water_level: number,
    event_type: number,
    limit: number
  ) : PrismaPromise<Total[]>{
    return this.prisma.$queryRaw<Total[]>`
    WITH waves AS (
      SELECT
        water_level,
        event_type,
        golden_ikura_num,
        RANK() OVER(ORDER BY golden_ikura_num DESC)::INT,
        ARRAY_AGG(name) AS names,
        members
      FROM (
        SELECT
          waves.id,
          waves.golden_ikura_num,
          waves.event_type,
          waves.water_level,
          players.name,
          players.nsaid,
          results.start_time,
          results.members
        FROM (
          SELECT
            *
          FROM waves
          WHERE
            event_type = ${event_type}
            AND water_level = ${water_level}
            AND is_clear = true
          ) AS waves
          INNER JOIN players ON waves."resultId" = players."resultId"
          INNER JOIN results ON waves."resultId" = results.salmon_id
        WHERE
          start_time = TO_TIMESTAMP(${start_time})
      ) AS waves
      GROUP BY
        start_time,
        event_type,
        water_level,
        golden_ikura_num,
        members
      ORDER BY golden_ikura_num DESC
      LIMIT ${limit}
    )
    SELECT
      *
    FROM
      waves;
    `;
  }

  queryBuilderTotal(start_time: number, nightLess: boolean, limit: number, threshold: number): PrismaPromise<Total[]> {
    return this.prisma.$queryRaw<Total[]>`
      WITH results AS (
        SELECT 
          MAX(golden_ikura_num), 
          RANK() OVER(
            ORDER BY 
              MAX(golden_ikura_num) DESC
          ):: INT, 
          no_night_waves, 
          members, 
          names 
        FROM 
          (
            SELECT 
              results.salmon_id, 
              results.golden_ikura_num, 
              results.no_night_waves, 
              results.members, 
              (
                SELECT 
                  ARRAY_AGG(name) 
                FROM 
                  (
                    SELECT 
                      UNNEST(
                        ARRAY_AGG(players.name)
                      ) AS name 
                    ORDER BY 
                      name
                  ) AS name
              ) AS names 
            FROM 
              results 
              INNER JOIN players ON results.salmon_id = players."resultId" 
            WHERE 
              results.start_time = TO_TIMESTAMP(${start_time}) 
              AND results.no_night_waves = ${nightLess}
              AND results.golden_ikura_num >= ${threshold}
            GROUP BY 
              results.salmon_id, 
              results.golden_ikura_num, 
              results.no_night_waves, 
              results.members 
            ORDER BY 
              results.golden_ikura_num DESC
          ) AS results 
        GROUP BY 
          results.no_night_waves, 
          results.members, 
          results.names 
        LIMIT 
          ${limit}
      ) 
      SELECT 
        * 
      FROM 
        results;
    `;
  }

  async findWaves(
    startTime: number,
  ): Promise<TotalResponse> {
    const total: Total[][] = await this.prisma.$transaction([
      this.queryBuilderTotal(startTime, false, 100, 130),
      this.queryBuilderTotal(startTime, true, 100, 120),
    ])

    const waves: Total[][] = await this.prisma.$transaction([
      this.queryBuilder(startTime, 0, 0, 100),
      this.queryBuilder(startTime, 1, 0, 100),
      this.queryBuilder(startTime, 2, 0, 100),
      this.queryBuilder(startTime, 1, 1, 25),
      this.queryBuilder(startTime, 2, 1, 25),
      this.queryBuilder(startTime, 1, 2, 25),
      this.queryBuilder(startTime, 2, 2, 25),
      this.queryBuilder(startTime, 1, 3, 25),
      this.queryBuilder(startTime, 2, 3, 25),
      this.queryBuilder(startTime, 0, 4, 25),
      this.queryBuilder(startTime, 1, 4, 25),
      this.queryBuilder(startTime, 2, 4, 25),
      this.queryBuilder(startTime, 0, 5, 25),
      this.queryBuilder(startTime, 1, 5, 25),
      this.queryBuilder(startTime, 2, 5, 25),
      this.queryBuilder(startTime, 0, 6, 25),
    ]);

    return {
      total: [
        total[0],
        total[1]
      ],
      waves: [
        [
          waves[0],
          null,
          null,
          null,
          waves[11],
          waves[14],
          waves[15],
        ],
        [
          waves[1],
          waves[3],
          waves[5],
          waves[7],
          waves[10],
          waves[13],
          null
        ],
        [
          waves[2],
          waves[4],
          waves[6],
          waves[8],
          waves[9],
          waves[12],
          null
        ],
      ]
    };
  }
}
