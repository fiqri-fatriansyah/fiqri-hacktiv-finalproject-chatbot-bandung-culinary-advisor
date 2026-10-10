import {
  Injectable,
  ServiceUnavailableException,
  BadGatewayException,
} from '@nestjs/common';
import { GoogleGenAI, ThinkingLevel, type Content, type Part } from '@google/genai';
import { REFUSAL_TEXT, SYSTEM_INSTRUCTION } from './chat.constants.js';

export interface HistoryTurn {
  role: 'user' | 'model';
  text: string;
}

@Injectable()
export class ChatService {
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GOOGLE_API_KEY belum diatur. Tambahkan ke file .env lalu jalankan ulang server.',
      );
    }
    this.client ??= new GoogleGenAI({ apiKey });
    return this.client;
  }

  async reply(message: string, images: Express.Multer.File[], history: HistoryTurn[]): Promise<string> {
    const client = this.getClient();
    const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

    const userParts: Part[] = [
      ...images.map((image) => ({
        inlineData: { mimeType: image.mimetype, data: image.buffer.toString('base64') },
      })),
      { text: message || 'Tolong jelaskan gambar ini dan rekomendasikan tempat kuliner di Bandung.' },
    ];

    const contents: Content[] = [
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
    } catch (error) {
      console.error('[backend] Gemini request failed:', (error as Error).message);
      throw new BadGatewayException('Gagal menghubungi layanan AI. Coba lagi sebentar lagi.');
    }
  }
}
