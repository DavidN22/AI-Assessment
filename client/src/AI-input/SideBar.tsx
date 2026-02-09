import { useState } from "react";
import type { Conversation } from "./types";
import { Trash } from "lucide-react";
interface SideBarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id:string) => void
  onClearHistory: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

function SideBar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearHistory,
  isPinned,
  onTogglePin,
  isMobile = false,
  onClose,
}: SideBarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isMobile || isPinned || isHovered;

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );

  // Format relative time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <aside
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className={`
        h-full bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-900/50
        flex flex-col transition-all duration-200 ease-out
        ${isMobile ? "w-full" : isExpanded ? "w-72" : "w-14"}
      `}
    >
      {/* Header */}
      <div
        className={`flex items-center h-14 border-b border-neutral-200 dark:border-neutral-900 transition-all duration-200 ${isExpanded ? "px-4 justify-between" : "px-0 justify-center"}`}
      >
        {isExpanded ? (
          <>
            <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
              History
            </span>
            <div className="flex items-center gap-1">
              {isMobile ? (
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800/60 transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={onTogglePin}
                  className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                    isPinned
                      ? "text-neutral-700 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-800"
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800/60"
                  }`}
                  aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                  title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                >
                  <svg
                    className="w-4 h-4"
                    fill={isPinned ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 5.25v6.75L18 15H6l2.25-3V5.25M12 15v6m-3.75-12h7.5"
                    />
                  </svg>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="h-8 w-8 rounded-md bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              C
            </span>
          </div>
        )}
      </div>

      {/* New chat button */}
      <div
        className={`transition-all duration-200 ${isExpanded ? "p-3" : "p-2"}`}
      >
        <button
          onClick={onNewConversation}
          className={`
            flex items-center justify-center rounded-md
            bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white
            text-white dark:text-neutral-900
            transition-all duration-150
            ${
              isExpanded
                ? "w-full h-9 gap-2 text-[13px] font-medium"
                : "w-10 h-10 mx-auto"
            }
          `}
          title="New Chat"
        >
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {isExpanded && <span>New chat</span>}
        </button>
      </div>

      {/* Conversation list */}
      <nav
        key={activeConversationId}
        className={`flex-1 overflow-y-auto custom-scrollbar ${isExpanded ? "px-2" : "px-2"}`}
      >
        {sortedConversations.length === 0 ? (
          isExpanded ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-neutral-400 dark:text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              </div>
              <p className="text-[13px] text-neutral-500 text-center">
                No conversations
              </p>
              <p className="text-[12px] text-neutral-400 dark:text-neutral-600 mt-1">
                Start a new chat
              </p>
            </div>
          ) : null
        ) : (
          <div className="space-y-0.5 pb-2">
            {sortedConversations.map((conversation) => {
              const isActive = activeConversationId === conversation.id;
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    w-full text-left rounded-md group
                    transition-colors duration-150
                    ${isExpanded ? "px-3 py-2" : "p-2 flex justify-center"}
                    ${
                      isActive
                        ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }
                  `}
                  title={isExpanded ? undefined : conversation.title}
                >
                  {isExpanded ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] truncate flex-1">
                        {conversation.title}
                      </span>
                      <span className="text-[11px] text-neutral-600 shrink-0">
                        {formatTime(conversation.updatedAt)}
                      </span>
                      <Trash
                        key={conversation.id}
                        className="w-4 h-4 shrink-0 cursor-pointer text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
                        onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${isActive ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-500"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      {conversations.length > 0 && (
        <div
          className={`border-t border-neutral-200 dark:border-neutral-900 transition-all duration-200 ${isExpanded ? "p-3" : "p-2"}`}
        >
          <button
            onClick={onClearHistory}
            className={`
              flex items-center justify-center gap-2 
              text-neutral-500 hover:text-red-500 dark:hover:text-red-400
              rounded-md transition-all duration-150
              hover:bg-neutral-100 dark:hover:bg-neutral-900
              ${isExpanded ? "w-full h-9 text-[13px]" : "w-10 h-10 mx-auto"}
            `}
            title="Clear history"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            {isExpanded && <span>Clear history</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

export default SideBar;
