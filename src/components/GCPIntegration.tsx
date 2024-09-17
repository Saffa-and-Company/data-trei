import { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Text,
  Card,
  ScrollArea,
  Select,
  Spinner,
  Heading,
} from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

import { Database } from "@/types/supabase";
import { errorToast, successToast } from "./Toast";

type GCPLog = Database["public"]["Tables"]["gcp_logs"]["Row"];
type GCPLogIngestion = Database["public"]["Tables"]["gcp_log_ingestion"]["Row"];

export default function GCPIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [projects, setProjects] = useState<
    { projectId: string; name: string }[]
  >([]);
  const [logs, setLogs] = useState<GCPLog[]>([]);
  const [logIngestions, setLogIngestions] = useState<GCPLogIngestion[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSetupProject, setSelectedSetupProject] = useState<
    string | null
  >(null);
  const [isSettingUpIngestion, setIsSettingUpIngestion] = useState(false);
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    checkGCPConnection();
    fetchLogIngestions();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchLogs(selectedProjectId);
      setupRealtimeListener(selectedProjectId);
    } else {
      cleanupRealtimeListener();
    }

    return () => {
      cleanupRealtimeListener();
    };
  }, [selectedProjectId]);

  const checkGCPConnection = async () => {
    const { data, error } = await supabase
      .from("gcp_connections")
      .select("expires_at")
      .single();

    if (data && new Date(data.expires_at) > new Date()) {
      setIsConnected(true);
      fetchGCPProjects();
    } else {
      setIsConnected(false);
    }
  };

  const fetchLogIngestions = async () => {
    const { data, error } = await supabase
      .from("gcp_log_ingestion")
      .select("*");

    if (error) {
      console.error("Error fetching log ingestions:", error);
    } else {
      setLogIngestions(data || []);
    }
  };

  const fetchLogs = async (projectId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("gcp_logs")
      .select("*")
      .eq("project_id", projectId)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching GCP logs:", error);
    } else {
      setLogs(data || []);
    }
    setIsLoading(false);
  };

  const fetchGCPProjects = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/gcp/auth";
  };

  const setupLogIngestion = async (projectId: string) => {
    setIsSettingUpIngestion(true);
    try {
      // try to fetch from gcp log ingestion database table
      const { data, error } = await supabase
        .from("gcp_log_ingestion")
        .select("*")
        .eq("project_id", projectId);
      if (error) {
        console.error("Error fetching log ingestion:", error);
      } else {
        if (data.length > 0) {
          errorToast("Log ingestion already set up for this project");
          return;
        }
      }
      const response = await fetch("/api/gcp/setup-log-ingestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (response.ok) {
        const data = await response.json();
        successToast("Log ingestion set up successfully");
        fetchLogIngestions();
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          errorToast("Log ingestion already set up for this project");
          // Handle the case where ingestion is already set up (e.g., show a message to the user)
        } else {
          errorToast("Failed to set up log ingestion:", errorData.error);
        }
      }
    } catch (error) {
      console.error("Error setting up log ingestion:", error);
    } finally {
      setIsSettingUpIngestion(false);
    }
  };

  const handleSetupLogIngestion = () => {
    if (selectedSetupProject) {
      setupLogIngestion(selectedSetupProject);
    }
  };

  const handleDeleteLogIngestion = async (projectId: string) => {
    setIsSettingUpIngestion(true);
    try {
      const response = await fetch("/api/gcp/delete-log-ingestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (response.ok) {
        successToast("Log ingestion deleted successfully");
        fetchLogIngestions();
        setSelectedProjectId(null);
        setLogs([]);
      } else {
        const errorData = await response.json();
        errorToast("Failed to delete log ingestion: " + errorData.error);
      }
    } catch (error) {
      console.error("Error deleting log ingestion:", error);
      errorToast("An error occurred while deleting log ingestion");
    } finally {
      setIsSettingUpIngestion(false);
    }
  };

  const setupRealtimeListener = (projectId: string) => {
    cleanupRealtimeListener();

    const channel = supabase
      .channel(`gcp_logs_${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gcp_logs",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setLogs((prevLogs) => [
            payload.new as GCPLog,
            ...prevLogs.slice(0, 49),
          ]);
        }
      )
      .subscribe();

    setRealtimeChannel(channel);
  };

  const cleanupRealtimeListener = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      setRealtimeChannel(null);
    }
  };

  return (
    <Flex direction="column" gap="6">
      <Card>
        <Heading size="4">Now Tracking</Heading>
        <Flex direction="column" gap="2" my="2">
          <Text size="2">Select Project:</Text>
          <Select.Root
            value={selectedProjectId || ""}
            onValueChange={(value) => setSelectedProjectId(value || null)}
          >
            <Select.Trigger placeholder="Select a project" />
            <Select.Content>
              {logIngestions.map((ingestion) => (
                <Select.Item key={ingestion.id} value={ingestion.project_id}>
                  {ingestion.project_id}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        {isLoading ? (
          <Spinner />
        ) : (
          <ScrollArea style={{ height: "400px" }}>
            {logs.map((log) => (
              <Card key={log.id} mt="2">
                <Flex justify="between" align="start">
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="2" weight="bold">
                      {log.severity}
                    </Text>
                    {log.text_payload && (
                      <Text size="2">{log.text_payload}</Text>
                    )}
                    {log.json_payload && (
                      <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
                        {JSON.stringify(log.json_payload, null, 2)}
                      </pre>
                    )}
                    {!log.text_payload && !log.json_payload && (
                      <Text size="2" color="gray">
                        No payload
                      </Text>
                    )}
                    {log.log_name && (
                      <Text size="2" color="gray">
                        {log.log_name}
                      </Text>
                    )}
                    {log.resource && (
                      <Text size="2" color="gray">
                        {JSON.stringify(log.resource)}
                      </Text>
                    )}
                  </Flex>
                  <Text size="1" color="gray" style={{ whiteSpace: "nowrap" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </Flex>
              </Card>
            ))}
          </ScrollArea>
        )}
      </Card>

      <Card>
        <Heading size="4">Connect to GCP</Heading>
        {!isConnected ? (
          <Button onClick={handleConnect}>Connect GCP</Button>
        ) : (
          <>
            <Text>GCP Connected</Text>
            <Flex direction="column" gap="2">
              <Select.Root
                value={selectedSetupProject || ""}
                onValueChange={(value) => setSelectedSetupProject(value)}
              >
                <Select.Trigger placeholder="Select a project to set up log ingestion" />
                <Select.Content>
                  {projects.map((project) => (
                    <Select.Item
                      key={project.projectId}
                      value={project.projectId}
                    >
                      {project.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              {logIngestions.find(
                (ingestion) => ingestion.project_id === selectedSetupProject
              ) && (
                <Button
                  onClick={() =>
                    handleDeleteLogIngestion(selectedSetupProject || "")
                  }
                  color="red"
                  variant="soft"
                  loading={isSettingUpIngestion}
                >
                  Delete Log Ingestion
                </Button>
              )}
              {!logIngestions.find(
                (ingestion) => ingestion.project_id === selectedSetupProject
              ) && (
                <Button
                  loading={isSettingUpIngestion}
                  onClick={handleSetupLogIngestion}
                  disabled={!selectedSetupProject || isSettingUpIngestion}
                  variant="soft"
                >
                  Setup Log Ingestion
                </Button>
              )}
            </Flex>
          </>
        )}
      </Card>
    </Flex>
  );
}
