"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Flex,
  Heading,
  Button,
  Card,
  Text,
  TextField,
  Dialog,
  Switch,
} from "@radix-ui/themes";
import {
  LockClosedIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
} from "@radix-ui/react-icons";
import { createClient } from "@/utils/supabase/client";
import { successToast, errorToast } from "@/components/Toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
  usage_limit: number | null;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const supabase = createClient();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [toastTitle, setToastTitle] = useState("");
  const [toastDescription, setToastDescription] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    const { data, error } = await supabase.from("api_keys").select("*");
    if (error) {
      console.error("Error fetching API keys:", error);
    } else {
      setApiKeys(data);
    }
  };

  const createApiKey = async () => {
    const response = await fetch("/api/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      fetchApiKeys();
    } else {
      console.error("Error creating API key:", await response.text());
    }
  };

  const toggleApiKey = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from("api_keys")
      .update({ active })
      .eq("id", id);

    if (error) {
      console.error("Error updating API key:", error);
    } else {
      fetchApiKeys();
    }
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) {
      console.error("Error deleting API key:", error);
    } else {
      fetchApiKeys();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        successToast("Copied to clipboard");
      },
      (err) => {
        errorToast("Failed to copy");
      }
    );
  };

  return (
    <Flex direction="column" gap="6" p="6">
      <Flex justify="between" align="center">
        <Heading size="8">API Key Management</Heading>
        <Button variant="soft" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </Flex>

      <Card>
        <Heading size="3" mb="4">
          Create New API Key
        </Heading>
        <Flex gap="4" align="end">
          {apiKeys.length === 0 ? (
            <Button onClick={createApiKey}>
              <PlusIcon />
              Create Key
            </Button>
          ) : (
            <Text>
              You already have an API key. Only one key is allowed per user.
            </Text>
          )}
        </Flex>
      </Card>

      <Card>
        <Heading size="3" mb="4">
          Your API Keys
        </Heading>
        <Flex direction="column" gap="4">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <Flex justify="between" align="center">
                <Flex direction="column" gap="1">
                  <Text weight="bold">{key.name}</Text>
                  <Text size="1">
                    Created: {new Date(key.created_at).toLocaleString()}
                  </Text>
                  {key.last_used_at && (
                    <Text size="1">
                      Last used: {new Date(key.last_used_at).toLocaleString()}
                    </Text>
                  )}
                  <Text size="1">
                    Usage: {key.usage_count} / {key.usage_limit || "∞"}
                  </Text>
                </Flex>
                <Flex gap="4" align="center">
                  <Button
                    variant="soft"
                    onClick={() => copyToClipboard(key.key)}
                  >
                    <CopyIcon />
                    Copy
                  </Button>
                  <Switch
                    checked={key.active}
                    onCheckedChange={(checked) => toggleApiKey(key.id, checked)}
                  />
                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button color="red" variant="soft">
                        <TrashIcon />
                        Delete
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <Dialog.Title>Confirm Deletion</Dialog.Title>
                      <Dialog.Description>
                        Are you sure you want to delete this API key? This
                        action cannot be undone.
                      </Dialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                          <Button variant="soft" color="gray">
                            Cancel
                          </Button>
                        </Dialog.Close>
                        <Dialog.Close>
                          <Button
                            variant="solid"
                            color="red"
                            onClick={() => deleteApiKey(key.id)}
                          >
                            Delete
                          </Button>
                        </Dialog.Close>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Card>

      <Card>
        <Flex justify="between" align="center" mb="4">
          <Heading size="3">How to Use Your API Key</Heading>
          <Button
            variant="soft"
            onClick={() =>
              copyToClipboard(`curl -X POST ${process.env.NEXT_PUBLIC_APP_PRODUCTION_URL}/api/webhook/log \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY_HERE" \\
  -d '{
    "repo_name": "example-repo",
    "event_type": "custom_event",
    "message": "This is a custom log message",
    "timestamp": "2023-05-01T12:00:00Z",
    "metadata": {
      "key1": "value1",
      "key2": "value2"
    }
  }'`)
            }
          >
            <CopyIcon />
            Copy Command
          </Button>
        </Flex>
        <Text mb="2">
          You can use your API key to send custom logs to Data Trei. Here&apos;s
          an example using curl:
        </Text>
        <Card variant="surface">
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {`curl -X POST ${process.env.NEXT_PUBLIC_APP_PRODUCTION_URL}/api/webhook/log \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY_HERE" \\
  -d '{
    "repo_name": "example-repo",
    "event_type": "custom_event",
    "message": "This is a custom log message",
    "timestamp": "2023-05-01T12:00:00Z",
    "metadata": {
      "key1": "value1",
      "key2": "value2"
    }
  }'`}
          </pre>
        </Card>
        <Text mt="2">
          Replace &apos;YOUR_API_KEY_HERE&apos; with your actual API key. You
          can customize the payload to include relevant information about your
          event.
        </Text>
      </Card>
    </Flex>
  );
}
