import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import User from './entities/user.entity';
import DeletedReasonLog from './entities/deleted_reason_log.entity';
import DeleteReason from './entities/delete_reason.entity';
import DeletedUser from './entities/deleted_user.entity';

@Module({
	imports: [
		ConfigModule.forRoot({}),
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: process.env.DB_HOST,
			port: parseInt(process.env.DB_PORT, 10),
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			entities: [User, DeletedUser, DeleteReason, DeletedReasonLog],
			synchronize: true,
		}),
		TypeOrmModule.forFeature([User, DeletedUser, DeleteReason, DeletedReasonLog]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '1y' },
			}),
		}),
	],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule { }
