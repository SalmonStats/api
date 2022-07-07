import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

class Account {
  @ApiProperty({ default: '0000000000000000' })
  nsaid: string;

  @ApiProperty({ default: 'すたーらいとえむいー' })
  nickname: string;

  @ApiProperty({
    default:
      'https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/b007cfc98eed87c2',
  })
  thumbnailURL: string;

  @ApiProperty({ default: '0000-0000-0000' })
  friendCode: string;
}

export class UsersRequestDto {
  @ApiProperty({ default: '0000000000000000' })
  uid: string;

  @ApiProperty()
  account: Account;

  @ApiProperty({ default: 'みなかみはちみ' })
  name: string;

  @ApiProperty({ default: 'tkgling' })
  screenName: string;

  @ApiPropertyOptional({
    default:
      'https://pbs.twimg.com/profile_images/1544579876275245057/km4scupk_400x400.jpg',
  })
  @IsOptional()
  thumbnailURL?: string;
}
