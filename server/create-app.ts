import 'reflect-metadata';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import cors from 'cors';
import express, { type Express } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

dotenv.config({ path: resolve(process.cwd(), '.env'), quiet: true });

function allowedOrigins(): string[] {
  return (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap(): Promise<Express> {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: true,
    logger: ['error', 'warn'],
  });

  const origins = allowedOrigins();
  app.use(
    cors({
      // Same-origin requests need no CORS; extra origins are opt-in via FRONTEND_ORIGIN.
      origin: origins.length > 0 ? origins : false,
      methods: ['POST', 'OPTIONS'],
    }),
  );
  app.setGlobalPrefix('api');

  await app.init();
  return server;
}

const globalForNest = globalThis as unknown as { nestServer?: Promise<Express> };

// Reuse one Nest instance per warm function / dev process.
export function getNestServer(): Promise<Express> {
  globalForNest.nestServer ??= bootstrap().catch((error) => {
    globalForNest.nestServer = undefined;
    throw error;
  });
  return globalForNest.nestServer;
}
