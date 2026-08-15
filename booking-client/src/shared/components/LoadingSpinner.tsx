export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4" role="status" aria-label="Loading">
      <div className="relative h-14 w-14">
        <svg className="h-full w-full animate-spin" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <circle cx="28" cy="28" r="23" stroke="#B8862B" strokeOpacity="0.16" strokeWidth="2.5" />
          <path d="M28 5a23 23 0 0 1 21.5 14.5" stroke="#B8862B" strokeWidth="3" strokeLinecap="round" />
          <path d="M28 5a23 23 0 0 1 19.9 5.1" stroke="#D8AE5F" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-ink"
          aria-hidden="true"
        >
          B<span className="text-brass">.</span>
        </span>
      </div>
    </div>
  );
}
