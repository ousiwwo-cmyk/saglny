import { cn } from "@/lib/utils"

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger" | "outline"
}) {
  const variants = {
    default: "bg-emerald-100 text-emerald-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    outline: "border border-emerald-200 text-emerald-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant || "default"],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
