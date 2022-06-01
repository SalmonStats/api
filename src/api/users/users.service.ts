import { User as UserModel } from '.prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Expose, plainToClass, Transform } from 'class-transformer';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import { PaginatedRequestDto } from '../dto/pagination.dto';
import { Result } from '../dto/result.response.dto';

export class UserData {
  @Expose()
  @Transform((params) => params.obj['count']['all'])
  job_id: number;

  @Expose()
  @Transform((params) => params.obj['sum']['golden_ikura_num'])
  golden_ikura_num: number;

  @Expose()
  @Transform((params) => params.obj['sum']['ikura_num'])
  ikura_num: number;

  @Expose()
  @Transform((params) => params.obj['sum']['dead_count'])
  dead_count: number;

  @Expose()
  @Transform((params) => params.obj['sum']['kuma_point'])
  kuma_point: number;

  @Expose()
  @Transform((params) => params.obj['sum']['help_count'])
  help_count: number;

  @Expose()
  @Transform((params) => params.obj['max']['grade_id'])
  grade_id: number;

  @Expose()
  @Transform((params) => params.obj['max']['grade_point'])
  grade_point: number;

  results: Result[];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: PaginatedRequestDto): Promise<UserModel[]> {
    return await this.prisma.user.findMany({
      skip: query.offset,
      take: query.limit,
    });
  }

  async find(nsaid: string): Promise<UserData> {
    const user: UserData = plainToClass(
      UserData,
      snakecaseKeys(
        await this.prisma.player.aggregate({
          where: {
            nsaid: nsaid,
          },
          _sum: {
            goldenIkuraNum: true,
            ikuraNum: true,
            deadCount: true,
            helpCount: true,
            kumaPoint: true,
          },
          _max: {
            gradePoint: true,
            gradeId: true,
          },
          _count: {
            _all: true,
          },
        })
      ),
      {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      }
    );

    const results: Result[] = snakecaseKeys(
      await this.prisma.result.findMany({
        where: {
          members: {
            has: nsaid,
          },
        },
        orderBy: {
          playTime: 'desc',
        },
        skip: 0,
        take: 50,
      })
    ).map((result) => plainToClass(Result, result));

    user.results = results;
    return user;
  }
}
