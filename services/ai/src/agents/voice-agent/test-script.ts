import "dotenv/config";
import fs from "fs";
import path from "path";
import { VertexAITTSProvider } from "./tts-provider";
import { TTSLanguageCodes } from "@shared/src/types";

async function run() {
  const tts = new VertexAITTSProvider();

  const audio = await tts.synthesize(
    "تغادر الوادي محملاً بمعرفة جديدة وأمل متجدد. الواحة لم تكن مجرد مكان من الماء والنباتات؛ كانت درسًا في الإصرار والمجتمع والتناغم مع الطبيعة. ترحل ومعك بذور لتزرعها وأفكار لتشاركها، وتعلم أن هذا الفهم سيصحبك إلى كل مكان تذهب إليه.",
    {
      languageCode: TTSLanguageCodes.ARABIC,
      prompt:
        "قم بسرد هذه القصة بالعربية بطريقة مشوقة وواضحة، كما لو كنت ترويها ككتاب صوتي.",
    }
  );

  const outDir = path.resolve(process.cwd(), "output");
  fs.mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `story-${timestamp}.wav`;
  const filePath = path.join(outDir, filename);

  if (audio.length === 0) {
    throw new Error("Audio buffer is empty!");
  }

  fs.writeFileSync(filePath, audio); // Gemini returns raw PCM (now wrapped in WAV container)
  console.log("Wrote audio to:", filePath);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
