interface ChatHeaderProps {
  title: string;
  onMenuOpen: () => void;
}

function ChatHeader({ title, onMenuOpen }: ChatHeaderProps) {
  return (
    <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-neutral-900 bg-neutral-950">
      <button
        onClick={onMenuOpen}
        className="h-8 w-8 -ml-1 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
        aria-label="Open menu"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
      <h1 className="text-[13px] font-medium text-neutral-300 truncate">{title}</h1>
    </div>
  );
}

export default ChatHeader;
