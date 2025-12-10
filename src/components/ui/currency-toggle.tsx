import { cn } from "@/lib/utils";

type Currency = "eth" | "usd";

interface CurrencyToggleProps {
  value: Currency;
  onChange: (value: Currency) => void;
  className?: string;
}

export function CurrencyToggle({
  value,
  onChange,
  className,
}: CurrencyToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-xs",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange("eth")}
        className={cn(
          "min-w-10 rounded-sm px-2 py-1 text-muted-foreground transition-colors",
          value === "eth"
            ? "bg-background shadow-sm"
            : "hover:text-foreground",
        )}
      >
        Ξ
      </button>
      <button
        type="button"
        onClick={() => onChange("usd")}
        className={cn(
          "min-w-10 rounded-sm px-2 py-1 text-muted-foreground transition-colors",
          value === "usd"
            ? "bg-background shadow-sm"
            : "hover:text-foreground",
        )}
      >
        USD
      </button>
    </div>
  );
}
