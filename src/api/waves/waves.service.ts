import { Injectable } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

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

  private queryBuilder(
    start_time: number,
    water_level: number,
    event_type: number,
    limit: number
  ): PrismaPromise<Total[]> {
    return this.prisma.$queryRaw<Total[]>`
      WITH results AS (
        SELECT 
          MAX(golden_ikura_num) AS golden_ikura_num, 
          RANK() OVER(
            ORDER BY 
              MAX(golden_ikura_num) DESC
          ):: INT, 
          members, 
          names 
        FROM 
          (
            SELECT 
              results.salmon_id, 
              waves.golden_ikura_num, 
              waves.event_type, 
              waves.water_level, 
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
              waves 
              INNER JOIN players ON waves."resultId" = players."resultId" 
              INNER JOIN results ON waves."resultId" = results.salmon_id 
            WHERE 
              results.start_time = TO_TIMESTAMP(${start_time}) 
              AND waves.event_type = ${event_type}
              AND waves.water_level = ${water_level}
              AND waves.golden_ikura_num >= 40
            GROUP BY 
              results.salmon_id, 
              waves.wave_id, 
              waves.golden_ikura_num, 
              waves.event_type, 
              waves.water_level, 
              results.members 
            ORDER BY 
              results.golden_ikura_num DESC
          ) AS results 
        GROUP BY 
          results.event_type, 
          results.water_level, 
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

  find(
    startTime: number,
    event_type: number,
    water_level: number,
    limit: number = 25
  ): Promise<Total[]> {
    return this.queryBuilder(startTime, water_level, event_type, limit);
  }
}
