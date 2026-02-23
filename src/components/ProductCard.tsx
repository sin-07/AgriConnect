"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiMapPin, FiPackage } from "react-icons/fi";
import { GiWheat } from "react-icons/gi";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

interface Props { product: Product; listMode?: boolean; }

const ProductCard: React.FC<Props> = ({ product, listMode = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const isBuyer = user?.role === "individual" || user?.role === "industrial";
  const availableStock = user?.role === "industrial" ? product.industrialStock : product.localStock;
  const meta = CATEGORY_COLORS[product.category] ?? DEFAULT_CATEGORY_COLOR;
  const inStock = product.localStock > 0 || product.industrialStock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please log in to add items to cart"); return; }
    if (!isBuyer)          { toast.error("Only buyers can purchase products");  return; }
    if (availableStock <= 0) { toast.error("Out of stock for your market type"); return; }
    addToCart(product, 1);
    toast.success(product.name + " added to cart");
  };

  if (listMode) {
    return (
      <Link href={"/marketplace/" + product._id}>
        <div className="group flex bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer animate-fade-in">
          <div className={"relative w-44 flex-shrink-0 " + meta.bg}>
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[8rem]">
                <GiWheat className="text-4xl text-gray-200" />
              </div>
            )}
            {product.isOrganic && (
              <span className="absolute top-2 left-2 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full shadow-sm">Organic</span>
            )}
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={"w-2 h-2 rounded-full flex-shrink-0 " + meta.dot} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
                {!inStock && <span className="ml-auto text-[10px] font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded-full">Out of stock</span>}
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                <FiMapPin className="flex-shrink-0 text-gray-300" />
                <span className="truncate">{product.farmer?.name}{product.farmer?.address?.city ? ", " + product.farmer.address.city : ""}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 gap-3">
              <div>
                <span className="text-2xl font-black text-primary-600">Rs.{product.pricePerUnit}</span>
                <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5">
                  <StockBadge qty={product.localStock} label="Local" unit={product.unit} />
                  <StockBadge qty={product.industrialStock} label="Bulk" unit={product.unit} />
                </div>
                {isBuyer && (
                  <button onClick={handleAddToCart} className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md">
                    <FiShoppingCart className="text-sm" /> Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={"/marketplace/" + product._id}>
      <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-pointer animate-fade-in">

        {/* Image */}
        <div className={"relative h-52 overflow-hidden " + meta.bg}>
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GiWheat className="text-6xl text-gray-200" />
            </div>
          )}

          {/* Top badges row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm capitalize">
              <span className={"w-1.5 h-1.5 rounded-full " + meta.dot} />
              {product.category}
            </span>
            <div className="flex flex-col items-end gap-1">
              {product.isOrganic && (
                <span className="text-[10px] font-bold bg-green-500 text-white px-2.5 py-1 rounded-full shadow-sm">Organic</span>
              )}
              {!inStock && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-2.5 py-1 rounded-full shadow-sm">Sold out</span>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white text-primary-700 text-sm font-bold px-5 py-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              View Product
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-primary-600 transition-colors mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <FiMapPin className="flex-shrink-0 text-gray-300" />
            <span className="truncate">{product.farmer?.name}{product.farmer?.address?.city ? ", " + product.farmer.address.city : ""}</span>
          </div>

          {/* Stock row */}
          <div className="flex items-center gap-1.5 mb-4">
            <FiPackage className="text-gray-300 text-xs flex-shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <StockBadge qty={product.localStock} label="Local" unit={product.unit} />
              <StockBadge qty={product.industrialStock} label="Bulk" unit={product.unit} />
            </div>
          </div>

          {/* Price + cart */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-50">
            <div>
              <span className="text-2xl font-black text-primary-600 leading-none">Rs.{product.pricePerUnit}</span>
              <span className="text-xs text-gray-400 ml-1 font-medium">/{product.unit}</span>
            </div>
            {isBuyer && (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-primary-200 hover:shadow-md"
              >
                <FiShoppingCart className="text-sm" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

function StockBadge({ qty, label, unit }: { qty: number; label: string; unit: string }) {
  if (qty <= 0) {
    return <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">{label}: —</span>;
  }
  return (
    <span className={"inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full " + (label === "Local" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}>
      {label}: {qty} {unit}
    </span>
  );
}

export default ProductCard;
