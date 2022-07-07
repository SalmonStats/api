import { CacheInterceptor, Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ResultsModule } from './results/results.module';
import { RankingModule } from './ranking/ranking.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { SchedulesModule } from './schedules/schedules.module';
import { UsersService } from './users/users.service';
import { PrismaService } from 'src/prisma.service';
import { StatsController } from './stats/stats.controller';
import { StatsModule } from './stats/stats.module';
import { StatsService } from './stats/stats.service';
import { NicknameAndIconController } from './nickname_and_icon/nickname_and_icon.controller';
import { NicknameAndIconService } from './nickname_and_icon/nickname_and_icon.service';
import { HttpModule } from '@nestjs/axios';
import { WavesController } from './waves/waves.controller';
import { WavesModule } from './waves/waves.module';
import { WavesService } from './waves/waves.service';
import { VersionsService } from './versions/versions.service';
import { VersionsController } from './versions/versions.controller';
import { VersionsModule } from './versions/versions.module';
import { WeaponsController } from './weapons/weapons.controller';
import { WeaponsModule } from './weapons/weapons.module';
import { TotalsService } from './totals/totals.service';
import { TotalsModule } from './totals/totals.module';
import { WeaponsService } from './weapons/weapons.service';
import { SalmonidsController } from './salmonids/salmonids.controller';
import { SalmonidsService } from './salmonids/salmonids.service';
import { SalmonidsModule } from './salmonids/salmonids.module';
import { RestoreController } from './restore/restore.controller';
import { RestoreService } from './restore/restore.service';
import { RestoreModule } from './restore/restore.module';

@Module({
  controllers: [
    ApiController,
    UsersController,
    StatsController,
    NicknameAndIconController,
    WavesController,
    VersionsController,
    WeaponsController,
    SalmonidsController,
    RestoreController,
  ],
  providers: [
    ApiService,
    PrismaService,
    UsersService,
    StatsService,
    WavesService,
    NicknameAndIconService,
    VersionsService,
    TotalsService,
    WeaponsService,
    SalmonidsService,
    RestoreService,
  ],
  imports: [
    ResultsModule,
    RankingModule,
    UsersModule,
    SchedulesModule,
    StatsModule,
    HttpModule,
    WavesModule,
    VersionsModule,
    WeaponsModule,
    TotalsModule,
    SalmonidsModule,
    RestoreModule,
  ],
})
export class ApiModule {}
