"use client";

import React from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════════
 * StatCard — used on buyer + farmer dashboards (eliminates duplication)
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  /** For buyer dashboard (simple) style */
  color?: string;
  /** For farmer dashboard (rich) style */
  subtitle?: string;
  gradient?: string;
  bgLight?: string;
}

export function StatCard({ icon, label, value, color, subtitle, gradient, bgLight }: StatCardProps) {
  // Rich variant (farmer-style) when gradient is provided
  if (gradient) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-300 group animate-fade-in">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    );
  }

  // Simple variant (buyer-style)
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${color ?? "bg-primary-50 text-primary-600"} flex items-center justify-center text-xl`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EmptyState — generic empty-state component used across pages
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 text-4xl text-primary-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-6 text-sm leading-relaxed">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary inline-flex items-center gap-2">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="btn-primary inline-flex items-center gap-2">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PageHeader — reusable animated page header with title + subtitle
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      {children}
    </div>
  );
}
