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
} from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/client";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import GithubIntegration, { Repo } from "@/components/GithubIntegration";
import { customToast } from "@/components/Toast";
import GithubDataManagement from "@/components/GithubDataManagement";
import DashboardLayout from "../layout";

interface Collaborator {
  id: number;
  login: string;
  avatar_url: string;
}

export default function GitHubConnectionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  useEffect(() => {
    if (selectedRepo) {
      fetchCollaborators();
    }
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

  return (
    <Flex direction="column" gap="6" p="6" width="100%">
      <Heading size="8" align="center">
        Manage GitHub Connections
      </Heading>
      {/* <GithubDataManagement /> */}
      <GithubIntegration onRepoSelect={setSelectedRepo} />
      <Card style={{ width: "100%" }}>
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
      <Button onClick={() => router.push("/dashboard")} size="3">
        Back to Dashboard
      </Button>
    </Flex>
  );
}
