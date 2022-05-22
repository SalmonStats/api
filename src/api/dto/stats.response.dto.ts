import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

class Stat {
  max: number;
  min: number;
  avg: number;
}

class IkuraStat {
  @ApiProperty()
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  golden_ikura_num: number;

  @ApiProperty()
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  ikura_num: number;

  @ApiProperty()
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  dead_count: number;

  @ApiProperty()
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  help_count: number;
}

export class IkuraStats {
  @ApiProperty()
  @Type(() => IkuraStat)
  max: IkuraStat;

  @ApiProperty()
  @Type(() => IkuraStat)
  min: IkuraStat;

  @ApiProperty()
  @Type(() => IkuraStat)
  avg: IkuraStat;

  @ApiProperty()
  @Transform((params) => params.value['all'])
  count: number;
}

class SingleResultDto {
  // 全員の記録
  @ApiProperty()
  global: IkuraStats;

  // 自チームの平均記録
  @ApiProperty()
  team: IkuraStats;

  // 自分の記録
  @ApiPropertyOptional()
  player?: IkuraStats;

  // マッチングした仲間の記録
  @ApiPropertyOptional()
  crew?: IkuraStats;
}

class TotalResultDto {
  // 全員の記録
  @ApiProperty()
  global: IkuraStats[];

  // 自チームの平均記録
  @ApiProperty()
  player?: IkuraStats[];
}

export class StatsResultsDto {
  @ApiProperty()
  @Type(() => TotalResultDto)
  waves: TotalResultDto;

  @ApiProperty()
  @Type(() => TotalResultDto)
  total: TotalResultDto;

  @ApiProperty()
  @Type(() => SingleResultDto)
  single: SingleResultDto;
}
