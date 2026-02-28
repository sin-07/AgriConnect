"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";
import { FiUser, FiShoppingBag, FiTruck } from "react-icons/fi";
import { useGsapFormReveal } from "@/hooks/useAnimations";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as UserRole) || "individual";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    businessName: "",
    gstNumber: "",
    farmSize: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const formRef = useGsapFormReveal();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as UserRole,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        ...(formData.role === "industrial" && {
          businessName: formData.businessName,
          gstNumber: formData.gstNumber,
        }),
        ...(formData.role === "farmer" && {
          farmSize: formData.farmSize,
        }),
      });

      toast.success("Registration successful!");

      switch (formData.role) {
        case "farmer":
          router.push("/dashboard/farmer");
          break;
        case "individual":
        case "industrial":
          router.push("/marketplace");
          break;
        default:
          router.push("/");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: "farmer",
      label: "Farmer",
      icon: <FiUser />,
      desc: "Sell your agricultural products",
    },
    {
      value: "individual",
      label: "Individual Buyer",
      icon: <FiShoppingBag />,
      desc: "Buy fresh produce for personal use",
    },
    {
      value: "industrial",
      label: "Industrial Buyer",
      icon: <FiTruck />,
      desc: "Buy in bulk for business",
    },
  ];

  return (
    <div ref={formRef} className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="AgriConnect" width={64} height={64} className="gsap-form-logo mx-auto mb-3 rounded-xl object-contain" />
          <h1 className="page-header-title font-display text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="page-header-subtitle text-gray-600 mt-2">
            Join AgriConnect as a farmer or buyer
          </p>
        </div>

        <div className="gsap-form-card card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="gsap-form-field">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: role.value as UserRole })
                    }
                    className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-[1.03] active:scale-[0.97] ${
                      formData.role === role.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <div className="text-2xl flex justify-center mb-1">
                      {role.icon}
                    </div>
                    <div className="font-medium text-sm">{role.label}</div>
                    <div className="text-xs mt-1 opacity-75">{role.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="gsap-form-field grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>

            <div className="gsap-form-field">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="gsap-form-field grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password *
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Repeat password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Address */}
            <div className="gsap-form-field">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Street address"
                  />
                </div>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="City"
                />
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="State"
                />
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Pincode"
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {formData.role === "industrial" && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                <h3 className="text-sm font-semibold text-blue-800">
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      GST Number
                    </label>
                    <input
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="GST number (optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === "farmer" && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 mb-3">
                  Farm Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Farm Size
                  </label>
                  <input
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 5 acres"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="gsap-form-btn btn-primary w-full py-3 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
