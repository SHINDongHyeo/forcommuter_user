import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UserDto } from './dtos/user.dto';
import DeletedUser from './entities/deleted_user.entity';
import DeletedReasonLog from './entities/deleted_reason_log.entity';
import DeleteReason from './entities/delete_reason.entity';
import * as fs from 'fs';
import { updateNickRes, validateNickRes } from './user.interface';

@Injectable()
export class UserService {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(DeletedUser)
		private readonly deletedUserRepository: Repository<DeletedUser>,
		@InjectRepository(DeletedReasonLog)
		private readonly deletedReasonLogRepository: Repository<DeletedReasonLog>,
		@InjectRepository(DeleteReason)
		private readonly deleteReasonRepository: Repository<DeleteReason>,
	) {}

	// 내 정보 조회
	async getUser(socialId: string): Promise<UserDto> {
		const user = await this.userRepository.findOneBy({
			socialId: socialId,
		});

		if (!user) {
			throw new NotFoundException(
				`No user with socialId ${socialId} from JWT`,
			);
		}

		return UserDto.fromEntity(user);
	}

	// 닉네임 수정
	async updateNick(
		socialId: string,
		newNick: string,
	): Promise<updateNickRes> {
		const isValidNick = await this.validateNick(newNick);
		if (!isValidNick.status) {
			return isValidNick;
		}

		const result = await this.userRepository.update(
			{ socialId: socialId },
			{ nick: newNick },
		);

		if (result.affected === 0) {
			throw new NotFoundException(
				`No user with socialId ${socialId} from JWT`,
			);
		}

		return { ...isValidNick, newNick };
	}

	// 닉네임 검증 - true: 유효함, false: 유효하지 않음
	async validateNick(nick: string): Promise<validateNickRes> {
		const isDuplicated = await this.checkNickDuplication(nick);
		if (isDuplicated) {
			return { status: false, detail: 'DUPLICATED' };
		}
		const isBadWords = await UserService.checkNickBadWords(nick);
		if (isBadWords) {
			return { status: false, detail: 'BAD_WORDS' };
		}
		return { status: true };
	}

	// 닉네임 중복 체크 - true: 중복됨, false: 중복되지 않음
	async checkNickDuplication(nick: string): Promise<boolean> {
		const user = await this.userRepository.findOneBy({ nick });

		if (user) {
			return true;
		}
		return false;
	}

	// 닉네임 비속어 체크 - true: 비속어, false: 비속어 아님
	static async checkNickBadWords(nick: string): Promise<boolean> {
		const json = fs.readFileSync('badwords.json', 'utf-8');
		const { badWords } = JSON.parse(json);
		return badWords.some((badWord: string) => nick.includes(badWord));
	}

	// 탈퇴
	async deleteUser(
		socialId: string,
		deleteReasonIds: Array<number>,
		deleteEtc: string | null,
	): Promise<void> {
		await this.dataSource.transaction('READ COMMITTED', async (manager) => {
			// user 테이블 데이터 조회
			const user = await manager.findOneBy(User, { socialId: socialId });
			if (!user) {
				throw new NotFoundException(
					`No user with socialId ${socialId} from JWT`,
				);
			}

			// deleteUser 테이블 데이터 추가
			const deletedUser = new DeletedUser();
			deletedUser.socialId = user.socialId;
			deletedUser.name = user.name;
			deletedUser.email = user.email;
			deletedUser.nick = user.nick;
			deletedUser.provider = user.provider;
			deletedUser.createdAt = user.createdAt;
			deletedUser.deletedAt = new Date();
			deletedUser.detail = deleteEtc;
			const newDeletedUser = await manager.save(deletedUser);

			// deleteReasonLog 테이블 데이터 추가
			if (!deleteReasonIds || deleteReasonIds.length === 0) {
				throw new BadRequestException(
					'Delete reasons must be provided',
				);
			}
			const deleteReasonLogs = await Promise.all(
				deleteReasonIds.map(async (deleteReasonId) => {
					const deleteReason = await manager.findOneBy(DeleteReason, {
						id: deleteReasonId,
					});
					if (!deleteReason) {
						throw new NotFoundException('No delete reason matches');
					}

					const deleteReasonLog = manager.create(DeletedReasonLog, {
						deletedUser: newDeletedUser,
						deleteReason: deleteReason,
					});

					return deleteReasonLog;
				}),
			);
			await manager.save(DeletedReasonLog, deleteReasonLogs);

			// user 테이블 데이터 삭제
			const result = await manager.delete(User, { socialId });
			if (result.affected === 0) {
				throw new NotFoundException(
					`No user with socialId ${socialId} from JWT`,
				);
			}
		});
	}
}
