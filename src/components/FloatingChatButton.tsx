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
import Image from "next/image";

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
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
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            cursor: "pointer",
          }}
          ref={buttonRef}
          onClick={toggleChat}
        >
          <Image
            src="/images/ask.svg"
            alt="Chat with Gemini"
            width={200}
            height={50}
          />
        </div>
      )}

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
          <Image
            src="/images/gemini.svg"
            alt="Chat with Gemini"
            width={50}
            height={50}
            className="p-2 self-center"
          />

          <GeminiLogAnalysis onClose={() => setIsOpen(false)} />
        </Card>
      )}
    </>
  );
}
