"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Flex, Text, Container, Heading, Button } from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";

import GithubIntegration from "@/components/GithubIntegration";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "github_connected") {
      setMessage("Successfully connected to GitHub!");
    } else if (error) {
      setMessage(`Error: ${error.replace(/_/g, " ")}`);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      router.push("/");
    }
  };

  return (
    <Container size="3">
      <Flex justify="end" py="4">
        <Button variant="soft" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>
      <Flex direction="column" gap="6" align="center" py="9">
        <Heading size="8" align="center">
          Welcome to Data Trei
        </Heading>
        <Text size="4" align="center" style={{ maxWidth: "600px" }}>
          Secure your B2B operations with advanced log tracking and threat
          intelligence
        </Text>

        {/* {message && (
          <Text size="3" color={message.startsWith("Error") ? "red" : "green"}>
            {message}
          </Text>
        )} */}

        <GithubIntegration />
      </Flex>
    </Container>
  );
}
