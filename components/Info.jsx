"use client";

import { IoIosClose } from "react-icons/io";
import { TbArrowBackUp } from "react-icons/tb";
import { motion } from "motion/react"
import { useState, useEffect } from "react";
import { ACHIEVEMENTS } from "@/lib/constants";
import { fetchUserCollection } from "@/lib/supabase";
import { isMobile } from "pixi.js";


export default function PlayerInfoPanel({ history, player, onClose, ingredients, achievements }) { // [NEW] Accept achievements prop
  const [ currentTab, setCurrentTab ] = useState(0)
  const tabs = [
    {
      id: 0,
      name: "คอลเล็กชั่น"
    },
    {
      id: 1,
      name: "วัตถุดิบที่สร้าง"
    },
    {
      id: 2,
      name: "ความสำเร็จ"
    }
  ]
  return (
    <div  onClick={onClose} className="fixed inset-0 bg-black/80 flex items-center justify-center z-1000  
                    backdrop-blur-sm p-2! md:p-4!">
      <motion.div
        onClick={(e) =>  e.stopPropagation()}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`bg-[url("/texture/paper.jpg")] border-4 border-[#b6562c]/50
                      p-4! md:p-8! max-w- max-h-144 h-144  w-3xl flex flex-col
                      shadow-[0_0_60px_rgba(139,105,20,0.4)] animate-in slide-in-from-bottom-4 duration-75 `}>
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 gap-2 ">
          
          <div className="flex justify-between items-center w-full">
            <h2 className="text-[#b6562c] font-bold text-lg md:text-2xl">ข้อมูล {player}</h2>
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

          <div className="flex justify-center w-full">
          {
            tabs.map(t => (
              <motion.button
                key={t.id}
                onClick={() => setCurrentTab(t.id)}
                className={`bg-transparent cursor-pointer
                          text-[#b6562c] text-sm md:text-lg flex w-full items-center justify-center
                          transition-all duration-75  rounded-t-lg p-2!
                          ${currentTab === t.id ? "border-x-4 border-t-4 border-[#b6562c]/50" : "border-b-4  border-[#b6562c]/50"}`}>
                {t.name}
              </motion.button>
            ))
          }
          </div>


        </div>
        {/* Content */}
        {
          currentTab == 0 ? <CollectionContent player={player} /> : 
          currentTab == 1 ? <MaterialContent ingredients={ingredients} player={player} /> :  
          currentTab == 2 ? <AchievementContent achievements={achievements} /> : 
          <CollectionContent player={player} />
        }
      </motion.div>
    </div>
  );
}


