"use client";

import React, { Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import PageLoader from "@/components/PageLoader";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        {children}
      </CartProvider>
    </AuthProvider>
  );
};
