"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
export function NewTaskSheet({
  properties,
  trigger = "inline",
}: {
  properties: Property[];
  /** inline: a normal button. sidebar: rail and sidebar form. fab: floats above the phone tab bar. */
  trigger?: "inline" | "sidebar" | "fab";
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  if (properties.length === 0) return null;
  // A request page has its own reply bar at the bottom; the floating button would cover it.
  if (trigger === "fab" && /^\/tasks\/.+/.test(pathname)) return null;

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
      {trigger === "inline" ? (
        <Button onClick={() => setOpen(true)}>
          <Plus aria-hidden size={18} strokeWidth={2.25} />
          New request
        </Button>
      ) : null}
      {trigger === "sidebar" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="New request"
          className="inline-flex h-11 w-11 items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--accent)] font-semibold text-white transition-[transform,background-color] duration-[var(--fast)] hover:bg-[var(--accent-text)] active:scale-[0.97] lg:w-full"
        >
          <Plus aria-hidden size={20} strokeWidth={2.25} />
          <span className="hidden lg:inline">New request</span>
        </button>
      ) : null}
      {trigger === "fab" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="md:hidden fixed right-5 z-40 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+16px)] inline-flex h-14 items-center gap-2 rounded-[var(--r-full)] bg-[var(--accent)] pl-5 pr-6 font-semibold text-white shadow-[0_6px_20px_rgba(24,34,30,0.22)] active:scale-[0.97] transition-transform duration-[var(--fast)]"
        >
          <Plus aria-hidden size={20} strokeWidth={2.25} />
          New request
        </button>
      ) : null}
      <Sheet open={open} onClose={() => setOpen(false)} title="New request">
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
