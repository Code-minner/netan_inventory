// src/app/products/components/AddCategoryModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { CloseIcon, UploadIcon } from "../../../../../public/svg/svg";
import Image from "next/image";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory?: (categoryData: CategoryFormData) => void;
  editingCategory?: CategoryFormData | null;
}

interface CategoryFormData {
  name: string;
  image: File | null;
  imagePreview: string | null;
}

export default function AddCategoryModal({ 
  isOpen, 
  onClose, 
  onAddCategory,
  editingCategory 
}: AddCategoryModalProps) {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    image: null,
    imagePreview: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        image: editingCategory.image,
        imagePreview: editingCategory.imagePreview,
      });
    } else {
      setFormData({
        name: "",
        image: null,
        imagePreview: null,
      });
    }
  }, [editingCategory]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
      setFormData({
        name: "",
        image: null,
        imagePreview: null,
      });
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddCategory) {
      onAddCategory(formData);
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md bg-white shadow-2xl rounded-2xl flex flex-col transition-all duration-200 ease-out ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingCategory ? "Edit category" : "Add new category"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <CloseIcon size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Thumbnail */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Category thumbnail
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  isDragging
                    ? "border-green-500 bg-green-50"
                    : formData.imagePreview
                    ? "border-green-500 bg-green-50/30"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {formData.imagePreview ? (
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden relative">
                      <img
                        src={formData.imagePreview}
                        alt="Category thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: null, imagePreview: null }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <CloseIcon size={14} />
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <UploadIcon size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="text-green-600 font-medium">Upload image</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Category Name */}
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1.5">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g grains"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
              >
                {editingCategory ? "Save" : "Add category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}