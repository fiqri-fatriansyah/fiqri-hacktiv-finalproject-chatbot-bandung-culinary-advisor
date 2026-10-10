import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ChatService, type HistoryTurn } from './chat.service.js';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_HISTORY_TURNS,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  MAX_MESSAGE_LENGTH,
} from './chat.constants.js';

interface ChatBody {
  message?: string;
  history?: string;
}

function parseHistory(raw: string | undefined): HistoryTurn[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (turn): turn is HistoryTurn =>
          typeof turn === 'object' &&
          turn !== null &&
          (turn.role === 'user' || turn.role === 'model') &&
          typeof turn.text === 'string' &&
          turn.text.trim().length > 0,
      )
      .slice(-MAX_HISTORY_TURNS)
      .map((turn) => ({ role: turn.role, text: turn.text.slice(0, MAX_MESSAGE_LENGTH) }));
  } catch {
    return [];
  }
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', MAX_IMAGES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Format gambar harus JPG, PNG, WEBP, atau HEIC.'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async chat(@Body() body: ChatBody | undefined, @UploadedFiles() files: Express.Multer.File[] = []) {
    const message = (body?.message ?? '').trim();

    if (!message && files.length === 0) {
      throw new BadRequestException('Pesan atau gambar wajib diisi.');
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(`Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.`);
    }

    const reply = await this.chatService.reply(message, files, parseHistory(body?.history));
    return { reply };
  }
}
