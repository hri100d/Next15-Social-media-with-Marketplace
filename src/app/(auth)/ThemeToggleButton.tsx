"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { key: "light", label: "Light", icon: <Sun className="size-4" /> },
    {
      key: "system",
      label: "System Default",
      icon: <Monitor className=" size-4" />,
    },
    { key: "dark", label: "Dark", icon: <Moon className=" size-4" /> },
  ];

  return (
    <div className="space-x-2 bg-card rounded-full">
      {themeOptions.map(({ key, label, icon }) => (
        <Button
          key={key}
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full transition-colors",
            theme === key && "bg-primary text-background"
          )}
          onClick={() => setTheme(key)}
          title={label}
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}
