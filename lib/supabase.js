import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create client only if credentials exist, otherwise create a dummy client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: "holistic_health_group_school_proj" },
    })
  : null;

// Demo ingredients for when Supabase is not configured
const DEMO_INGREDIENTS = [
  {
    id: "1",
    name: "มะเขือเทศ",
    category: "ผลไม้",
    benefit: "Rich in lycopene, supports heart health and skin protection",
    image_url: "/ingredients/tomato.png",
  },
  {
    id: "2",
    name: "แครรอท",
    category: "ผัก",
    benefit: "High in beta-carotene, promotes eye health and immunity",
    image_url: "/ingredients/carrot.png",
  },
  {
    id: "3",
    name: "ผักโขม",
    category: "ผัก",
    benefit: "Packed with iron and vitamins, boosts energy and bone health",
    image_url: "/ingredients/spinach.png",
  },
  {
    id: "4",
    name: "ไข่ไก่",
    category: "เนื้อ",
    benefit:
      "Complete protein source, supports brain function and muscle growth",
    image_url: "/ingredients/egg.png",
  },
  {
    id: "5",
    name: "เนื้อไก่",
    category: "เนื้อ",
    benefit: "Lean protein, helps build muscle and supports immune system",
    image_url: "/ingredients/chicken.png",
  },
  {
    id: "6",
    name: "เนื้อปลา",
    category: "เนื้อ",
    benefit: "Rich in omega-3 fatty acids, supports heart and brain health",
    image_url: "/ingredients/fish.png",
  },
  {
    id: "7",
    name: "แอปเปิ้ล",
    category: "ผลไม้",
    benefit: "High in fiber and antioxidants, aids digestion and heart health",
    image_url: "/ingredients/apple.png",
  },
  {
    id: "8",
    name: "เลม่อน",
    category: "ผลไม้",
    benefit: "Vitamin C powerhouse, boosts immunity and aids detoxification",
    image_url: "/ingredients/lemon.png",
  },
  {
    id: "9",
    name: "กล้วย",
    category: "ผลไม้",
    benefit: "Great source of potassium, supports energy and muscle function",
    image_url: "/ingredients/banana.png",
  },
  {
    id: "10",
    name: "ขิง",
    category: "สมุนไพร",
    benefit: "Anti-inflammatory properties, aids digestion and reduces nausea",
    image_url: "/ingredients/ginger.png",
  },
  {
    id: "11",
    name: "กระเทียม",
    category: "สมุนไพร",
    benefit: "Natural antibiotic, boosts immunity and heart health",
    image_url: "/ingredients/garlic.png",
  },
  {
    id: "12",
    name: "น้ำผึ้ง",
    category: "อื่นๆ",
    benefit: "Natural sweetener with antibacterial properties, soothes throat",
    image_url: "/ingredients/honey.png",
  },
];

// Demo recipes storage (in-memory for demo mode)
let demoRecipes = [];

/**
 * Fetch all ingredients from the database
 */
export async function fetchIngredients() {
  // Return demo data if Supabase not configured
  if (!isSupabaseConfigured) {
    return DEMO_INGREDIENTS;
  }

  const { data, error } = await supabase

    .from("ingredients")
    .select("*")
    .order("created_at", { ascending: true }); // Order by created_at to keep stable

  if (error) {
    console.error("Error fetching ingredients:", error);
    return DEMO_INGREDIENTS; // Fallback to demo data
  }

  return data || DEMO_INGREDIENTS;
}

/**
 * Find a recipe by its ingredient hash
 */
export async function findRecipe(ingredientHash) {
  // Check demo recipes if Supabase not configured
  if (!isSupabaseConfigured) {
    return (
      demoRecipes.find((r) => r.ingredient_hash === ingredientHash) || null
    );
  }

  const { data, error } = await supabase

    .from("recipes")
    .select("*")
    .eq("ingredient_hash", ingredientHash)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error finding recipe:", error);
  }

  return data;
}

/**
 * Create a new recipe
 */
