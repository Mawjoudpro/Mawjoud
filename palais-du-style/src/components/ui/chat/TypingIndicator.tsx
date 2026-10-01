/** « En train d'écrire » : trois points qui ondulent, dans une bulle entrante (animation transform/opacity uniquement). */
export function TypingIndicator({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mt-1.5 self-start ${className}`} role="status" aria-label="Palais du Style écrit…">
      <svg viewBox="0 0 8 13" width="8" height="13" aria-hidden="true" className="absolute top-0 -left-[7px] -scale-x-100 text-cream">
        <path d="M0 0h8L1.5 10.5C.9 11.4 0 11 0 10Z" fill="currentColor" />
      </svg>
      <div className="flex h-[38px] items-center gap-1.5 rounded-[18px] rounded-tl-[4px] bg-cream px-4">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot size-[7px] rounded-full bg-ink/55" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </div>
    </div>
  );
}
