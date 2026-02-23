"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Product, ProductFormData } from "@/types";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiTruck,
  FiBox,
  FiSearch,
  FiTrendingUp,
  FiCalendar,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
} from "react-icons/fi";
import { GiWheat } from "react-icons/gi";
import { StatCard } from "@/components/ui/SharedUI";
import { CATEGORY_EMOJI, ORDER_STEPS } from "@/lib/constants";

const emptyProduct: ProductFormData = {
  name: "",
  description: "",
  category: "vegetables",
  pricePerUnit: 0,
  unit: "kg",
  imageUrl: "",
  localStock: 0,
  industrialStock: 0,
  isOrganic: false,
  harvestDate: "",
  expiryDate: "",
};

export default function FarmerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "add">(
    "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/products/farmer/my-products");
      setProducts(res.data.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders/farmer-orders");
      setOrders(res.data.data.orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "farmer")) {
      router.push("/login");
      return;
    }
    if (isAuthenticated && user?.role === "farmer") {
      Promise.all([fetchProducts(), fetchOrders()]).finally(() =>
        setLoading(false)
      );
    }
  }, [authLoading, isAuthenticated, user, router, fetchProducts, fetchOrders]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", formData);
        toast.success("Product created successfully");
      }
      setFormData(emptyProduct);
      setEditingId(null);
      setActiveTab("products");
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      imageUrl: product.imageUrl,
      localStock: product.localStock,
      industrialStock: product.industrialStock,
      isOrganic: product.isOrganic,
      harvestDate: product.harvestDate
        ? new Date(product.harvestDate).toISOString().split("T")[0]
        : "",
      expiryDate: product.expiryDate
        ? new Date(product.expiryDate).toISOString().split("T")[0]
        : "",
    });
    setEditingId(product._id);
    setActiveTab("add");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to update order status"
      );
    }
  };

  // Computed values
  const totalRevenue = useMemo(
    () => orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
    [orders]
  );
  const pendingCount = useMemo(
    () => orders.filter((o: any) => o.status === "pending").length,
    [orders]
  );
  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive).length,
    [products]
  );
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);
  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter((o: any) => o.status === orderFilter);
  }, [orders, orderFilter]);

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-gradient-to-r from-green-100 to-green-50 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white rounded-xl shadow-sm" />
              ))}
            </div>
            <div className="h-12 bg-white rounded-xl w-96" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-xl shadow-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FM";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 animate-fade-in-fast">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 animate-slide-right">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg border border-white/30">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Welcome back, {user?.name?.split(" ")[0]}!
                  </h1>
                  <span className="text-2xl">👋</span>
                </div>
                <p className="text-primary-100 mt-0.5 flex items-center gap-2">
                  <GiWheat className="text-primary-200" />
                  Farmer Dashboard — Manage your farm products & orders
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData(emptyProduct);
                setEditingId(null);
                setActiveTab("add");
              }}
              className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-primary-50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 animate-slide-left"
            >
              <FiPlus className="text-lg" /> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards — overlapping the hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-10 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<FiPackage />}
            label="Total Products"
            value={products.length.toString()}
            subtitle={`${activeProducts} active`}
            gradient="from-emerald-500 to-emerald-600"
            bgLight="bg-emerald-50"
          />
          <StatCard
            icon={<FiTrendingUp />}
            label="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            subtitle={`across ${orders.length} orders`}
            gradient="from-amber-500 to-orange-500"
            bgLight="bg-amber-50"
          />
          <StatCard
            icon={<FiTruck />}
            label="Active Orders"
            value={pendingCount.toString()}
            subtitle="need attention"
            gradient="from-blue-500 to-indigo-500"
            bgLight="bg-blue-50"
          />
          <StatCard
            icon={<FiBox />}
            label="Total Stock"
            value={products
              .reduce((s, p) => s + p.localStock + p.industrialStock, 0)
              .toLocaleString()}
            subtitle="units available"
            gradient="from-violet-500 to-purple-600"
            bgLight="bg-violet-50"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-6 inline-flex gap-1 animate-fade-in">
          {[
            { key: "products", label: "My Products", icon: <FiPackage className="text-base" />, count: products.length },
            { key: "orders", label: "Orders", icon: <FiTruck className="text-base" />, count: orders.length },
            { key: "add", label: editingId ? "Edit Product" : "Add Product", icon: editingId ? <FiEdit2 className="text-base" /> : <FiPlus className="text-base" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === "add" && !editingId) setFormData(emptyProduct);
                setActiveTab(tab.key as "products" | "orders" | "add");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════ PRODUCTS TAB ══════════════════════════════════════ */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Search bar */}
            {products.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-20 px-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
                  <GiWheat className="text-4xl text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No products listed yet
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  Start by adding your first agricultural product. Buyers are
                  waiting to discover fresh farm produce!
                </p>
                <button
                  onClick={() => {
                    setFormData(emptyProduct);
                    setEditingId(null);
                    setActiveTab("add");
                  }}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <FiPlus /> Add Your First Product
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16 px-6">
                <FiSearch className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No products match &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredProducts.map((product) => {
                  const totalStock = product.localStock + product.industrialStock;
                  const localPct = totalStock ? Math.round((product.localStock / totalStock) * 100) : 0;
                  const industrialPct = totalStock ? 100 - localPct : 0;

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 overflow-hidden group animate-slide-up"
                      style={{ animationDelay: `${filteredProducts.indexOf(product) * 60}ms` }}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Product image / placeholder */}
                        <div className="md:w-40 lg:w-48 h-40 md:h-auto bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0 relative overflow-hidden">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <span className="text-4xl mb-1">
                                {CATEGORY_EMOJI[product.category] || "📦"}
                              </span>
                              <span className="text-xs text-gray-400 capitalize">
                                {product.category}
                              </span>
                            </div>
                          )}
                          {!product.isActive && (
                            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                INACTIVE
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                  {product.name}
                                </h3>
                                {product.isOrganic && (
                                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    Organic
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl font-bold text-primary-600">
                                ₹{product.pricePerUnit}
                              </p>
                              <p className="text-xs text-gray-400">
                                per {product.unit}
                              </p>
                            </div>
                          </div>

                          {/* Stock bars */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                              <span>Stock Distribution</span>
                              <span className="font-medium text-gray-700">
                                {totalStock.toLocaleString()} {product.unit} total
                              </span>
                            </div>
                            <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
                              {totalStock > 0 ? (
                                <>
                                  <div
                                    className="bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                                    style={{ width: `${localPct}%` }}
                                    title={`Local: ${product.localStock}`}
                                  />
                                  <div
                                    className="bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                                    style={{ width: `${industrialPct}%` }}
                                    title={`Industrial: ${product.industrialStock}`}
                                  />
                                </>
                              ) : (
                                <div className="w-full bg-red-200 flex items-center justify-center">
                                  <span className="text-[9px] text-red-600 font-bold">OUT OF STOCK</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1.5 text-xs">
                              <span className="flex items-center gap-1 text-green-600">
                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                Local: {product.localStock}
                              </span>
                              <span className="flex items-center gap-1 text-blue-600">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                Industrial: {product.industrialStock}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => router.push(`/marketplace/${product._id}`)}
                              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                              <FiEye className="text-sm" /> View
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <FiEdit2 className="text-sm" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <FiTrash2 className="text-sm" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ ORDERS TAB ══════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Filter bar */}
            {orders.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        orderFilter === f
                          ? "bg-primary-600 text-white shadow-sm"
                          : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      {f === "all" ? "All Orders" : f}
                      {f === "all" && (
                        <span className="ml-1.5 opacity-75">{orders.length}</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-20 px-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                  <FiTruck className="text-4xl text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  When buyers purchase your products, orders will show up here
                  for you to manage.
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16 px-6">
                <FiAlertCircle className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No {orderFilter} orders found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => {
                  const statusIdx = ORDER_STEPS.indexOf(order.status);
                  const isCancelled = order.status === "cancelled";
                  const borderColor = isCancelled
                    ? "border-l-red-400"
                    : order.status === "delivered"
                    ? "border-l-green-400"
                    : order.status === "shipped"
                    ? "border-l-blue-400"
                    : "border-l-amber-400";

                  return (
                    <div
                      key={order._id}
                      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${borderColor} overflow-hidden hover:shadow-md transition-all duration-300 animate-slide-up`}
                      style={{ animationDelay: `${filteredOrders.indexOf(order) * 60}ms` }}
                    >
                      <div className="p-5">
                        {/* Order header */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-bold text-gray-800">
                                #{order._id.slice(-8).toUpperCase()}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  isCancelled
                                    ? "bg-red-100 text-red-700"
                                    : order.status === "delivered"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                } capitalize`}
                              >
                                {isCancelled && <FiX className="text-xs" />}
                                {order.status === "delivered" && <FiCheck className="text-xs" />}
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FiCalendar className="text-xs" />
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span>Buyer: <span className="text-gray-700 font-medium">{order.buyer?.name || "N/A"}</span></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{order.totalAmount?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {/* Progress steps */}
                        {!isCancelled && (
                          <div className="mb-4">
                            <div className="flex items-center gap-0">
                              {ORDER_STEPS.map((step, i) => {
                                const reached = i <= statusIdx;
                                const active = i === statusIdx;
                                return (
                                  <React.Fragment key={step}>
                                    <div className="flex flex-col items-center flex-shrink-0">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                                          reached
                                            ? "bg-primary-600 text-white shadow-sm shadow-primary-200"
                                            : "bg-gray-100 text-gray-400"
                                        } ${active ? "ring-4 ring-primary-100" : ""}`}
                                      >
                                        {reached ? <FiCheck /> : i + 1}
                                      </div>
                                      <span
                                        className={`text-[10px] mt-1 capitalize whitespace-nowrap ${
                                          reached ? "text-primary-600 font-semibold" : "text-gray-400"
                                        }`}
                                      >
                                        {step}
                                      </span>
                                    </div>
                                    {i < ORDER_STEPS.length - 1 && (
                                      <div
                                        className={`flex-1 h-0.5 mx-1 mt-[-14px] rounded-full transition-all ${
                                          i < statusIdx ? "bg-primary-500" : "bg-gray-100"
                                        }`}
                                      />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Items table */}
                        <div className="bg-gray-50 rounded-xl p-3 mb-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                                <th className="text-left pb-2 font-medium">Product</th>
                                <th className="text-right pb-2 font-medium">Qty</th>
                                <th className="text-right pb-2 font-medium">Price</th>
                                <th className="text-right pb-2 font-medium">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item: any, idx: number) => (
                                <tr key={idx} className="border-t border-gray-100/75">
                                  <td className="py-2 text-gray-700 font-medium">
                                    {item.productName}
                                  </td>
                                  <td className="py-2 text-right text-gray-500">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="py-2 text-right text-gray-500">
                                    ₹{item.pricePerUnit}
                                  </td>
                                  <td className="py-2 text-right font-semibold text-gray-700">
                                    ₹{item.subtotal?.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Actions */}
                        {order.status !== "delivered" && !isCancelled && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {order.status === "pending" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, "confirmed")}
                                className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-all"
                              >
                                <FiCheck /> Confirm Order
                              </button>
                            )}
                            {order.status === "confirmed" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, "processing")}
                                className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-all"
                              >
                                <FiRefreshCw /> Start Processing
                              </button>
                            )}
                            {order.status === "processing" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, "shipped")}
                                className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all"
                              >
                                <FiTruck /> Mark Shipped
                              </button>
                            )}
                            {order.status === "shipped" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, "delivered")}
                                className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm transition-all"
                              >
                                <FiCheck /> Mark Delivered
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, "cancelled")}
                              className="inline-flex items-center gap-1.5 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-all"
                            >
                              <FiX /> Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ ADD/EDIT PRODUCT TAB ══════════════════════════════════════ */}
        {activeTab === "add" && (
          <div className="max-w-3xl">
            {/* Form header banner */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${editingId ? "bg-blue-100 text-blue-600" : "bg-primary-100 text-primary-600"}`}>
                  {editingId ? <FiEdit2 /> : <FiPlus />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {editingId
                      ? "Update the details below and save your changes"
                      : "Fill in the product information to list it on the marketplace"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <FiPackage className="text-primary-500" /> Basic Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Product Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., Fresh Organic Tomatoes"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange as any}
                        className="input-field min-h-[100px]"
                        rows={4}
                        placeholder="Describe your product — quality, origin, freshness..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Category <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        {Object.entries(CATEGORY_EMOJI).map(([cat, emoji]) => (
                          <option key={cat} value={cat}>
                            {emoji} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Unit <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        <option value="kg">Kilogram (kg)</option>
                        <option value="quintal">Quintal</option>
                        <option value="ton">Ton</option>
                        <option value="dozen">Dozen</option>
                        <option value="piece">Piece</option>
                        <option value="liter">Liter</option>
                        <option value="bundle">Bundle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Price Per Unit (₹) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                        <input
                          name="pricePerUnit"
                          type="number"
                          value={formData.pricePerUnit}
                          onChange={handleChange}
                          className="input-field pl-8"
                          min={0}
                          step={0.01}
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <ImageUpload
                        label="Product Image"
                        value={formData.imageUrl}
                        onChange={(url) =>
                          setFormData((prev) => ({ ...prev, imageUrl: url }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Allocation */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <FiBox className="text-primary-500" /> Stock Allocation
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-5 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 flex items-start gap-2">
                    <FiAlertCircle className="text-amber-500 mt-0.5 flex-shrink-0" />
                    Allocate stock separately for local and industrial markets.
                    Buyers will only see the stock relevant to their market type.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-xs">
                        🏪
                      </div>
                      <label className="block text-sm font-bold text-green-800 mb-0.5">
                        Local Market Stock <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs text-green-600 mb-3">
                        For individual & local buyers
                      </p>
                      <input
                        name="localStock"
                        type="number"
                        value={formData.localStock}
                        onChange={handleChange}
                        className="input-field bg-white"
                        min={0}
                        required
                      />
                    </div>
                    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xs">
                        🏭
                      </div>
                      <label className="block text-sm font-bold text-blue-800 mb-0.5">
                        Industrial Market Stock <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs text-blue-600 mb-3">
                        For industrial & bulk buyers
                      </p>
                      <input
                        name="industrialStock"
                        type="number"
                        value={formData.industrialStock}
                        onChange={handleChange}
                        className="input-field bg-white"
                        min={0}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <FiCalendar className="text-primary-500" /> Additional
                    Details
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Harvest Date
                      </label>
                      <input
                        name="harvestDate"
                        type="date"
                        value={formData.harvestDate}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <label className="relative flex items-center gap-3 cursor-pointer group bg-green-50/50 border border-green-100 rounded-xl px-4 py-3 hover:bg-green-50 transition-colors">
                    <input
                      name="isOrganic"
                      type="checkbox"
                      checked={formData.isOrganic}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                      id="isOrganic"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800">
                        Organic Product
                      </span>
                      <p className="text-xs text-gray-500">
                        Mark if this product is organically grown without
                        chemical fertilizers or pesticides
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw className="animate-spin" /> Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <FiCheck /> Update Product
                    </>
                  ) : (
                    <>
                      <FiPlus /> Create Product
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(emptyProduct);
                      setEditingId(null);
                    }}
                    className="inline-flex items-center gap-2 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    <FiX /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


