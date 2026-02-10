"use client";

import { useState, useCallback } from "react";
import { generateIngredientHash } from "@/lib/supabase";

/**
 * Custom hook for managing game state
 */
export function useGameState() {
  const [potIngredients, setPotIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add an ingredient to the pot
  const addToPot = useCallback((ingredient) => {
    setPotIngredients((prev) => {
      // Check if already in pot
      if (prev.find((i) => i.id === ingredient.id)) {
        return prev;
      }
      return [...prev, ingredient];
    });
  }, []);

  // Remove an ingredient from the pot
  const removeFromPot = useCallback((ingredientId) => {
    setPotIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
  }, []);

  // Clear the pot
  const clearPot = useCallback(() => {
    setPotIngredients([]);
  }, []);

  // Get combined benefits from all ingredients in pot
  const getCombinedBenefits = useCallback(() => {
    return potIngredients.map((ing) => ({
      name: ing.name,
      emoji: ing.emoji,
      benefit: ing.benefit,
    }));
  }, [potIngredients]);

  // Generate hash for current pot ingredients
  const getPotHash = useCallback(() => {
    const ids = potIngredients.map((i) => i.id);
    return generateIngredientHash(ids);
  }, [potIngredients]);

  // Get ingredient IDs for saving
  const getPotIngredientIds = useCallback(() => {
    return potIngredients.map((i) => i.id);
  }, [potIngredients]);

  return {
    potIngredients,
    addToPot,
    removeFromPot,
    clearPot,
    getCombinedBenefits,
    getPotHash,
    getPotIngredientIds,
    isLoading,
    setIsLoading,
  };
}
