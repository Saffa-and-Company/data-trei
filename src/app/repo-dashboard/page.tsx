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
} from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database } from "@/types/supabase";

type TrackedRepo = Database["public"]["Tables"]["tracked_repos"]["Row"];
type EventLog = Database["public"]["Tables"]["event_logs"]["Row"];

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
      .channel("event_logs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_logs" },
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
      .from("event_logs")
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
    <Flex direction="column" gap="6" p="6">
      <Flex justify="between" align="center">
        <Heading size="8">Repository Dashboard</Heading>
        <Link href="/dashboard">
          <Button variant="soft">Back to Main Dashboard</Button>
        </Link>
      </Flex>

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
            {selectedRepo ? `Logs for ${selectedRepo}` : "All Repository Logs"}
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
                    <Badge color="green">{log.source}</Badge>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </ScrollArea>
        </Card>
      </Flex>
    </Flex>
  );
}
