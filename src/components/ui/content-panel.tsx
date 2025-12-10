import { cn } from "@/lib/utils";

interface ContentPanelProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

export function ContentPanel({
  children,
  className,
  innerClassName,
}: ContentPanelProps) {
  return (
    <div className={cn("bg-background p-2 flex flex-col", className)}>
      <div className={cn("bg-card flex-1 min-h-0", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
