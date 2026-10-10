var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, ServiceUnavailableException, BadGatewayException, } from '@nestjs/common';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { REFUSAL_TEXT, SYSTEM_INSTRUCTION } from './chat.constants.js';
let ChatService = class ChatService {
    client = null;
    getClient() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new ServiceUnavailableException('GOOGLE_API_KEY belum diatur. Tambahkan ke file .env lalu jalankan ulang server.');
        }
        this.client ??= new GoogleGenAI({ apiKey });
        return this.client;
    }
    async reply(message, images, history) {
        const client = this.getClient();
        const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
        const userParts = [
            ...images.map((image) => ({
                inlineData: { mimeType: image.mimetype, data: image.buffer.toString('base64') },
            })),
            { text: message || 'Tolong jelaskan gambar ini dan rekomendasikan tempat kuliner di Bandung.' },
        ];
        const contents = [
            ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
            { role: 'user', parts: userParts },
        ];
        try {
            const response = await client.models.generateContent({
                model,
                contents,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    temperature: 0.4,
                    maxOutputTokens: 1024,
                    thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
                },
            });
            return response.text?.trim() || REFUSAL_TEXT;
        }
        catch (error) {
            console.error('[backend] Gemini request failed:', error.message);
            throw new BadGatewayException('Gagal menghubungi layanan AI. Coba lagi sebentar lagi.');
        }
    }
};
ChatService = __decorate([
    Injectable()
], ChatService);
export { ChatService };
//# sourceMappingURL=chat.service.js.map