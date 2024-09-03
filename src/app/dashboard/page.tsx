"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Flex, Text, Container, Heading } from "@radix-ui/themes";

import GithubIntegration from "@/components/GithubIntegration";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "github_connected") {
      setMessage("Successfully connected to GitHub!");
    } else if (error) {
      setMessage(`Error: ${error.replace(/_/g, " ")}`);
    }
  }, [searchParams]);

  return (
    <Container size="3">
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
