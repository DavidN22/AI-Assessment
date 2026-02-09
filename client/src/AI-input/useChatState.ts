import { useState, useEffect, useRef } from "react";
import { sendMessageToAI, streamMessageFromAI, ApiError } from "./apiService";
import {
  type Message,
  type Conversation,
  createConversation,
  createMessage,
} from "./types";
import {
  loadConversations,
  saveConversations,
  loadStreamingEnabled,
  saveStreamingEnabled,
  loadSidebarPinned,
  saveSidebarPinned,
  loadDarkMode,
  saveDarkMode,
  clearConversationsStorage,
} from "./storage";

export function useChatState() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadConversations(),
  );
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(() => {
    const loaded = loadConversations();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarPinned, setSidebarPinned] = useState(() => loadSidebarPinned());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(() =>
    loadStreamingEnabled(),
  );
  const [darkMode, setDarkMode] = useState(() => loadDarkMode());
  const streamingMessageRef = useRef<string>("");

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  // Persist conversations to local storage
  // Acts more like a universal hook so rather than handling saving conversation in each function that touches
  // conversation this hook will run on any conversation change and sync to localstorage with a utility helper
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Toggle streaming mode
  const handleToggleStreaming = () => {
    setStreamingEnabled((prev) => {
      const newValue = !prev;
      saveStreamingEnabled(newValue);
      return newValue;
    });
  };

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const newValue = !prev;
      saveDarkMode(newValue);
      return newValue;
    });
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Create a new conversation
  const handleNewConversation = () => {
    const existingEmptyConversation = conversations.find(
      (conv) => conv.messages.length === 0,
    );

    if (existingEmptyConversation) {
      setActiveConversationId(existingEmptyConversation.id);
      setError(null);
      return;
    }

    const newConv = createConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setError(null);
  };

  // Select a conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setError(null);
  };

  const handleConversationDelete = (id: string) => {
    const title = conversations.find((conv) => conv.id == id);
    if (window.confirm("Are you sure you want to delete " + (title?.title ?? "this chat"))) {
      const filteredConversations = conversations.filter(
        (conv) => conv.id != id,
      );
      setConversations(filteredConversations);

      // Update activeConversationId if the deleted conversation was active
      if (activeConversationId === id) {
        setActiveConversationId(
          filteredConversations.length > 0 ? filteredConversations[0].id : null,
        );
      }
    }
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all chat history?")) {
      setConversations([]);
      setActiveConversationId(null);
      setError(null);
      clearConversationsStorage();
    }
  };

  // Toggle sidebar pin state
  const handleTogglePin = () => {
    setSidebarPinned((prev) => {
      const newValue = !prev;
      saveSidebarPinned(newValue);
      return newValue;
    });
  };

  // Build messages array for AI (includes current message) helper function
  const buildMessagesForAI = (newMessage: string) => {
    const history = activeConversation?.messages.slice(-19) ?? [];
    return [
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user" as const, content: newMessage },
    ];
  };

  // Send a message
  const handleSendMessage = async (content: string) => {
      let currentConvId = activeConversationId;
      if (!currentConvId) {
        const newConv = createConversation();
        setConversations((prev) => [newConv, ...prev]);
        currentConvId = newConv.id;
        setActiveConversationId(currentConvId);
      }

      const userMessage = createMessage("user", content);
      const assistantMessageId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Build full messages array for AI
      const messagesForAI = buildMessagesForAI(content);

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentConvId) {
            const isFirstMessage = conv.messages.length === 0;
            return {
              ...conv,
              title: isFirstMessage
                ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
                : conv.title,
              messages: [...conv.messages, userMessage],
              updatedAt: new Date(),
            };
          }
          return conv;
        }),
      );

      setIsLoading(true);
      setError(null);

      if (streamingEnabled) {
        streamingMessageRef.current = "";
        let messageAdded = false;

        await streamMessageFromAI(
          messagesForAI,
          (chunk) => {
            setIsStreaming(true);
            streamingMessageRef.current += chunk;

            if (!messageAdded) {
              messageAdded = true;
              const newMessage: Message = {
                id: assistantMessageId,
                role: "assistant",
                content: streamingMessageRef.current,
                timestamp: new Date(),
              };
              setConversations((prev) =>
                prev.map((conv) => {
                  if (conv.id === currentConvId) {
                    return {
                      ...conv,
                      messages: [...conv.messages, newMessage],
                      updatedAt: new Date(),
                    };
                  }
                  return conv;
                }),
              );
            } else {
              setConversations((prev) =>
                prev.map((conv) => {
                  if (conv.id === currentConvId) {
                    return {
                      ...conv,
                      messages: conv.messages.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: streamingMessageRef.current }
                          : msg,
                      ),
                    };
                  }
                  return conv;
                }),
              );
            }
          },
          () => {
            setIsLoading(false);
            setIsStreaming(false);
          },
          (err) => {
            setError(err.message);
            setConversations((prev) =>
              prev.map((conv) => {
                if (conv.id === currentConvId) {
                  const hasAssistantMessage = conv.messages.some(
                    (msg) => msg.id === assistantMessageId,
                  );
                  if (hasAssistantMessage) {
                    return {
                      ...conv,
                      messages: conv.messages.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: `⚠️ Error: ${err.message}` }
                          : msg,
                      ),
                    };
                  } else {
                    return {
                      ...conv,
                      messages: [
                        ...conv.messages,
                        {
                          id: assistantMessageId,
                          role: "assistant" as const,
                          content: `⚠️ Error: ${err.message}`,
                          timestamp: new Date(),
                        },
                      ],
                      updatedAt: new Date(),
                    };
                  }
                }
                return conv;
              }),
            );
            setIsLoading(false);
            setIsStreaming(false);
          },
        );
      } else {
        try {
          const response = await sendMessageToAI(messagesForAI);
          const assistantMessage = createMessage("assistant", response);

          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === currentConvId) {
                return {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: new Date(),
                };
              }
              return conv;
            }),
          );
        } catch (err) {
          const errorMessage =
            err instanceof ApiError
              ? err.message
              : "An unexpected error occurred. Please try again.";
          setError(errorMessage);

          const errorResponseMessage = createMessage(
            "assistant",
            `⚠️ Error: ${errorMessage}`,
          );
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === currentConvId) {
                return {
                  ...conv,
                  messages: [...conv.messages, errorResponseMessage],
                  updatedAt: new Date(),
                };
              }
              return conv;
            }),
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading,
    isStreaming,
    error,
    sidebarPinned,
    mobileMenuOpen,
    streamingEnabled,
    darkMode,
    setError,
    setMobileMenuOpen,
    handleToggleStreaming,
    handleToggleDarkMode,
    handleNewConversation,
    handleConversationDelete,
    handleSelectConversation,
    handleClearHistory,
    handleTogglePin,
    handleSendMessage,
  };
}
