"use client";
import { useState } from "react";
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { login, signup } from "./actions";
import { Button, Flex, Text, TextField, Card } from "@radix-ui/themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { customToast } from "@/components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      customToast(result.error || "An error occurred");
      console.error(result.error);
    }
  };

  const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const result = await signup(email, password);
    if (result.success) {
      router.push("/");
      customToast("A confirmation email has been sent to your email address.");
    } else {
      customToast(result.error || "An error occurred");
      console.error(result.error);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Image
        src="/images/background.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />
      <Flex
        justify="center"
        align="center"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: adds a dark overlay
        }}
      >
        <Card style={{ maxWidth: 450, width: "100%", opacity: 0.7 }}>
          <Flex direction="column" gap="3">
            <Image
              src="/images/heading_logo.svg"
              alt="Logo"
              width={300}
              height={100}
              className="m-5"
              style={{ opacity: 1.0 }}
            />

            <form onSubmit={(e) => e.preventDefault()}>
              <Flex direction="column" gap="3">
                <Text as="label" htmlFor="email" size="2" weight="bold">
                  Email:
                </Text>

                <TextField.Root
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                >
                  <TextField.Slot>
                    <EnvelopeClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                <Text as="label" htmlFor="password" size="2" weight="bold">
                  Password:
                </Text>

                <TextField.Root
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                <Flex gap="3" mt="4">
                  <Button
                    onClick={handleLogin}
                    type="button"
                    style={{ flex: 1 }}
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={handleSignup}
                    type="button"
                    variant="solid"
                    style={{ flex: 1 }}
                  >
                    Sign up
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </Flex>
    </div>
  );
}