export async function createRecipe({
  name,
  ingredients, // Expecting JSON array
  ingredientHash,
  creatorName,
  description = null,
  image_url = null,
}) {
  // Store in demo recipes if Supabase not configured
  if (!isSupabaseConfigured) {
    console.log("Supabase not configured, using demo storage");
    const newRecipe = {
      id: crypto.randomUUID(),
      name,
      ingredients,
      ingredient_hash: ingredientHash,
      by: creatorName,
      description,
      image_url,
      created_at: new Date().toISOString(),
    };
    demoRecipes.push(newRecipe);
    return newRecipe;
  }

  const { data, error } = await supabase

    .from("recipes")
    .insert({
      name,
      ingredients,
      ingredient_hash: ingredientHash,
      by: creatorName,
      description,
      image_url,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating recipe:", error);
    return null;
  }

  return data;
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(file) {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, cannot upload image.");
    return null;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("ingredients")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("ingredients").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Upload a recipe image to Supabase Storage
 */
export async function uploadRecipeImage(file) {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, cannot upload recipe image.");
    return null;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `recipe_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("recipes")
    .upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading recipe image:", uploadError);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("recipes").getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Add a new ingredient
 */
export async function addIngredient(ingredient) {
  if (!isSupabaseConfigured) {
    // For demo, just return the object with a fake ID
    return { ...ingredient, id: crypto.randomUUID() };
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("ingredients")
    .select("id")
    .ilike("name", ingredient.name) // Use ilike for case-insensitive check
    .maybeSingle();

  if (existing) {
    return { error: "duplicate" };
  }

  const { data, error } = await supabase
    .from("ingredients")
    .insert([
      {
        name: ingredient.name,
        category: ingredient.category,
        benefit: ingredient.benefit,
        image_url: ingredient.image_url,
        by: ingredient.by || "C",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding ingredient:", error);
    return null;
  }
  return data;
}

/**
 * Fetch recipes by creator name
 */
export async function fetchRecipesByCreator(creatorName) {
  if (!isSupabaseConfigured) {
    return demoRecipes.filter((r) => r.by === creatorName);
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("by", creatorName)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes by creator:", error);
    return [];
  }

  return data || [];
}

/**
 * Add a recipe to user's collection
 */
export async function addToCollection(userName, recipeId) {
  if (!isSupabaseConfigured) {
    // Demo mode: no-op or mock if needed
    return;
  }

  const { error } = await supabase
    .from("user_collections")
    .upsert(
      { user_name: userName, recipe_id: recipeId },
      { onConflict: "user_name, recipe_id", ignoreDuplicates: true },
    );

  if (error) {
    console.error("Error adding to collection:", error);
  }
}

/**
 * Fetch user's collection (all recipes cooked/found)
 */
export async function fetchUserCollection(userName) {
  if (!isSupabaseConfigured) {
    return demoRecipes; // Return all demo recipes for simplicity in demo mode
  }

  // Fetch recipe_ids from user_collections
  const { data: collectionData, error: collectionError } = await supabase
    .from("user_collections")
    .select("recipe_id")
    .eq("user_name", userName);

  if (collectionError) {
    console.error("Error fetching user collection ids:", collectionError);
    return [];
  }

  if (!collectionData || collectionData.length === 0) {
    return [];
  }

  const recipeIds = collectionData.map((item) => item.recipe_id);

  // Fetch actual recipes
  const { data: recipesData, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .in("id", recipeIds)
    .order("created_at", { ascending: false });

  if (recipesError) {
    console.error("Error fetching collected recipes:", recipesError);
    return [];
  }

  return recipesData || [];
}

/**
 * Bulk upload ingredients and recipes (Preset)
 * @param {Array} ingredients - List of ingredient objects
 * @param {Array} recipes - List of recipe objects
 */
export async function uploadPresetData(ingredients = [], recipes = []) {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured.");
    return { createdIngredientsCount: 0, createdRecipesCount: 0 };
  }

  console.log(
    `Starting upload: ${ingredients.length} ingredients, ${recipes.length} recipes.`,
  );

  let createdIngredientsCount = 0;
  let createdRecipesCount = 0;
  const ingredientMap = new Map(); // Name -> ID

  // 1. Upload Ingredients & Build Map
  for (const ing of ingredients) {
    // Check existence by name
    const { data: existing } = await supabase
      .from("ingredients")
      .select("id")
      .eq("name", ing.name)
      .maybeSingle();

    if (existing) {
      ingredientMap.set(ing.name, existing.id);
    } else {
      const { data: newIng, error } = await supabase
        .from("ingredients")
        .insert({
          name: ing.name,
          category: ing.category,
          benefit: ing.benefit,
          image_url: ing.image_url,
          by: "System",
        })
        .select()
        .single();

      if (error) {
        console.error(`Failed to upload ingredient ${ing.name}:`, error);
      } else if (newIng) {
        createdIngredientsCount++;
        ingredientMap.set(ing.name, newIng.id);
      }
    }
  }

  // 2. Upload Recipes
  for (const rec of recipes) {
    // Check existence by name
    const { data: existing } = await supabase
      .from("recipes")
      .select("id")
      .eq("name", rec.name)
      .maybeSingle();

    if (!existing) {
      // Resolve Ingredient IDs
      const resolvedIngredients = rec.ingredients.map((ri) => {
        const realId = ingredientMap.get(ri.name);
        if (!realId) {
          console.warn(
            `Warning: Ingredient '${ri.name}' in recipe '${rec.name}' not found in database or upload list.`,
          );
        }
        return {
          ...ri,
          id: realId || ri.id, // Use real ID if found, otherwise keep existing (or undefined)
        };
      });

      // Calculate Hash if missing
      let finalHash = rec.ingredient_hash;
      if (!finalHash) {
        const ids = resolvedIngredients.map((i) => i.id).filter(Boolean);
        if (ids.length > 0) {
          finalHash = ids.sort().join("-");
          console.log(`Auto-generated hash for '${rec.name}': ${finalHash}`);
        } else {
          console.warn(
            `Could not generate hash for '${rec.name}': No valid ingredient IDs found.`,
          );
          finalHash = "error-no-hash";
        }
      }

      const { error } = await supabase.from("recipes").insert({
        name: rec.name,
        ingredients: resolvedIngredients, // Use Resolved Ingredients with IDs
        ingredient_hash: finalHash,
        by: "System",
      });

      if (error) {
        console.error(`Failed to upload recipe ${rec.name}:`, error);
      } else {
        createdRecipesCount++;
      }
    }
  }

  console.log(
    `Upload complete. Added ${createdIngredientsCount} ingredients and ${createdRecipesCount} recipes.`,
  );
  return { createdIngredientsCount, createdRecipesCount };
}

/**
 * Get current database data as a preset object
 */
export async function getPresetData() {
  if (!isSupabaseConfigured) return { ingredients: [], recipes: [] };

  const { data: ingredients } = await supabase.from("ingredients").select("*");
  const { data: recipes } = await supabase.from("recipes").select("*");

  return { ingredients: ingredients || [], recipes: recipes || [] };
}
