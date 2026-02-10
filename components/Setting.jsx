"use client";

import { IoIosClose } from "react-icons/io";
import { motion } from "motion/react";
import { IoVolumeHigh, IoVolumeMute, IoVideocam, IoVideocamOff } from "react-icons/io5";

export default function SettingPanel({ onClose, bgm, video }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-1000 
                    backdrop-blur-sm p-2! md:p-4!"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`bg-[url("/texture/paper.jpg")] border-4 border-[#b6562c]/50
                      p-8! max-w-lg w-full flex flex-col 
                      shadow-[0_0_60px_rgba(139,105,20,0.4)] animate-in slide-in-from-bottom-4 duration-75`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6!">
          <h2 className="text-[#b6562c] font-bold text-2xl">⚙️ ตั้งค่า</h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.1 }}
            className="bg-transparent cursor-pointer w-9 h-9 
                       text-[#b6562c] text-3xl flex items-center justify-center
                       transition-all duration-75"
            onClick={onClose}
          >
            <IoIosClose />
          </motion.button>
        </div>

        {/* Audio Section */}
        <div className="flex flex-col gap-5">
          <h3 className="text-[#b6562c]/80 font-semibold text-lg border-b border-[#b6562c]/20 pb-2!">
            🎵 เสียง
          </h3>

          {/* Mute Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={!bgm.isMuted}
              onChange={bgm.toggleMute}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-[#b6562c]/20 border-2 border-[#b6562c]/40 rounded-full 
                          peer-checked:bg-[#b6562c] peer-checked:border-[#b6562c]
                          relative transition-all duration-300"
            >
              <div
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#FFF8E7] rounded-full 
                            transition-transform duration-300 peer-checked:translate-x-0
                            shadow-sm"
                style={{
                  transform: !bgm.isMuted ? "translateX(20px)" : "translateX(0)",
                }}
              />
            </div>
            <span className="text-[#b6562c] font-medium flex items-center gap-2">
              {bgm.isMuted ? (
                <>
                  <IoVolumeMute className="text-lg" /> ปิดเสียง
                </>
              ) : (
                <>
                  <IoVolumeHigh className="text-lg" /> เปิดเสียง
                </>
              )}
            </span>
          </label>

          {/* Volume Slider */}
          <div className="flex flex-col gap-2">
            <label className="text-[#b6562c]/80 text-sm font-medium">
              ระดับเสียง: {Math.round(bgm.volume * 100)}%
            </label>
            <div className="flex items-center gap-3">
              <IoVolumeMute className="text-[#b6562c]/50 text-lg shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={bgm.volume}
                onChange={(e) => bgm.setVolume(parseFloat(e.target.value))}
                disabled={bgm.isMuted}
                className="w-full h-2 rounded-full appearance-none cursor-pointer
                           bg-[#b6562c]/20 accent-[#b6562c]
                           disabled:opacity-40 disabled:cursor-not-allowed
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-[#b6562c]
                           [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(182,86,44,0.5)]
                           [&::-webkit-slider-thumb]:transition-transform
                           [&::-webkit-slider-thumb]:hover:scale-110
                           [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                           [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0
                           [&::-moz-range-thumb]:bg-[#b6562c]"
              />
              <IoVolumeHigh className="text-[#b6562c]/50 text-lg shrink-0" />
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="flex flex-col gap-5 mt-6!">
          <h3 className="text-[#b6562c]/80 font-semibold text-lg border-b border-[#b6562c]/20 pb-2!">
            🎬 วิดีโอ
          </h3>

          {/* Dynamic BG Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={video.dynamicBg}
              onChange={() => video.setDynamicBg(!video.dynamicBg)}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-[#b6562c]/20 border-2 border-[#b6562c]/40 rounded-full 
                          peer-checked:bg-[#b6562c] peer-checked:border-[#b6562c]
                          relative transition-all duration-300"
            >
              <div
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#FFF8E7] rounded-full 
                            transition-transform duration-300
                            shadow-sm"
                style={{
                  transform: video.dynamicBg ? "translateX(20px)" : "translateX(0)",
                }}
              />
            </div>
            <span className="text-[#b6562c] font-medium flex items-center gap-2">
              {video.dynamicBg ? (
                <>
                  <IoVideocam className="text-lg" /> พื้นหลังเคลื่อนไหว
                </>
              ) : (
                <>
                  <IoVideocamOff className="text-lg" /> พื้นหลังหยุดนิ่ง
                </>
              )}
            </span>
          </label>

          {/* Projectile Animation Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={video.projectileAnim}
              onChange={() => video.setProjectileAnim(!video.projectileAnim)}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-[#b6562c]/20 border-2 border-[#b6562c]/40 rounded-full 
                          peer-checked:bg-[#b6562c] peer-checked:border-[#b6562c]
                          relative transition-all duration-300"
            >
              <div
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#FFF8E7] rounded-full 
                            transition-transform duration-300
                            shadow-sm"
                style={{
                  transform: video.projectileAnim ? "translateX(20px)" : "translateX(0)",
                }}
              />
            </div>
            <span className="text-[#b6562c] font-medium flex items-center gap-2">
              {video.projectileAnim ? (
                <>✨ แอนิเมชันวัตถุดิบ</>
              ) : (
                <>🚫 ไม่แสดงแอนิเมชัน</>
              )}
            </span>
          </label>
        </div>
      </motion.div>
    </div>
  );
}
