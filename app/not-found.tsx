import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col px-6 py-10 max-w-md w-full mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-[length:var(--text-title)]">That page is not here.</h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          It may have moved, or the link may be one you are not able to open.
        </p>
      </div>
      <Link href="/" className="block">
        <Button type="button" thumb>
          Back to home
        </Button>
      </Link>
    </main>
  );
}
