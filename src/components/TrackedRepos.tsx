import { useState, useEffect } from "react";
import { Card, Text, Flex, ScrollArea } from "@radix-ui/themes";

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

  useEffect(() => {
    fetchTrackedRepos();
    fetchRepoLogs();
  }, []);

  const fetchTrackedRepos = async () => {
    const response = await fetch("/api/github/tracked-repos");
    const data = await response.json();
    setTrackedRepos(data.repos);
  };

  const fetchRepoLogs = async () => {
    const response = await fetch("/api/github/repo-logs");
    const data = await response.json();
    setRepoLogs(data.logs);
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
