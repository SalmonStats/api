import { User as UserModel } from '.prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaginatedRequestDto } from '../dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: PaginatedRequestDto): Promise<UserModel[]> {
    return await this.prisma.user.findMany({
      skip: query.offset,
      take: query.limit,
    });
  }

  async find(nsaid: number): Promise<UserModel> {
    return await this.prisma.user
      .findUnique({
        where: {
          id: nsaid,
        },
        rejectOnNotFound: true,
      })
      .catch((error) => {
        throw new NotFoundException();
      });
  }
}
