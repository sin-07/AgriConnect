"use client";

import React from "react";
import Link from "next/link";
import { GiWheat, GiFarmer } from "react-icons/gi";
import {
  FiTruck, FiShield, FiDollarSign, FiUsers,
  FiArrowRight, FiShoppingBag, FiCheckCircle, FiStar,
} from "react-icons/fi";
import { useReveal } from "@/hooks/useAnimations";

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const features = useReveal();
  const howItWorks = useReveal();
  const categories = useReveal();
  const cta = useReveal();

  return (
    <div className="overflow-x-hidden">

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-primary-950 via-primary-800 to-emerald-700 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-primary-400/10 blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/3 blur-3xl" />
          {/* Floating wheat icons */}
          <GiWheat className="absolute top-[12%] right-[10%] text-7xl text-white/8 animate-float" />
          <GiWheat className="absolute bottom-[18%] left-[6%] text-5xl text-white/8 animate-float" style={{ animationDelay: "2s" }} />
          <GiWheat className="absolute top-[55%] right-[20%] text-4xl text-white/6 animate-float" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div className="animate-hero-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-emerald-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wider uppercase">
              <GiWheat className="text-base" />
              India&apos;s farmer-first marketplace
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Farm Fresh,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-lime-300">
                Zero Brokers.
              </span>
            </h1>
            <p className="text-lg text-primary-100 max-w-lg mb-10 leading-relaxed">
              AgriConnect puts farmers and buyers in direct contact — no
              middlemen, honest prices, and produce that goes from soil to shelf
              in a single step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold text-base hover:bg-emerald-50 hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                <FiShoppingBag /> Browse Marketplace
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/10 hover:border-white/70 hover:-translate-y-0.5 transition-all duration-200"
              >
                <GiFarmer /> Join as Farmer <FiArrowRight className="text-sm" />
              </Link>
            </div>
            {/* Trust row */}
            <div className="flex items-center gap-6 mt-12">
              {[
                { icon: <FiCheckCircle />, text: "No broker fees" },
                { icon: <FiCheckCircle />, text: "Verified farmers" },
                { icon: <FiCheckCircle />, text: "Direct delivery" },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-1.5 text-emerald-200 text-sm font-medium">
                  {t.icon} {t.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card stack */}
          <div className="hidden lg:flex justify-center animate-hero-right">
            <div className="relative w-80">
              {/* Back card */}
              <div className="absolute -top-6 -right-6 w-full h-full bg-white/10 backdrop-blur rounded-3xl border border-white/20 rotate-6" />
              {/* Front card */}
              <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-400/30 flex items-center justify-center">
                    <GiWheat className="text-2xl text-emerald-200" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Ravi Kumar</p>
                    <p className="text-primary-200 text-xs">Wheat Farmer · Punjab</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs bg-emerald-400/25 text-emerald-200 px-2 py-1 rounded-full font-semibold">Verified</span>
                  </div>
                </div>
                {[
                  { name: "Whole Wheat", qty: "50 kg bags", price: "₹280/kg" },
                  { name: "Basmati Rice", qty: "25 kg bags", price: "₹120/kg" },
                  { name: "Yellow Lentils", qty: "10 kg bags", price: "₹95/kg" },
                ].map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                    style={{ animationDelay: `${i * 0.1}s` }}>
                    <div>
                      <p className="text-white text-sm font-semibold">{p.name}</p>
                      <p className="text-primary-200 text-xs">{p.qty}</p>
                    </div>
                    <span className="text-emerald-300 font-bold text-sm">{p.price}</span>
                  </div>
                ))}
                <div className="mt-6">
                  <div className="flex items-center gap-1 text-yellow-300 mb-1">
                    {[...Array(5)].map((_, i) => <FiStar key={i} className="text-xs fill-yellow-300" />)}
                    <span className="text-white/60 text-xs ml-1">4.9</span>
                  </div>
                  <p className="text-primary-200 text-xs">"Excellent quality produce, arrived fresh!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80L1440 80L1440 30C1200 80 900 0 720 20C540 40 240 0 0 30L0 80Z" fill="#f7f9f4" />
          </svg>
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3 block">Why AgriConnect</span>
            <h2 className="font-display text-4xl font-extrabold text-gray-900 mb-4">Built for those who grow food</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A transparent platform that removes friction and puts money back in farmers&apos; hands.</p>
          </div>

          <div
            ref={features.ref}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <FiShield className="text-3xl" />,
                title: "No Brokers",
                description: "Direct transactions between farmers and buyers. No middlemen, no hidden fees on either side.",
                color: "bg-green-500",
                light: "bg-green-50",
                text: "text-green-600",
                delay: "0ms",
              },
              {
                icon: <FiDollarSign className="text-3xl" />,
                title: "Fair Pricing",
                description: "Farmers set their own prices. Buyers get competitive rates without any broker markup.",
                color: "bg-blue-500",
                light: "bg-blue-50",
                text: "text-blue-600",
                delay: "120ms",
              },
              {
                icon: <FiTruck className="text-3xl" />,
                title: "Farm Fresh",
                description: "Products shipped directly from farms, guaranteeing maximum freshness and quality.",
                color: "bg-orange-500",
                light: "bg-orange-50",
                text: "text-orange-600",
                delay: "240ms",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-400 overflow-hidden
                  ${features.visible ? "animate-slide-up" : "opacity-0 translate-y-8"}`}
                style={{ animationDelay: f.delay }}
              >
                <div className={`w-14 h-14 ${f.light} ${f.text} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#f7f9f4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3 block">Process</span>
            <h2 className="font-display text-4xl font-extrabold text-gray-900">How it works</h2>
          </div>

          <div ref={howItWorks.ref} className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: "01",
                  icon: <GiFarmer className="text-2xl" />,
                  title: "Farmers List Products",
                  desc: "Farmers upload produce, set prices, and split stock between local and industrial buyers.",
                  delay: "0ms",
                },
                {
                  step: "02",
                  icon: <FiShoppingBag className="text-2xl" />,
                  title: "Buyers Browse",
                  desc: "Individual and bulk buyers discover fresh products filtered by category, market type, and price.",
                  delay: "150ms",
                },
                {
                  step: "03",
                  icon: <FiUsers className="text-2xl" />,
                  title: "Direct Connection",
                  desc: "Orders go straight to the farmer. No broker, no markup — just a clean, honest transaction.",
                  delay: "300ms",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`text-center ${howItWorks.visible ? "animate-slide-up" : "opacity-0 translate-y-8"}`}
                  style={{ animationDelay: s.delay }}
                >
                  <div className="relative inline-flex w-24 h-24 bg-white border-2 border-primary-200 rounded-full items-center justify-center mb-6 shadow-md mx-auto group hover:border-primary-500 hover:shadow-primary-100 hover:shadow-lg transition-all duration-300">
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">{s.step}</span>
                    <div className="text-primary-600 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3 block">Browse by category</span>
            <h2 className="font-display text-4xl font-extrabold text-gray-900">What&apos;s on the marketplace</h2>
          </div>

          <div ref={categories.ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Vegetables", val: "vegetables" },
              { label: "Fruits",     val: "fruits" },
              { label: "Grains",     val: "grains" },
              { label: "Pulses",     val: "pulses" },
              { label: "Spices",     val: "spices" },
              { label: "Dairy",      val: "dairy" },
              { label: "Oilseeds",   val: "oilseeds" },
              { label: "Flowers",    val: "flowers" },
              { label: "Herbs",      val: "herbs" },
              { label: "Nuts",       val: "nuts" },
              { label: "Other",      val: "other" },
              { label: "View All",   val: "" },
            ].map((c, i) => (
              <Link
                key={c.label}
                href={`/marketplace${c.val ? `?category=${c.val}` : ""}`}
                className={`border rounded-2xl px-4 py-5 text-center text-sm font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-md
                  ${c.label === "View All"
                    ? "bg-primary-600 border-primary-600 hover:bg-primary-700 text-white font-bold"
                    : "bg-primary-50 border-primary-200 hover:bg-primary-100 text-primary-700"}
                  ${categories.visible ? "animate-slide-up" : "opacity-0 translate-y-6"}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════════════════════════ */}
      <section
        ref={cta.ref}
        className={`py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-700 relative overflow-hidden
          ${cta.visible ? "animate-fade-in" : "opacity-0"}`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Farmer card */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-10 hover:bg-white/15 hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-400/25 rounded-2xl flex items-center justify-center mb-6">
                <GiFarmer className="text-white text-2xl" />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-white mb-3">Are you a farmer?</h3>
              <p className="text-primary-200 mb-8 leading-relaxed">List your produce, set your own prices, and reach thousands of buyers directly — no commission, no middleman.</p>
              <Link
                href="/register?role=farmer"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Register as Farmer <FiArrowRight />
              </Link>
            </div>
            {/* Buyer card */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-10 hover:bg-white/15 hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 bg-blue-400/25 rounded-2xl flex items-center justify-center mb-6">
                <FiShoppingBag className="text-white text-2xl" />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-white mb-3">Looking to buy?</h3>
              <p className="text-primary-200 mb-8 leading-relaxed">Access seasonal produce at honest farm-gate prices. Order for personal use or bulk industrial requirements.</p>
              <Link
                href="/register?role=individual"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Register as Buyer <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-950 text-gray-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <GiWheat className="text-2xl text-primary-500" />
              <span className="text-lg font-bold text-white">Agri<span className="text-primary-500">Connect</span></span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
            <p className="text-xs">&copy; {new Date().getFullYear()} AgriConnect. Empowering farmers, connecting buyers.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
