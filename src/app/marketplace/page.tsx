"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useDeferredValue,
} from "react";
import api from "@/lib/api";
import { Product, Pagination } from "@/types";
import ProductCard from "@/components/ProductCard";
import {
  FiSearch, FiX, FiChevronDown, FiGrid, FiList,
  FiSliders, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { GiWheat } from "react-icons/gi";
import { CATEGORY_PILLS, SORT_OPTIONS } from "@/lib/constants";
import { useGsapMarketplaceHero, useGsapScrollReveal } from "@/hooks/useAnimations";
import gsap from "gsap";





export default function MarketplacePage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("");
  const [market,     setMarket]     = useState("");
  const [sort,       setSort]       = useState("-createdAt");
  const [organic,    setOrganic]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [viewMode,   setViewMode]   = useState<"grid" | "list">("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const searchRef = useRef<HTMLInputElement>(null);
  const heroRef = useGsapMarketplaceHero();
  const productsGridRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page, limit: 12, sort };
      if (deferredSearch) params.search    = deferredSearch;
      if (category)       params.category  = category;
      if (market)         params.stockType = market;
      if (organic)        params.organic   = true;
      const res = await api.get("/products", { params });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, deferredSearch, category, market, organic]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // GSAP stagger for product cards whenever products change
  useEffect(() => {
    const el = productsGridRef.current;
    if (!el || loading || products.length === 0) return;

    const cards = el.querySelectorAll(".gsap-product-entry");
    if (!cards.length) return;

    gsap.fromTo(
      cards,
      { y: 50, opacity: 0, scale: 0.92 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: "back.out(1.4)",
      }
    );
  }, [products, loading, viewMode]);

  const resetFilters = () => {
    setCategory(""); setMarket(""); setOrganic(false);
    setSort("-createdAt"); setSearch(""); setPage(1);
  };

  const hasFilters = !!(category || market || organic || search);
  const activeCat  = CATEGORY_PILLS.find((c) => c.value === category) ?? CATEGORY_PILLS[0];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-700 pb-28 pt-14 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div aria-hidden="true" className="mp-blob pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div aria-hidden="true" className="mp-blob pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary-600/30 blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="page-header-badge inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
            <GiWheat className="text-emerald-300" /> Direct from Indian Farms — Zero Brokers
          </span>
          <h1 className="page-header-title font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
            Fresh from the <span className="text-emerald-300">Field</span>
          </h1>
          <p className="page-header-subtitle text-primary-100/80 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Hundreds of seasonal products, priced honestly by the farmers who grow them.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); setPage(1); }}
            className="mp-search relative max-w-2xl mx-auto"
          >
            <div className="flex items-center bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
              <FiSearch className="absolute left-5 text-gray-400 text-lg pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tomatoes, Wheat, Turmeric..."
                className="flex-1 pl-12 pr-4 py-4 text-base text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(""); setPage(1); }} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <FiX />
                </button>
              )}
              <button type="submit" className="m-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-7 py-2.5 rounded-xl font-bold text-sm transition-all flex-shrink-0 hover:shadow-lg">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 54" fill="none" className="w-full" preserveAspectRatio="none">
            <path d="M0 27C240 54 480 54 720 27C960 0 1200 0 1440 27V54H0V27Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* CATEGORY PILLS */}
      <div className="sticky top-[64px] z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-3 pl-4 sm:pl-6 lg:pl-8">
          {CATEGORY_PILLS.map((cat) => {
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setPage(1); }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  isActive
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
          <div className="w-6 flex-shrink-0" />
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-3 relative z-10">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={`lg:hidden inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border shadow-sm transition-colors ${
                hasFilters ? "bg-primary-50 text-primary-700 border-primary-200" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              <FiSliders className="text-base" />
              Filters
              {hasFilters && (
                <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {[category, market, organic ? "o" : "", search ? "s" : ""].filter(Boolean).length}
                </span>
              )}
            </button>
            {market && <Chip label={market === "local" ? "Local Market" : "Industrial"} color="blue" onRemove={() => { setMarket(""); setPage(1); }} />}
            {organic && <Chip label="Organic" color="green" onRemove={() => { setOrganic(false); setPage(1); }} />}
            {search && <Chip label={`"${search}"`} color="gray" onRemove={() => { setSearch(""); setPage(1); }} />}
            {hasFilters && (
              <button onClick={resetFilters} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Clear all</button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {pagination && !loading && (
              <span className="hidden sm:inline-flex items-center bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                {pagination.total.toLocaleString()} products
              </span>
            )}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="appearance-none bg-white border border-gray-200 text-gray-700 pl-3 pr-8 py-2 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-400 shadow-sm cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
            </div>
            <div className="hidden sm:flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <button onClick={() => setViewMode("grid")} className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-700"}`}>
                <FiGrid className="text-sm" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-700"}`}>
                <FiList className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden mb-6 bg-white rounded-2xl border border-gray-100 shadow-md p-5 animate-fade-in">
            <FilterPanel market={market} setMarket={setMarket} organic={organic} setOrganic={setOrganic} onReset={resetFilters} setPage={setPage} />
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-[120px] bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <FilterPanel market={market} setMarket={setMarket} organic={organic} setOrganic={setOrganic} onReset={resetFilters} setPage={setPage} />
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {[...Array(9)].map((_, i) => <SkeletonCard key={i} list={viewMode === "list"} />)}
              </div>
            ) : products.length === 0 ? (
              <EmptyState onReset={resetFilters} query={search} category={activeCat.label} />
            ) : (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`} ref={productsGridRef}>
                {products.map((p) => (
                  <div key={p._id} className="gsap-product-entry">
                    <ProductCard product={p} listMode={viewMode === "list"} />
                  </div>
                ))}
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-12">
                <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <FiChevronLeft />
                </PageBtn>
                {getPaginationRange(page, pagination.pages).map((p, idx) =>
                  p === "..." ? (
                    <span key={idx} className="w-9 text-center text-gray-400 text-sm select-none">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(Number(p))}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${p === page ? "bg-primary-600 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-primary-300 hover:text-primary-600"}`}
                    >
                      {p}
                    </button>
                  )
                )}
                <PageBtn onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                  <FiChevronRight />
                </PageBtn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, color, onRemove }: { label: string; color: "blue" | "green" | "gray"; onRemove: () => void }) {
  const styles = { blue: "bg-blue-50 text-blue-700 border-blue-200", green: "bg-green-50 text-green-700 border-green-200", gray: "bg-gray-100 text-gray-700 border-gray-200" }[color];
  return (
    <span className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-3 py-1 rounded-full ${styles}`}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity"><FiX className="text-[10px]" /></button>
    </span>
  );
}

function FilterPanel({ market, setMarket, organic, setOrganic, onReset, setPage }: {
  market: string; setMarket: (v: string) => void;
  organic: boolean; setOrganic: (v: boolean) => void;
  onReset: () => void; setPage: (v: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">Filters</p>
        <button onClick={onReset} className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors">Reset all</button>
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Market</p>
        <div className="space-y-1">
          {[{ value: "", label: "All Markets" }, { value: "local", label: "Local / Small" }, { value: "industrial", label: "Industrial / Bulk" }].map((m) => (
            <button
              key={m.value}
              onClick={() => { setMarket(m.value); setPage(1); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${market === m.value ? "bg-primary-50 text-primary-700 font-semibold ring-1 ring-primary-200" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${market === m.value ? "bg-primary-500" : "bg-gray-300"}`} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Quality</p>
        <button
          onClick={() => { setOrganic(!organic); setPage(1); }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${organic ? "bg-green-50 text-green-700 font-semibold ring-1 ring-green-200" : "text-gray-600 hover:bg-gray-50"}`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${organic ? "bg-green-500" : "bg-gray-300"}`} />
            Organic only
          </div>
          <div className="relative w-9 h-5 rounded-full transition-colors" style={{ backgroundColor: organic ? "rgb(34,197,94)" : "rgb(209,213,219)" }}>
            <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" style={{ left: organic ? "1.25rem" : "0.125rem" }} />
          </div>
        </button>
      </div>
    </div>
  );
}

