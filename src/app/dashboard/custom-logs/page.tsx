"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Flex, Heading, Card, Text, ScrollArea, Badge } from "@radix-ui/themes";
import { RealtimeChannel } from "@supabase/supabase-js";

type CustomLog = {
  id: string;
  repo_name: string;
  event_type: string;
  message: string;
  created_at: string;
  metadata: Record<string, any>;
};

export default function CustomLogsPage() {
  const [logs, setLogs] = useState<CustomLog[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchCustomLogs();

    // Set up real-time listener
    const channel = supabase
      .channel("custom_logs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "custom_logs",
        },
        (payload) => {
          console.log("Change received!", payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCustomLogs = async () => {
    const { data, error } = await supabase
      .from("custom_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100); // Limit to the most recent 100 logs

    if (error) {
      console.error("Error fetching custom logs:", error);
    } else {
      setLogs(data || []);
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    fetchCustomLogs();
  };

  return (
    <Flex direction="column" gap="6" p="6" width="100%">
      <Heading size="8">Custom Logs</Heading>
      <Card>
        <ScrollArea style={{ height: "70vh" }}>
          <Flex direction="column" gap="3">
            {logs.map((log) => (
              <Card key={log.id} style={{ padding: "12px" }}>
                <Flex justify="between" align="center" mb="2">
                  <Badge color="blue">{log.event_type}</Badge>
                  <Text size="1" color="gray">
                    {new Date(log.created_at).toLocaleString()}
                  </Text>
                </Flex>
                <Text>{log.message}</Text>
                <Flex justify="between" align="center" mt="2">
                  <Text size="1" color="gray">
                    Repository: {log.repo_name}
                  </Text>
                </Flex>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <Card mt="2" variant="surface">
                    <Text size="1" weight="bold">
                      Metadata:
                    </Text>
                    <pre style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </Card>
                )}
              </Card>
            ))}
          </Flex>
        </ScrollArea>
      </Card>
    </Flex>
  );
}
