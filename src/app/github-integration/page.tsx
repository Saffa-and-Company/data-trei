import GithubIntegration from "@/components/GithubIntegration";
import { Flex, Heading, Button } from "@radix-ui/themes";
import Link from "next/link";

export default function GitHubIntegrationPage() {
  return (
    <Flex direction="column" gap="6" p="6">
      <Flex justify="between" align="center">
        <Heading size="8">GitHub Integration</Heading>
        <Link href="/dashboard">
          <Button variant="soft">Back to Main Dashboard</Button>
        </Link>
      </Flex>
      <GithubIntegration />
    </Flex>
  );
}
