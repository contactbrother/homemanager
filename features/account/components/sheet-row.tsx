"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { RowContent, rowClass } from "./settings";

/** A settings row that opens its form in a sheet. */
export function SheetRow({
  icon,
  label,
  value,
  tone,
  sheetTitle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  tone?: "default" | "danger" | "accent";
  sheetTitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button type="button" onClick={() => setOpen(true)} className={rowClass}>
        <RowContent
          icon={icon}
          label={label}
          value={value}
          tone={tone}
          trailing={<ChevronRight aria-hidden size={18} className="shrink-0 text-[var(--mute)]" />}
        />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={sheetTitle ?? label}>
        {children}
      </Sheet>
    </li>
  );
}
