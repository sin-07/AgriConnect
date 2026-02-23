/**
 * Shared category definitions used across home page, marketplace, farmer dashboard, and product cards.
 * Single source of truth — no more duplicate category lists.
 */

export const CATEGORIES = [
  { value: "vegetables", label: "Vegetables", emoji: "🥬" },
  { value: "fruits",     label: "Fruits",     emoji: "🍎" },
  { value: "grains",     label: "Grains",     emoji: "🌾" },
  { value: "pulses",     label: "Pulses",     emoji: "🫘" },
  { value: "spices",     label: "Spices",     emoji: "🌶️" },
  { value: "dairy",      label: "Dairy",      emoji: "🥛" },
  { value: "oilseeds",   label: "Oilseeds",   emoji: "🌻" },
  { value: "flowers",    label: "Flowers",    emoji: "🌸" },
  { value: "herbs",      label: "Herbs",      emoji: "🌿" },
  { value: "nuts",       label: "Nuts",       emoji: "🥜" },
  { value: "other",      label: "Other",      emoji: "📦" },
] as const;

/** For marketplace filter pills (includes "All" prefix) */
export const CATEGORY_PILLS = [
  { value: "", label: "All" },
  ...CATEGORIES,
];

/** Emoji lookup by category value */
export const CATEGORY_EMOJI: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.emoji])
);

/** Color metadata for product cards */
export const CATEGORY_COLORS: Record<string, { accent: string; bg: string; dot: string }> = {
  vegetables: { accent: "bg-green-500",  bg: "bg-green-50",  dot: "bg-green-500"  },
  fruits:     { accent: "bg-red-500",    bg: "bg-red-50",    dot: "bg-red-500"    },
  grains:     { accent: "bg-yellow-500", bg: "bg-yellow-50", dot: "bg-yellow-500" },
  pulses:     { accent: "bg-orange-500", bg: "bg-orange-50", dot: "bg-orange-500" },
  spices:     { accent: "bg-rose-500",   bg: "bg-rose-50",   dot: "bg-rose-500"   },
  dairy:      { accent: "bg-sky-500",    bg: "bg-sky-50",    dot: "bg-sky-500"    },
  oilseeds:   { accent: "bg-amber-500",  bg: "bg-amber-50",  dot: "bg-amber-500"  },
  flowers:    { accent: "bg-pink-500",   bg: "bg-pink-50",   dot: "bg-pink-500"   },
  herbs:      { accent: "bg-teal-500",   bg: "bg-teal-50",   dot: "bg-teal-500"   },
  nuts:       { accent: "bg-lime-500",   bg: "bg-lime-50",   dot: "bg-lime-500"   },
  other:      { accent: "bg-gray-400",   bg: "bg-gray-50",   dot: "bg-gray-400"   },
};

export const DEFAULT_CATEGORY_COLOR = { accent: "bg-primary-500", bg: "bg-primary-50", dot: "bg-primary-500" };

/** Sort options for marketplace */
export const SORT_OPTIONS = [
  { value: "-createdAt",    label: "Newest first" },
  { value: "createdAt",     label: "Oldest first" },
  { value: "pricePerUnit",  label: "Price: Low to High" },
  { value: "-pricePerUnit", label: "Price: High to Low" },
  { value: "name",          label: "Name A-Z" },
] as const;

/** Order status pipeline */
export const ORDER_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
