"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import {
  fetchIngredients,
  createRecipe,
  addIngredient,
  addToCollection,
  fetchUserCollection,
  fetchRecipesByCreator, // [NEW] Import
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
  // [NEW] Tracking stats for advanced achievements
  const [playerStats, setPlayerStats, statsLoaded] = useLocalStorage("playerStats", {
    ingredientsContributed: 0,
    detailsAdded: 0,
    firstDiscoveries: 0,
  });

  // [NEW] Full collection for achievements (replaces history for counts)
  const [userCollection, setUserCollection] = useState([]);
  const [collectionLoaded, setCollectionLoaded] = useState(false);

  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]); // [NEW] Queue for multiple unlocks

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
      
      // [NEW] Fetch full collection
      fetchUserCollection(playerName).then(data => {
        setUserCollection(data);
        setCollectionLoaded(true);
      });
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
  // Check if an achievement is unlocked
  const isUnlocked = useCallback((id) => {
    return achievements.some((a) =>
      typeof a === "string" ? a === id : a.id === id,
    );
  }, [achievements]);

  // [MODIFIED] Batch unlock achievements to prevent localStorage race conditions
  const batchUnlockAchievements = useCallback(
    (idsOrData) => {
      if (!achievementsLoaded) return;

      const newAchievements = [];
      
      idsOrData.forEach(item => {
        const id = typeof item === 'string' ? item : item.id;
        if (isUnlocked(id)) return;

        let newAchievement = null;
        if (typeof item === 'object') {
           newAchievement = {
              ...item,
              unlockedAt: new Date().toISOString(),
           };
        } else {
           const staticData = ACHIEVEMENTS.find((a) => a.id === item);
           if (staticData) {
             newAchievement = {
               ...staticData,
               unlockedAt: new Date().toISOString(),
             };
           }
        }

        if (newAchievement) {
            newAchievements.push(newAchievement);
        }
      });

      if (newAchievements.length > 0) {
        setAchievements((prev) => [...prev, ...newAchievements]);
        setAchievementQueue((prev) => [...prev, ...newAchievements]);
      }
    },
    [achievementsLoaded, isUnlocked, setAchievements],
  );

  // [NEW] Process Achievement Queue
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      // Add delay to ensure valid exit animation and "breathing room"
      const timer = setTimeout(() => {
        const next = achievementQueue[0];
        setCurrentAchievement(next);
        setAchievementQueue((prev) => prev.slice(1));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentAchievement, achievementQueue]);

  // [NEW] Achievement System: Check conditions
  const checkAchievements = useCallback((currentStats = {}, currentCollection = []) => {
    const toUnlock = [];

    // 1. Found N Recipes (found_*)
    // Use the full DB collection count instead of limited history
    const uniqueFound = (currentCollection.length > 0 ? currentCollection : userCollection).length;
    
    if (uniqueFound >= 10) toUnlock.push("found_10");
    if (uniqueFound >= 50) toUnlock.push("found_50");
    if (uniqueFound >= 100) toUnlock.push("found_100");
    if (uniqueFound >= 500) toUnlock.push("found_500");

    // 2. First Discoveries (new_*)
    const discoverCount = currentStats.firstDiscoveries ?? playerStats.firstDiscoveries;
    if (discoverCount >= 10) toUnlock.push("new_10");
    if (discoverCount >= 50) toUnlock.push("new_50");
    if (discoverCount >= 100) toUnlock.push("new_100");
    if (discoverCount >= 200) toUnlock.push("new_200");

    // 3. Contribution (contributed_*)
    const contribCount = currentStats.ingredientsContributed ?? playerStats.ingredientsContributed;
    if (contribCount >= 10) toUnlock.push("contributed_1");
    if (contribCount >= 50) toUnlock.push("contributed_2");
    if (contribCount >= 100) toUnlock.push("contributed_3");
    if (contribCount >= 200) toUnlock.push("contributed_4");

    // 4. Detailer (detailer_*)
    const detailCount = currentStats.detailsAdded ?? playerStats.detailsAdded;
    if (detailCount >= 1) toUnlock.push("detailer_1");
    if (detailCount >= 10) toUnlock.push("detailer_2");
    if (detailCount >= 50) toUnlock.push("detailer_3");
    if (detailCount >= 100) toUnlock.push("detailer_4");

    // [NEW] Retroactive "Lost One" (Welcome)
    // If player has done anything, ensure they have the welcome achievement
    if (uniqueFound > 0 || discoverCount > 0 || contribCount > 0 || detailCount > 0) {
        toUnlock.push("lost_one");
    }

    if (toUnlock.length > 0) {
        batchUnlockAchievements(toUnlock);
    }

  }, [history, playerStats, userCollection, batchUnlockAchievements]); // Added batchUnlockAchievements dependency

  // Check achievement count whenever achievements change
  useEffect(() => {
    if (!achievementsLoaded) return;
    const count = achievements.length;
    const toUnlock = [];
    if (count >= 5) toUnlock.push("achievement_1");
    if (count >= 20) toUnlock.push("achievement_2");
    if (count >= 50) toUnlock.push("achievement_3");
    if (count >= 100) toUnlock.push("achievement_4");
    
    if (toUnlock.length > 0) batchUnlockAchievements(toUnlock);
  }, [achievements, achievementsLoaded, batchUnlockAchievements]);

  // [NEW] Achievement Check: The Lost One
  // [NEW] Achievement Check: The Lost One & Migration

  // [NEW] Load initial ingredients & Retroactive Stats Check
  useEffect(() => {
    fetchIngredients().then((data) => {
      setIngredients(data);
      setDataLoading(false);

      if (playerName && achievementsLoaded) {
        // 1. Count contributed ingredients
        const myIngredients = data.filter(i => i.by === playerName).length;
        
        // 2. Count created recipes (first discoveries & details)
        fetchRecipesByCreator(playerName).then(myRecipes => {
            const myDiscoveries = myRecipes.length;
            const myDetails = myRecipes.filter(r => r.description || r.image_url).length;

            setPlayerStats(prev => {
                const newStats = {
                    ...prev,
                    ingredientsContributed: Math.max(prev.ingredientsContributed || 0, myIngredients),
                    firstDiscoveries: Math.max(prev.firstDiscoveries || 0, myDiscoveries),
                    detailsAdded: Math.max(prev.detailsAdded || 0, myDetails)
                };
                
                // Trigger check with new stats
                checkAchievements(newStats);

                return newStats;
            });
        });
      }
    });
  }, [playerName, achievementsLoaded]); // Added achievementsLoaded dependency

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setShowNamePopup(false);
    unmute(); // Start BGM when first-time user clicks "ตกลง"
    setTimeout(() => {
      batchUnlockAchievements(["lost_one"]);
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
        
        // Update local collection state immediately
        const updatedCollection = [...userCollection, newRecipe];
        setUserCollection(updatedCollection);

        // [NEW] Achievement Check: First Discovery
        // [NEW] Dynamic Achievement: Recipe Discovery
        // Always award a "Discoverer" achievement for a new recipe
        const discoveryId = `discovery-${newRecipe.id}`;
        if (achievementsLoaded) {
          // Update stats
          const newStats = {
            ...playerStats,
            firstDiscoveries: (playerStats.firstDiscoveries || 0) + 1,
            detailsAdded: (playerStats.detailsAdded || 0) + (recipeDesc || imageUrl ? 1 : 0)
          };
          setPlayerStats(newStats);

          // Slight delay to show achievement after result popup
          setTimeout(() => {
            batchUnlockAchievements([{
                id: `discovery-${newRecipe.id}`,
                name: `ผู้ค้นพบ ${newRecipe.name}`,
                description: "คุณคือคนแรกที่ค้นพบสูตรอาหารนี้",
                icon: "🍳",
            }]);
            // Check other stats
            checkAchievements(newStats, updatedCollection);
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
      
      // Update stats
      const newStats = {
        ...playerStats,
        ingredientsContributed: (playerStats.ingredientsContributed || 0) + 1
      };
      setPlayerStats(newStats);
      checkAchievements(newStats);
      
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
            
            // Update local collection state immediately if not exists
            let updatedCollection = userCollection;
            const exists = userCollection.some(r => r.id === recipe.id);
             
            // [NEW] Check for duplicate (cooked before) - using full collection
            if (exists) {
                batchUnlockAchievements(["duplicate"]);
            } else {
                updatedCollection = [...userCollection, recipe];
                setUserCollection(updatedCollection);
            }

            // [NEW] Check for messy (mixed many)
            const toUnlock = [];
            if (finalIngredients.length > 10) toUnlock.push("messy_mixed_1"); // > 10
            if (finalIngredients.length > 100) toUnlock.push("messy_mixed_2"); // > 100
            
            if (toUnlock.length > 0) batchUnlockAchievements(toUnlock);
             
            // Check general stats
            checkAchievements({}, updatedCollection);
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
        <AnimatePresence mode="wait">
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
