"use client";

import { cn } from "@/lib/utils";

/** Flutter TrustCard */
export function TrustCard({
  icon,
  label,
  iconColor,
  width = 128,
}: {
  icon: React.ReactNode;
  label: string;
  iconColor: string;
  width?: number;
}) {
  return (
    <div
      style={{ width }}
      className={cn(
        "rounded-[18px] border border-white/[0.22] bg-[rgba(16,28,58,0.38)] p-3.5 pb-3 shadow-[0_8px_12px_rgba(0,0,0,0.16)] backdrop-blur-[14px] transition duration-[220ms]",
        "hover:-translate-y-1 hover:border-white/45 hover:bg-[rgba(16,28,58,0.55)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.28)]",
      )}
    >
      <div style={{ color: iconColor }} className="mb-2.5 [&>svg]:h-[22px] [&>svg]:w-[22px]">
        {icon}
      </div>
      <p className="whitespace-pre-line text-[12.5px] font-semibold leading-[1.25] text-white">
        {label}
      </p>
    </div>
  );
}
