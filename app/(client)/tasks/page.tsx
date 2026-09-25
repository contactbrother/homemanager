import { ListChecks } from "lucide-react";

export const metadata = { title: "Requests" };

/** On desktop the list sits beside this; phones and tablets never show it. */
export default function RequestsIndex() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[var(--r-lg)] border border-dashed border-[var(--line-strong)] px-6 text-center lg:mt-[60px]">
      <ListChecks aria-hidden size={28} strokeWidth={1.5} className="text-[var(--mute)]" />
      <p className="mt-3 font-medium">Choose a request to see its history</p>
      <p className="mt-1 text-[var(--mute)]">Updates from the team and your notes appear there.</p>
    </div>
  );
}
