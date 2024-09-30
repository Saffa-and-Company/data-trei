"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Text,
  Card,
  ScrollArea,
  Select,
  Spinner,
  IconButton,
} from "@radix-ui/themes";
import { GitHubLogoIcon, PlusIcon } from "@radix-ui/react-icons";

interface Props {
  onRepoSelect?: (repo: Repo) => void;
}

export interface Repo {
  id: number;
  name: string;
  owner: {
    login: string;
  };
}

export default function GitHubIntegration({ onRepoSelect }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchRepos();
    }
  }, [isConnected]);

  const checkGitHubConnection = async () => {
    const response = await fetch("/api/github/connection");
    const data = await response.json();
    setIsConnected(data.connected);
  };

  const handleConnect = () => {
    window.location.href = `/api/auth/github`;
  };

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/github/repos?page=${currentPage}`);
      const data = await response.json();
      if (response.status === 401) {
        setIsConnected(false);
      } else {
        setRepos((prevRepos) => [...prevRepos, ...data.repos]);
        setHasNextPage(data.hasNextPage);
        setTotalCount(data.totalCount);
        setCurrentPage(data.currentPage + 1);
      }
    } catch (error) {
      console.error("Error fetching repos:", error);
      setIsConnected(false);
    }
    setLoading(false);
  };

  const handleTrackRepo = async (repo: Repo) => {
    try {
      const response = await fetch("/api/github/track-repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: repo.name,
          repoOwner: repo.owner.login,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(
          `Successfully set up tracking for ${repo.owner.login}/${repo.name}`
        );
        // Optionally, refresh the list of tracked repos here
      } else {
        console.error("Error tracking repo:", data.error);
        if (response.status === 403) {
          alert(
            `Unable to set up tracking for ${repo.owner.login}/${repo.name}. You may not have sufficient permissions to create webhooks.`
          );
        } else if (data.error === "GitHub not connected") {
          setIsConnected(false);
          alert(
            "Your GitHub connection has expired. Please reconnect your account."
          );
        } else {
          alert(
            `Failed to set up tracking for ${repo.owner.login}/${repo.name}: ${data.error}`
          );
        }
      }
    } catch (error) {
      console.error("Error tracking repo:", error);
      alert("An error occurred while trying to track the repository");
    }
  };

  return (
    <Flex
      direction="column"
      gap="4"
      align="center"
      style={{ width: "100%", maxWidth: "600px" }}
    >
      {!isConnected ? (
        <Button onClick={handleConnect} size="3">
          <GitHubLogoIcon width="16" height="16" />
          Connect to GitHub
        </Button>
      ) : (
        <>
          {loading && (
            <Flex align="center" justify="center" gap="2">
              <Text>Fetching repositories</Text>
              <Spinner size="3" />
            </Flex>
          )}
          {repos.length > 0 && (
            <>
              <Text size="2">Showing {repos.length} repositories</Text>
              <Card style={{ width: "100%" }}>
                <ScrollArea style={{ height: "300px" }}>
                  <Flex direction="column" gap="2" p="2">
                    {repos.map((repo) => (
                      <Card
                        key={repo.id}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          backgroundColor:
                            selectedRepo?.id === repo.id
                              ? "var(--accent-9)"
                              : "inherit",
                        }}
                      >
                        <Flex justify="between" align="center">
                          <Text
                            onClick={() => {
                              setSelectedRepo(repo);
                              onRepoSelect && onRepoSelect(repo);
                            }}
                          >
                            {repo.owner.login} / {repo.name}
                          </Text>
                          <IconButton
                            size="1"
                            variant="soft"
                            className="hover:cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackRepo(repo);
                            }}
                          >
                            <PlusIcon />
                          </IconButton>
                        </Flex>
                      </Card>
                    ))}
                    {hasNextPage && !loading && (
                      <Button
                        onClick={fetchRepos}
                        size="2"
                        variant="soft"
                        style={{ marginTop: "16px" }}
                      >
                        Load More Repositories
                      </Button>
                    )}
                  </Flex>
                </ScrollArea>
              </Card>
            </>
          )}
        </>
      )}
    </Flex>
  );
}
