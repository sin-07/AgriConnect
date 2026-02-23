"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  FiShoppingCart,
  FiMapPin,
  FiPhone,
  FiArrowLeft,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { GiWheat } from "react-icons/gi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-xl h-96" />
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 rounded w-3/4" />
            <div className="bg-gray-200 h-4 rounded w-1/2" />
            <div className="bg-gray-200 h-24 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-500">Product not found</h2>
        <Link href="/marketplace" className="btn-primary mt-4 inline-block">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isBuyer = user?.role === "individual" || user?.role === "industrial";
  const availableStock =
    user?.role === "industrial" ? product.industrialStock : product.localStock;
  const stockLabel = user?.role === "industrial" ? "Industrial" : "Local";

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }
    if (!isBuyer) {
      toast.error("Only buyers can purchase products");
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} ${product.unit} available`);
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} ${product.unit} of ${product.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6"
      >
        <FiArrowLeft /> Back to Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center h-96 animate-scale-in overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <GiWheat className="text-8xl text-primary-300" />
          )}
        </div>

        {/* Details */}
        <div className="animate-slide-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-blue capitalize">{product.category}</span>
            {product.isOrganic && <span className="badge-green">Organic</span>}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-bold text-primary-600">
              ₹{product.pricePerUnit}
            </span>
            <span className="text-lg text-gray-500">per {product.unit}</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Stock info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 animate-fade-in delay-200">
            <h3 className="font-semibold text-gray-800 mb-2">Stock Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Local Market</span>
                <p className="text-lg font-semibold text-green-600">
                  {product.localStock} {product.unit}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Industrial Market</span>
                <p className="text-lg font-semibold text-blue-600">
                  {product.industrialStock} {product.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Farmer info */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 animate-fade-in delay-300">
            <h3 className="font-semibold text-green-800 mb-2">Farmer Details</h3>
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2 text-green-700">
                <FiMapPin /> {product.farmer?.name}
                {product.farmer?.address?.city &&
                  `, ${product.farmer.address.city}`}
                {product.farmer?.address?.state &&
                  `, ${product.farmer.address.state}`}
              </p>
              {product.farmer?.phone && (
                <p className="flex items-center gap-2 text-green-700">
                  <FiPhone /> {product.farmer.phone}
                </p>
              )}
            </div>
          </div>

          {/* Add to cart */}
          {isBuyer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <FiMinus />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center border-x border-gray-300 py-2 outline-none"
                    min={1}
                    max={availableStock}
                  />
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(availableStock, q + 1))
                    }
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <FiPlus />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {stockLabel} stock: {availableStock} {product.unit}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock <= 0}
                  className="btn-primary flex items-center gap-2 py-3 px-8 hover:scale-[1.03] active:scale-[0.97] transition-transform"
                >
                  <FiShoppingCart />
                  Add to Cart — ₹{(product.pricePerUnit * quantity).toFixed(2)}
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Please{" "}
                <Link
                  href="/login"
                  className="font-semibold text-yellow-900 underline"
                >
                  log in
                </Link>{" "}
                to purchase this product.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
