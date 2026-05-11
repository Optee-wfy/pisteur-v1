import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TRPCProvider } from "@/lib/trpc-provider";
import Navbar from "@/components/ui/navbar";

export default async function LeadsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <TRPCProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar user={user} />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-8 xl:px-10">
          {children}
        </main>
      </div>
    </TRPCProvider>
  );
}
