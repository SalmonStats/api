import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

class AccountCreateInputDto {
  @ApiProperty({ default: '0000000000000000', description: 'プレイヤーID' })
  nsaid: string;

  @ApiProperty({ default: 'すたーらいとえむいー' })
  nickname: string;

  @ApiProperty({
    default:
      'https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/b007cfc98eed87c2',
    description: 'プロフィール画像',
  })
  thumbnailURL: string;

  @ApiProperty({ default: '0000-0000-0000', description: 'フレンドコード' })
  friendCode: string;
}

export class UsersRequestDto {
  @ApiProperty({ default: '0000000000000000', description: 'プレイヤーID' })
  uid: string;

  @ApiProperty({ description: 'アカウント' })
  @ValidateNested({ each: true })
  @Type(() => AccountCreateInputDto)
  account: AccountCreateInputDto[];

  @ApiProperty({
    default: 'みなかみはちみ',
    description: 'ツイッターアカウント名',
  })
  name: string;

  @ApiProperty({
    default: 'tkgling',
    description: 'ツイッターアカウントID',
  })
  screenName: string;

  @ApiPropertyOptional({
    default:
      'https://pbs.twimg.com/profile_images/1544579876275245057/km4scupk_400x400.jpg',
    description: 'ツイッタープロフィール画像',
  })
  @IsOptional()
  thumbnailURL?: string;
}
