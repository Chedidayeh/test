import { WebSocket, WebSocketServer, RawData } from "ws";
import { IncomingMessage, Server } from "http";
import {
  GoogleCloudSTTProvider,
  STTStreamingSession,
  TTSToSTTLanguageMap,
} from "../stt-provider";
import { TTSLanguageCodes } from "@shared/src/types";
import { logger } from "../../../lib/logger";

const provider = new GoogleCloudSTTProvider();

type StartMessage = {
  type: "start";
  languageCode?: string;
  sampleRateHertz?: number;
  encoding?: "LINEAR16" | "WEBM_OPUS";
};

type StopMessage = {
  type: "stop";
};

type ClientMessage = StartMessage | StopMessage;

function parseClientMessage(raw: RawData): ClientMessage | null {
  try {
    const parsed = JSON.parse(raw.toString()) as ClientMessage;
    if (parsed.type === "start" || parsed.type === "stop") return parsed;
    return null;
  } catch {
    return null;
  }
}

function sendJson(ws: WebSocket, payload: Record<string, unknown>) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

export function attachSTTWebSocket(server: Server, path: string) {
  const wss = new WebSocketServer({ server, path });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    let session: STTStreamingSession | null = null;

    const cleanup = () => {
      session?.destroy();
      session = null;
    };

    ws.on("message", (raw: RawData, isBinary: boolean) => {
      if (isBinary) {
        if (!session) {
          sendJson(ws, {
            type: "error",
            message: "Send a JSON { type: 'start' } message before audio chunks",
          });
          return;
        }
        session.write(Buffer.from(raw as Buffer));
        return;
      }

      const message = parseClientMessage(raw);
      if (!message) {
        sendJson(ws, { type: "error", message: "Invalid control message" });
        return;
      }

      if (message.type === "start") {
        cleanup();

        session = provider.createStreamingSession(
          {
            languageCode:
              message.languageCode ??
              TTSToSTTLanguageMap[TTSLanguageCodes.ENGLISH_US],
            sampleRateHertz: message.sampleRateHertz ?? 16000,
            encoding: message.encoding ?? "LINEAR16",
            interimResults: true,
          },
          (result) => {
            sendJson(ws, {
              type: "transcript",
              transcript: result.transcript,
              isFinal: result.isFinal,
              confidence: result.confidence,
            });
          },
          (error) => {
            logger.error("[STT Stream] Recognition error", { error: String(error) });
            sendJson(ws, { type: "error", message: error.message });
            cleanup();
          },
        );

        sendJson(ws, { type: "ready" });
        return;
      }

      if (message.type === "stop") {
        session?.end();
        session = null;
        sendJson(ws, { type: "stopped" });
      }
    });

    ws.on("close", cleanup);
    ws.on("error", cleanup);
  });

  logger.info("[STT Stream] WebSocket endpoint ready", { path });
}
