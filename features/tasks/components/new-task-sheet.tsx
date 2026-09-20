"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/features/tasks/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { PriorityPicker } from "./priority-picker";
import type { TaskPriority } from "@/lib/constants";
import type { Property } from "@/lib/supabase/types";

/**
 * FR-024, FR-030, revised. A request is a title, optional detail and a priority.
 * The property selector appears only when there is more than one to choose between.
 */
export function NewTaskSheet({ properties }: { properties: Property[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (properties.length === 0) return null;

  function send() {
    setError(null);
    start(async () => {
      const result = await createTask({
        propertyId: propertyId || properties[0].id,
        title,
        body,
        priority,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigator.vibrate?.(12);
      setOpen(false);
      setTitle("");
      setBody("");
      setPriority("normal");
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Request something</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Request something">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          {properties.length > 1 ? (
            <div>
              <label htmlFor="property" className="block mb-2">
                Which home
              </label>
              <select
                id="property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full min-h-[44px] px-4"
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
            <label htmlFor="title" className="block mb-2">
              What is it?
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={80}
              placeholder="AC not cooling in master bedroom"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[44px] px-4"
            />
          </div>

          <div>
            <label htmlFor="body" className="block mb-2">
              Anything else we should know?{" "}
              <span className="text-[var(--mute)]">Optional</span>
            </label>
            <textarea
              id="body"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3"
            />
          </div>

          <PriorityPicker value={priority} onChange={setPriority} />

          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" thumb disabled={pending}>
            {pending ? "Sending" : "Send request"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
