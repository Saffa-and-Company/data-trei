import { useState, useRef, useEffect } from "react";
import {
  Button,
  TextField,
  Card,
  Text,
  Flex,
  Select,
  Box,
} from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";
import parse from "html-react-parser";
import { parseAnswer } from "@/utils/helper";
import { ArrowUpIcon } from "@radix-ui/react-icons";

type GeminiLogAnalysisProps = {
  onClose: () => void;
};

export default function GeminiLogAnalysis({ onClose }: GeminiLogAnalysisProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [logType, setLogType] = useState("github");
  const answerRef = useRef<HTMLDivElement>(null);
  const textQueueRef = useRef<string[]>([]);
  const supabase = createClient();

  const handleAskQuestion = async () => {
    setLoading(true);
    setAnswer("");
    setNewText("");
    textQueueRef.current = [];
    try {
      const response = await fetch("/api/gemini/analyze-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, logType }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get response reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setLoading(false);
              return;
            }
            textQueueRef.current.push(parseAnswer(data));
          }
        }
      }
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

  useEffect(() => {
    const processQueue = () => {
      if (textQueueRef.current.length > 0) {
        const nextChunk = textQueueRef.current.shift();
        setNewText(nextChunk || "");
        setTimeout(() => {
          setAnswer((prev) => prev + (nextChunk || ""));
          setNewText("");
        }, 500);
      }
    };

    const intervalId = setInterval(processQueue, 600);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  return (
    <Flex direction="column" gap="3" style={{ height: "100%" }}>
      <Flex direction="column" gap="2">
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
      </Flex>
      <Card variant="surface" style={{ flexGrow: 1, overflowY: "auto" }}>
        <Box
          ref={answerRef}
          style={{
            height: "100%",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <Text>{parse(answer)}</Text>
          <Text className={newText ? "animate-fade-in" : ""}>
            {parse(newText)}
          </Text>
        </Box>
      </Card>
      <Flex
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        <Button
          onClick={handleAskQuestion}
          disabled={loading}
          style={{ width: "48%" }}
        >
          <ArrowUpIcon />
        </Button>
        <Button variant="outline" onClick={onClose} style={{ width: "48%" }}>
          Close
        </Button>
      </Flex>
    </Flex>
  );
}
