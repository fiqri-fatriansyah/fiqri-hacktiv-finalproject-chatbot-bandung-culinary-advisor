import 'reflect-metadata';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import cors from 'cors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
dotenv.config({
    path: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '../.env'),
        resolve(process.cwd(), '../.env.development.local'),
    ],
    quiet: true,
});
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.use(cors({
        origin: allowedOrigins,
        methods: ['POST', 'OPTIONS'],
    }));
    app.setGlobalPrefix('api');
    const port = Number(process.env.PORT ?? 4000);
    await app.listen(port, '0.0.0.0');
    console.log(`[backend] Bandung culinary advisor listening on :${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map