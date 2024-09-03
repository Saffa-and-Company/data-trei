import { login, signup } from "./actions";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";

export default function LoginPage() {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      style={{ minHeight: "100vh" }}
    >
      <Flex
        direction="column"
        gap="4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <form style={{ width: "100%" }}>
          <Flex direction="column" gap="3" style={{ width: "100%" }}>
            <Text as="label" htmlFor="email" size="2" weight="bold">
              Email:
            </Text>
            <TextField.Root
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              style={{ width: "100%" }}
            />
            <Text as="label" htmlFor="password" size="2" weight="bold">
              Password:
            </Text>
            <TextField.Root
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              style={{ width: "100%" }}
            />
            <Flex gap="3" mt="4">
              <Button type="submit" formAction={login} style={{ flex: 1 }}>
                Log in
              </Button>
              <Button
                type="submit"
                formAction={signup}
                variant="outline"
                style={{ flex: 1 }}
              >
                Sign up
              </Button>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
}
