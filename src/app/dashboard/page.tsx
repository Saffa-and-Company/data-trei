"use client";

import { Flex, Text, Container, Heading, Card, Box } from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <Container size="3" p="6">
      <Flex direction="column" gap="6" align="center" py="9">
        <Heading size="8" align="center">
          Welcome to Data Trei
        </Heading>
        <Text size="4" align="center" style={{ maxWidth: "600px" }}>
          Secure your B2B operations with advanced log tracking and threat
          intelligence
        </Text>
        <Card className="w-full max-w-lg">
          <Flex direction="column" gap="6" align="center" p="6">
            <Heading size="5">Please select the data source</Heading>
            <Flex gap="4" justify="center" wrap="wrap">
              <Link href="/dashboard/gcp-integration" passHref>
                <Box
                  p="4"
                  className="border-[1px] border-gray-500 rounded-[--radius-3] w-[120px] h-[120px] flex flex-col justify-center items-center hover:border-[--color-accent-9]"
                >
                  <Flex direction="column" align="center" gap="2">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        src="/images/gcp.svg"
                        width={40}
                        height={40}
                        alt="GCP"
                      />
                    </div>
                    <Text>GCP</Text>
                  </Flex>
                </Box>
              </Link>
              <Link href="/dashboard/github-connections" passHref>
                <Box
                  p="4"
                  className="border-[1px] border-gray-500 rounded-[--radius-3] w-[120px] h-[120px] flex flex-col justify-center items-center hover:border-[--color-accent-9]"
                >
                  <Flex direction="column" align="center" gap="2">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <GitHubLogoIcon width={40} height={40} />
                    </div>
                    <Text>GitHub</Text>
                  </Flex>
                </Box>
              </Link>
              <Link href="/dashboard/api-keys" passHref>
                <Box
                  p="4"
                  className="border-[1px] border-gray-500 rounded-[--radius-3] w-[120px] h-[120px] flex flex-col justify-center items-center hover:border-[--color-accent-9]"
                >
                  <Flex direction="column" align="center" gap="2">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        src="/images/custom-api.svg"
                        width={40}
                        height={40}
                        alt="Custom API"
                      />
                    </div>
                    <Text>Custom API</Text>
                  </Flex>
                </Box>
              </Link>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}
