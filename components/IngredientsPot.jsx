"use client";

import "@/styles/card.css";

import { findRecipe, createRecipe } from "@/lib/supabase";
import { CATEGORIES as categories } from "@/lib/constants";

import { isMotionComponent, motion } from "motion/react";
import { Trykker } from "next/font/google";
import { useState, useEffect, useRef } from "react";

import { BiSolidFoodMenu } from "react-icons/bi";
import { IoIosClose, IoMdSearch } from "react-icons/io";
import { GrAppsRounded } from "react-icons/gr";
import Image from "next/image";


export default function IngredientsPot({
  setDataLoading,
  setShowNamingPopup,
  ingredientsConf,
  potDataConf,
  potIngredientsConf,
  addIngredientConf,
  ingredients, // [NEW] Received as prop
  onRecipeFound, // [NEW] Callback when recipe is found
  onStir, // [NEW] Callback to trigger stir background video
  projectileAnim, // [NEW] Whether to show flying animation
  isMobile,
}) {

  ingredients.sort((a, b) => a.name.localeCompare(b.name));
  potIngredientsConf.get.sort((a, b) => a.name.localeCompare(b.name));

  const [currentCategory, setCurrentCategory] = useState("เนื้อ");
  const [prevCategory, setPrevCategory] = useState("เนื้อ");

  // const [ingredients, setIngredients] = useState([]); // [REMOVED]
  const [flyingItems, setFlyingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* Search State */
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Sprite animation frame (0-7 for 8 frames)
  const [spriteFrame, setSpriteFrame] = useState(0);

  // Pot position (center of screen, higher up)
  const potPosition = { x: 0.5, y: 0.60 }; // percentage of screen

  const getPotHash = () =>
    potIngredientsConf.get
      .map((i) => i.id)
      .sort()
      .join("-");

  // Handle adding ingredient
  const handleAddIngredient = (ingredient, event) => {
    if (potIngredientsConf.get.find((p) => p.id === ingredient.id)) return;

    if (projectileAnim === false) {
      // Skip animation — add directly to pot
      potIngredientsConf.set((prev) => {
        if (prev.some((p) => p.id === ingredient.id)) return prev;
        return [...prev, ingredient];
      });
      onStir?.();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const targetX = window.innerWidth * potPosition.x;
    const targetY = window.innerHeight * potPosition.y - 100;

    setFlyingItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        ingredient,
        startX,
        startY,
        targetX,
        targetY,
        progress: 0,
      },
    ]);

    // Trigger stir background video
    onStir?.();
  };

  // Get flying item position with arc
  const getFlyingPosition = (item) => {
    const { startX, startY, targetX, targetY, progress } = item;
    const ease = 1 - Math.pow(1 - progress, 3);
    const x = startX + (targetX - startX) * ease;
    const arcHeight = -200;
    const arc = Math.sin(progress * Math.PI) * arcHeight;
    const y = startY + (targetY - startY) * ease + arc;
    const scale = 1 + progress * 0.3;
    const rotation = progress * 360;
    // Fade out quickly at the end (last 20% of animation)
    const opacity = progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;
    return { x, y, scale, rotation, opacity };
  };

  // Flying animation
  // 1. สร้าง "กล่อง" เก็บข้อมูลล่าสุดไว้
  const itemsRef = useRef(flyingItems);

  // 2. คอยอัปเดตกล่องนี้ให้มีข้อมูลล่าสุดเสมอ
  useEffect(() => {
    itemsRef.current = flyingItems;
  }, [flyingItems]);

  useEffect(() => {
    if (flyingItems.length === 0) return;

    const interval = setInterval(() => {
      // 3. หยิบข้อมูลจาก "กล่อง" มาคำนวณ (ได้ค่าล่าสุดแน่นอน ไม่เป็น 0)
      const currentItems = itemsRef.current;
      const reached = [];
      const stillFlying = [];

      currentItems.forEach(item => {
        const nextP = item.progress + 0.02;
        if (nextP >= 1) {
          reached.push(item.ingredient); // เก็บของที่ถึงแล้วไว้ในตะกร้าชั่วคราว
        } else {
          stillFlying.push({ ...item, progress: nextP });
        }
      });

      // 4. อัปเดต UI ของเราเอง
      setFlyingItems(stillFlying);

      // 5. [สำคัญ] ถ้ามีของถึงแล้ว ค่อยสั่งอัปเดตหม้อ "ข้างนอก" การคำนวณข้างบน
      if (reached.length > 0) {
        potIngredientsConf.set(prevPot => {
          const nextPot = [...prevPot];
          reached.forEach(ing => {
            if (!nextPot.some(p => p.id === ing.id)) nextPot.push(ing);
          });
          return nextPot;
        });
      }
    }, 16);

    return () => clearInterval(interval);
  }, [flyingItems.length > 0]);

  // Sprite animation - cycle through 8 frames
  useEffect(() => {
    const spriteInterval = setInterval(() => {
      setSpriteFrame((prev) => (prev + 1) % 8);
    }, 150); // 150ms per frame = ~6.6 fps
    return () => clearInterval(spriteInterval);
  }, []);

  const removeFromPot = (id) => {
    potIngredientsConf.set((prev) => prev.filter((p) => p.id !== id));
  };

  const handleComplete = async () => {
    // 1. Force complete transfer for all flying items
    const currentItems = itemsRef.current;
    
    // Merge existing pot + flying items (unique by ID)
    const potIngs = potIngredientsConf.get;
    const flyingIngs = currentItems.map(item => item.ingredient);
    
    const allIngredients = [...potIngs];
    flyingIngs.forEach(ing => {
      if (!allIngredients.some(p => p.id === ing.id)) {
        allIngredients.push(ing);
      }
    });

    if (allIngredients.length === 0) return;

    // 2. Clear flying items immediately
    setFlyingItems([]);
    itemsRef.current = [];

    // 3. Update pot state immediately
    potIngredientsConf.set(allIngredients);
    
    setIsLoading(true);
    try {
      const hash = allIngredients.map(i => i.id).sort().join('-');
      const existingRecipe = await findRecipe(hash);
      
      if (existingRecipe) {
        // Pass the explicit list because state updates are async
        onRecipeFound(existingRecipe, allIngredients);
      } else {
        setShowNamingPopup(true);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 justify-around items-center w-full h-full">
      {ingredientsConf.get && (
        <div className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent to-50%  z-10"></div>
      )}

      {/* Ingredient Panel - Responsive: sidebar on desktop, modal on mobile */}
      <motion.div
        initial={{ scale: 0.1 }}
        animate={{ scale: 1 }}
        className={`
                ${ isMobile ? "max-w-md" : " max-w-104"} w-full
                ${ingredientsConf.get ? "" : "opacity-0 scale-0"} 
                ${ isMobile && potDataConf.get ? "hidden" : "" } 
                z-10 duration-75 
                bg-[url("/texture/paper.jpg")] border-4 
                border-[#b6562c]/50
            `}
            
        style={{
          // backgroundImage: 'url("/texture/paper.jpg")',
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && ingredientsConf.get) {
            ingredientsConf.set(false);
          }
        }}
      >
        <div className="flex h-144 max-h-144">
          <div className={`w-14 border-r-4 h-full border-[#b6562c]/50 duration-100  flex flex-col gap-2 ${isMobile ? "hidden" : ""}`}>
            <div className="w-full h-32 rounded-l-xl"></div>
            { /* GrAppsRounded */ }
            <motion.button
              title="วัตถุดิบ"
              onClick={() => {setCurrentCategory("all"); setShowSearch(true);}}
              whileTap={{ scale: 0.95 }}
              className={`
                w-full h-14 rounded-l-xl text-xl flex justify-center items-center 
                cursor-pointer duration-100 text-[#b6562c] ${currentCategory == "all" ? "" : "opacity-40 scale-90"} 
              `}
            >
              <div className="p-2!">
                <GrAppsRounded />
              </div>
            </motion.button>
            {categories.map((cate) => (
              <motion.button
                title={cate.name}
                onClick={() => {setCurrentCategory(cate.name); setShowSearch(false); setSearchTerm("")}}
                whileTap={{ scale: 0.95 }}
                key={cate.id}
                className={`
                  w-full h-14 rounded-l-xl  text-sm flex justify-center items-center 
                  cursor-pointer duration-100 
                  ${currentCategory == cate.name ? "" : "opacity-40 scale-90"} 
                `}
              >
                <div className="p-2! relative w-full h-full flex items-center justify-center">
                  <Image src={cate.image_url} alt={cate.name} width={32} height={32} className="object-contain" />
                </div>
              </motion.button>
            ))}
            <motion.button
                title="เพิ่มวัตถุดิบ"
                whileTap={{ scale: 0.90 }}
                onClick={() => addIngredientConf.set(true)}
                className={`
                  w-full h-14 rounded-l-xl  text-2xl flex justify-center items-center 
                  cursor-pointer duration-100 p-2! text-[#b6562c] opacity-60 hover:opacity-100
                `}
              >
                <BiSolidFoodMenu />
              </motion.button>
          </div>

          <div
            className="w-full flex flex-col p-4! gap-2 md:gap-4  "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`pb-3! flex justify-between items-center border-b text-[#b6562c] border-[#b6562c]/50 ${showSearch ? "gap-2" : ""} `}>
              {showSearch ? (
                <div className="flex-1 flex items-center gap-2 bg-[#b6562c]/10 px-2! border border-[#b6562c]/30">
                  <IoMdSearch className={`text-xl shrink-0`} />
                  <input
                    autoFocus
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาวัตถุดิบ..."
                    className="w-full bg-transparent selection:text-white! border-none outline-none p-1! text-[#b6562c] placeholder-[#b6562c]/50"
                  />
                  <button onClick={() => { setSearchTerm(""); setShowSearch(false); if ( isMobile ) { setCurrentCategory(prevCategory); } }} className="text-lg cursor-pointer">✕</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-bold">วัตถุดิบ<span className="text-[#b6562c]/50 mx-1!">{currentCategory != "all" ? "│" : ""}</span>{currentCategory == "all" ? "" : currentCategory}</span>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {setShowSearch(true); setCurrentCategory("all");}}
                    className="p-1! rounded-full hover:bg-[#b6562c]/10 text-xl hidden md:block cursor-pointer"
                  >
                    <IoMdSearch />
                  </motion.button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="border-none text-3xl justify-self-start cursor-pointer self-end duration-75 ml-2"
                onClick={() => ingredientsConf.set(false)}
              >
                <IoIosClose />
              </motion.button>
            </div>

            { isMobile && !showSearch && (
              <div className="flex gap-1 h-full max-h-6 overflow-x-auto 
              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <motion.button 
                  onClick={() => {setShowSearch(true); setPrevCategory(currentCategory);}}
                  className={`
                    p-1! bg-[#b6562c]/10 text-[#b6562c] flex items-center justify-center
                    border border-[#b6562c]/50 text-xs rounded-sm shrink-0
                  `}>
                  <IoMdSearch />
                </motion.button>
                {
                  categories.map(c => (
                    <motion.button 
                      onClick={() => {setCurrentCategory(c.name);setShowSearch(false);}}
                      key={c.id} 
                      className={`
                        p-1!    flex items-center justify-center
                        border border-[#b6562c]/50 text-xs rounded-sm shrink-0
                        ${currentCategory === c.name ? " bg-[#b6562c]" : "text-[#b6562c] bg-[#b6562c]/10"}
                      `}>
                      {c.name}
                    </motion.button>
                  ))
                }

              </div>
            )}

            {/* Ingredient List */}
            <div className="overflow-y-auto h-full">
              <div className="grid grid-cols-3 gap-2 overflow-y-auto mr-1! content-start">
                {ingredients
                  .filter((ing) => {
                    if (searchTerm.trim()) {
                      return ing.name.toLowerCase().includes(searchTerm.toLowerCase());
                    }
                    return currentCategory === ing.category || showSearch || currentCategory === "all";
                  })
                  .map((ing, idx) => {
                    const inPot = potIngredientsConf.get.find((p) => p.id === ing.id);

                    return (
                      <motion.button
                        key={ing.id || idx}
                        title={ing.name}
                        onClick={(e) => {
                          handleAddIngredient(ing, e);
                          if (!potDataConf.get && !isMobile) potDataConf.set(true);
                        }}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        variants={{
                          initial: { scale: 1 },
                        }}
                        disabled={!!inPot}
                        className={`
                          flex flex-col justify-center items-center gap-2 py-1! md:py-2!
                          border border-[#b6562c]/20 drop-shadow-2xl bg-[#b6562c]/10
                          cursor-pointer 
                          ${inPot ? "opacity-60 cursor-not-allowed" : ""}
                        `}
                      >
                        <motion.div
                          variants={{
                            hover: { scale: 1.1 },
                            tap: { scale: 0.95 }
                          }}
                          className="w-8 md:w-12 flex justify-center"
                        >
                          <Image src={ing.image_url} alt={ing.name} width={48} height={48} className="object-contain" />
                        </motion.div>
                        <span className="text-[#b6562c] text-xs md:text-lg">
                          {ing.name.length > 15
                            ? ing.name.slice(0, 15) + "..."
                            : ing.name}
                        </span>
                        {/* {inPot && <span className="text-[#90EE90] text-[14px] ">✓</span>} */}
                      </motion.button>
                    );
                  })}
                
              </div>
            </div>
            { 
              isMobile && (
                <>
                  <div className="flex justify-between items-center gap-1 text-[#b6562c] ">
                    <div className="
                      flex flex-nowrap gap-1 bg-[#b6562c]/10 border border-[#b6562c]/50 
                      p-1! overflow-x-auto  w-full h-10
                      [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                    ">
                      {
                        potIngredientsConf.get.map(ing => (
                          <button 
                            onClick={() => removeFromPot(ing.id)}
                            key={ing.id} className="text-sm shrink-0">
                            <Image src={ing.image_url} alt={ing.name} width={32} height={32} className="h-8 w-auto object-contain" />
                          </button>
                        ))
                      }

                    </div>
                    {/* <motion.button 
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading || potIngredientsConf.get.length <= 0}
                      onClick={handleComplete}
                      className="bg-[#b6562c]/10 text-sm py-1! px-2! w-16 h-full border border-[#b6562c]/50 disabled:opacity-60 duration-75">
                      {isLoading ? "..." : "ปรุง"}

                    </motion.button> */}
                    </div>
                    <div className="flex justify- gap-2 text-[#b6562c] mt-2!">
                       <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addIngredientConf.set(true)}
                        className="bg-[#b6562c]/10 text-sm p-2! w-fit h-full border border-[#b6562c]/50 disabled:opacity-60 duration-75">
                        เพิ่มวัตถุดิบ

                      </motion.button>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading || potIngredientsConf.get.length <= 0}
                        onClick={handleComplete}
                        className="bg-[#b6562c]/10 text-sm p-2! w-fit h-full border border-[#b6562c]/50 disabled:opacity-60 duration-75">
                        {isLoading ? "เริ่มปรุง..." : "เริ่มปรุง"}

                    </motion.button>
                  </div>
                </>
              )
            }
          </div>
        </div>
      </motion.div>

      {/* Pot Info Panel - Responsive: positioned panel on desktop, modal on mobile */}
      <motion.div
        initial={{ scale: 0.1 }}
        animate={{ scale: 1 }}
        className={`
              z-10 
              ${ isMobile ? "self-center w-full max-w-104" : "self-end w-full max-w-80"} 
              ${potDataConf.get ? "" : "opacity-0 scale-0"} 
              ${ isMobile && ingredientsConf.get ? "hidden" : "" } 
              bg-[url("/texture/paper.jpg")] 
              shadow-lg/70 shadow-[#b6562c]
              border-4 border-[#b6562c]/50 duration-75 
            `}
        onClick={(e) => {
          if (e.target === e.currentTarget && potDataConf.get) {
            potDataConf.set(false);
          }
        }}
      >
        <div
          className={`
                 h-144 md:h-120  flex flex-col
                overflow-hidden
                shadow-lg duration-200
              `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="p-3! flex flex-col justify-between items-center text-center"
            style={
              {
                // background: 'rgba(139, 90, 43, 0.5)',
                // borderBottom: '1px solid rgba(200, 150, 100, 0.2)',
              }
            }
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="border-none text-[#b6562c] text-3xl justify-self-start cursor-pointer self-end"
              onClick={() => potDataConf.set(false)}
            >
              <IoIosClose />
            </motion.button>
            <div className="flex flex-col items-center gap-2 flex-1 justify-between">
              <Image src={"/cooking.gif"} alt="Cooking" width={80} height={80} className="h-20 w-auto rounded-2xl" unoptimized />
              <h3 className="text-[#b6562c] m-0 text-[14px]">
                วัตถุดิบที่ใส่ ({potIngredientsConf.get.length})
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className=" flex flex-1 overflow-auto flex-col gap-4 justify-between p-2! md:p-4!">
            <div className="grid grid-cols-3 gap-1 md:gap-3 ">
              {potIngredientsConf.get.map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => removeFromPot(ing.id)}
                    className="
                            px-3! py-1! text-xs md:text-sm
                            border border-[#b6562c]/20
                            text-[#b6562c] cursor-pointer flex flex-col gap-2! bg-[#b6562c]/10
                          "
                  >
                    <div className="flex justify-center">
                      <Image src={ing.image_url} alt={ing.name} width={48} height={48} className="object-contain h-10 w-auto" />
                    </div>
                    {ing.name.length > 10
                      ? ing.name.slice(0, 10) + "..."
                      : ing.name}
                  </button>
              ))}
            </div>
          </div>
          <div className="p-4!">
            <motion.button
              onClick={handleComplete}
              disabled={isLoading || potIngredientsConf.get.length <= 0}
              whileTap={{ scale: 0.95 }}
              className="
                      h-12 p-3! px-5! justify-self-center flex items-center  disabled:opacity-60
                      text-[#b6562c] font-bold text-sm md:text-lg cursor-pointer border-4 border-[#b6562c]/50 bg-[#b6562c]/10
                    "
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {isLoading ? "..." : "ปรุง"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Flying Ingredients */}
      {flyingItems.map((item) => {
        const pos = getFlyingPosition(item);
        return (
          <div
            key={item.id}
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -50%) scale(${pos.scale}) rotate(${pos.rotation}deg)`,
              fontSize: 48,
              pointerEvents: "none",
              zIndex: 100,
              opacity: pos.opacity,
            }}
          >
            <Image src={item.ingredient.image_url} alt={item.ingredient.name} width={48} height={48} className="h-12 w-auto object-contain" />
          </div>
        );
      })}

      {/* Pot is now part of background image */}

      {/* Animated Smoke */}
      <div
        style={{
          position: "absolute",
          left: `${potPosition.x * 100}%`,
          top: `calc(${potPosition.y * 100}% - 180px)`,
          transform: "translateX(-50%)",
          zIndex: 6,
          pointerEvents: "none",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${-30 + i * 15}px`,
              bottom: 0,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.4)",
              filter: "blur(8px)",
              animation: `smokeRise 3s ease-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
                @keyframes potBob {
                0%, 100% { transform: translate(-50%, -50%); }
                50% { transform: translate(-50%, calc(-50% - 8px)); }
                }
                @keyframes smokeRise {
                0% {
                    opacity: 0.6;
                    transform: translateY(0) scale(1);
                }
                50% {
                    opacity: 0.4;
                }
                100% {
                    opacity: 0;
                    transform: translateY(-120px) scale(2);
                }
                }
            `}</style>
    </div>
  );
}
