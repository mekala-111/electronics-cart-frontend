import { cn } from "@/lib/utils";

/** Flutter PageShell — maxWidth 1440 + framePad */
export function PageShell({
  children,
  className,
  maxWidth = 1440,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: number | null;
  padded?: boolean;
}) {
  const content = (
    <div className={cn(padded && "frame-pad", className)}>{children}</div>
  );

  if (maxWidth == null) return content;

  return (
    <div className="mx-auto w-full" style={{ maxWidth }}>
      {content}
    </div>
  );
}
