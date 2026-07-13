import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "default" | "lg" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 rounded-md px-3 text-xs gap-1.5",
  default: "h-9 px-4 py-2 text-sm gap-2",
  lg: "h-10 rounded-md px-6 text-sm gap-2",
  icon: "size-9",
};

/** Class string for the button look — apply to a Link or any element. */
export function buttonClass(opts: { variant?: Variant; size?: Size; className?: string } = {}) {
  const { variant = "default", size = "default", className } = opts;
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button ref={ref} className={buttonClass({ variant, size, className })} {...props} />
  ),
);
Button.displayName = "Button";
