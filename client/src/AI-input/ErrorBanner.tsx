import { useEffect, useState } from "react";

interface ErrorBannerProps {
  error: string;
  onDismiss: () => void;
  darkMode?: boolean;
  autoDismissMs?: number;
}

function ErrorBanner({ error, onDismiss, darkMode = true, autoDismissMs = 5000 }: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(), 200);
  };

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss after specified time
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(), 200);
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  return (
    <div 
      className={`
        absolute top-16 right-4 z-20 md:right-6 max-w-sm
        transform transition-all duration-200 ease-out
        ${isVisible && !isExiting 
          ? "translate-x-0 opacity-100" 
          : "translate-x-4 opacity-0"
        }
      `}
    >
      <div className={`backdrop-blur-md border rounded-xl px-4 py-3 shadow-lg ${
        darkMode
          ? "bg-red-500/15 border-red-500/30 shadow-red-500/10"
          : "bg-red-50 border-red-200 shadow-red-100"
      }`}>
        <div className="flex items-start gap-3">
          {/* Error icon */}
          <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
            darkMode ? "bg-red-500/20" : "bg-red-100"
          }`}>
            <svg
              className={`w-3 h-3 ${darkMode ? "text-red-400" : "text-red-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Error message */}
          <p className={`text-sm flex-1 leading-relaxed ${darkMode ? "text-red-300" : "text-red-700"}`}>{error}</p>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className={`shrink-0 transition-colors p-0.5 ${
              darkMode
                ? "text-red-400/60 hover:text-red-300"
                : "text-red-400 hover:text-red-600"
            }`}
            aria-label="Dismiss error"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar for auto-dismiss */}
        {autoDismissMs > 0 && (
          <div className={`mt-2 h-0.5 rounded-full overflow-hidden ${darkMode ? "bg-red-500/20" : "bg-red-200"}`}>
            <div 
              className={`h-full rounded-full ${darkMode ? "bg-red-400/50" : "bg-red-400"}`}
              style={{
                animation: `shrink ${autoDismissMs}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      {/* Keyframe animation for progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default ErrorBanner;
