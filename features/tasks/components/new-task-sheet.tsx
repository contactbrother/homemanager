"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/features/tasks/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import type { Property } from "@/lib/supabase/types";

/**
 * FR-024, FR-030. The client is never asked to categorise or prioritise. The property
 * selector appears only when there is more than one to choose between.
 */
export function NewTaskSheet({ properties }: { properties: Property[] }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [voice, setVoice] = useState<File | null>(null);
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (properties.length === 0) return null;

  function send(withVoice: File | null) {
    setError(null);
    start(async () => {
      const result = await createTask({
        propertyId: propertyId || properties[0].id,
        body,
        voice: withVoice,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigator.vibrate?.(12);
      setOpen(false);
      setBody("");
      setVoice(null);
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Ask for something</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Ask for something">
        <div className="space-y-4">
          {properties.length > 1 ? (
            <div>
              <label htmlFor="property" className="block mb-2">
                Which home
              </label>
              <select
                id="property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
              >
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label htmlFor="body" className="block mb-2">
              What do you need?
            </label>
            <textarea
              id="body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
            />
          </div>

          {/* Release sends immediately: a voice note needs no second step. */}
          <VoiceRecorder
            disabled={pending}
            onRecorded={(file) => {
              if (!file) return;
              setVoice(file);
              send(file);
            }}
          />

          {voice ? (
            <p className="text-[var(--mute)]">Voice note attached.</p>
          ) : null}

          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            thumb
            disabled={pending}
            onClick={() => send(voice)}
          >
            {pending ? "Sending" : "Send"}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
