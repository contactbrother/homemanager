"use client";

import {
  TASK_PRIORITIES,
  TASK_PRIORITY_HINTS,
  TASK_PRIORITY_LABELS,
  type TaskPriority,
} from "@/lib/constants";

const selected: Record<TaskPriority, string> = {
  low: "border-[var(--ink)] bg-[var(--surface-2)]",
  normal: "border-[var(--accent)] bg-[var(--accent-soft)]",
  high: "border-[var(--warn)] bg-[var(--warn-soft)]",
  emergency: "border-[var(--alert)] bg-[var(--alert-soft)]",
};

/** Four options, one tap each, with a plain sentence so no one has to guess what
 *  "high" means at 11pm with water on the floor. */
export function PriorityPicker({
  value,
  onChange,
  name = "priority",
  compact = false,
}: {
  value: TaskPriority;
  onChange: (next: TaskPriority) => void;
  name?: string;
  compact?: boolean;
}) {
  return (
    <fieldset>
      <legend className="block mb-2">How urgent is it?</legend>
      <div className={compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 gap-2"}>
        {TASK_PRIORITIES.map((option) => {
          const active = option === value;
          return (
            <label
              key={option}
              className={[
                "cursor-pointer rounded-[var(--r-md)] border px-3 py-2 min-h-[44px] flex flex-col justify-center",
                active ? selected[option] : "border-[var(--line)] bg-[var(--surface)]",
              ].join(" ")}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={active}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span className="font-medium">{TASK_PRIORITY_LABELS[option]}</span>
              {!compact ? (
                <span className="text-[length:var(--text-small)] text-[var(--mute)]">
                  {TASK_PRIORITY_HINTS[option]}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
