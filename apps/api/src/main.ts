import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { CONFIG } from "./lib/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    allowedHeaders: ["Content-Type", "X-User-Id"],
    origin: [CONFIG.CLIENT_URL],
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(CONFIG.PORT);
}
void bootstrap();
