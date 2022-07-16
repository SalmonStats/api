import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserCreateInputDto } from '../dto/users.response';
import crypto from 'crypto';

export interface UserRole {
  nsaid: string;
  is_clear: number;
  is_failure: number;
  job_id: number;
  is_imperial_scholars: boolean;
  is_verified: boolean;
  is_friend_code_public: boolean;
  is_twitter_id_public: boolean;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // アカウント連携
  update(request: UserCreateInputDto): Promise<User> {
    // 指定されたユーザーIDのアカウントを追加
    return this.prisma.user.update({
      where: {
        uid: request.uid,
      },
      data: {
        accounts: {
          connectOrCreate: request.accounts.map((account) => ({
            where: {
              nsaid: account.nsaid,
            },
            create: {
              nsaid: account.nsaid,
              nickname: account.nickname,
              thumbnailURL: account.thumbnail_url,
              friendCode: account.friend_code,
            },
          })),
        },
      },
    });
  }

  // アカウント作成
  create(request: UserCreateInputDto): Promise<User> {
    return this.prisma.user.upsert({
      where: {
        uid: request.uid,
      },
      include: {
        accounts: true,
      },
      create: {
        uid: request.uid,
        name: request.display_name,
        screenName: request.screen_name,
        thumbnailURL: request.thumbnail_url,
        accessToken: crypto
          .createHash('sha256')
          .update(request.uid)
          .digest('hex'),
        accounts: {
          connectOrCreate: request.accounts.map((account) => ({
            where: {
              nsaid: account.nsaid,
            },
            create: {
              nsaid: account.nsaid,
              nickname: account.nickname,
              thumbnailURL: account.thumbnail_url,
              friendCode: account.friend_code,
            },
          })),
        },
      },
      update: {
        name: request.display_name,
        screenName: request.screen_name,
        thumbnailURL: request.thumbnail_url,
        accounts: {
          connectOrCreate: request.accounts.map((account) => ({
            where: {
              nsaid: account.nsaid,
            },
            create: {
              nsaid: account.nsaid,
              nickname: account.nickname,
              thumbnailURL: account.thumbnail_url,
              friendCode: account.friend_code,
            },
          })),
        },
      },
    });
  }
}
