import { IsEmail, IsEnum, IsNotEmpty, IsString, IsDate, Length } from 'class-validator';
import { Provider } from '../user.interface';

export class DeletedUserDto {
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

    @IsDate()
    @IsNotEmpty()
    deletedAt: Date;

    @IsString()
    detail: string;

    constructor(partial: Partial<DeletedUserDto>) {
        Object.assign(this, partial);
    }
}
