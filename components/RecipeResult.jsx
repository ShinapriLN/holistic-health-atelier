"use client";

import { motion } from "motion/react"
import Image from "next/image";

export default function RecipeResult({
  recipe,
  benefits,
  isNewDiscovery,
  onCookAgain,
}) {

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-1000 
                    backdrop-blur-sm p-2! md:p-4! overflow-y-auto">
      <div className={`bg-[url("/texture/paper.jpg")] border-4 border-[#b6562c]/50 
                      p-4! max-w-2xl w-full max-h-[80vh] flex flex-col justify-between
                      shadow-[0_0_60px_rgba(139,105,20,0.4)] animate-in zoom-in-95 duration-300 `}>
        
        {/* Header */}
        <div className="text-center mb-8! flex flex-col gap-4">
          {isNewDiscovery && (
            <div className="bg-linear-to-r from-green-600 to-green-700 rounded-full w-fit self-center
                           py-2! px-5! text-white text-sm font-semibold inline-block 
                           animate-pulse shadow-[0_0_20px_rgba(74,124,74,0.4)]">
              ✨ ค้นพบสูตรใหม่ ✨
            </div>
          )}
          <h2 className="text-[#b6562c] text-4xl font-semibold  
                         drop-shadow-[0_2px_10px_rgba(245,212,145,0.3)]">
            {recipe.name}
          </h2>
          <p className="text-[#b6562c] text-sm italic">
            {isNewDiscovery 
              ? `ค้นพบโดย: ${recipe.by}` 
              : `ถูกค้นพบโดย: ${recipe.by}`}
          </p>
        </div>

        {/* Health Benefits */}
        <div className="bg-[#b6562c]/10 p-6! h-full mb-6! border-4 border-[#b6562c]/50 flex flex-col gap-2">
          <h3 className="text-[#b6562c] text-xl text-center mb-5">🌿 ประโยชน์ต่อสุขภาพ</h3>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-44 md:max-h-80 pr-1!">
            {benefits.map((item, index) => (
              <div 
                key={index} 
                className="flex gap-4 items-start  border-2 border-[#b6562c]/50 p-4!
                           transition-transform duration-200" 
              >
                <span className="text-3xl">
                  <Image 
                    src={item.image_url} 
                    alt={item.name}
                    width={72} 
                    height={72} 
                    className="w-18 object-contain" 
                  />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[#b6562c] font-bold">{item.name}</span>
                  <span className="text-[#b6562c] text-sm leading-relaxed">
                    {item.benefit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cook Again Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-[#b6562c]/10 border-2 border-[#b6562c]/50 w-fit self-center flex
                     py-4! px-8! text-lg text-[#b6562c] font-semibold
                     transition-all duration-300 cursor-pointer
                     hover:-translate-y-1 hover:shadow-xl hover:shadow-[#b6562c]/30"
          onClick={onCookAgain}
        >
          ตกลง
        </motion.button>
      </div>
    </div>
  );
}
