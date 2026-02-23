"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { FiShoppingBag, FiClock, FiCheckCircle, FiTruck, FiDownload } from "react-icons/fi";
import { StatCard } from "@/components/ui/SharedUI";

export default function BuyerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadReceipt = async (orderId: string) => {
    setDownloadingId(orderId);
    try {
      const res = await api.get(`/orders/${orderId}/receipt`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `AgriConnect_Receipt_${orderId.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders/my-orders");
      setOrders(res.data.data.orders);
    } catch (error: unknown) {
      console.error("Failed to fetch orders:", error);
    }
  }, []);

  useEffect(() => {
    if (
      !authLoading &&
      (!isAuthenticated ||
        (user?.role !== "individual" && user?.role !== "industrial"))
    ) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      fetchOrders().finally(() => setLoading(false));
    }
  }, [authLoading, isAuthenticated, user, router, fetchOrders]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 w-48 rounded" />
          <div className="bg-gray-200 h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSpent = orders.reduce(
    (sum: number, o: any) => sum + (o.totalAmount || 0),
    0
  );

  const statusColor: Record<string, string> = {
    pending: "badge-yellow",
    confirmed: "badge-blue",
    processing: "badge-blue",
    shipped: "badge-blue",
    delivered: "badge-green",
    cancelled: "badge-red",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-slide-down">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === "industrial" ? "Industrial" : "Buyer"} Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name}! Here&apos;s your order history.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiShoppingBag />}
          label="Total Orders"
          value={orders.length.toString()}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={<FiClock />}
          label="Pending"
          value={pendingOrders.toString()}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          icon={<FiCheckCircle />}
          label="Delivered"
          value={deliveredOrders.toString()}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={<FiTruck />}
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString()}`}
          color="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="text-center py-16 card animate-fade-in">
          <FiShoppingBag className="text-5xl text-gray-300 mx-auto mb-4 animate-bounce-gentle" />
          <h3 className="text-xl font-semibold text-gray-500">
            No orders yet
          </h3>
          <p className="text-gray-400 mt-2 mb-4">
            Start shopping from the marketplace
          </p>
          <button
            onClick={() => router.push("/marketplace")}
            className="btn-primary"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any, idx: number) => (
            <div key={order._id} className="card p-5 animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-500 font-mono">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`badge ${
                      statusColor[order.status] || "badge-blue"
                    } capitalize`}
                  >
                    {order.status}
                  </span>
                  <span className="font-bold text-lg text-primary-600">
                    ₹{order.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-3">
                {order.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm py-1"
                  >
                    <span className="text-gray-700">{item.productName}</span>
                    <span className="text-gray-500">
                      {item.quantity} {item.unit} × ₹{item.pricePerUnit} = ₹
                      {item.subtotal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping */}
              {order.shippingAddress && (
                <div className="border-t mt-3 pt-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Ship to:</span>{" "}
                  {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pinCode}
                </div>
              )}

              {/* Receipt download for delivered orders */}
              {order.status === "delivered" && (
                <div className="border-t mt-3 pt-3">
                  <button
                    onClick={() => downloadReceipt(order._id)}
                    disabled={downloadingId === order._id}
                    className="inline-flex items-center gap-2 bg-green-50 hover:bg-green-100 disabled:opacity-60 text-green-700 font-semibold text-sm px-4 py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FiDownload className="text-base" />
                    {downloadingId === order._id ? "Downloading..." : "Download Receipt (PDF)"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


