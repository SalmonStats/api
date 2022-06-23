import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

class IkuraStat {
  @ApiProperty({ description: '金イクラ数' })
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  golden_ikura_num: number;

  @ApiProperty({ description: '赤イクラ数' })
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  ikura_num: number;

  @ApiProperty({ description: '被救助数' })
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  dead_count: number;

  @ApiProperty({ description: '救助数' })
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  help_count: number;
}

export class IkuraStats {
  @ApiProperty({ description: '最大値' })
  @Type(() => IkuraStat)
  max: IkuraStat;

  @ApiProperty({ description: '最小値' })
  @Type(() => IkuraStat)
  min: IkuraStat;

  @ApiProperty({ description: '平均値' })
  @Type(() => IkuraStat)
  avg: IkuraStat;

  @ApiProperty({ description: '回数' })
  @Transform((params) => params.value['all'])
  count: number;
}

class SingleResultDto {
  @ApiProperty({ type: IkuraStats, description: 'プレイヤー全体' })
  global: IkuraStats;

  @ApiPropertyOptional({
    type: IkuraStats,
    description: '指定プレイヤーとマッチングしたプレイヤー全体',
  })
  team: IkuraStats;

  @ApiPropertyOptional({ type: IkuraStats, description: '指定プレイヤー' })
  player?: IkuraStats;

  @ApiPropertyOptional({
    type: IkuraStats,
    description: '指定プレイヤーとマッチングした仲間',
  })
  crew?: IkuraStats;
}

class TotalResultDto {
  @ApiProperty({ type: [IkuraStats], description: '全体' })
  @Type(() => IkuraStats)
  global: IkuraStats[];

  @ApiProperty({
    type: [IkuraStats],
    description: '指定プレイヤーを含む',
  })
  @Type(() => IkuraStats)
  player?: IkuraStats[];
}

class JobResult {
  is_clear: {
    count: number;
  };
  is_failure: {
    count: number;
    failure_reason: {
      wipe_out: number[],
      time_limit: number[]
    };
  };
  golden_ikura_num: {
    avg: number;
    sum: number;
    sd: number;
  };
  ikura_num: {
    avg: number;
    sum: number;
    sd: number;
  };
}

export class LegacyStatsDto {
  job_result: JobResult
  boss_counts: {appearances: number, defeated: number}[]
}

export class StatsResultsDto {
  @ApiProperty({ type: TotalResultDto, description: 'WAVE記録(チーム単位)' })
  @Type(() => TotalResultDto)
  waves: TotalResultDto;

  @ApiProperty({ type: TotalResultDto, description: '総合記録(チーム単位)' })
  @Type(() => TotalResultDto)
  total: TotalResultDto;

  @ApiProperty({
    type: SingleResultDto,
    description: '個人記録(プレイヤー単位)',
  })
  @Type(() => SingleResultDto)
  single: SingleResultDto;

  @ApiProperty({
    type: LegacyStatsDto,
    description: '総合統計(旧Stats統計)',
  })
  @Type(() => LegacyStatsDto)
  stats: LegacyStatsDto;
}
