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
import {
  GitHubLogoIcon,
  ActivityLogIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/router";

interface TrackedRepo {
  id: number;
  repo_name: string;
}

interface RepoLog {
  id: number;
  repo_name: string;
  event_type: string;
  message: string;
  created_at: string;
}

export default function RepoDashboardPage() {
  const [trackedRepos, setTrackedRepos] = useState<TrackedRepo[]>([]);
  const [repoLogs, setRepoLogs] = useState<RepoLog[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchTrackedRepos();
    fetchRepoLogs();

    const repoLogsSubscription = supabase
      .channel("repo_logs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repo_logs" },
        handleRepoLogsChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(repoLogsSubscription);
    };
  }, []);

  const fetchTrackedRepos = async () => {
    const { data, error } = await supabase
      .from("tracked_repos")
      .select("id, repo_name");
    if (error) console.error("Error fetching tracked repos:", error);
    else setTrackedRepos(data);
  };

  const fetchRepoLogs = async () => {
    const { data, error } = await supabase
      .from("repo_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching repo logs:", error);
      if (error.message === "GitHub token is invalid or revoked") {
        router.push("/dashboard");
      }
    } else {
      setRepoLogs(data);
    }
  };

  const handleRepoLogsChange = (payload: any) => {
    console.log("Change received!", payload);
    fetchRepoLogs();
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
                  <br />
                  <Text size="1" color="gray" mt="2">
                    Repository: {log.repo_name}
                  </Text>
                </Card>
              ))}
            </Flex>
          </ScrollArea>
        </Card>
      </Flex>
    </Flex>
  );
}
