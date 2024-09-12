"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flex, Text, Container, Heading, Button } from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";
import {
  ActivityLogIcon,
  GitHubLogoIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";

import GithubIntegration from "@/components/GithubIntegration";
import GCPIntegration from "@/components/GCPIntegration";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

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

        <Flex gap="4">
          <Button onClick={() => router.push("/repo-dashboard")} size="3">
            <ActivityLogIcon />
            View Repository Dashboard
          </Button>
          <Button onClick={() => router.push("/api-keys")} size="3">
            <LockClosedIcon />
            Manage API Keys
          </Button>
          <Button onClick={() => router.push("/github-connections")} size="3">
            <GitHubLogoIcon />
            Manage GitHub Connections
          </Button>
        </Flex>

        <GithubIntegration />
        <GCPIntegration />
      </Flex>
    </Container>
  );
}
