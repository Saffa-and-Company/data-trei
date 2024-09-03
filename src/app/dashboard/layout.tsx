import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Loader from "@/components/Loader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (!data) {
    return <Loader />;
  }

  if (!data.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
