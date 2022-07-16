import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserCreateInputDto } from '../dto/users.response';

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
              thumbnailURL: account.thumbnailURL,
              friendCode: account.friendCode,
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
        accounts: {
          connectOrCreate: request.accounts.map((account) => ({
            where: {
              nsaid: account.nsaid,
            },
            create: {
              nsaid: account.nsaid,
              nickname: account.nickname,
              thumbnailURL: account.thumbnailURL,
              friendCode: account.friendCode,
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
              thumbnailURL: account.thumbnailURL,
              friendCode: account.friendCode,
            },
          })),
        },
      },
    });
  }
}
