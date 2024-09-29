import { Body, Controller, Get, Patch, Headers, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // 유저 정보 조회
  @Get(':socialId')
  async getUser(
    @Param('socialId') socialId: string,
  ): Promise<UserDto> {
    return this.userService.getUser(socialId);
  }

  // 닉네임 수정
  @Patch('nick/:socialId')
  async updateNick(
    @Param('socialId') socialId: string,
    @Body('newNick') newNick: string,
  ): Promise<string> {
    return this.userService.updateNick(socialId, newNick);
  }

  // 유저 삭제
  @Delete(':socialId')
  async deleteUser(
    @Param('socialId') socialId: string,
    @Body('deleteReasonIds') deleteReasonIds: Array<number>,
    @Body('deleteEtc') deleteEtc: string | null,
  ): Promise<void> {
    return this.userService.deleteUser(socialId, deleteReasonIds, deleteEtc);
  }
}
