import { useState, useEffect } from "react";
import { Card, Text, Flex, ScrollArea } from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";

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

export default function TrackedRepos() {
  const [trackedRepos, setTrackedRepos] = useState<TrackedRepo[]>([]);
  const [repoLogs, setRepoLogs] = useState<RepoLog[]>([]);
  const supabase = createClient();

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
    if (error) console.error("Error fetching repo logs:", error);
    else setRepoLogs(data);
  };

  const handleRepoLogsChange = (payload: any) => {
    console.log("Change received!", payload);
    fetchRepoLogs(); // Refetch logs when a change occurs
  };

  return (
    <Flex direction="column" gap="4">
      <Card>
        <Text size="5" weight="bold">
          Tracked Repositories
        </Text>
        <ScrollArea style={{ height: "200px" }}>
          {trackedRepos.map((repo) => (
            <Text key={repo.id}>{repo.repo_name}</Text>
          ))}
        </ScrollArea>
      </Card>
      <Card>
        <Text size="5" weight="bold">
          Repository Logs
        </Text>
        <ScrollArea style={{ height: "300px" }}>
          {repoLogs.map((log) => (
            <Card key={log.id} style={{ marginBottom: "8px" }}>
              <Text size="2" weight="bold">
                {log.repo_name}
              </Text>
              <Text size="2">
                {log.event_type}: {log.message}
              </Text>
              <Text size="1" color="gray">
                {new Date(log.created_at).toLocaleString()}
              </Text>
            </Card>
          ))}
        </ScrollArea>
      </Card>
    </Flex>
  );
}
