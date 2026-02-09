// Shared types for the AI Chat application

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  //To track time of message
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  //Can be used in future for stuff like metadata not used now for display but stored in localstorage
  createdAt: Date;
  //Used to show the time difference in sidebar between last updated
  updatedAt: Date;
}

// Utility function to generate unique IDs sice we dont want to use index (pref never use index)
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Utility to create a new conversation, triggered on "New Chat" button or auto-created when sending first message
export const createConversation = (title?: string): Conversation => ({
  id: generateId(),
  title: title || "New Chat",
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Utility to create a new message, triggered as a object maker for whenever the user sends a message and when the AI
// replies
export const createMessage = (
  role: "user" | "assistant",
  content: string,
): Message => ({
  id: generateId(),
  role,
  content,
  timestamp: new Date(),
});
