import ChatContainer from "./ChatContainer";
import DarkModeToggle from "./DarkModeToggle";
import ErrorBanner from "./ErrorBanner";
import InputBar from "./InputBar";
import SideBar from "./SideBar";
import StreamingToggle from "./StreamingToggle";
import { useChatState } from "./useChatState";

function Chat() {
  const {
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
    handleSelectConversation,
    handleConversationDelete,
    handleClearHistory,
    handleTogglePin,
    handleSendMessage,
  } = useChatState();

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-neutral-950' : 'bg-white'}`}>
      {/* Sidebar - hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <SideBar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation = {handleConversationDelete}
          onClearHistory={handleClearHistory}
          isPinned={sidebarPinned}
          onTogglePin={handleTogglePin}
        />
      </div>

      {/* Mobile sidebar overlay */}
      <div className="md:hidden">
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <SideBar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => {
              handleSelectConversation(id);
              setMobileMenuOpen(false);
            }}
            onNewConversation={() => {
              handleNewConversation();
              setMobileMenuOpen(false);
            }}
            onClearHistory={handleClearHistory}
            onDeleteConversation = {handleConversationDelete}
            isPinned={true}
            onTogglePin={() => {}}
            isMobile={true}
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>
      </div>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile floating menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 h-9 w-9 flex items-center justify-center rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm dark:shadow-none"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <DarkModeToggle
            darkMode={darkMode}
            onToggle={handleToggleDarkMode}
          />
          <StreamingToggle
            streamingEnabled={streamingEnabled}
            onToggle={handleToggleStreaming}
          />
        </div>

        {error && <ErrorBanner error={error} onDismiss={() => setError(null)} darkMode={darkMode} />}

        <ChatContainer
          messages={activeConversation?.messages || []}
          isLoading={isLoading}
          isStreaming={isStreaming}
          activeConversationId={activeConversationId}
          inputBar={
            <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
          }
        />
      </main>
    </div>
  );
}

export default Chat;
