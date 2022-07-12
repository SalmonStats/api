import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserCreateInputDto } from '../dto/users.response';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(request: UserCreateInputDto) {
    // return this.prisma.user.upsert({
    //   where: {
    //     uid: request.uid,
    //   },
    //   create: {
    //     uid: request.uid,
    //     name: request.display_name,
    //     screenName: request.screen_name,
    //     thumbnailURL: request.photoURL,
    //   },
    //   update: {
    //     name: request.display_name,
    //     screenName: request.screen_name,
    //     thumbnailURL: request.photoURL,
    //   },
    // });
  }
}
