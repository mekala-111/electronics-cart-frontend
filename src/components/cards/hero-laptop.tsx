"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** Flutter HeroLaptop — floating + platform glow */
export function HeroLaptop() {
  return (
    <motion.div
      animate={{ y: [-6, 6, -6], scale: [1, 1.012, 1] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto w-[88%] max-w-[560px] md:w-[48vw] xl:w-[40vw] 2xl:w-[42vw]"
    >
      <Image
        src="/images/laptop.png"
        alt="Featured laptops"
        width={720}
        height={480}
        priority
        className="relative z-10 h-auto w-full object-contain"
      />
      <div className="absolute inset-x-[12%] bottom-2 z-0">
        <div className="h-[18px] rounded-[10px] bg-gradient-to-r from-[#1A2438] via-[#0C1424] to-[#1A2438] shadow-[0_10px_28px_rgba(30,94,255,0.45),0_10px_28px_rgba(241,90,36,0.4)]" />
        <div className="mt-1 flex gap-1">
          <div className="h-[3px] flex-1 rounded-sm bg-primary shadow-[0_0_12px_rgba(30,94,255,0.7)]" />
          <div className="h-[3px] flex-1 rounded-sm bg-accent shadow-[0_0_12px_rgba(241,90,36,0.7)]" />
        </div>
      </div>
    </motion.div>
  );
}
