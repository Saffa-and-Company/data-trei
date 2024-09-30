"use client";

import { Flex, Text, Container, Heading } from "@radix-ui/themes";
import GithubIntegration from "@/components/GithubIntegration";
import GeminiLogAnalysis from "@/components/GeminiLogAnalysis";

export default function DashboardPage() {
  return (
    <Container size="3" p="6">
      <GeminiLogAnalysis />
      <Flex direction="column" gap="6" align="center" py="9">
        <Heading size="8" align="center">
          Welcome to Data Trei
        </Heading>
        <Text size="4" align="center" style={{ maxWidth: "600px" }}>
          Secure your B2B operations with advanced log tracking and threat
          intelligence
        </Text>

        <GithubIntegration />
      </Flex>
    </Container>
  );
}
