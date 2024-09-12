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

  const fetchGCPLogs = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/gcp/logs?projectId=${selectedProject}`
      );
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      } else {
        console.error("Failed to fetch GCP logs");
      }
    } catch (error) {
      console.error("Error fetching GCP logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction="column" gap="4">
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
            onClick={fetchGCPLogs}
            loading={isLoading}
            disabled={!selectedProject || isLoading}
          >
            Fetch GCP Logs
          </Button>
          <ScrollArea style={{ height: "300px" }}>
            {logs.map((log, index) => (
              <Card key={index} style={{ marginBottom: "8px" }}>
                <Text size="2" weight="bold">
                  {log.severity} - {log.resource.type}
                </Text>
                {log.httpRequest && (
                  <Text size="2">
                    {log.httpRequest.requestMethod} {log.httpRequest.requestUrl}{" "}
                    - Status: {log.httpRequest.status}
                  </Text>
                )}
                <Text size="2">
                  {log.textPayload ||
                    (log.jsonPayload
                      ? JSON.stringify(log.jsonPayload)
                      : "No payload")}
                </Text>
                {log.labels && (
                  <Text size="1">Labels: {JSON.stringify(log.labels)}</Text>
                )}
                <Text size="1" color="gray">
                  {new Date(log.timestamp).toLocaleString()} - {log.logName}
                </Text>
              </Card>
            ))}
          </ScrollArea>
        </>
      )}
    </Flex>
  );
}
