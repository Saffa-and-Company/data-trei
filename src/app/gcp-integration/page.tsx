"use client";

import GCPIntegration from "@/components/GCPIntegration";
import { Flex, Heading, Button } from "@radix-ui/themes";
import Link from "next/link";

export default function GCPIntegrationPage() {
  return (
    <Flex direction="column" gap="6" p="6">
      <Flex justify="between" align="center">
        <Heading size="8">GCP Integration</Heading>
        <Link href="/dashboard">
          <Button variant="soft">Back to Main Dashboard</Button>
        </Link>
      </Flex>
      <GCPIntegration />
    </Flex>
  );
}
