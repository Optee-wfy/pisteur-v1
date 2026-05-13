import PisteurSidebar from "@/components/pisteur/sidebar";
import { TRPCProvider } from "@/lib/trpc-provider";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PisteurLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <TRPCProvider>
      <div
        className="grid h-screen w-full"
        style={{ gridTemplateColumns: "var(--pisteur-sidebar-width, 220px) minmax(0, 1fr)" }}
      >
        <PisteurSidebar />
        <main className="overflow-y-auto">
          {children}
        </main>
      </div>
    </TRPCProvider>
  );
}
