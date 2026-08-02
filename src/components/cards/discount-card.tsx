"use client";

import { motion } from "framer-motion";

/** Flutter DiscountCard */
export function DiscountCard({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -4, 0, 4, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      <div className="w-[168px] rounded-[24px] border border-white/40 bg-white/96 px-5 py-[18px] shadow-[0_12px_28px_rgba(8,21,47,0.18),0_4px_20px_rgba(241,90,36,0.12)] backdrop-blur-[8px]">
        <p className="text-[13px] font-medium text-nav-muted">Up to</p>
        <p className="mt-0.5 text-[28px] font-extrabold leading-[1.1] tracking-[-0.5px] text-accent">
          50% OFF
        </p>
        <p className="mt-1 text-[12.5px] font-medium leading-[1.3] text-navy">
          on Refurbished Laptops
        </p>
      </div>
    </motion.div>
  );
}
