"use client";

import { useState, useEffect } from "react";
import { Button, Flex, Text, Card, ScrollArea } from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

interface Repo {
  id: number;
  name: string;
}

export default function GitHubIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    checkGitHubConnection();
  }, []);

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
      setRepos((prevRepos) => [...prevRepos, ...data.repos]);
      setHasNextPage(data.hasNextPage);
      setTotalCount(data.totalCount);
      setCurrentPage(data.currentPage + 1);
    } catch (error) {
      console.error("Error fetching repos:", error);
    }
    setLoading(false);
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
          {repos.length === 0 && (
            <Button onClick={fetchRepos} size="3" disabled={loading}>
              {loading ? "Fetching..." : "Fetch Repositories"}
            </Button>
          )}
          {repos.length > 0 && (
            <>
              <Text size="2">Showing {repos.length} repositories</Text>
              <Card style={{ width: "100%" }}>
                <ScrollArea style={{ height: "300px" }}>
                  <Flex direction="column" gap="2" p="2">
                    {repos.map((repo) => (
                      <Card key={repo.id} style={{ padding: "8px" }}>
                        <Text>{repo.name}</Text>
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
