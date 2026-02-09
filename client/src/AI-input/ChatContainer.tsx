import { useEffect, useRef, useMemo, useState, type ReactNode } from "react";
import type { Message } from "./types";
import MessageFormatter from "./MessageFormatter";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming?: boolean;
  inputBar?: ReactNode;
  activeConversationId?: string | null;
}

// Loading dots animation component
function LoadingDots() {
  return (
    <div className="flex items-start gap-4 animate-fade-in">
      <img
        src="/chatbot.png"
        alt="AI"
        className="w-7 h-7 rounded-full shrink-0"
      />
      <div className="flex items-center gap-1 pt-2">
        <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" />
      </div>
    </div>
  );
}

// User message bubble component
function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex items-start gap-3 flex-row-reverse animate-fade-in">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-100">
        <svg
          className="w-4 h-4 text-neutral-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </div>

      {/* Message bubble */}
      <div className="max-w-[70%] md:max-w-[60%] rounded-2xl rounded-tr-sm px-4 py-3 bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white">
        <p className="text-[15px] leading-7 whitespace-pre-wrap wrap-break-word tracking-wide">
          {message.content}
        </p>
        <p className="text-[11px] mt-2 text-neutral-500">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// AI response component - no bubble, clean formatted markdown
function AIMessage({ message }: { message: Message }) {
  return (
    <div className="flex items-start gap-4 animate-fade-in">
      {/* Avatar */}
      <img
        src="/chatbot.png"
        alt="AI"
        className="w-7 h-7 rounded-full shrink-0"
      />

      {/* Formatted content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <MessageFormatter content={message.content} />
        <p className="text-[11px] text-neutral-600 mt-3">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-neutral-400 dark:text-neutral-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 mb-2">
        What can I help with?
      </h3>
      <p className="text-[14px] text-neutral-500 max-w-sm">
        Ask me anything—questions, code, ideas, or just to chat.
      </p>
    </div>
  );
}

function ChatContainer({ messages, isLoading, isStreaming = false, inputBar, activeConversationId }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef<number>(0);
  const initialLoadRef = useRef<boolean>(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Handle scroll visibility for the scroll-to-bottom button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollButton(distanceFromBottom > 100);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to bottom on initial load or conversation change (but NOT during AI typing)
  useEffect(() => {
    // On initial load, scroll to bottom
    if (initialLoadRef.current && messages.length > 0) {
      initialLoadRef.current = false;
      requestAnimationFrame(() => scrollToBottom("instant"));
      prevMessageCountRef.current = messages.length;
      return;
    }

    // On conversation change, scroll to bottom
    if (activeConversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = activeConversationId ?? null;
      requestAnimationFrame(() => scrollToBottom("instant"));
      prevMessageCountRef.current = messages.length;
      return;
    }

    // Only scroll when a NEW user message is added (not during AI response)
    const messageCountIncreased = messages.length > prevMessageCountRef.current;
    const lastMessage = messages[messages.length - 1];
    
    if (messageCountIncreased && lastMessage?.role === "user") {
            console.log("hit")
      requestAnimationFrame(() => scrollToBottom());
    }
    
    prevMessageCountRef.current = messages.length;
  }, [messages.length, activeConversationId, messages]);

  // Group messages: user message + following AI response(s)
  // For calulations and formatting we use memo to prevent the caluculation rerunning on component rerender
  const messageGroups = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];

    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((message) => {
      if (message.role === "user") {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Scrollable messages area */}
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto pt-14 md:pt-16 pb-4 md:pb-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto px-8 space-y-6 pb-44">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <>
              {messageGroups.map((group, groupIndex) => {
                const isLastGroup = groupIndex === messageGroups.length - 1;
                
                return (
                  <div
                    key={`group-${groupIndex}`}
                    // If last group → add min-height so it fills the screen like a fresh page.
                    // If not last group → no min-height, so it only takes up the space its content needs.
                    // The idea is to mimic gpt/gemini style flow where each response creates fresh page idea
                    // Then when a new message appears the previous is not last group so we render it normally 
                    // with "flex flex-col space-y-6"
                    className={isLastGroup ? "min-h-[calc(100vh-290px)] flex flex-col space-y-6" : "flex flex-col space-y-6"}
                  >
                    {group.map((message) =>
                      message.role === "user" ? (
                        <UserMessage key={message.id} message={message} />
                      ) : (
                        <AIMessage key={message.id} message={message} />
                      )
                    )}
                    {/* Loading dots only in last group */}
                    {isLastGroup && isLoading && !isStreaming && <LoadingDots />}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-neutral-800 shadow-lg rounded-full p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
          aria-label="Scroll to bottom"
        >
          <svg
            className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
      
      {/* Floating input bar */}
      {inputBar && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          {inputBar}
        </div>
      )}
    </div>
  );
}

export default ChatContainer;