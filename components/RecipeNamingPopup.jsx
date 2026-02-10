"use client";

import { useState, useRef } from "react";

export default function RecipeNamingPopup({ ingredients, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [addDetails, setAddDetails] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        description: addDetails ? description.trim() || null : null,
        imageFile: addDetails ? imageFile : null,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-1000 backdrop-blur-sm">
      <div className={`bg-[url("/texture/paper.jpg")] border-4 border-[#b6562c]/50
                       p-10! max-w-lg w-[90%] max-h-[80vh] overflow-y-auto
                      shadow-[0_0_60px_rgba(139,105,20,0.4)] animate-in zoom-in-95 duration-300 `}>
        
        {/* Header */}
        <div className="text-center mb-4! flex flex-col gap-2">
          <div className="text-5xl animate-bounce mb-4">🎉</div>
          <h2 className="text-[#b6562c] text-3xl font-semibold">
            ค้นพบสูตรใหม่
          </h2>
          <p className="text-[#b6562c]">
            คุณคือคนแรกที่ค้นพบสูตรอาหารนี้
          </p>
        </div>

        {/* Ingredients used */}
        <div className="bg-[#b6562c]/10 border-2 border-[#b6562c]/50 p-4! mb-6!">
          <p className="text-[#b6562c] text-sm mb-3!">วัตถุดิบที่ใช้:</p>
          <div className="flex flex-wrap gap-2 overflow-auto pr-1! max-h-28 md:max-h-36">
            {ingredients.map((ing) => (
              <span key={ing.id} className="bg- border border-amber-900/50 flex gap-2 items-center justify-center
                                             py-1.5! px-3! text-[#b6562c] text-sm">
                <img src={ing.image_url} className="h-4" /> {ing.name}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-[#b6562c]">สร้างชื่อเมนู:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น ผัดกะเพราหมูสับไข่ดาว..."
            className="bg-white/40 border-2 border-[#b6562c]/50 py-4! px-5! text-lg 
                       text-[#b6562c] transition-all duration-300
                       placeholder:text-amber-700/50 selection:text-white!
                       focus:outline-none focus:border-[#b6562c]/80 focus:shadow-[0_0_20px_rgba(139,105,20,0.3)]"
            autoFocus
            maxLength={50}
          />

          {/* Add More Details Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addDetails}
              onChange={(e) => setAddDetails(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className="w-5 h-5 border-2 border-[#b6562c]/50 bg-white/40
                          flex items-center justify-center transition-all duration-200
                          peer-checked:bg-[#b6562c] peer-checked:border-[#b6562c]"
            >
              {addDetails && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-[#b6562c] text-sm">เพิ่มรายละเอียดเพิ่มเติม (รูปภาพ & คำอธิบาย)</span>
          </label>

          {/* Extra Details Section */}
          {addDetails && (
            <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200
                            bg-[#b6562c]/5 border-2 border-[#b6562c]/20 p-4!">
              
              {/* Image Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-[#b6562c] text-sm font-medium">📷 รูปภาพอาหาร:</label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover border-2 border-[#b6562c]/30"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7
                                 flex items-center justify-center text-sm cursor-pointer
                                 hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/40 border-2 border-dashed border-[#b6562c]/40
                               py-6! px-4! text-[#b6562c]/60 text-sm cursor-pointer
                               hover:border-[#b6562c]/70 hover:bg-white/60 transition-all"
                  >
                    📁 คลิกเพื่อเลือกรูปภาพ
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[#b6562c] text-sm font-medium">📝 คำอธิบายอาหาร:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="บอกเล่าเกี่ยวกับเมนูนี้..."
                  maxLength={1000}
                  rows={3}
                  className="bg-white/40 border-2 border-[#b6562c]/50 py-3! px-4! text-sm 
                             text-[#b6562c] transition-all duration-300 resize-none
                             placeholder:text-amber-700/50
                             focus:outline-none focus:border-[#b6562c]/80 focus:shadow-[0_0_20px_rgba(139,105,20,0.3)]"
                />
                <span className="text-[#b6562c]/50 text-xs text-right">{description.length}/1000</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-2!">
            <button
              type="button"
              className="bg-transparent border-2 w-full border-amber-900/50 py-3! px-6!
                         text-amber-700 transition-all duration-300
                         hover:border-amber-700 cursor-pointer"
              onClick={onCancel}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-[#b6562c] py-3! px-6! w-full
                         text-white font-semibold transition-all duration-300
                         hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,105,20,0.4)]
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={!name.trim()}
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
