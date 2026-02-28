"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiArrowLeft,
} from "react-icons/fi";
import { GiWheat } from "react-icons/gi";
import { useGsapCartItems, useGsapScaleIn } from "@/hooks/useAnimations";

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, totalAmount } =
    useCart();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    phone: user?.phone || "",
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const cartRef = useGsapCartItems();
  const emptyRef = useGsapScaleIn();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to place an order");
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        notes,
      };

      await api.post("/orders", orderData);
      toast.success("Order placed successfully!");
      clearCart();
      router.push("/dashboard/buyer");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !showCheckout) {
    return (
      <div ref={emptyRef} className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-500 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-6">
          Browse our marketplace to find fresh agricultural products
        </p>
        <Link href="/marketplace" className="btn-primary inline-block">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div ref={cartRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6"
      >
        <FiArrowLeft /> Continue Shopping
      </Link>

      <h1 className="page-header-title text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => {
            const maxStock =
              user?.role === "industrial"
                ? item.product.industrialStock
                : item.product.localStock;

            return (
              <div key={item.product._id} className="gsap-cart-item card p-5">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <GiWheat className="text-3xl text-primary-300" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          by {item.product.farmer?.name} •{" "}
                          {item.product.category}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1
                            )
                          }
                          className="px-2 py-1 hover:bg-gray-50"
                        >
                          <FiMinus className="text-sm" />
                        </button>
                        <span className="px-3 py-1 border-x border-gray-300 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              Math.min(item.quantity + 1, maxStock)
                            )
                          }
                          className="px-2 py-1 hover:bg-gray-50"
                        >
                          <FiPlus className="text-sm" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-primary-600">
                          ₹
                          {(
                            item.product.pricePerUnit * item.quantity
                          ).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{item.product.pricePerUnit}/{item.product.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={clearCart}
            className="text-red-600 text-sm font-medium hover:text-red-700"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="gsap-cart-summary card p-6 sticky top-24">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Order Summary
            </h3>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900">
                    ₹{(item.product.pricePerUnit * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="btn-primary w-full py-3"
              >
                Proceed to Checkout
              </button>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <h4 className="font-semibold text-gray-800">
                  Shipping Address
                </h4>
                <input
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      street: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Street address *"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="City *"
                    required
                  />
                  <input
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        state: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="State *"
                    required
                  />
                </div>
                <input
                  value={shippingAddress.pincode}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      pincode: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Pincode *"
                  required
                />
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      phone: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Phone number *"
                  required
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  placeholder="Order notes (optional)"
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="btn-outline w-full py-2 text-sm"
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
