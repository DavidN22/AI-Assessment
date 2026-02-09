import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI, { toFile } from "openai";
import multer from "multer";

const app = express();

let client: OpenAI;
try {
  const apiKey = process.env.OPENAI_API_KEY || "your-api-key-here";
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  // This isent needed but safe incase the libaray doesent read the env directly from the env
  client = new OpenAI({
    apiKey: apiKey,
  });
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error instanceof Error ? error.message : error);
  client = null as any;
}
// To handle audio uploading for the transcibe api from openai
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "oks" });
});

// Non-streaming chat endpoint
app.post("/api/chat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!client) {
      throw new Error("OpenAI client is not initialized. Please check your OPENAI_API_KEY environment variable.");
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: messages.map((m: { role: string; content: string }) => ({
        type: "message" as const,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    });

    res.json({ content: response.output_text });
  } catch (err) {
    next(err);
  }
});

// Streaming chat endpoint
app.post("/api/chat/stream", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!client) {
      throw new Error("OpenAI client is not initialized. Please check your OPENAI_API_KEY environment variable.");
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = await client.responses.create({
      model: "gpt-4.1",
      input: messages.map((m: { role: string; content: string }) => ({
        type: "message" as const,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        res.write(`data: ${JSON.stringify({ type: "delta", content: event.delta })}\n\n`);
      } else if (event.type === "response.completed") {
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      }
    }

    res.end();
  } catch (err) {
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", message: err instanceof Error ? err.message : "An error occurred" })}\n\n`);
      res.end();
    } else {
      next(err);
    }
  }
});

// Speech-to-text transcription endpoint
app.post("/api/transcribe", upload.single("audio"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!client) {
      throw new Error("OpenAI client is not initialized. Please check your OPENAI_API_KEY environment variable.");
    }

    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const audioFile = await toFile(req.file.buffer, "audio.webm", {
      type: req.file.mimetype,
    });

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-transcribe",
      response_format: "text",
    });

    res.json({ text: transcription });
  } catch (err) {
    next(err);
  }
});

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error caught by global handler:", err);
  const message = err instanceof Error ? err.message : "An unexpected error occurred";
  res.status(500).json({ error: message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
