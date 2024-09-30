import { useState } from "react";
import { Button, TextField, Card, Text, Flex, Box } from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";
import parse from "html-react-parser";

export default function GithubDataManagement() {
  const [action, setAction] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAction = async () => {
    setLoading(true);
    setResponse("");
    try {
      const response = await fetch("/api/gemini/data-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      await executeAction(data);
    } catch (error) {
      console.error("Error processing action:", error);
      setResponse("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (actionData: { action: string; params: any }) => {
    try {
      switch (actionData.action) {
        case "github-revoke-access-all":
          await handleRevokeAccessAll(actionData.params.username);
          break;
        case "github-list-collaborators":
          setResponse("Listing collaborators is not implemented yet.");
          break;
        case "github-add-collaborator":
          setResponse("Adding collaborator is not implemented yet.");
          break;
        case "error":
          setResponse(`Error: ${actionData.params.message}`);
          break;
        default:
          setResponse(`Unknown action: ${actionData.action}`);
      }
    } catch (error) {
      console.error("Error executing action:", error);
      setResponse(`Error executing action: ${actionData.action}`);
    }
  };

  const handleRevokeAccessAll = async (username: string) => {
    try {
      const response = await fetch("/api/github/revoke-access-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (response.ok) {
        setResponse(
          `Access revoked for ${username} from all repositories.\n\n${data.message}`
        );
      } else {
        setResponse(`Failed to revoke access: ${data.error}`);
      }
    } catch (error) {
      console.error("Error revoking access:", error);
      setResponse(
        "An error occurred while trying to revoke access from all repositories."
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAction();
    }
  };

  return (
    <Card style={{ marginBottom: "20px" }}>
      <Flex direction="column" gap="3">
        <Text size="5" weight="bold">
          GitHub Data Management
        </Text>
        <TextField.Root
          placeholder="Enter your action (e.g., 'Revoke access for username from all repositories')"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={handleAction} disabled={loading}>
          {loading ? "Processing..." : "Execute Action"}
        </Button>
        {response && (
          <Card variant="surface">
            <Box
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <Text>{parse(response)}</Text>
            </Box>
          </Card>
        )}
      </Flex>
    </Card>
  );
}
