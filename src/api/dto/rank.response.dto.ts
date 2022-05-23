import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

class Ikura {
  @ApiProperty()
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  golden_ikura_num: number;

  @ApiProperty()
  @Transform((params) => Number(parseFloat(params.value).toFixed(3)))
  ikura_num: number;
}

export class RankResponseDto {
  @ApiProperty()
  @Type(() => Ikura)
  max: Ikura;

  @ApiProperty()
  @Type(() => Ikura)
  min: Ikura;

  @ApiProperty()
  @Type(() => Ikura)
  avg: Ikura;

  @ApiProperty()
  @Transform((params) => params.value['all'])
  count: number;
}

// export class RankResultDto {
//   @ApiProperty()
//   @Type(() => RankDto)
//   total: RankDto[];

//   @ApiProperty()
//   @Type(() => RankDto)
//   waves: RankDto[];
// }
