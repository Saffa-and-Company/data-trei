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

import { Database } from "@/types/supabase";

interface GCPProject {
  projectId: string;
  name: string;
}
type GCPLog = Database["public"]["Tables"]["gcp_logs"]["Row"];

export default function GCPIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [projects, setProjects] = useState<GCPProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [logs, setLogs] = useState<GCPLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIngestionSetup, setIsIngestionSetup] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkGCPConnection();
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      checkIngestionStatus();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && isIngestionSetup) {
      fetchInitialLogs();
      const subscription = subscribeToLogs();
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedProject, isIngestionSetup]);

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

  const checkIngestionStatus = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("gcp_log_ingestion")
        .select("*")
        .eq("project_id", selectedProject)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setIsIngestionSetup(!!data);
    } catch (error) {
      console.error("Error checking ingestion status:", error);
    } finally {
      setIsLoading(false);
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
        setIsIngestionSetup(true);
      } else {
        console.error("Failed to set up log ingestion");
      }
    } catch (error) {
      console.error("Error setting up log ingestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInitialLogs = async () => {
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
      console.error("Error fetching initial GCP logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToLogs = () => {
    return supabase
      .channel(`public:gcp_logs:project_id=eq.${selectedProject}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gcp_logs",
          filter: `project_id=eq.${selectedProject}`,
        },
        (payload) => {
          console.log("New log received:", payload.new);
          setLogs((currentLogs) => {
            const newLog = payload.new as GCPLog;
            const updatedLogs = [newLog, ...currentLogs];
            return updatedLogs.slice(0, 50); // Keep only the latest 50 logs
          });
        }
      )
      .subscribe();
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
            onValueChange={(value) => {
              setSelectedProject(value);
              setLogs([]);
            }}
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
          {selectedProject && !isIngestionSetup && (
            <Button onClick={setupLogIngestion} disabled={isLoading}>
              Set Up Log Ingestion
            </Button>
          )}
          {isLoading && <Spinner />}
          {isIngestionSetup && (
            <Card style={{ height: "400px" }}>
              <ScrollArea style={{ height: "100%" }}>
                {logs.map((log) => (
                  <Card
                    key={log.id}
                    style={{ marginBottom: "16px", padding: "12px" }}
                  >
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="center">
                        <Text size="2" weight="bold">
                          {log.severity}
                        </Text>
                        <Text size="1" color="gray">
                          {new Date(log.timestamp).toLocaleString()}
                        </Text>
                      </Flex>

                      <Text
                        size="2"
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {log.text_payload ||
                          (log.json_payload
                            ? JSON.stringify(log.json_payload, null, 2)
                            : "No payload")}
                      </Text>

                      {log.labels && (
                        <Text size="1">
                          Labels: {JSON.stringify(log.labels, null, 2)}
                        </Text>
                      )}

                      <Text size="1" color="gray">
                        Log Name: {log.log_name}
                      </Text>
                    </Flex>
                  </Card>
                ))}
              </ScrollArea>
            </Card>
          )}
        </>
      )}
    </Flex>
  );
}
