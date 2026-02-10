"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import {
  fetchIngredients,
  createRecipe,
  addIngredient,
  addToCollection,
  uploadPresetData,
  uploadRecipeImage,
  getPresetData,
} from "@/lib/supabase";
import { INITIAL_INGREDIENTS, INITIAL_RECIPES } from "@/lib/initial_data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useBGM } from "@/hooks/useBGM";
import { ACHIEVEMENTS } from "@/lib/constants";
import AchievementPopup from "@/components/AchievementPopup";
import NamePopup from "@/components/NamePopup";
import RecipeNamingPopup from "@/components/RecipeNamingPopup";
import RecipeResult from "@/components/RecipeResult";

import Navigation from "@/components/Nav";
import IngredientsPot from "@/components/IngredientsPot";

import HistoryPanel from "@/components/HistoryPanel";
import PlayerInfoPanel from "@/components/Info";
import SettingPanel from "@/components/Setting";
import AddIngredientPopup from "@/components/AddIngredient";

import BackgroundVideo from "@/components/BackgroundVideo";
import { Bagel_Fat_One } from "next/font/google";

import { motion } from "motion/react";

const bagel = Bagel_Fat_One({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Home() {
  const [playerName, setPlayerName, nameLoaded] = useLocalStorage(
    "playerName",
    null,
  );
  const [history, setHistory, historyLoaded] = useLocalStorage(
    "cookingHistory",
    [],
  );
  const [achievements, setAchievements, achievementsLoaded] = useLocalStorage(
    "achievements",
    [],
  );

  const [currentAchievement, setCurrentAchievement] = useState(null);

  // BGM
  const { unmute, tryAutoplayUnmuted, volume, setVolume, isMuted, toggleMute } = useBGM("/bgm/bgm.mp3");

  // Background video
  const stirRef = useRef(null);
  const [dynamicBg, setDynamicBg] = useLocalStorage("dynamicBg", true);
  const [projectileAnim, setProjectileAnim] = useLocalStorage("projectileAnim", true);

  const [potIngredients, setPotIngredients] = useState([]);
  const [ingredients, setIngredients] = useState([]); // [NEW] Lifted state

  const [showIngredients, setShowIngredients] = useState(true);
  const [showPotData, setShowPotData] = useState(false);

  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showNamingPopup, setShowNamingPopup] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPlayerInfo, setShowPlayerInfo] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [showAddIngredient, setShowAddIngredient] = useState(false);

  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Responsive: detect mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (nameLoaded && !playerName) {
      setShowNamePopup(true);
    }
  }, [nameLoaded, playerName]);

  // Returning user: try to autoplay unmuted
  useEffect(() => {
    if (nameLoaded && playerName) {
      tryAutoplayUnmuted();
    }
  }, [nameLoaded, playerName, tryAutoplayUnmuted]);

  // [NEW] Dev Tools: Expose upload function to window
  useEffect(() => {
    window.uploadInitialData = async (secret) => {
      if (secret !== "setup_initial_data") {
        console.warn("⛔ Access Denied: You need a password to run this.");
        console.warn("Usage: uploadInitialData('setup_initial_data')");
        return;
      }
      console.log("Uploading initial data sources...");
      await uploadPresetData(INITIAL_INGREDIENTS, INITIAL_RECIPES);
    };

    window.getPresetData = async () => {
      const data = await getPresetData();
      console.log("Current DB Data:", data);
      console.log("JSON:", JSON.stringify(data, null, 2));
    };

    // console.log("🛠️ Dev Tools Loaded:");
    // console.log("> window.uploadInitialData() - Uploads data from lib/initial_data.js");
    // console.log("> window.getPresetData()     - Prints current DB data to console");
  }, []);

  // [NEW] Helper: Unlock Achievement
  const unlockAchievement = useCallback(
    (id, dynamicData = null) => {
      if (!achievementsLoaded) return;

      // Check if already unlocked
      const isUnlocked = achievements.some((a) =>
        typeof a === "string" ? a === id : a.id === id,
      );
      if (isUnlocked) return;

      let newAchievement = null;

      if (dynamicData) {
        // Dynamic achievement
        newAchievement = {
          id,
          ...dynamicData,
          unlockedAt: new Date().toISOString(),
        };
      } else {
        // Static achievement from constants
        const staticData = ACHIEVEMENTS.find((a) => a.id === id);
        if (staticData) {
          newAchievement = {
            ...staticData,
            unlockedAt: new Date().toISOString(),
          };
        }
      }

      if (newAchievement) {
        setAchievements((prev) => [...prev, newAchievement]);
        setCurrentAchievement(newAchievement);
      }
    },
    [achievementsLoaded, achievements, setAchievements],
  );

  // [NEW] Achievement Check: The Lost One
  // [NEW] Achievement Check: The Lost One & Migration

  // [NEW] Load initial ingredients
  useEffect(() => {
    fetchIngredients().then((data) => {
      setIngredients(data);
      setDataLoading(false);
    });
  }, []);

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setShowNamePopup(false);
    unmute(); // Start BGM when first-time user clicks "ตกลง"
    setTimeout(() => {
      unlockAchievement("lost_one");
    }, 500);
  };

  const getPotHash = () =>
    potIngredients
      .map((i) => i.id)
      .sort()
      .join("-");

  const handleRecipeNamed = async ({ name: recipeName, description: recipeDesc, imageFile }) => {
    setIsLoading(true);
    setShowNamingPopup(false);
    try {
      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadRecipeImage(imageFile);
      }

      const newRecipe = await createRecipe({
        name: recipeName,
        ingredients: potIngredients.map((i) => ({
          name: i.name,
          benefit: i.benefit,
          image_url: i.image_url,
        })),
        ingredientHash: getPotHash(),
        creatorName: playerName,
        description: recipeDesc || null,
        image_url: imageUrl,
      });
      if (newRecipe) {
        setCurrentRecipe(newRecipe);
        setIsNewDiscovery(true);
        setShowResult(true);
        addToHistory(newRecipe, true);

        // [NEW] Add to persistent collection
        addToCollection(playerName, newRecipe.id);

        // [NEW] Achievement Check: First Discovery
        // [NEW] Dynamic Achievement: Recipe Discovery
        // Always award a "Discoverer" achievement for a new recipe
        const discoveryId = `discovery-${newRecipe.id}`;
        if (achievementsLoaded) {
          // Slight delay to show achievement after result popup
          setTimeout(() => {
            unlockAchievement(`discovery-${newRecipe.id}`, {
              name: `ผู้ค้นพบ ${newRecipe.name}`,
              description: "คุณคือคนแรกที่ค้นพบสูตรอาหารนี้",
              icon: "🍳",
            });
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = useCallback(
    (recipe, isNew, ingredientsOverride = null) => {
      // Use override if provided, otherwise fallback to current state
      const currentIngs = ingredientsOverride || potIngredients;

      setHistory((prev) =>
        [
          {
            id: crypto.randomUUID(),
            recipeName: recipe.name,
            ingredients: currentIngs.map((i) => ({
              name: i.name,
              benefit: i.benefit,
              image_url: i.image_url,
            })),
            creatorName: recipe.by,
            createdAt: new Date().toISOString(),
            isNewDiscovery: isNew,
          },
          ...prev,
        ].slice(0, 50),
      );
    },
    [potIngredients, setHistory],
  );

  const handleCookAgain = () => {
    setShowResult(false);
    setCurrentRecipe(null);
    setShowPotData(false);
    setPotIngredients([]);
  };

  const getCombinedBenefits = (ingredientsOverride = null) => {
    const list = ingredientsOverride || potIngredients;
    return list.map((i) => ({
      name: i.name,
      benefit: i.benefit,
      image_url: i.image_url,
    }));
  };

  const handleAddIngredient = async (newIngredient) => {
    // Save to DB
    const result = await addIngredient({
      ...newIngredient,
      by: playerName,
    });

    if (result?.error === "duplicate") {
      alert(`มีวัตถุดิบ "${newIngredient.name}" อยู่แล้ว!`);
      return false;
    }

    if (result) {
      setIngredients((prev) => [...prev, result]);
      return true;
    }
    return false;
  };

  if (!nameLoaded || !historyLoaded || dataLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a2e",
          color: "#d4a574",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className="p-2! md:p-4!"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <BackgroundVideo onStirRef={stirRef} enabled={dynamicBg} />
      <div className="absolute inset-0 bg-linear-to-b from-[#f29f76] to-transparent to-20%  z-10"></div>

      <div className="flex flex-col h-full ">
        {/* Header */}
        <div className="bg-linear-to-b dfrom-black z-20 to-transparent w-full flex justify-center md:justify-between gap-2 items-center md:items-start ">
          {/* Left Header */}
          <div
            // style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            className={`border-4 border-[#b6562c]/50 shadow-[0_0_10px_#b6562c] text-shadow-[0_0_2px_#b6562c] bg-[url('/texture/paper.jpg')] p-2! md:p-4! text-xl md:text-3xl font-bold text-[#b6562c] ${bagel.className}`}
          >
            Holistic Health Atelier
          </div>

          {/* Right Header */}
          {playerName && (
            <div
              className="hidden md:flex"
              style={{ alignItems: "center", gap: 12 }}
            >
              <span
                style={{
                  color: "#f4e4bc",
                  fontSize: 13,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                Welcome, {playerName}!
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-[url('/texture/paper.jpg')] hidden md:block text-[#b6562c] border-2 border-[#b6562c]/50 py-2! px-4!`}
                onClick={() => setShowHistory(true)}
                style={{
                  // background: 'linear-gradient(135deg, #d4b896, #c9a96e)',
                  // border: '2px solid #8B6914',
                  // padding: '8px 16px',
                  // borderRadius: 15,
                  // color: '#5a3a0a',
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                📜 ประวัติการปรุง
              </motion.button>
            </div>
          )}
        </div>

        <IngredientsPot
          setDataLoading={setDataLoading}
          setShowNamingPopup={setShowNamingPopup}
          ingredientsConf={{
            get: showIngredients,
            set: setShowIngredients,
          }}
          potDataConf={{
            get: showPotData,
            set: setShowPotData,
          }}
          potIngredientsConf={{
            get: potIngredients,
            set: setPotIngredients,
          }}
          addIngredientConf={{
            get: showAddIngredient,
            set: setShowAddIngredient,
          }}
          // [NEW] Pass ingredients prop
          ingredients={ingredients}
          onRecipeFound={(recipe, finalIngredients) => {
            setCurrentRecipe(recipe);
            setIsNewDiscovery(false);
            setShowResult(true);
            // Pass the final ingredients because potIngredients state might be stale in this closure
            addToHistory(recipe, false, finalIngredients);
            // [NEW] Add to persistent collection
            addToCollection(playerName, recipe.id);
          }}
          onStir={() => stirRef.current?.()}
          projectileAnim={projectileAnim}
          isMobile={isMobile}
        />

        <Navigation
          ingredientsConf={{
            get: showIngredients,
            set: setShowIngredients,
          }}
          potDataConf={{
            get: showPotData,
            set: setShowPotData,
          }}
          historyConf={{
            get: showHistory,
            set: setShowHistory,
          }}
          playerInfoConf={{
            get: showPlayerInfo,
            set: setShowPlayerInfo,
          }}
          settingConf={{
            get: showSetting,
            set: setShowSetting
          }}
          isMobile={isMobile}
        />

        {/* Achievement Popup */}
        <AnimatePresence>
          {currentAchievement && (
            <AchievementPopup
              achievement={currentAchievement}
              onClose={() => setCurrentAchievement(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Popups */}
      {showNamePopup && <NamePopup onSubmit={handleNameSubmit} />}
      {showNamingPopup && (
        <RecipeNamingPopup
          ingredients={potIngredients}
          onSubmit={handleRecipeNamed}
          onCancel={() => setShowNamingPopup(false)}
        />
      )}
      {showResult && currentRecipe && (
        <RecipeResult
          recipe={currentRecipe}
          benefits={getCombinedBenefits()}
          isNewDiscovery={isNewDiscovery}
          onCookAgain={handleCookAgain}
        />
      )}
      {showHistory && (
        <HistoryPanel history={history} onClose={() => setShowHistory(false)} />
      )}
      {showPlayerInfo && (
        <PlayerInfoPanel
          history={history}
          player={playerName}
          onClose={() => setShowPlayerInfo(false)}
          ingredients={ingredients}
          achievements={achievements}
        />
      )}
      {showSetting && (
        <SettingPanel
          onClose={() => setShowSetting(false)}
          bgm={{ volume, setVolume, isMuted, toggleMute }}
          video={{ dynamicBg, setDynamicBg, projectileAnim, setProjectileAnim }}
        />
      )}
      {showAddIngredient && (
        <AddIngredientPopup
          history={history}
          onClose={() => setShowAddIngredient(false)}
          onAdd={handleAddIngredient}
        />
      )}
    </div>
  );
}
