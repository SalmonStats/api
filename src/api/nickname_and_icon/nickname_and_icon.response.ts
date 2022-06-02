import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

class NicknameAndIcon {
  @IsString()
  @ApiProperty()
  nickname: string;

  @IsString()
  @ApiProperty()
  nsa_id: string;

  @IsString()
  @ApiProperty()
  thumbnail_url: string;
}

export class NicknameAndIconResponseDto {
  @ApiProperty({ type: [NicknameAndIcon] })
  @Type(() => NicknameAndIcon)
  nickname_and_icons: NicknameAndIcon[];
}
