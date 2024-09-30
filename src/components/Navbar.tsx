import { Flex, Heading, Button, Separator } from "@radix-ui/themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ActivityLogIcon,
  GitHubLogoIcon,
  LockClosedIcon,
  ExitIcon,
  HomeIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      window.location.href = "/"; // Use window.location for full page reload after logout
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <Flex
      direction="column"
      p="6"
      style={{
        borderRight: "1px solid var(--gray-5)",
        width: "300px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: "var(--gray-1)",
      }}
    >
      <Heading size="6" mb="6">
        Data Trei
      </Heading>
      <Flex direction="column" gap="3" style={{ flex: 1 }}>
        <NavButton
          icon={<HomeIcon />}
          label="Dashboard"
          path="/dashboard"
          isActive={isActive("/dashboard")}
        />
        <NavButton
          icon={<ActivityLogIcon />}
          label="Repository Dashboard"
          path="/dashboard/repo-dashboard"
          isActive={isActive("/dashboard/repo-dashboard")}
        />
        <NavButton
          icon={<LockClosedIcon />}
          label="API Keys"
          path="/dashboard/api-keys"
          isActive={isActive("/dashboard/api-keys")}
        />
        <NavButton
          icon={<GitHubLogoIcon />}
          label="GitHub Connections"
          path="/dashboard/github-connections"
          isActive={isActive("/dashboard/github-connections")}
        />
        <NavButton
          icon={<GearIcon />}
          label="GCP Integration"
          path="/dashboard/gcp-integration"
          isActive={isActive("/dashboard/gcp-integration")}
        />
      </Flex>
      <Separator size="4" my="4" />
      <Button
        variant="ghost"
        onClick={handleLogout}
        style={{
          justifyContent: "flex-start",
          width: "100%",
          color: "var(--gray-11)",
        }}
      >
        <ExitIcon style={{ marginRight: "8px" }} /> Logout
      </Button>
    </Flex>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

function NavButton({ icon, label, path, isActive }: NavButtonProps) {
  return (
    <Link href={path} passHref style={{ textDecoration: "none" }}>
      <Button variant={isActive ? "surface" : "ghost"} style={{}}>
        {icon}
        <span style={{ marginLeft: "8px" }}>{label}</span>
      </Button>
    </Link>
  );
}
