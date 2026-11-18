import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/gemini/compose', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY belum tersedia. Pastikan API key sudah dikonfigurasi di Settings > Secrets.',
      });
      return;
    }

    const body = req.body as {
      styleHint?: string;
      themeHint?: string;
      currentLyrics?: string;
    };

    const styleHint = (body.styleHint || '').trim();
    const themeHint = (body.themeHint || '').trim();

    const userPrompt = [
      'Buat sebuah konsep lagu lengkap untuk AI music generator (YuE2 / Suno style).',
      styleHint ? `Preferensi genre/style dari pengguna: "${styleHint}".` : 'Pilih genre musik modern yang menarik (misalnya Synthwave, Pop Rock Indonesia, Lo-Fi R&B, atau Indie Electronic).',
      themeHint ? `Tema atau ide cerita lagu: "${themeHint}".` : 'Buat tema emosional atau atmosferik yang kuat dan puitis.',
      'Persyaratan wajib:',
      '1. Tulis lirik berstruktur jelas menggunakan tag bagian seperti [Verse 1], [Chorus], [Verse 2], [Bridge], [Outro].',
      '2. Tulis stylePrompt dalam bahasa Inggris ringkas untuk deskripsi audio AI (instrumen, vokal, tempo, mood, tekstur produksi), maksimal 180 karakter.',
      '3. Tentukan bpm realistis (antara 70 sampai 155) dan musicalKey (misalnya "Am", "C", "Dm", "Fm", "G").',
      '4. Tulis lirik yang musikal, berima rapi, dan enak dinyanyikan (dalam Bahasa Indonesia atau campuran Indonesia-Inggris yang natural sesuai genre).',
    ].join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction:
            'Kamu adalah produser musik profesional dan penulis lagu untuk studio produksi musik AI. Berikan output JSON valid sesuai skema tanpa teks tambahan.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Judul lagu singkat dan kuat.',
              },
              stylePrompt: {
                type: Type.STRING,
                description:
                  'Deskripsi prompt gaya musik untuk generator audio (instrumen, genre, mood, karakter vokal).',
              },
              bpm: {
                type: Type.INTEGER,
                description: 'Tempo lagu dalam BPM antara 70 dan 155.',
              },
              musicalKey: {
                type: Type.STRING,
                description: 'Kunci nada utama lagu, misalnya Am, C, Dm, Fm, atau G.',
              },
              lyrics: {
                type: Type.STRING,
                description:
                  'Lirik lagu lengkap dengan penanda bagian [Verse 1], [Chorus], [Verse 2], [Bridge], dan [Outro].',
              },
            },
            required: ['title', 'stylePrompt', 'bpm', 'musicalKey', 'lyrics'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Gemini tidak mengembalikan konten.' });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        title: string;
        stylePrompt: string;
        bpm: number;
        musicalKey: string;
        lyrics: string;
      };

      res.json({
        title: parsed.title,
        stylePrompt: parsed.stylePrompt,
        bpm: Math.min(165, Math.max(65, Number(parsed.bpm) || 110)),
        musicalKey: parsed.musicalKey || 'Am',
        lyrics: parsed.lyrics,
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Gagal memanggil Gemini API.';
      console.error('Gemini compose error:', errMsg);
      res.status(500).json({
        error: `Gagal membuat lirik & style dengan Gemini: ${errMsg}`,
      });
    }
  });

  app.post('/api/engine/ping', async (req, res) => {
    const body = req.body as { url?: string; engine?: string };
    const rawUrl = (body.url || '').trim();

    if (!rawUrl) {
      res.status(400).json({
        connected: false,
        message: 'URL API belum diisi.',
      });
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Protokol harus http:// atau https://');
      }
    } catch {
      res.status(400).json({
        connected: false,
        message: 'Format URL tidak valid. Gunakan http:// atau https://.',
      });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const started = Date.now();

    try {
      const target = parsedUrl.toString();
      const response = await fetch(target, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timer);
      const latencyMs = Date.now() - started;

      res.json({
        connected: response.ok || response.status < 500,
        statusCode: response.status,
        latencyMs,
        message:
          response.ok || response.status < 500
            ? `Terhubung (${response.status} · ${latencyMs} ms)`
            : `Server merespons status ${response.status}`,
      });
    } catch (error) {
      clearTimeout(timer);
      const reason =
        error instanceof Error && error.name === 'AbortError'
          ? 'Timeout koneksi (3.5 detik)'
          : 'Endpoint tidak dapat dijangkau';
      res.json({
        connected: false,
        message: reason,
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bushido Art Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
