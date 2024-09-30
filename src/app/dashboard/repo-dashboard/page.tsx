"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Flex,
  Heading,
  Card,
  Text,
  Button,
  ScrollArea,
  Badge,
  Container,
} from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { Database } from "@/types/supabase";
import GeminiLogAnalysis from "@/components/GeminiLogAnalysis";

type TrackedRepo = Database["public"]["Tables"]["tracked_repos"]["Row"];
type EventLog = Database["public"]["Tables"]["github_logs"]["Row"];

export default function RepoDashboardPage() {
  const [trackedRepos, setTrackedRepos] = useState<TrackedRepo[]>([]);
  const [repoLogs, setRepoLogs] = useState<EventLog[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchTrackedRepos();
    fetchEventLogs();

    const repoLogsSubscription = supabase
      .channel("github_logs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "github_logs" },
        handleEventLogsChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(repoLogsSubscription);
    };
  }, []);

  const fetchTrackedRepos = async () => {
    const { data, error } = await supabase.from("tracked_repos").select("*");
    if (error) console.error("Error fetching tracked repos:", error);
    else setTrackedRepos(data || []);
  };

  const fetchEventLogs = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("github_logs")
      .select("*")
      // .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching event logs:", error);
    } else {
      setRepoLogs(data || []);
    }
  };

  const handleEventLogsChange = (payload: any) => {
    console.log("Change received!", payload);
    fetchEventLogs();
  };

  const filteredLogs = selectedRepo
    ? repoLogs.filter((log) => log.repo_name === selectedRepo)
    : repoLogs;

  return (
    <Container size="4" p="6" style={{ width: "100%", maxWidth: "none" }}>
      <Flex direction="column" gap="6" style={{ width: "100%" }}>
        <Heading size="8" align="center">
          Repository Dashboard
        </Heading>

        <Flex gap="6">
          <Card style={{ width: "30%" }}>
            <Heading size="4" mb="4">
              Tracked Repositories
            </Heading>
            <ScrollArea style={{ height: "400px" }}>
              <Flex direction="column" gap="2">
                {trackedRepos.map((repo) => (
                  <Button
                    key={repo.id}
                    variant={selectedRepo === repo.repo_name ? "solid" : "soft"}
                    onClick={() => setSelectedRepo(repo.repo_name)}
                  >
                    <GitHubLogoIcon />
                    {repo.repo_name}
                  </Button>
                ))}
              </Flex>
            </ScrollArea>
          </Card>

          <Card style={{ width: "70%" }}>
            <Heading size="4" mb="4">
              {selectedRepo
                ? `Logs for ${selectedRepo}`
                : "All Repository Logs"}
            </Heading>
            <ScrollArea style={{ height: "400px" }}>
              <Flex direction="column" gap="3">
                {filteredLogs.map((log) => (
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
                  </Card>
                ))}
              </Flex>
            </ScrollArea>
          </Card>
        </Flex>
      </Flex>
    </Container>
  );
}
