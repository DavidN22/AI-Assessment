import { useState, useRef, useEffect, type SubmitEvent, type KeyboardEvent } from "react";
import { transcribeAudio } from "./apiService";

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

function InputBar({ onSendMessage, isLoading, disabled = false }: InputBarProps) {
  const [text, setText] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (event?: SubmitEvent<HTMLFormElement>) => {
    event?.preventDefault();
    
    const trimmedText = text.trim();
    if (!trimmedText || isLoading || disabled) return;
    
    onSendMessage(trimmedText);
    setText("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = text.trim().length > 0 && !isLoading && !disabled;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        if (audioBlob.size > 0) {
          setIsTranscribing(true);
          try {
            const transcribedText = await transcribeAudio(audioBlob);
            setText((prev) => prev + (prev ? " " : "") + transcribedText.trim());
            textareaRef.current?.focus();
          } catch (error) {
            console.error("Transcription failed:", error);
          } finally {
            setIsTranscribing(false);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-800 min-h-14 shadow-sm dark:shadow-none">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Waiting for response..." : "Message..."}
          disabled={isLoading || disabled}
          rows={1}
          className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 pl-4 pr-2 py-4 resize-none focus:outline-none focus:ring-0 text-[14px] max-h-40 disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto custom-scrollbar"
        />

        {/* Microphone button */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isLoading || disabled || isTranscribing}
          className={`
            p-2 rounded-lg transition-colors duration-150 flex items-center justify-center shrink-0
            ${isRecording
              ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
              : isTranscribing
                ? "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            }
          `}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isTranscribing ? (
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : isRecording ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
          
        {/* Send button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`
            mr-2 p-2 rounded-lg transition-colors duration-150 flex items-center justify-center shrink-0
            ${canSubmit
              ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              : "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed"
            }
          `}
          aria-label="Send message"
        >
            {isLoading ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                />
              </svg>
            )}
        </button>
      </div>
      
      {/* Helper text */}
      <p className="text-[11px] text-neutral-600 mt-2 text-center">
        <kbd className="px-1 py-0.5 bg-neutral-900 rounded text-neutral-500 font-mono text-[10px]">↵</kbd> send · <kbd className="px-1 py-0.5 bg-neutral-900 rounded text-neutral-500 font-mono text-[10px]">⇧↵</kbd> new line
      </p>
    </form>
  );
}

export default InputBar;
