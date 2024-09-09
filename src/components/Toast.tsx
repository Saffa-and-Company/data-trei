import { Card, Text } from "@radix-ui/themes";
import { toast, ToastOptions } from "react-hot-toast";

export const customToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <Card
        style={{
          backgroundColor: "var(--color-panel-solid)",
          color: "var(--color-text)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-3)",
          boxShadow: "var(--shadow-5)",
        }}
      >
        <Text>{message}</Text>
      </Card>
    ),
    options
  );
};

export const successToast = (message: string, options?: ToastOptions) => {
  return customToast(message, { ...options, icon: "✅" });
};

export const errorToast = (message: string, options?: ToastOptions) => {
  return customToast(message, { ...options, icon: "❌" });
};
