import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NicknameAndIcon } from 'src/api/nickname_and_icon/nickname_and_icon.response';
import { Result as CoopResult } from '../result.response.dto';

class IkuraResult {
  constructor(golden_ikura_num, ikura_num) {
    this.golden_ikura_num = golden_ikura_num;
    this.ikura_num = ikura_num;
  }

  golden_ikura_num: number;
  ikura_num: number;
}

export interface UserData {
  stage_id: number;
  player_golden_ikura_num: number;
  player_ikura_num: number;
  golden_ikura_num: number;
  ikura_num: number;
  grade_point: number;
  kuma_point: number;
  shifts_worked: number;
  nightless: boolean;
}

export class StageResult {
  constructor(result: UserData, stage_id: number, nightless: boolean) {
    if (result === undefined) {
      this.stage_id = stage_id;
      this.nightless = nightless;
      this.grade_point_max = null;
      this.shifts_worked = null;
      this.kuma_point_total = null;
      this.player_results = new IkuraResult(null, null);
      this.team_results = new IkuraResult(null, null);
      return;
    } else {
      this.stage_id = result.stage_id;
      this.nightless = nightless;
      this.grade_point_max = result.grade_point;
      this.shifts_worked = result.shifts_worked;
      this.kuma_point_total = result.kuma_point;
      this.player_results = new IkuraResult(
        result.player_golden_ikura_num,
        result.player_ikura_num
      );
      this.team_results = new IkuraResult(
        result.golden_ikura_num,
        result.ikura_num
      );
    }
  }

  @ApiProperty({ description: 'ステージID' })
  stage_id: number;

  @ApiProperty({ description: '最高評価' })
  grade_point_max: number;

  @ApiProperty()
  shifts_worked: number;

  @ApiProperty()
  kuma_point_total: number;

  @ApiProperty()
  nightless: boolean;

  @ApiProperty({ type: IkuraResult })
  player_results: IkuraResult;

  @ApiProperty({ type: IkuraResult })
  team_results?: IkuraResult;
}

export class UserStats {
  constructor(results: UserData[], nicknameAndIcons?: NicknameAndIcon) {
    // バイト回数の合計
    this.shifts_worked = results.reduce(
      (acc, cur) => acc + cur.shifts_worked,
      0
    );
    // 金イクラの合計
    this.golden_ikura_num = results.reduce(
      (acc, cur) => acc + cur.golden_ikura_num,
      0
    );
    // ユーザーID
    this.nsaid = nicknameAndIcons.nsa_id;
    // イクラの合計
    this.ikura_num = results.reduce((acc, cur) => acc + cur.ikura_num, 0);
    // クマサンポイントの合計
    this.kuma_point = results.reduce((acc, cur) => acc + cur.kuma_point, 0);
    // 評価レートの最高値
    this.grade_point = Math.max(...results.map((cur) => cur.grade_point));

    // ニックネーム
    this.nickname = nicknameAndIcons.nickname;
    // 画像
    this.thumbnail_url = nicknameAndIcons.thumbnail_url;

    const getStageResult = (stageId: number, nightless: boolean) => {
      const result = results.find(
        (cur) => cur.stage_id === stageId && cur.nightless === nightless
      );
      return new StageResult(result, stageId, nightless);
    };

    this.stage_results = [
      {
        stage_id: 5000,
        night: getStageResult(5000, false),
        nightless: getStageResult(5000, true),
      },
      {
        stage_id: 5001,
        night: getStageResult(5001, false),
        nightless: getStageResult(5001, true),
      },
      {
        stage_id: 5002,
        night: getStageResult(5002, false),
        nightless: getStageResult(5002, true),
      },
      {
        stage_id: 5003,
        night: getStageResult(5003, false),
        nightless: getStageResult(5003, true),
      },
      {
        stage_id: 5004,
        night: getStageResult(5004, false),
        nightless: getStageResult(5004, true),
      },
    ];
  }

  @ApiProperty()
  nsaid: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  thumbnail_url: string;

  @ApiProperty()
  shifts_worked: number;

  @ApiProperty()
  golden_ikura_num: number;

  @ApiProperty()
  ikura_num: number;

  @ApiProperty()
  dead_count: number;

  @ApiProperty()
  kuma_point: number;

  @ApiProperty()
  help_count: number;

  @ApiProperty()
  grade_id: number;

  @ApiProperty()
  grade_point: number;

  @ApiProperty({ type: [StageResult] })
  @Type(() => StageResult)
  stage_results: StageResults[];

  @ApiProperty({ type: [CoopResult] })
  @Type(() => CoopResult)
  results: CoopResult[];
}

class StageResults {
  @ApiProperty()
  stage_id: number;
  @ApiProperty()
  night: StageResult;

  @ApiProperty()
  nightless: StageResult;
}
