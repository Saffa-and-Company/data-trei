import { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Text,
  Card,
  ScrollArea,
  Select,
  Spinner,
} from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";

interface GCPLog {
  timestamp: string;
  severity: string;
  resource: {
    type: string;
    labels: {
      [key: string]: string;
    };
  };
  httpRequest?: {
    requestMethod: string;
    requestUrl: string;
    status: number;
    userAgent: string;
    remoteIp: string;
  } | null;
  labels?: {
    [key: string]: string;
  } | null;
  logName?: string | null;
  textPayload: string | null;
  jsonPayload: any | null;
}

interface GCPProject {
  projectId: string;
  name: string;
}

export default function GCPIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [projects, setProjects] = useState<GCPProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [logs, setLogs] = useState<GCPLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkGCPConnection();
  }, []);

  const checkGCPConnection = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("gcp_connections")
        .select("id")
        .eq("user_id", user.id)
        .single();
      setIsConnected(!!data);
      if (data) {
        fetchGCPProjects();
      }
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/gcp/auth";
  };

  const fetchGCPProjects = async () => {
    try {
      const response = await fetch("/api/gcp/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      } else {
        console.error("Failed to fetch GCP projects");
      }
    } catch (error) {
      console.error("Error fetching GCP projects:", error);
    }
  };

  const setupLogIngestion = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/gcp/setup-log-ingestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Log ingestion set up successfully:", data);
        // You might want to update the UI to show that log ingestion is set up
      } else {
        console.error("Failed to set up log ingestion");
      }
    } catch (error) {
      console.error("Error setting up log ingestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGCPLogs = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("gcp_logs")
        .select("*")
        .eq("project_id", selectedProject)
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data);
    } catch (error) {
      console.error("Error fetching GCP logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex className="max-w-5xl" direction="column" gap="4" p="4">
      <Text size="5" weight="bold">
        GCP Integration
      </Text>
      {!isConnected ? (
        <Button onClick={handleConnect}>Connect GCP</Button>
      ) : (
        <>
          <Text>GCP Connected</Text>
          <Select.Root
            value={selectedProject || undefined}
            onValueChange={setSelectedProject}
          >
            <Select.Trigger placeholder="Select a project" />
            <Select.Content>
              {projects.map((project) => (
                <Select.Item key={project.projectId} value={project.projectId}>
                  {project.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Button
            onClick={setupLogIngestion}
            disabled={!selectedProject || isLoading}
          >
            Set Up Log Ingestion
          </Button>
          <Button
            onClick={fetchGCPLogs}
            disabled={!selectedProject || isLoading}
          >
            Fetch GCP Logs
            {isLoading && <Spinner ml="2" />}
          </Button>
          <Card style={{ height: "400px" }}>
            <ScrollArea style={{ height: "100%" }}>
              {logs.map((log, index) => (
                <Card
                  key={index}
                  style={{ marginBottom: "16px", padding: "12px" }}
                >
                  <Flex direction="column" gap="2">
                    <Flex justify="between" align="center">
                      <Text size="2" weight="bold">
                        {log.severity} - {log.resource.type}
                      </Text>
                      <Text size="1" color="gray">
                        {new Date(log.timestamp).toLocaleString()}
                      </Text>
                    </Flex>

                    {log.httpRequest && (
                      <Text size="2">
                        {log.httpRequest.requestMethod}{" "}
                        {log.httpRequest.requestUrl} - Status:{" "}
                        {log.httpRequest.status}
                      </Text>
                    )}

                    <Text
                      size="2"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {log.textPayload ||
                        (log.jsonPayload
                          ? JSON.stringify(log.jsonPayload, null, 2)
                          : "No payload")}
                    </Text>

                    {log.labels && (
                      <Text size="1">
                        Labels: {JSON.stringify(log.labels, null, 2)}
                      </Text>
                    )}

                    <Text size="1" color="gray">
                      Log Name: {log.logName}
                    </Text>
                  </Flex>
                </Card>
              ))}
            </ScrollArea>
          </Card>
        </>
      )}
    </Flex>
  );
}
