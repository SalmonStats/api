import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

export class AccountCreateInputDto {
  @ApiProperty({ description: 'ユーザーID', example: '91d160aa84e88da6' })
  @IsString()
  nsaid: string;

  @ApiProperty({ description: 'ユーザー名', example: 'みなかみはちみ' })
  @IsString()
  nickname: string;

  @ApiProperty({
    description: 'ユーザーアカウント画像',
    example:
      'https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/d246b279e0125831',
  })
  @IsString()
  thumbnailURL: string;

  @ApiProperty({
    description: 'フレンドコード',
    example: '0123-4567-8910',
  })
  @IsString()
  friendCode: string;
}

export class UserConnectInputDto {
  @ApiProperty({
    description: 'Twitter固有ID',
    example: 'u0ucwsTlP6b2EJNAOZWLKSMbybd2',
  })
  @IsString()
  uid: string;

  @ApiProperty({
    type: [AccountCreateInputDto],
    description: 'ニンテンドースイッチアカウント',
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => AccountCreateInputDto)
  accounts: AccountCreateInputDto[];
}

export class UserCreateInputDto {
  @ApiProperty({
    description: 'Twitterアカウント名',
    example: 'すたーらいとあーにゃ',
  })
  @IsString()
  display_name: string;

  @ApiProperty({ description: 'TwitterID', example: '@tkgling' })
  @IsString()
  screen_name: string;

  @ApiProperty({
    description: 'Twitter画像',
    example:
      'https://pbs.twimg.com/profile_images/1544579876275245057/km4scupk_normal.jpg',
  })
  @IsString()
  thumbnail_url: string;

  @ApiProperty({
    description: 'Twitter固有ID',
    example: 'u0ucwsTlP6b2EJNAOZWLKSMbybd2',
  })
  @IsString()
  uid: string;

  @ApiProperty({
    type: [AccountCreateInputDto],
    description: 'ニンテンドースイッチアカウント',
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => AccountCreateInputDto)
  accounts: AccountCreateInputDto[];
}
