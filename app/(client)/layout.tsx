import { requireClient } from "@/features/auth/guards";
import { ClientNav } from "@/components/nav/client-nav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Content first, navigation last: the thumb reaches the bottom. FR-044. */}
      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-8 pb-32">
        {children}
      </main>
      <ClientNav />
    </div>
  );
}
