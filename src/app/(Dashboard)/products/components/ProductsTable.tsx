"use client";

import { useMemo, useState } from "react";
import {
  DeleteIcon,
  FilterIcon,
  SearchIcon,
  ExportIcon,
  EditIcon,
  PlusIcon,
} from "../../../../../public/svg/svg";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import AddCategoryModal from "./AddCategoryModal";
import { formatNaira, parseAmount } from "@/src/lib/format";
import { MOCK_PRODUCTS, type Product } from "@/src/lib/mock-data";

type ProductFormData = {
  name: string;
  category: string;
  amount: string;
  unit: string;
  description: string;
  inStock: boolean;
  image: File | null;
  imagePreview: string | null;
};

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleAddProduct = (productData: ProductFormData) => {
    const price = parseAmount(productData.amount);
    const next: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name,
      unit: productData.unit,
      category: productData.category || "Uncategorized",
      amount: formatNaira(price),
      currentPrice: price,
      dateAdded: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      image: productData.imagePreview || "",
      description: productData.description || "",
      inStock: productData.inStock,
    };
    setProducts((prev) => [next, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleEditProduct = (productData: ProductFormData) => {
    if (!selectedProduct) return;
    const price = parseAmount(productData.amount);
    setProducts((prev) =>
      prev.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              name: productData.name,
              unit: productData.unit,
              category: productData.category || "Uncategorized",
              amount: formatNaira(price),
              currentPrice: price,
              image: productData.imagePreview || product.image,
              description: productData.description || "",
              inStock: productData.inStock,
            }
          : product,
      ),
    );
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productToDelete: Product) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${productToDelete.name}"?`,
      )
    ) {
      return;
    }
    setProducts((prev) =>
      prev.filter((product) => product.id !== productToDelete.id),
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your products
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <PlusIcon size={16} />
            Add category
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg px-3 sm:px-4 py-2.5"
          >
            <PlusIcon size={16} />
            Add product
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 min-w-0 items-center gap-2 sm:gap-3"
        >
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-700 placeholder-gray-700"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2"
          >
            <FilterIcon size={14} />
            Search
          </button>
        </form>

        <button className="self-start flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2">
          <ExportIcon size={14} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="py-3 px-6 font-medium">Product</th>
              <th className="py-3 px-6 font-medium">Category</th>
              <th className="py-3 px-6 font-medium">Amount</th>
              <th className="py-3 px-6 font-medium">Date added</th>
              <th className="py-3 px-6 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  No products yet. Add your first product.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#E6EDE8] relative flex items-center justify-center text-xs font-semibold text-[#2D266C]">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          product.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-gray-600">
                    {product.category}
                  </td>
                  <td className="py-3 px-6 text-gray-600">{product.amount}</td>
                  <td className="py-3 px-6 text-gray-600">
                    {product.dateAdded}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3 text-gray-400">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsEditModalOpen(true);
                        }}
                        className="hover:text-gray-600 transition-colors"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <DeleteIcon size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleEditProduct}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
