import { Body, Controller, Get, Patch, Headers, Param, Delete, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { updateNickRes, validateNickRes } from './user.interface';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) { }

	// 내 정보 조회
	@Get(':socialId')
	async getUser(
		@Param('socialId') socialId: string,
	): Promise<UserDto> {
		return this.userService.getUser(socialId);
	}

	// 닉네임 중복 검사
	@Post('nick/validate')
	async validateNick(
		@Body('nick') nick: string,
	): Promise<validateNickRes> {
		return this.userService.validateNick(nick);
	}

	// 닉네임 수정
	@Patch('nick/:socialId')
	async updateNick(
		@Param('socialId') socialId: string,
		@Body('newNick') newNick: string,
	): Promise<updateNickRes> {
		return this.userService.updateNick(socialId, newNick);
	}

	// 탈퇴
	@Delete(':socialId')
	async deleteUser(
		@Param('socialId') socialId: string,
		@Body('deleteReasonIds') deleteReasonIds: Array<number>,
		@Body('deleteEtc') deleteEtc: string | null,
	): Promise<void> {
		return this.userService.deleteUser(socialId, deleteReasonIds, deleteEtc);
	}
}
