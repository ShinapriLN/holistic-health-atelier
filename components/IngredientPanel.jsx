"use client";

import Image from "next/image";

export default function IngredientPanel({
  ingredients,
  potIngredients,
  onAddToPot,
}) {
  const isInPot = (ingredientId) => {
    return potIngredients.some((i) => i.id === ingredientId);
  };

  // Group ingredients by category
  const groupedIngredients = ingredients.reduce((acc, ing) => {
    if (!acc[ing.category]) {
      acc[ing.category] = [];
    }
    acc[ing.category].push(ing);
    return acc;
  }, {});

  const categoryNames = {
    vegetable: "Vegetables",
    fruit: "Fruits",
    protein: "Protein",
    herb: "Herbs",
    grain: "Grains",
    dairy: "Dairy",
    other: "Other",
  };

  return (
    <div 
      className="rounded-2xl overflow-hidden max-h-[70vh] overflow-y-auto"
      style={{
        background: 'rgba(139, 90, 43, 0.85)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        margin: '16px',
        padding: '16px',
      }}
    >
      <h2 
        className="text-center font-bold text-lg mb-4"
        style={{ color: '#FFF8E7' }}
      >
        ✨ Ingredients
      </h2>
      
      <div className="space-y-4">
        {Object.entries(groupedIngredients).map(([category, items]) => (
          <div key={category}>
            <h3 
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: '#FFE4B5' }}
            >
              {categoryNames[category] || category}
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {items.map((ingredient) => {
                const inPot = isInPot(ingredient.id);
                return (
                  <button
                    key={ingredient.id}
                    disabled={inPot}
                    onClick={(e) => onAddToPot(ingredient, e)}
                    className="rounded-xl p-3 transition-all duration-200 flex flex-col items-center gap-2"
                    style={{
                      background: inPot ? 'rgba(0,100,0,0.3)' : 'rgba(255,255,255,0.15)',
                      opacity: inPot ? 0.5 : 1,
                      cursor: inPot ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!inPot) e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      if (!inPot) e.currentTarget.style.background = inPot ? 'rgba(0,100,0,0.3)' : 'rgba(255,255,255,0.15)';
                    }}
                    title={ingredient.benefit}
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
                      {ingredient.image_url ? (
                        <Image
                          src={ingredient.image_url}
                          alt={ingredient.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-2xl">
                          {ingredient.emoji || "🍴"}
                        </span>
                      )}
                    </div>
                    <span 
                      className="text-xs text-center leading-tight"
                      style={{ color: '#FFF8E7' }}
                    >
                      {ingredient.name}
                    </span>
                    {inPot && (
                      <span className="absolute text-green-400 text-xs">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
