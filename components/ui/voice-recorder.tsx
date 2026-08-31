"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hold to record, release to send. The signature interaction of the product.
 *
 * The container is whatever the browser chooses: iOS Safari produces audio/mp4 and
 * Chrome produces audio/webm, and asking for a specific mime type is the usual cause
 * of silent failure on iOS. Migration 3 allows both. See research.md R7.
 *
 * Where MediaRecorder is absent or the microphone is refused, this renders nothing at
 * all and the text field alone carries the interaction, which FR-022 already requires
 * to be sufficient.
 */
export function VoiceRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (file: File | null) => void;
  disabled?: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [refused, setRefused] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        typeof window.MediaRecorder !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia,
    );
  }, []);

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  async function start() {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      // No mimeType argument: let the browser pick what it can actually produce.
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType });
        // A tap rather than a hold produces nothing worth sending.
        if (blob.size < 1024) {
          onRecorded(null);
          return;
        }
        onRecorded(new File([blob], "voice-note", { type: rec.mimeType }));
      };
      rec.start();
      recorder.current = rec;
      setSeconds(0);
      setRecording(true);
      navigator.vibrate?.(10);
    } catch {
      setRefused(true);
    }
  }

  function stop() {
    recorder.current?.stop();
    recorder.current = null;
    setRecording(false);
  }

  if (!supported || refused) return null;

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={() => recording && stop()}
        // Keyboard equivalent, because a press-and-hold is not operable by keyboard. FR-054.
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !recording) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if ((e.key === " " || e.key === "Enter") && recording) {
            e.preventDefault();
            stop();
          }
        }}
        className="w-full min-h-[56px] rounded-[var(--r-md)] border border-[var(--line)]
                   transition-transform duration-[var(--fast)] ease-[var(--ease)] active:scale-[0.98]
                   data-[recording=true]:border-[var(--alert)]"
        data-recording={recording}
      >
        {recording ? `Recording ${seconds}s, release to send` : "Hold to record"}
      </button>
      <p aria-live="polite" className="sr-only">
        {recording ? "Recording" : ""}
      </p>
    </div>
  );
}
