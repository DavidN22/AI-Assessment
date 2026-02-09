import type { Conversation, Message } from "./types";

// Local storage keys
export const STORAGE_KEY = "ai-chat-conversations";
export const SIDEBAR_PINNED_KEY = "ai-chat-sidebar-pinned";
export const STREAMING_ENABLED_KEY = "ai-chat-streaming-enabled";
export const DARK_MODE_KEY = "ai-chat-dark-mode";

// Load streaming preference
export const loadStreamingEnabled = (): boolean => {
  try {
    const stored = localStorage.getItem(STREAMING_ENABLED_KEY);
    if (stored === null) return true;
    return stored === "true";
  } catch {
    return true;
  }
};

// Save streaming preference
export const saveStreamingEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem(STREAMING_ENABLED_KEY, String(enabled));
  } catch (error) {
    console.error("Failed to save streaming preference:", error);
  }
};

// Load dark mode preference
export const loadDarkMode = (): boolean => {
  try {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored === null) return true; // Default to dark mode
    return stored === "true";
  } catch {
    return true;
  }
};

// Save dark mode preference
export const saveDarkMode = (enabled: boolean) => {
  try {
    localStorage.setItem(DARK_MODE_KEY, String(enabled));
  } catch (error) {
    console.error("Failed to save dark mode preference:", error);
  }
};

// Load sidebar pinned state
export const loadSidebarPinned = (): boolean => {
  try {
    const stored = localStorage.getItem(SIDEBAR_PINNED_KEY);
    if (stored === null) return true;
    return stored === "true";
  } catch {
    return true;
  }
};

// Save sidebar pinned state
export const saveSidebarPinned = (pinned: boolean) => {
  try {
    localStorage.setItem(SIDEBAR_PINNED_KEY, String(pinned));
  } catch (error) {
    console.error("Failed to save sidebar pinned state:", error);
  }
};

// Load conversations from local storage
export const loadConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((conv: Conversation) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    }
  } catch (error) {
    console.error("Failed to load conversations:", error);
  }
  return [];
};

// Save conversations to local storage
export const saveConversations = (conversations: Conversation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Failed to save conversations:", error);
  }
};

// Clear conversations from local storage
export const clearConversationsStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};
