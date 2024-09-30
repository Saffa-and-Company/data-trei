import { useState, useRef, useEffect } from "react";
import {
  Button,
  Card,
  TextField,
  ScrollArea,
  Text,
  Flex,
  IconButton,
} from "@radix-ui/themes";
import { ChatBubbleIcon, Cross2Icon } from "@radix-ui/react-icons";
import GeminiLogAnalysis from "./GeminiLogAnalysis";

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null); // Added ref for the button

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) // Check if click is outside the button
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleChat = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the event from bubbling up
    setIsOpen((prev) => !prev); // Use functional state update
  };

  return (
    <>
      <Button
        ref={buttonRef} // Attach ref to the button
        size="3"
        variant="solid"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={toggleChat}
      >
        <ChatBubbleIcon width="24" height="24" />
      </Button>

      {isOpen && (
        <Card
          ref={chatBoxRef}
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "400px",
            height: "600px",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Flex justify="between" align="center" mb="3">
            <Text size="5" weight="bold">
              Chat with Gemini
            </Text>
            <IconButton size="1" onClick={() => setIsOpen(false)}>
              <Cross2Icon />
            </IconButton>
          </Flex>
          <ScrollArea style={{ flexGrow: 1 }}>
            <GeminiLogAnalysis />
          </ScrollArea>
        </Card>
      )}
    </>
  );
}
