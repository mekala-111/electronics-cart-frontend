import { cn } from "@/lib/utils";
import Link from "next/link";

/** Flutter SectionTitle */
export function SectionTitle({
  eyebrow,
  title,
  accentWord,
  subtitle,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  accentWord?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const parts =
    accentWord && title.includes(accentWord)
      ? {
          before: title.slice(0, title.indexOf(accentWord)),
          mid: accentWord,
          after: title.slice(title.indexOf(accentWord) + accentWord.length),
        }
      : null;

  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="mb-2.5 text-xs font-bold tracking-[1.6px] text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.8px] text-navy md:text-[32px] xl:text-[36px] 2xl:text-[42px]">
          {parts ? (
            <>
              {parts.before}
              <span className="text-accent">{parts.mid}</span>
              {parts.after}
            </>
          ) : (
            title
          )}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-[15px] font-normal leading-[1.4] text-muted md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className={cn("shrink-0", subtitle && "pb-1")}>{action}</div>
      ) : null}
    </div>
  );
}

export function ViewAllLink({
  href = "/products",
  label = "View All →",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="text-[15px] font-semibold text-primary hover:underline"
    >
      {label}
    </Link>
  );
}
