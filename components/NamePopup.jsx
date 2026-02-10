"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function NamePopup({ onSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-1000 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="
          bg-[url('/texture/paper.jpg')] border-4 border-[#b6562c]/50
          p-12! text-center max-w-md w-[90%] relative
          shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden
        "
      >
         {/* Shine effect */}
         <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shine_3s_infinite]" />

        {/* <div className="absolute top-4 left-6 text-2xl animate-pulse">✨</div>
        <div className="absolute top-4 right-6 text-2xl animate-pulse delay-1000">✨</div> */}
        
        <h2 className="text-[#b6562c] text-3xl font-bold mb-3!">
          ยินดีต้อนรับ!
        </h2>
        <p className="text-[#b6562c]/70 text-lg mb-8!">
          โปรดกรอกชื่อ
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="กรอกชื่อของคุณ..."
            className="
              bg-[#b6562c]/10 border-2 border-[#b6562c]/50  py-2! px-5! text-lg 
              text-[#b6562c] text-center transition-all duration-300
              placeholder:text-[#b6562c]/40 selection:text-white!
              focus:outline-none focus:border-[#b6562c] focus:bg-[#b6562c]/20
            "
            autoFocus
            maxLength={30}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="
              bg-[#b6562c] py-2! px-8! w-fit self-center
              text-lg text-[#FFF8E7] font-bold transition-all duration-300
              hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
              border-2 border-transparent hover:border-[#FFF8E7]/20
            "
            disabled={!name.trim()}
          >
            ตกลง
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
