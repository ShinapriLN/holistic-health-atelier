"use client";

import { IoIosClose } from "react-icons/io";
import { motion } from "motion/react"

export default function HistoryPanel({ history, onClose }) {
  return (
    <div  onClick={onClose} className="fixed inset-0 bg-black/80 flex items-center justify-center z-1000 
                    backdrop-blur-sm p-2! md:p-4!">
      <motion.div
        onClick={(e) =>  e.stopPropagation()}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`bg-[url("/texture/paper.jpg")] border-4 border-[#b6562c]/50
                      p-4! md:p-8! max-w-lg w-full max-h-[80vh] h-144 flex flex-col gap-4
                      shadow-[0_0_60px_rgba(139,105,20,0.4)] animate-in slide-in-from-bottom-4 duration-75`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#b6562c] font-bold text-2xl">📜 ประวัติการปรุง</h2>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.1 }}
            className="bg-transparent cursor-pointer w-9 h-9 
                       text-[#b6562c] text-3xl flex items-center justify-center
                       transition-all duration-75 "
            onClick={onClose}
          >
            <IoIosClose />
          </motion.button>
        </div>

        {/* Content */}
        {history.length === 0 ? (
          <div className="text-center text-amber-700 py-10 h-full flex flex-col justify-center">
            <p>ไม่พบประวัติการปรุงอาหาร</p>
            <p>เริ่มผสมวัตถุดิบเพื่อค้นพบสูตรอาหารครั้งแรก 🍳</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1!">
            {history.map((item, index) => (
              <motion.div 
                initial={{ scale: 0.99 }}
                whileHover={{ scale: 1 }}
                key={item.id || index} 
                className="bg-[#b6562c]/10 border-2 border-[#b6562c]/50 p-4!
                           transition-all duration-75 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center mb-2 gap-2">
                  <span className="text-[#b6562c] font-bold">{item.recipeName}</span>
                  {item.isNewDiscovery && (
                    <span className="bg-green-900/30 text-green-400 text-xs py-1! px-2! rounded-full whitespace-nowrap">
                      ✨
                    </span>
                  )}
                </div>
                {/* <div className="text-amber-100/50 text-sm mb-2 leading-relaxed">
                  {item.ingredients.join(", ")}
                </div> */}
                <div className="flex justify-between text-amber-800 text-xs">
                  <span>By: {item.creatorName}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
