import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class RankResult {
  @ApiPropertyOptional({ description: 'リザルトID' })
  salmon_id: number;

  @ApiProperty({ description: 'ランク' })
  rank: number;

  @ApiProperty({ description: '金イクラ数' })
  golden_ikura_num: number;

  @ApiProperty({ description: '赤イクラ数' })
  ikura_num: number;

  @ApiPropertyOptional({
    type: [String],
    example: [
      '0000000000000000',
      '1111111111111111',
      '2222222222222222',
      '3333333333333333',
    ],
    description: 'チームメンバー(ソート済み)',
  })
  members: string[];
}

export class RankIkura {
  @ApiProperty({ type: RankResult, description: '金イクラランキング' })
  golden_ikura_num: number;

  @ApiProperty({ type: RankResult, description: '赤イクラランキング' })
  ikura_num: number;

  @ApiPropertyOptional({ description: '回数' })
  count?: number;
}

export class RankIkuras {
  @ApiProperty({ type: RankResult, description: '金イクラランキング' })
  golden_ikura_num: RankResult[];

  @ApiProperty({ type: RankResult, description: '赤イクラランキング' })
  ikura_num: RankResult[];

  @ApiPropertyOptional({ description: '回数' })
  count?: number;
}

/**
 * Aggregate
 */
export class RankDetail {
  @ApiProperty()
  @Type(() => RankIkura)
  max: RankIkura;

  @ApiProperty()
  @Type(() => RankIkura)
  min: RankIkura;

  @ApiProperty()
  @Type(() => RankIkura)
  avg: RankIkura;

  @ApiProperty()
  @Transform((params) => params.value['all'])
  count: number;
}

export class RankWaveEventHigh {
  @ApiProperty({ type: RankResult })
  'water-levels': RankResult;
  @ApiProperty({ type: RankResult })
  rush: RankResult;
  @ApiProperty({ type: RankResult })
  'goldie-seeking': RankResult;
  @ApiProperty({ type: RankResult })
  griller: RankResult;
  @ApiProperty({ type: RankResult })
  'the-mothership': RankResult;
  @ApiProperty({ type: RankResult })
  fog: RankResult;
}

export class RankWaveEventNormal {
  @ApiProperty({ type: RankResult })
  'water-levels': RankResult;
  @ApiProperty({ type: RankResult })
  rush: RankResult;
  @ApiProperty({ type: RankResult })
  'goldie-seeking': RankResult;
  @ApiProperty({ type: RankResult })
  griller: RankResult;
  @ApiProperty({ type: RankResult })
  'the-mothership': RankResult;
  @ApiProperty({ type: RankResult })
  fog: RankResult;
}

export class RankWaveEventLow {
  @ApiProperty({ type: RankResult })
  'water-levels': RankResult;
  @ApiProperty({ type: RankResult })
  'the-mothership': RankResult;
  @ApiProperty({ type: RankResult })
  fog: RankResult;
  @ApiProperty({ type: RankResult })
  'cohock-charge': RankResult;
}

export class RankWave {
  @ApiProperty({ type: RankWaveEventHigh })
  high: RankWaveEventHigh;
  @ApiProperty({ type: RankWaveEventNormal })
  normal: RankWaveEventNormal;
  @ApiProperty({ type: RankWaveEventLow })
  low: RankWaveEventLow;
}

class RankTotal {
  @ApiProperty({ type: RankIkura, description: '夜イベントを含む' })
  @Type(() => RankIkura)
  all: RankIkuras;

  @ApiProperty({ type: RankIkura, description: '夜イベントを含まない' })
  @Type(() => RankIkura)
  no_night_waves: RankIkuras;
}

class RankTotals {
  @ApiProperty({ type: RankIkura, description: '夜イベントを含む' })
  @Type(() => RankIkura)
  all: RankIkuras;

  @ApiProperty({ type: RankIkura, description: '夜イベントを含まない' })
  @Type(() => RankIkura)
  no_night_waves: RankIkuras;
}

export class Rank {
  @ApiProperty({ type: RankTotal, description: '総合記録ランク' })
  total: RankTotal;

  @ApiProperty({ type: RankWave, description: 'WAVE記録ランク' })
  waves: RankWave;
}
