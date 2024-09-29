import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dtos/user.dto';
import DeletedUser from './entities/deleted_user.entity';
import DeletedReasonLog from './entities/deleted_reason_log.entity';
import DeleteReason from './entities/delete_reason.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DeletedUser)
    private readonly deletedUserRepository: Repository<DeletedUser>,
    @InjectRepository(DeletedReasonLog)
    private readonly deletedReasonLogRepository: Repository<DeletedReasonLog>,
    @InjectRepository(DeleteReason)
    private readonly deleteReasonRepository: Repository<DeleteReason>,
  ) { }

  async getUser(socialId: string): Promise<UserDto> {
    const user = await this.userRepository.findOneBy({ socialId: socialId });

    if (!user) {
      throw new NotFoundException(`No user with socialId ${socialId} from JWT`);
    }

    return UserDto.fromEntity(user);
  }

  async updateNick(socialId: string, newNick: string): Promise<string> {
    const result = await this.userRepository.update({ socialId: socialId }, { nick: newNick });

    if (result.affected === 0) {
      throw new NotFoundException(`No user with socialId ${socialId} from JWT`);
    }

    return newNick;
  }

  async deleteUser(socialId: string, deleteReasonIds: Array<number>, deleteEtc: string | null): Promise<void> {
    // user 테이블 데이터 조회
    const user = await this.userRepository.findOneBy({ socialId: socialId });
    if (!user) {
      throw new NotFoundException(`No user with socialId ${socialId} from JWT`);
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
    const newDeletedUser = await this.deletedUserRepository.save(deletedUser);

    // deleteReasonLog 테이블 데이터 추가
    if (!deleteReasonIds || deleteReasonIds.length === 0) {
      throw new BadRequestException('Delete reasons must be provided');
    }
    const deleteReasonLogs = await Promise.all(
      deleteReasonIds.map(async (deleteReasonId) => {
        const deleteReason = await this.deleteReasonRepository.findOneBy({ id: deleteReasonId });

        const deleteReasonLog = this.deletedReasonLogRepository.create({
          deletedUser: newDeletedUser,
          deleteReason: deleteReason,
        });

        return deleteReasonLog;
      })
    );
    await this.deletedReasonLogRepository.save(deleteReasonLogs);

    // user 테이블 데이터 삭제
    const result = await this.userRepository.delete({ socialId });
    if (result.affected === 0) {
      throw new NotFoundException(`No user with socialId ${socialId} from JWT`);
    }
  }
}
