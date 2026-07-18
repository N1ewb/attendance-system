const baseClasses = "animate-pulse bg-gray-200";

const variantClasses = {
  text: "h-4 rounded",
  circular: "rounded-full",
  rectangular: "rounded-lg",
};

export function Skeleton({ variant = "text", width, height, className = "" }) {
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.text} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
