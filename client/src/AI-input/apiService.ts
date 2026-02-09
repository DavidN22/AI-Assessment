import axios, { isAxiosError, type AxiosError } from "axios";

// Message type for API requests
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// API configuration
const API_BASE_URL = "/api";
const ENDPOINTS = {
  chat: `${API_BASE_URL}/chat`,
  chatStream: `${API_BASE_URL}/chat/stream`,
  transcribe: `${API_BASE_URL}/transcribe`,
} as const;

// Custom error class for API errors
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isNetworkError: boolean;

  constructor(message: string, statusCode: number = 500, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
  }
}

// Parse error response from axios
const parseAxiosError = (error: AxiosError): ApiError => {
  if (error.response) {
    const data = error.response.data as { error?: string; message?: string } | string;
    const message =
      typeof data === "string"
        ? data
        : data?.error || data?.message || "An error occurred";
    return new ApiError(message, error.response.status);
  }

  if (error.request) {
    return new ApiError(
      "Unable to connect to the server. Please check your connection.",
      0,
      true
    );
  }

  return new ApiError("Failed to send request. Please try again.");
};

// Send messages to AI (non-streaming)
export async function sendMessageToAI(messages: ChatMessage[]): Promise<string> {
  if (messages.length === 0) {
    throw new ApiError("Messages cannot be empty", 400);
  }

  try {
    const response = await axios.post<{ content: string }>(ENDPOINTS.chat, { messages });
    return response.data.content;
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    if (isAxiosError(error)) throw parseAxiosError(error);
    throw new ApiError("An unexpected error occurred");
  }
}

// Send messages to AI (streaming)
export async function streamMessageFromAI(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: ApiError) => void
): Promise<void> {
  if (messages.length === 0) {
    onError(new ApiError("Messages cannot be empty", 400));
    return;
  }

  try {
    const response = await axios.post(
      ENDPOINTS.chatStream,
      { messages },
      { responseType: "stream", adapter: "fetch" }
    );

    const stream = response.data as ReadableStream;
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "delta") {
              onChunk(data.content);
            } else if (data.type === "done") {
              onComplete();
              return;
            } else if (data.type === "error") {
              throw new ApiError(data.message);
            }
          } catch (parseError) {
            if (parseError instanceof ApiError) throw parseError;
          }
        }
      }
    }

    onComplete();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      onError(error);
    } else if (isAxiosError(error)) {
      onError(parseAxiosError(error));
    } else if (error instanceof Error) {
      onError(new ApiError(error.message));
    } else {
      onError(new ApiError("An unexpected error occurred during streaming"));
    }
  }
}

// Transcribe audio to text
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");

    const response = await axios.post<{ text: string }>(ENDPOINTS.transcribe, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.text;
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    if (isAxiosError(error)) throw parseAxiosError(error);
    throw new ApiError("Failed to transcribe audio");
  }
}

