import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Schedule {
  @ApiProperty()
  start_time: Date;

  @ApiProperty()
  end_time: Date;

  @ApiProperty()
  stage_id: number;

  @ApiProperty()
  weapon_list: number[];

  @ApiPropertyOptional()
  rare_weapon: number;
}
