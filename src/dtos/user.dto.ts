import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsString,
	IsDate,
	Length,
} from 'class-validator';
import { Provider } from '../user.interface';
import User from 'src/entities/user.entity';

export class UserDto {
	@IsString()
	@Length(1, 100)
	socialId: string;

	@IsString()
	@Length(1, 100)
	name: string;

	@IsEmail()
	@Length(1, 100)
	email: string;

	@IsString()
	@Length(1, 100)
	nick: string;

	@IsEnum(Provider)
	provider: Provider;

	@IsDate()
	@IsNotEmpty()
	createdAt: Date;

	constructor(partial: Partial<UserDto>) {
		Object.assign(this, partial);
	}

	static fromEntity(user: User): UserDto {
		return new UserDto({
			socialId: user.socialId,
			name: user.name,
			email: user.email,
			nick: user.nick,
			provider: user.provider,
			createdAt: user.createdAt,
		});
	}
}
