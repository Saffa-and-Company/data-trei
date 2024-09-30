"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Flex,
  Text,
  Container,
  Heading,
  Button,
  Card,
  ScrollArea,
  Table,
  Badge,
} from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import GithubIntegration, { Repo } from "@/components/GithubIntegration";
import { customToast } from "@/components/Toast";
import GithubDataManagement from "@/components/GithubDataManagement";
import DashboardLayout from "../layout";
import GeminiLogAnalysis from "@/components/GeminiLogAnalysis";
import { Database } from "@/types/supabase";

interface Collaborator {
  id: number;
  login: string;
  avatar_url: string;
}

type TrackedRepo = Database["public"]["Tables"]["tracked_repos"]["Row"];
type EventLog = Database["public"]["Tables"]["github_logs"]["Row"];

export default function GitHubConnectionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [trackedRepos, setTrackedRepos] = useState<TrackedRepo[]>([]);
  const [repoLogs, setRepoLogs] = useState<EventLog[]>([]);
  const [selectedTrackedRepo, setSelectedTrackedRepo] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (selectedRepo) {
      fetchCollaborators();
    }
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
  }, [selectedRepo]);

  const fetchCollaborators = async () => {
    if (!selectedRepo) return;
    try {
      const response = await fetch(
        `/api/github/collaborators?repo=${selectedRepo.owner.login}/${selectedRepo.name}`
      );
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data);
      } else {
        console.error("Failed to fetch collaborators");
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  const revokeAccess = async (username: string) => {
    if (!selectedRepo) return;
    try {
      const response = await fetch(`/api/github/revoke-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo: `${selectedRepo.owner.login}/${selectedRepo.name}`,
          username: username,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchCollaborators();
      } else if (response.status === 404) {
        customToast(
          data.error ||
            "Unable to revoke access. You may not have permission or the user might not be a direct collaborator."
        );
      } else {
        console.error("Failed to revoke access:", data.error);
        customToast("An error occurred while trying to revoke access.");
      }
    } catch (error) {
      console.error("Error revoking access:", error);
      customToast("An unexpected error occurred.");
    }
  };

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

  const filteredLogs = selectedTrackedRepo
    ? repoLogs.filter((log) => log.repo_name === selectedTrackedRepo)
    : repoLogs;

  return (
    <Flex direction="column" gap="6" p="6" width="100%">
      <Heading size="8" align="center">
        Manage GitHub Integration
      </Heading>
      <Flex direction="row" gap="6">
        <Card style={{ flex: 1 }}>
          <GithubIntegration onRepoSelect={setSelectedRepo} />
        </Card>
        <Card style={{ flex: 1 }}>
          <Heading size="3" mb="4">
            GitHub Collaborators
          </Heading>
          <ScrollArea style={{ height: "300px" }}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {collaborators.map((collaborator) => (
                  <Table.Row key={collaborator.id}>
                    <Table.Cell>{collaborator.login}</Table.Cell>
                    <Table.Cell>
                      <Button
                        onClick={() => revokeAccess(collaborator.login)}
                        size="1"
                        color="red"
                      >
                        Revoke Access
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollArea>
        </Card>
      </Flex>
      <Container size="4" style={{ width: "100%", maxWidth: "none" }}>
        <Flex direction="column" gap="6" style={{ width: "100%" }}>
          <GeminiLogAnalysis />
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
                      variant={
                        selectedTrackedRepo === repo.repo_name
                          ? "solid"
                          : "soft"
                      }
                      onClick={() => setSelectedTrackedRepo(repo.repo_name)}
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
                {selectedTrackedRepo
                  ? `Logs for ${selectedTrackedRepo}`
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
    </Flex>
  );
}
