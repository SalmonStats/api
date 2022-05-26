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

export class RankIkura<T> {
  @ApiProperty({ type: RankResult, description: '金イクラランキング' })
  golden_ikura_num: T;

  @ApiProperty({ type: RankResult, description: '赤イクラランキング' })
  ikura_num: T;

  @ApiPropertyOptional({ description: '回数' })
  count?: number;
}

/**
 * Aggregate
 */
export class RankDetail {
  @ApiProperty()
  @Type(() => RankIkura)
  max: RankIkura<number>;

  @ApiProperty()
  @Type(() => RankIkura)
  min: RankIkura<number>;

  @ApiProperty()
  @Type(() => RankIkura)
  avg: RankIkura<number>;

  @ApiProperty()
  @Transform((params) => params.value['all'])
  count: number;
}

export class RankWaveEventHigh<T> {
  @ApiProperty({ type: RankResult })
  'water-levels': T;
  @ApiProperty({ type: RankResult })
  rush?: T;
  @ApiProperty({ type: RankResult })
  'goldie-seeking'?: T;
  @ApiProperty({ type: RankResult })
  griller?: T;
  @ApiProperty({ type: RankResult })
  'the-mothership': T;
  @ApiProperty({ type: RankResult })
  fog: T;
}

export class RankWaveEventNormal<T> {
  @ApiProperty({ type: RankResult })
  'water-levels': T;
  @ApiProperty({ type: RankResult })
  rush?: T;
  @ApiProperty({ type: RankResult })
  'goldie-seeking'?: T;
  @ApiProperty({ type: RankResult })
  griller?: T;
  @ApiProperty({ type: RankResult })
  'the-mothership': T;
  @ApiProperty({ type: RankResult })
  fog: T;
}

export class RankWaveEventLow<T> {
  @ApiProperty({ type: RankResult })
  'water-levels': T;
  @ApiProperty({ type: RankResult })
  'the-mothership': T;
  @ApiProperty({ type: RankResult })
  fog: T;
  @ApiProperty({ type: RankResult })
  'cohock-charge': T;
}

export class RankWave<T> {
  @ApiProperty({ type: RankWaveEventHigh })
  high: RankWaveEventHigh<T>;
  @ApiProperty({ type: RankWaveEventNormal })
  normal: RankWaveEventNormal<T>;
  @ApiProperty({ type: RankWaveEventLow })
  low: RankWaveEventLow<T>;
}

class RankTotal<T> {
  @ApiProperty({ type: RankIkura, description: '夜イベントを含む' })
  @Type(() => RankIkura)
  all: RankIkura<T>;

  @ApiProperty({ type: RankIkura, description: '夜イベントを含まない' })
  @Type(() => RankIkura)
  no_night_waves: RankIkura<T>;
}

export class Rank<T> {
  @ApiProperty({ type: RankTotal, description: '総合記録ランク' })
  total: RankTotal<T>;

  @ApiProperty({ type: RankWave, description: 'WAVE記録ランク' })
  waves: RankWave<T>;
}
