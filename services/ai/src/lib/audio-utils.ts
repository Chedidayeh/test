import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { Readable, PassThrough } from "stream";

// Point fluent-ffmpeg at the bundled static binary (no system install needed)
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

/**
 * Convert a WAV buffer to MP3 at 64kbps mono.
 * Reduces file size by ~6× vs 24kHz 16-bit PCM WAV.
 */
export function convertWavToMp3(wavBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(wavBuffer);
    const outputStream = new PassThrough();
    const chunks: Buffer[] = [];

    outputStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    outputStream.on("end", () => resolve(Buffer.concat(chunks)));
    outputStream.on("error", reject);

    ffmpeg(inputStream)
      .inputFormat("wav")
      .outputFormat("mp3")
      .audioBitrate("64k")
      .audioChannels(1)
      .audioFrequency(24000)
      .on("error", reject)
      .pipe(outputStream, { end: true });
  });
}
