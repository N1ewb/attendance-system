import { cn } from "@/lib/utils"

const variantClasses = {
  text: "h-4 rounded",
  circular: "rounded-full",
  rectangular: "rounded-lg",
}

function Skeleton({
  className,
  variant,
  width,
  height,
  ...props
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        variant && variantClasses[variant],
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton }
