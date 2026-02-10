"use client";

import { IoIosClose } from "react-icons/io";
import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import { uploadImage } from "@/lib/supabase";

export default function AddIngredientPopup({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "เนื้อ",
    benefit: "",
    image_url: "",
  });

  const [imageMode, setImageMode] = useState("url"); // 'url' or 'upload'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFormData({ ...formData, image_url: "" }); // Clear URL input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
        let finalImageUrl = formData.image_url;

        if (imageMode === 'upload' && selectedFile) {
            const uploadedUrl = await uploadImage(selectedFile);
            if (uploadedUrl) {
                finalImageUrl = uploadedUrl;
            } else {
                alert("Upload failed. Please try again.");
                setUploading(false);
                return;
            }
        } else if (imageMode === 'url' && !finalImageUrl) {
             alert("Please enter an image URL.");
             setUploading(false);
             return;
        }


        if (onAdd) {
            const success = await onAdd({
                ...formData,
                image_url: finalImageUrl,
            });
            if (success === false) {
                setUploading(false);
                return;
            }
        }
        onClose();
    } catch (error) {
        console.error("Error submitting ingredient:", error);
        alert("Something went wrong.");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-1000 
                    backdrop-blur-sm p-5!"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`bg-[url("/texture/paper.jpg")] border-4 border-[#b6562c]/50
                      p-8! max-w-lg w-full max-h-[85vh] h-auto flex flex-col gap-4 overflow-y-auto
                      shadow-[0_0_60px_rgba(139,105,20,0.4)] animate-in slide-in-from-bottom-4 duration-75`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[#b6562c] font-bold text-2xl">เพิ่มวัตถุดิบ</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#b6562c] font-bold">ชื่อวัตถุดิบ</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="p-2! border-2 selection:text-white! border-[#b6562c]/50 bg-[#b6562c]/10 text-[#b6562c] duration-75 outline-none focus:border-[#b6562c]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#b6562c] font-bold">หมวดหมู่</label>
            <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="p-2! border-2 border-[#b6562c]/50 bg-[#b6562c]/10 text-[#b6562c] outline-none focus:border-[#b6562c]"
            >
                {CATEGORIES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#b6562c] font-bold">สรรพคุณ</label>
            <textarea
              required
              value={formData.benefit}
              onChange={(e) =>
                setFormData({ ...formData, benefit: e.target.value })
              }
              className="p-2! border-2 border-[#b6562c]/50 bg-[#b6562c]/10 text-[#b6562c] outline-none focus:border-[#b6562c] min-h-20 selection:text-white!"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#b6562c] font-bold">รูปภาพ</label>
            
            <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer text-[#b6562c]">
                    <input 
                        type="radio" 
                        name="imageMode" 
                        value="url" 
                        checked={imageMode === 'url'} 
                        onChange={() => setImageMode('url')}
                    />
                    กรอก URL
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#b6562c]">
                    <input 
                        type="radio" 
                        name="imageMode" 
                        value="upload" 
                        checked={imageMode === 'upload'} 
                        onChange={() => setImageMode('upload')}
                    />
                    อัพโหลดรูปภาพ
                </label>
            </div>

            {imageMode === 'url' ? (
                <>
                <input
                type="text"
                value={formData.image_url}
                placeholder="https://..."
                onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setPreviewUrl(e.target.value);
                }}
                className="p-2!  border-[#b6562c]/50 selection:text-white! bg-[#b6562c]/10 text-[#b6562c] outline-none focus:border-[#b6562c]"
                />
                <p className="text-xs text-[#b6562c]/70">
                * ใส่ URL ของรูปภาพ
                </p>
                </>
            ) : (
                <div className="flex flex-col gap-2">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="p-2! text-[#b6562c] border-2 border-[#b6562c]/50 bg-[#b6562c]/10 "
                    />
                </div>
            )}

            {/* Preview */}
            {(previewUrl && (imageMode === 'upload' ? selectedFile : formData.image_url)) && (
                <div className="mt-2! flex justify-center border-2 border-dashed border-[#b6562c]/30 p-2 rounded-lg relative h-32 w-full">
                    <Image 
                      src={previewUrl} 
                      alt="Preview" 
                      fill
                      className="object-contain" 
                      unoptimized={previewUrl.startsWith('blob:')}
                    />
                </div>
            )}

          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={uploading}
            className={`mt-2! bg-[#b6562c] text-[#f4e4bc] py-3! font-bold text-lg shadow-lg hover:bg-[#a04b25] transition-colors
                ${uploading ? "opacity-70 cursor-wait" : ""}
            `}
          >
            {uploading ? "กำลังบันทึก..." : "บันทึก"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
