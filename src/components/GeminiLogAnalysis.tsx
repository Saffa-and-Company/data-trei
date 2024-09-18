import { useState } from "react";
import { Button, TextField, Card, Text, Flex, Select } from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";

export default function GeminiLogAnalysis() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [logType, setLogType] = useState("github");
  const supabase = createClient();

  const handleAskQuestion = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/analyze-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, logType }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("An error occurred while processing your question.");
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAskQuestion();
    }
  };

  return (
    <Card style={{ marginBottom: "20px" }}>
      <Flex direction="column" gap="3">
        <Text size="5" weight="bold">
          Ask Gemini about your logs
        </Text>
        <Flex gap="2">
          <Select.Root
            value={logType}
            onValueChange={(value) => setLogType(value)}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="github">GitHub Logs</Select.Item>
              <Select.Item value="custom">Custom Logs</Select.Item>
              <Select.Item value="gcp">GCP Logs</Select.Item>
            </Select.Content>
          </Select.Root>
          <TextField.Root
            placeholder="Ask a question about your logs..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ flexGrow: 1 }}
          />
          <Button onClick={handleAskQuestion} disabled={loading}>
            {loading ? "Processing..." : "Ask Question"}
          </Button>
        </Flex>
        {answer && (
          <Card variant="surface">
            <Text>{answer}</Text>
          </Card>
        )}
      </Flex>
    </Card>
  );
}
