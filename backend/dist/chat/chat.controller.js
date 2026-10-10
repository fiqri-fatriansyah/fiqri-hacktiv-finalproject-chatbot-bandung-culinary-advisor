var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, Body, Controller, HttpCode, Post, UploadedFiles, UseInterceptors, } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ChatService } from './chat.service.js';
import { ALLOWED_IMAGE_TYPES, MAX_HISTORY_TURNS, MAX_IMAGES, MAX_IMAGE_BYTES, MAX_MESSAGE_LENGTH, } from './chat.constants.js';
function parseHistory(raw) {
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed
            .filter((turn) => typeof turn === 'object' &&
            turn !== null &&
            (turn.role === 'user' || turn.role === 'model') &&
            typeof turn.text === 'string' &&
            turn.text.trim().length > 0)
            .slice(-MAX_HISTORY_TURNS)
            .map((turn) => ({ role: turn.role, text: turn.text.slice(0, MAX_MESSAGE_LENGTH) }));
    }
    catch {
        return [];
    }
}
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async chat(body, files = []) {
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
};
__decorate([
    Post(),
    HttpCode(200),
    UseInterceptors(FilesInterceptor('images', MAX_IMAGES, {
        storage: memoryStorage(),
        limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES },
        fileFilter: (_req, file, callback) => {
            if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                callback(new BadRequestException('Format gambar harus JPG, PNG, WEBP, atau HEIC.'), false);
                return;
            }
            callback(null, true);
        },
    })),
    __param(0, Body()),
    __param(1, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "chat", null);
ChatController = __decorate([
    Controller('chat'),
    __metadata("design:paramtypes", [ChatService])
], ChatController);
export { ChatController };
//# sourceMappingURL=chat.controller.js.map