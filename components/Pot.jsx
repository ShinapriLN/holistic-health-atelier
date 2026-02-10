"use client";

import Image from "next/image";

export default function Pot({
  potIngredients,
  onRemove,
  onComplete,
  isLoading,
}) {
  return (
    <div className="flex items-end gap-6">
      {/* Pot */}
      <div className="relative">
        <Image
          src="/pot.png"
          alt="Magical Cooking Pot"
          width={500}
          height={500}
          className="drop-shadow-2xl"
          priority
        />
      </div>

      {/* Info panel on the RIGHT side */}
      <div 
        className="flex flex-col gap-3 p-5 rounded-xl self-center"
        style={{ 
          background: 'rgba(139, 90, 43, 0.9)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          minWidth: '200px',
          maxWidth: '250px',
        }}
      >
        <h3 className="font-bold text-center" style={{ color: '#FFF8E7' }}>
          🍲 In the Pot
        </h3>
        
        {potIngredients.length === 0 ? (
          <p className="text-sm text-center" style={{ color: '#FFE4B5' }}>
            Click ingredients to add!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {potIngredients.map((ing) => (
              <button
                key={ing.id}
                onClick={() => onRemove(ing.id)}
                className="text-xs px-2 py-1 rounded-full hover:opacity-70 transition-all"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF8E7' }}
                title="Click to remove"
              >
                {ing.emoji} {ing.name} ✕
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onComplete}
          disabled={potIngredients.length === 0 || isLoading}
          className="mt-2 px-6 py-3 rounded-full font-semibold text-white transition-all"
          style={{
            background: potIngredients.length === 0 
              ? 'rgba(100,100,100,0.5)' 
              : 'linear-gradient(135deg, #B8860B, #8B4513)',
            cursor: potIngredients.length === 0 ? 'not-allowed' : 'pointer',
            opacity: potIngredients.length === 0 ? 0.5 : 1,
          }}
        >
          {isLoading ? "Cooking..." : "✨ Complete Recipe"}
        </button>
      </div>
    </div>
  );
}
