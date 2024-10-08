"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { Flex } from "@radix-ui/themes";
import FloatingChatButton from "@/components/FloatingChatButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Flex>
      <Navbar />
      <Flex
        style={{
          marginLeft: "300px",
          width: "calc(100% - 300px)",
          minHeight: "100vh",
        }}
      >
        {children}
        <FloatingChatButton />
      </Flex>
    </Flex>
  );
}
