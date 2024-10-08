import { Flex, Heading, Button, Separator, Box } from "@radix-ui/themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ActivityLogIcon,
  GitHubLogoIcon,
  LockClosedIcon,
  ExitIcon,
  HomeIcon,
  GearIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

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
      <div className="w-[300px] h-[100px] relative">
        <Image
          src="/images/heading_logo.svg"
          alt="Logo"
          style={{ objectFit: "fill" }}
          fill
        />
      </div>
      <Flex direction="column" gap="3" style={{ flex: 1 }}>
        <NavButton
          icon={<HomeIcon />}
          label="Dashboard"
          path="/dashboard"
          isActive={isActive("/dashboard")}
        />

        <NavButton
          icon={<LockClosedIcon />}
          label="API Keys"
          path="/dashboard/api-keys"
          isActive={isActive("/dashboard/api-keys")}
        />
        <NavButton
          icon={<GitHubLogoIcon />}
          label="GitHub Integration"
          path="/dashboard/github-connections"
          isActive={isActive("/dashboard/github-connections")}
        />
        <NavButton
          icon={
            <Image src="/images/gcp.svg" alt="GCP" width={15} height={15} />
          }
          label="GCP Integration"
          path="/dashboard/gcp-integration"
          isActive={isActive("/dashboard/gcp-integration")}
        />
        <NavButton
          icon={<FileTextIcon />}
          label="Custom Logs"
          path="/dashboard/custom-logs"
          isActive={isActive("/dashboard/custom-logs")}
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
      <Box
        style={{
          borderRadius: "4px",
          color: isActive ? "var(--accent-11)" : "var(--gray-11)",
          transition: "color 0.2s ease, background-color 0.2s ease",
        }}
      >
        <Flex
          align="center"
          style={{
            backgroundColor: isActive ? "var(--accent-3)" : "transparent",
            borderRadius: "4px",
            padding: "8px",
          }}
        >
          {icon}
          <span style={{ marginLeft: "8px" }}>{label}</span>
        </Flex>
      </Box>
    </Link>
  );
}
