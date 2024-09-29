import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { UserModule } from './user.module';
import LoggingInterceptor from './logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('NODE_PORT');
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(port);
}
bootstrap();