function SkeletonCard({ list }: { list: boolean }) {
  if (list) return (
    <div className="bg-white rounded-2xl animate-pulse flex gap-4 p-4 border border-gray-100 shadow-sm">
      <div className="w-44 h-32 bg-gray-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        <div className="h-5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  );
  return (
    <div className="bg-white rounded-2xl animate-pulse border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-52 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        <div className="h-5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-9 bg-gray-100 rounded-xl mt-5" />
      </div>
    </div>
  );
}

function EmptyState({ onReset, query, category }: { onReset: () => void; query: string; category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="w-24 h-24 rounded-3xl bg-primary-50 flex items-center justify-center mb-6">
        <GiWheat className="text-5xl text-primary-300" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
      <p className="text-gray-400 max-w-sm mb-8 leading-relaxed text-sm">
        {query ? `No results for "${query}" in ${category}.` : `Nothing in this category yet.`} Farmers add new stock daily.
      </p>
      <button onClick={onReset} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm">
        Show all products
      </button>
    </div>
  );
}

function PageBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-sm"
    >
      {children}
    </button>
  );
}

function getPaginationRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range: (number | "...")[] = [1];
  if (current > 3) range.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) range.push(p);
  if (current < total - 2) range.push("...");
  range.push(total);
  return range;
}
