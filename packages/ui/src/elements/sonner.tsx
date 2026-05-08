"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // Toast container: bg-card, border-border, rounded-md, shadow-popover
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-md, var(--radius))",
          // Variant tokens — border-l-4 accent per §6.8
          "--success-bg": "var(--card)",
          "--success-text": "var(--card-foreground)",
          "--success-border": "var(--success)",
          "--warning-bg": "var(--card)",
          "--warning-text": "var(--card-foreground)",
          "--warning-border": "var(--warning)",
          "--error-bg": "var(--card)",
          "--error-text": "var(--card-foreground)",
          "--error-border": "var(--destructive)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Base toast: matches spec — bg-card border border-border rounded-md shadow-[var(--shadow-popover)]
          // p-3 min-w-[320px] max-w-[420px] text-sm
          toast:
            "cn-toast !bg-[var(--card)] !border !border-[var(--border)] !rounded-md !shadow-[var(--shadow-popover)] !p-3 !min-w-[320px] !max-w-[420px] !text-sm",
          // Variant left-border rules per §6.8
          success: "!border-l-4 !border-l-[var(--success)]",
          warning: "!border-l-4 !border-l-[var(--warning)]",
          error: "!border-l-4 !border-l-[var(--destructive)]",
          info: "!border-l-4 !border-l-[var(--info)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
export { toast } from "sonner";
