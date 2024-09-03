import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      style={{ minHeight: "100vh" }}
    >
      <Heading size="8" mb="4">
        Oops! Something went wrong.
      </Heading>
      <Text size="5" mb="6">
        We apologize for the inconvenience. Please try again later.
      </Text>
      <Button size="3" onClick={() => router.push("/")}>
        Return to Home
      </Button>
    </Flex>
  );
}
