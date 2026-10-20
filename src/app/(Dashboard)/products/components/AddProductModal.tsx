// src/app/products/components/AddProductModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { CloseIcon, UploadIcon, PlusIcon } from "../../../../../public/svg/svg";
import Image from "next/image";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct?: (productData: ProductFormData) => void | Promise<void>;
}

interface ProductFormData {
  name: string;
  category: string;
  amount: string;
  unit: string;
  description: string;
  inStock: boolean;
  image: File | null;
  imagePreview: string | null;
}

const categories = [
  "Oil and sauces",
  "Beverages",
  "Grains",
  "Canned goods",
  "Dairy",
];

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
}: AddProductModalProps) {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    amount: "",
    unit: "",
    description: "",
    inStock: true,
    image: null,
    imagePreview: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
      setFormData({
        name: "",
        category: "",
        amount: "",
        unit: "",
        description: "",
        inStock: true,
        image: null,
        imagePreview: null,
      });
      setShowNewCategory(false);
      setNewCategory("");
    }, 200);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
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

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setFormData((prev) => ({ ...prev, category: newCategory.trim() }));
      setShowNewCategory(false);
      setNewCategory("");
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddProduct) {
      handleClose();
      return;
    }
    setSaving(true);
    try {
      await onAddProduct(formData);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add product</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <CloseIcon size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Image Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Product image
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                      <Image
                        src={formData.imagePreview}
                        alt="Product preview"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          image: null,
                          imagePreview: null,
                        }))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <CloseIcon size={14} />
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <UploadIcon size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="text-green-600 font-medium">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      SVG, PNG, JPG or GIF (max. 800x400px)
                    </p>
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

            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 block mb-1.5"
              >
                Product name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700 block mb-1.5"
              >
                Category
              </label>
              <div className="flex gap-2">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-900 bg-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {showNewCategory && (
                    <option value={newCategory} className="text-green-600">
                      + {newCategory}
                    </option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="flex items-center gap-1 px-3 py-2.5 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
                >
                  <PlusIcon size={14} />
                  Add new
                </button>
              </div>
              {showNewCategory && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Price & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="amount"
                  className="text-sm font-medium text-gray-700 block mb-1.5"
                >
                  Price
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="₦0.00"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="unit"
                  className="text-sm font-medium text-gray-700 block mb-1.5"
                >
                  Measuring unit
                </label>
                <input
                  id="unit"
                  name="unit"
                  type="text"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="E.g per cup"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 block mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-900 placeholder-gray-400 resize-none"
              />
            </div>

            {/* In Stock Toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
              <span className="text-sm text-gray-700">
                Available (in stock?)
              </span>
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
                disabled={saving}
                className="px-6 py-2.5 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
              >
                {saving ? "Uploading..." : "Add product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
