interface StreamingToggleProps {
  streamingEnabled: boolean;
  onToggle: () => void;
}

function StreamingToggle({ streamingEnabled, onToggle }: StreamingToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors border ${
        streamingEnabled
          ? "bg-violet-600 text-white border-violet-500 dark:bg-violet-600 dark:border-violet-500"
          : "bg-white text-neutral-500 border-neutral-300 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-500 dark:border-neutral-800 dark:hover:text-neutral-300 dark:hover:bg-neutral-800"
      }`}
        title={
          streamingEnabled
            ? "Click to disable streaming"
            : "Click to enable streaming"
        }
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
        <span>{streamingEnabled ? "Stream" : "No stream"}</span>
      </button>
  );
}

export default StreamingToggle;
