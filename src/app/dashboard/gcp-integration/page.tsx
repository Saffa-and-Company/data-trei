"use client";

import GCPIntegration from "@/components/GCPIntegration";
import { Flex, Heading, Button } from "@radix-ui/themes";
import Link from "next/link";
import DashboardLayout from "../layout";

export default function GCPIntegrationPage() {
  return (
    <Flex direction="column" gap="6" p="6" width="100%">
      <Flex justify="between" align="center">
        <Heading size="8">GCP Integration</Heading>
      </Flex>
      <GCPIntegration />
    </Flex>
  );
}
