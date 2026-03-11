import { VertexAI } from "@google-cloud/vertexai";
import path from "path";
import "dotenv/config";
import { TTSLanguageCodes } from "@shared/src/types";

export interface TTSOptions {
  languageCode?: TTSLanguageCodes;
  prompt?: string;
}

const credentialsPath = path.resolve(
  process.cwd(),
  "src",
  "service_account.json",
);

export class VertexAITTSProvider {
  private model: any;

  constructor() {
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: "us-central1",
      googleAuthOptions: {
        keyFilename: credentialsPath,
      },
    });

    this.model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-flash-tts",
    });
  }

  async synthesize(text: string, options: TTSOptions = {}): Promise<Buffer> {
    const {
      languageCode = TTSLanguageCodes.ENGLISH_US,
      prompt = "Narrate this story clearly and emotionally like an audiobook narrator.",
    } = options;

    const request = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${prompt}\n\n${text}`,
            },
          ],
        },
      ],

      generationConfig: {
        responseModalities: ["AUDIO"],

        speechConfig: {
          languageCode,
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Achernar",
            },
          },
        },
      },
    };

    const response = await this.model.generateContent(request);

    const audioPart = response.response.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData,
    );

    if (!audioPart?.inlineData?.data) {
      console.error(
        "No audio found. Response candidates:",
        response.response.candidates?.length,
      );
      console.error(
        "First part:",
        response.response.candidates?.[0]?.content?.parts?.[0],
      );
      throw new Error("No audio returned from Gemini TTS");
    }

    const pcmBuffer = Buffer.from(audioPart.inlineData.data, "base64");
    const wavBuffer = this.wrapPCMInWAV(pcmBuffer, 24000, 1, 16);

    return wavBuffer;
  }

  // Wrap raw PCM data in WAV container with proper headers
  wrapPCMInWAV(
    pcmBuffer: Buffer,
    sampleRate: number = 24000,
    channels: number = 1,
    bitsPerSample: number = 16,
  ): Buffer {
    const byteRate = (sampleRate * channels * bitsPerSample) / 8;
    const blockAlign = (channels * bitsPerSample) / 8;
    const subChunk2Size = pcmBuffer.length;
    const chunkSize = 36 + subChunk2Size;

    const wav = Buffer.alloc(44 + subChunk2Size);

    // RIFF chunk descriptor
    wav.write("RIFF", 0);
    wav.writeUInt32LE(chunkSize, 4);
    wav.write("WAVE", 8);

    // fmt subchunk
    wav.write("fmt ", 12);
    wav.writeUInt32LE(16, 16); // subChunk1Size
    wav.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    wav.writeUInt16LE(channels, 22);
    wav.writeUInt32LE(sampleRate, 24);
    wav.writeUInt32LE(byteRate, 28);
    wav.writeUInt16LE(blockAlign, 32);
    wav.writeUInt16LE(bitsPerSample, 34);

    // data subchunk
    wav.write("data", 36);
    wav.writeUInt32LE(subChunk2Size, 40);
    pcmBuffer.copy(wav, 44);

    return wav;
  }
}
