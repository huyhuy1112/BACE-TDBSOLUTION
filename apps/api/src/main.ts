import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const webUrl = config.get<string>('WEB_URL', 'http://localhost:3000');
  app.enableCors({
    origin: [webUrl, 'http://localhost:3000'],
    credentials: true,
  });

  const port = Number(config.get('PORT')) || Number(config.get('API_PORT')) || 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`BACE API listening on http://localhost:${port}/api`);
}

bootstrap();
