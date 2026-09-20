"use client";

import { useEffect, useRef, useState } from "react";
import { getVoiceUrl } from "@/features/tasks/actions";

/**
 * Plays a stored recording. The signed URL is fetched only when the person asks to
 * hear it, so a page with several notes does not mint several URLs on load, and a
 * URL that has expired is simply fetched again on the next tap.
 */
export function VoiceNote({ path, label = "Voice note" }: { path: string; label?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (url && audio.current) audio.current.play().catch(() => undefined);
  }, [url]);

  async function load() {
    setError(null);
    setLoading(true);
    const result = await getVoiceUrl(path);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setUrl(result.data.url);
  }

  if (url) {
    return (
      <div className="mt-2">
        <audio
          ref={audio}
          controls
          preload="metadata"
          src={url}
          className="w-full max-w-sm"
          aria-label={label}
          onError={() => {
            setUrl(null);
            setError("That recording could not be played.");
          }}
        />
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={load}
        disabled={loading}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] px-4 font-medium"
      >
        <span aria-hidden="true">▶</span>
        {loading ? "Loading" : `Play ${label.toLowerCase()}`}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-[var(--alert)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