function CollectionContent({ player }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSelected, setCurrentSelected] = useState(null);

  const [mobileTab, setMobileTab] = useState(0)

  useEffect(() => {
    if (player) {
      setLoading(true);
      fetchUserCollection(player).then(data => {
        setRecipes(data);
        setLoading(false);
      });
    }
  }, [player]);

  if (loading) {
    return <div className="p-4! border-b-4 border-x-4 border-[#b6562c]/50 h-full flex items-center justify-center text-center text-[#b6562c]">กำลังโหลด...</div>;
  }

  return (
    <div className="h-full max-h-108 ">
      {
        currentSelected === null ? 
        <div  className={`grid-cols-3 md:grid-cols-4 content-start gap-3 overflow-y-auto p-2! relative h-full border-b-4 border-x-4 border-[#b6562c]/50 
        ${recipes.length === 0 ? "flex items-center justify-center" : "grid"}`}>
          {recipes.length === 0 && (
            <div className="col-span-4 text-center text-[#b6562c]/70 py-10! h-full flex items-center justify-center">
              ยังไม่มีสูตรอาหารที่สะสมไว้
            </div>
          )}
          {recipes.map((item, index) => (
            <motion.button 
              initial={{ scale: 0.98 }}
              whileHover={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              key={item.id || index} 
              onClick={() => {
                setCurrentSelected(index);
                // [NEW] Set default mobile tab: "รูปภาพ" if image exists, else "วัตถุดิบ"
                setMobileTab(item.image_url ? "รูปภาพ" : "วัตถุดิบ");
              }}
              className={`h-24 bg-[#b6562c]/10 border-2 border-[#b6562c]/50 p-2! transition-all duration-75 text-[#b6562c] cursor-pointer`}
            >
              
              <div className="flex justify-center items-center mb-2 gap-2">
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
              
            </motion.button>
          ))}
        </div> : 
        <div className="grid  px text-[#b6562c] border-x-4 border-b-4 border-[#b6562c]/50 h-full content-start">
          <div className="flex justify-between p-2!">
            <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl w-fit cursor-pointer text-[#b6562c]/70! hover:text-[#b6562c]! duration-100"
            onClick={() => setCurrentSelected(null)}
          
          >
            <TbArrowBackUp />
          </motion.button>

            <span className={`text-lg md:text-2xl font-bold text-[#b6562c] bg-[#b6562c]/10 p-2! border-2 border-[#b6562c]/50 self-end `}>
              {recipes[currentSelected].name}
            </span>
          </div>
          
          
          { /* content */ }
          { /* ingredients */ }
          <div className={`h-full overflow-hidden flex p-2! ${isMobile ? "hidden" : ""}`}>
            <div className="flex flex-col gap-1">
              <span className="font-bold">วัตถุดิบที่ใช้</span>

              <div className="w-64 flex flex-col p-2! overflow-y-auto h-full">
              {
                recipes[currentSelected].ingredients.map((ing, index) => (
                  <div key={ing.id || index} className="flex gap-2 justify-start items-center w-fit">
                    <div className=" w-fit p-2!">
                      <img src={ing.image_url} className="h-12" />
                    </div>
                    <div  className=" w-fit">
                      <span key={ing.id}>{ing.name}</span>
                    </div>
                  </div>
                ))
              }
              </div>
            </div>
             
            
            { /* description */}
            <div className="flex flex-col gap-1">
              <span  className="font-bold ">
                ประโยชน์
              </span>
              <div className=" w-full flex flex-col p-2! overflow-y-auto h-full">
                
                {
                  recipes[currentSelected].ingredients.map((ing, index) => (
                    <div key={ing.id || index} className="flex">
                        <span className="mr-2!">✦</span>
                        <span className="">
                          {ing.benefit}
                        </span>
                    </div>
                  ))
                }
              </div>
              {recipes[currentSelected].description && (
                <div className="mt-4 pt-4 border-t border-[#b6562c]/30 text-sm">
                  <span className="font-bold block mb-1">คำอธิบาย</span>
                  {recipes[currentSelected].description}
                </div>
              )}
            </div>
          </div>

          {isMobile && (
            <div className="h-full flex flex-col text-sm md:text-lg">
                <div className="flex justify-around">
                  {(() => {
                    const hasImage = !!recipes[currentSelected].image_url;
                    const mobTabs = hasImage ? ["รูปภาพ", "วัตถุดิบ", "ประโยชน์"] : ["วัตถุดิบ", "ประโยชน์"];
                    
                    return mobTabs.map((t, i) => (
                      <button 
                        onClick={() => setMobileTab(t)}
                        key={t} className={`
                          p-1!  ${(mobileTab === t || mobileTab === i /* fallback for initial numeric state */) ? "bg-[#b6562c]/50 text-[#6c2000]" : "text-[#b6562c]"} 
                          border-y border-[#b6562c]/50 w-full duration-75 transition-all`}>
                        {t}
                      </button>
                    ));
                  })()}
                </div>
                {
                  (mobileTab === "รูปภาพ") ? (
                    <div className="w-full h-full p-2! overflow-y-auto flex items-center justify-center">
                      <img 
                        src={recipes[currentSelected].image_url} 
                        className="max-h-64 object-contain rounded-lg border-2 border-[#b6562c]/30"
                      />
                    </div>
                  ) :
                  (mobileTab === "วัตถุดิบ" || mobileTab === 0) ? (
                    <div className="w-full grid grid-cols-2 p-2! overflow-y-auto max-h-84 md:max-h-80">
                    {
                      recipes[currentSelected].ingredients.map((ing, index) => (
                        <div key={ing.id || index} className="flex gap-2 justify-start items-center w-fit">
                          <div className=" w-fit p-2!">
                            <img src={ing.image_url} className="h-12" />
                          </div>
                          <div  className=" w-fit">
                            <span key={ing.id}>{ing.name}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  ) : 
                  (mobileTab === "ประโยชน์" || mobileTab === 1) ? (
                    <div className=" w-full flex flex-col p-2! gap-2 overflow-y-auto max-h-84 md:max-h-80 ">
                    {
                      recipes[currentSelected].ingredients.map((ing, index) => (
                        <div key={ing.id || index} className="flex">
                            <span className="mr-2!">✦</span>
                            <span className="">
                              {ing.benefit}
                            </span>
                        </div>
                      ))
                    }
                    {recipes[currentSelected].description && (
                      <>
                        <span className="font-bold block mb-1!">ข้อเสนอแนะ</span>
                        <pre className="text-wrap ">{recipes[currentSelected].description}</pre>
                      </>
                    )}
                    </div>
                  ) : <></>
                }
              </div>
            )
          }
           
            
        </div>
      }
      
    </div>
  )
}


function MaterialContent({ ingredients, player }) {

  return (
    <div className="
      grid grid-cols-3 content-start gap-4 overflow-y-auto p-4!
      border-b-4 border-x-4 border-[#b6562c]/50 h-full
    ">
      {ingredients && ingredients.filter(ing => ing.by === player).map((ing, index) => (
        <div 
          key={ing.id || index} 
          className="
            flex flex-col items-center justify-center p-3! gap-2
            bg-[#b6562c]/10 border-2 border-[#b6562c]/50 
            text-[#b6562c]
          "
        >
          <img src={ing.image_url} alt={ing.name} className="h-12 w-12 object-contain" />
          <span className="text-sm font-semibold">{ing.name}</span>
        </div>
      ))}
    </div>
  )
}

function AchievementContent({ achievements }) {
  // Only show unlocked achievements
  const displayList = (achievements || []).map(a => ({ ...a, unlocked: true }));

  return (
    <div className="
      flex flex-1 flex-col gap-3 overflow-y-auto p-4!
      border-b-4 border-x-4 border-[#b6562c]/50 
    ">
      {displayList.length === 0 && (
        <div className="text-center text-[#b6562c]/70 py-10">
          ยังไม่มีความสำเร็จที่ปลดล็อค
        </div>
      )}
      {displayList.map((ach) => (
        <div 
          key={ach.id}
          className={`
            flex items-center gap-4 p-4! border-2 rounded-xl
            ${ach.unlocked 
              ? "bg-[#b6562c]/10 border-[#b6562c]/50" 
              : "bg-gray-200/50 border-gray-300 grayscale opacity-70"}
          `}
        >
          <div className="text-4xl">
            {ach.icon}
          </div>
          <div className="flex flex-col gap-1">
            <span className={`font-bold ${ach.unlocked ? "text-[#b6562c]" : "text-gray-500"}`}>
              {ach.name}
            </span>
            <span className="text-xs text-[#b6562c]/70">
              {ach.unlocked ? ach.description : "???"}
            </span>
            {ach.unlockedAt && (
               <span className="text-[10px] text-[#b6562c]/50">
                 {new Date(ach.unlockedAt).toLocaleDateString()}
               </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}


