"use client";

import { Button, Flex, Text, Container, Heading, Box } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <Container size="4" className="min-h-screen py-20">
      <Flex direction="column" gap="9" align="center">
        <Heading size="9" align="center">
          Welcome to Data Trei
        </Heading>
        <Text size="5" align="center" className="max-w-2xl">
          Secure your B2B operations with advanced log tracking and threat
          intelligence
        </Text>
        <Flex gap="4">
          <Button
            onClick={() => router.push("/dashboard")}
            size="4"
            variant="solid"
          >
            Get Started
          </Button>
          <Button size="4" variant="outline">
            Learn More
          </Button>
        </Flex>
        {/* <Box className="relative w-full aspect-video max-w-4xl">
          <Image
            src="/dashboard-mockup.png"
            alt="Data Trei Dashboard"
            layout="fill"
            objectFit="cover"
            className="rounded-lg shadow-2xl"
          />
        </Box> */}
        <Flex direction="column" gap="6" className="max-w-4xl">
          <Heading size="6" align="center">
            Why Choose Data Trei?
          </Heading>
          <Flex gap="6" wrap="wrap" justify="center">
            {[
              {
                title: "Real-time Monitoring",
                description:
                  "Track your B2B logs in real-time for immediate insights",
              },
              {
                title: "Threat Intelligence",
                description:
                  "Advanced AI to detect and alert you about potential threats",
              },
              {
                title: "Easy Integration",
                description:
                  "Seamlessly integrate with your existing B2B infrastructure",
              },
              {
                title: "Customizable Alerts",
                description: "Set up personalized alerts for critical events",
              },
            ].map((feature, index) => (
              <Box key={index} className="w-64 p-4 border rounded-lg">
                <Heading size="4">{feature.title}</Heading>
                <Text size="2" color="gray">
                  {feature.description}
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
}
