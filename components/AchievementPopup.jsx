"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function AchievementPopup({ achievement, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto close after 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-9999 pointer-events-none">
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.8 }}
        className="
          bg-[url('/texture/paper.jpg')] border-4 border-[#b6562c]/50
          p-4! shadow-[0_10px_40px_rgba(0,0,0,0.5)]
          flex items-center gap-4 min-w-[300px] max-w-[90vw]
          relative overflow-hidden
        "
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shine_2s_infinite]" />

        <div className="text-4xl bg-[#b6562c]/10 p-2! rounded-full border-2 border-[#b6562c]/30">
          {achievement.icon}
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#b6562c]/70 uppercase tracking-wider">
            Achievement Unlocked!
          </span>
          <span className="text-xl font-bold text-[#b6562c]">
            {achievement.name}
          </span>
          <span className="text-xs text-[#b6562c] opacity-80">
            {achievement.description}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
