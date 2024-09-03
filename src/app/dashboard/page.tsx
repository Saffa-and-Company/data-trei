import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import Loader from "@/components/Loader";

export default async function PrivatePage() {
  return <p>Hello welcome to the private page</p>;
}
