"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ════════════════════════════════════════════════════════════════════════════
 * GSAP ANIMATION HOOKS
 * Every hook:
 *   • Scopes selectors inside gsap.context(el) → no global leaks
 *   • Returns ctx.revert() as cleanup → safe for React StrictMode
 *   • Animates only transform/opacity → GPU-composited, zero layout reflow
 * ════════════════════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapHero — cinematic hero entrance
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Badge slides down
      tl.fromTo(
        ".hero-badge",
        { y: -40, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8 }
      );

      // Main heading words fly in with rotation
      tl.fromTo(
        ".hero-title-line",
        { x: -120, opacity: 0, rotateZ: -3 },
        { x: 0, opacity: 1, rotateZ: 0, duration: 1, stagger: 0.15 },
        "-=0.5"
      );

      // Gradient text clip reveal
      tl.fromTo(
        ".hero-gradient-text",
        { clipPath: "inset(0 100% 0 0)", opacity: 0 },
        { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 1.2, ease: "power3.inOut" },
        "-=0.6"
      );

      // Paragraph fades up
      tl.fromTo(
        ".hero-desc",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5"
      );

      // CTA buttons pop in with elastic
      tl.fromTo(
        ".hero-cta",
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.7)" },
        "-=0.3"
      );

      // Trust row staggers
      tl.fromTo(
        ".hero-trust-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
        "-=0.2"
      );

      // Right card stack: dramatic entrance
      tl.fromTo(
        ".hero-card-back",
        { x: 200, opacity: 0, rotate: 20, scale: 0.7 },
        { x: 0, opacity: 1, rotate: 6, scale: 1, duration: 1.2, ease: "elastic.out(1, 0.6)" },
        "-=1.2"
      );
      tl.fromTo(
        ".hero-card-front",
        { x: 150, opacity: 0, rotate: -10, scale: 0.8 },
        { x: 0, opacity: 1, rotate: 0, scale: 1, duration: 1, ease: "elastic.out(1, 0.65)" },
        "-=1"
      );

      // Product rows stagger inside the card
      tl.fromTo(
        ".hero-product-row",
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
        "-=0.5"
      );

      // Floating wheat icons — continuous float
      gsap.set(".hero-wheat-float, .hero-blob", { willChange: "transform" });

      gsap.to(".hero-wheat-float", {
        y: -20,
        rotation: 15,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.8, from: "random" },
      });

      // Decorative blobs — slow scale pulse
      gsap.to(".hero-blob", {
        scale: 1.15,
        opacity: 0.8,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 1.5,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapScrollReveal — reveal container children on scroll
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapScrollReveal(
  selector = ".gsap-reveal-item",
  options?: { y?: number; stagger?: number; duration?: number; start?: string }
) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Destructure to primitives so dep array stays stable across renders
  const y = options?.y ?? 60;
  const stagger = options?.stagger ?? 0.12;
  const duration = options?.duration ?? 0.8;
  const start = options?.start ?? "top 80%";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = el.querySelectorAll(selector);
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [selector, y, stagger, duration, start]);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapStaggerCards — staggered card entrance with 3D rotation
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapStaggerCards(selector = ".gsap-card") {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const cards = el.querySelectorAll(selector);
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      // perspective required for rotateX to render as 3-D
      gsap.set(el, { perspective: 800 });

      gsap.fromTo(
        cards,
        { y: 80, opacity: 0, rotateX: 15, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "back.out(1.4)",
          clearProps: "rotateX",
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [selector]);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapCounter — animate number from 0 to target
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapCounter(target: number, prefix = "", suffix = "") {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || target === 0) return;

    const obj = { val: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(obj.val).toLocaleString()}${suffix}`;
        },
      });
    });

    return () => ctx.revert();
  }, [target, prefix, suffix]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapTextReveal — per-character text reveal with scramble
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapTextReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const text = el.textContent || "";
    el.innerHTML = text
      .split("")
      .map((char) =>
        char === " "
          ? " "
          : `<span class="gsap-char" style="display:inline-block;opacity:0">${char}</span>`
      )
      .join("");

    const chars = el.querySelectorAll(".gsap-char");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          opacity: 0,
          y: 35,
          // Pass as function ref so EACH character receives a unique random angle
          rotateZ: () => gsap.utils.random(-18, 18),
          scale: 0,
        },
        {
          opacity: 1,
          y: 0,
          rotateZ: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.022,
          ease: "back.out(2)",
          clearProps: "rotateZ,scale",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapMagnetic — magnetic hover effect for buttons/elements
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapMagnetic(strength = 0.35) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // quickTo creates cached setters — no new tween object on every mousemove pixel
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power2.out" });

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - rect.left - rect.width / 2) * strength);
      yTo((e.clientY - rect.top - rect.height / 2) * strength);
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapParallax — parallax scroll movement
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: () => -100 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapSlideIn — element slides from a direction on mount
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapSlideIn(
  direction: "left" | "right" | "up" | "down" = "up",
  delay = 0
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dirs = {
      left: { x: -80, y: 0 },
      right: { x: 80, y: 0 },
      up: { x: 0, y: 80 },
      down: { x: 0, y: -80 },
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { ...dirs[direction], opacity: 0, scale: 0.95 },
        { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.9, delay, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, [direction, delay]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapPageTransition — page-level enter animation
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapPageTransition() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapFloat — infinite floating / bobbing animation
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapFloat(amplitude = 15, duration = 3) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { willChange: "transform" });
      gsap.to(el, {
        y: -amplitude,
        rotation: gsap.utils.random(-4, 4),
        duration,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, [amplitude, duration]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapScaleIn — elastic pop-in on scroll
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapScaleIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: 0, opacity: 0, rotation: -8 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.75,
          delay,
          ease: "elastic.out(1, 0.5)",
          clearProps: "rotation",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    });

    return () => ctx.revert();
  }, [delay]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapNavbar — navbar items stagger in
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapNavbar() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".nav-item",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.2 }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapHoverPop — scale pop on hover
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapHoverPop(scale = 1.05) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleEnter = () => {
      gsap.to(el, { scale, duration: 0.28, ease: "power2.out", overwrite: "auto" });
    };
    const handleLeave = () => {
      gsap.to(el, { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
    };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [scale]);

  return ref;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapCartItems — cart item entrance animation
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapCartItems() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // perspective needed for rotateY on cart items
      gsap.set(el, { perspective: 900 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        ".page-header-title",
        { y: 50, opacity: 0, clipPath: "inset(0 100% 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }
      );

      tl.fromTo(
        ".page-header-subtitle",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );

      tl.fromTo(
        ".gsap-cart-item",
        { x: -55, opacity: 0, rotateY: -12 },
        { x: 0, opacity: 1, rotateY: 0, duration: 0.55, stagger: 0.09, ease: "power3.out",
          clearProps: "rotateY" },
        "-=0.2"
      );

      tl.fromTo(
        ".gsap-cart-summary",
        { x: 55, opacity: 0, scale: 0.95 },
        { x: 0, opacity: 1, scale: 1, duration: 0.75, ease: "back.out(1.4)" },
        "-=0.4"
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapProductDetail — product detail page entrance
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapProductDetail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { perspective: 900 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".gsap-product-image",
        { scale: 0.82, opacity: 0, rotateY: -18 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 0.85, clearProps: "rotateY" }
      );

      tl.fromTo(
        ".gsap-product-badge",
        { y: -18, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.38, stagger: 0.07 },
        "-=0.45"
      );

      tl.fromTo(
        ".gsap-product-title",
        { x: -35, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55 },
        "-=0.25"
      );

      tl.fromTo(
        ".gsap-product-price",
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" },
        "-=0.2"
      );

      tl.fromTo(
        ".gsap-product-info",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.09 },
        "-=0.2"
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapDashboard — dashboard page entrance with stat pop
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".page-header-title",
        { y: 50, opacity: 0, clipPath: "inset(0 100% 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power4.out" }
      );

      tl.fromTo(
        ".page-header-subtitle",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );

      tl.fromTo(
        ".gsap-stat-card",
        { y: 40, opacity: 0, scale: 0.85 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.3"
      );

      tl.fromTo(
        ".gsap-dash-content",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.2"
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapFormReveal — auth form reveal for login/register
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapFormReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // perspective needed for the rotateX on the card
      gsap.set(el, { perspective: 900 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".gsap-form-logo",
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.75, ease: "elastic.out(1, 0.5)", clearProps: "rotation" }
      );

      tl.fromTo(
        ".page-header-title",
        { y: 50, opacity: 0, clipPath: "inset(0 100% 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power4.out" },
        "-=0.3"
      );

      tl.fromTo(
        ".page-header-subtitle",
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55 },
        "-=0.4"
      );

      tl.fromTo(
        ".gsap-form-card",
        { y: 55, opacity: 0, scale: 0.93, rotateX: 10 },
        { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.75, ease: "back.out(1.3)",
          clearProps: "rotateX" },
        "-=0.3"
      );

      tl.fromTo(
        ".gsap-form-field",
        { x: -28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.38, stagger: 0.07 },
        "-=0.3"
      );

      tl.fromTo(
        ".gsap-form-btn",
        { y: 18, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" },
        "-=0.1"
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapMarketplaceHero — marketplace hero entrance
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapMarketplaceHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Promote blobs to compositor layer before they animate
      gsap.set(".mp-blob", { willChange: "transform" });

      // Blobs animate in
      tl.fromTo(
        ".mp-blob",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: "elastic.out(1, 0.5)" }
      );

      // Badge drops in
      tl.fromTo(
        ".page-header-badge",
        { y: -30, opacity: 0, scale: 0.7, rotation: -8 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.5)" },
        "-=1.2"
      );

      // Title
      tl.fromTo(
        ".page-header-title",
        { y: 50, opacity: 0, clipPath: "inset(0 100% 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power4.out" },
        "-=0.3"
      );

      // Subtitle
      tl.fromTo(
        ".page-header-subtitle",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );

      // Search bar scales in
      tl.fromTo(
        ".mp-search",
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)" },
        "-=0.3"
      );

      // Continuous blob float
      gsap.to(".mp-blob", {
        scale: 1.1,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 1,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapPageHeader — canonical page header animation (standalone utility)
 * Badge → Title → Subtitle, identical animation on every page.
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapPageHeader() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        ".page-header-badge",
        { y: -30, opacity: 0, scale: 0.7, rotation: -8 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.5)" }
      );

      tl.fromTo(
        ".page-header-title",
        { y: 50, opacity: 0, clipPath: "inset(0 100% 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 },
        "-=0.3"
      );

      tl.fromTo(
        ".page-header-subtitle",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/* ────────────────────────────────────────────────────────────────────────────
 * useGsapSectionHeader — same badge→title→subtitle animation, scroll-triggered.
 * Use this for mid-page section headings so the animation fires on scroll.
 * ──────────────────────────────────────────────────────────────────────────── */
export function useGsapSectionHeader() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });

      tl.fromTo(
        ".page-header-badge",
        { y: -30, opacity: 0, scale: 0.7, rotation: -8 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.5)" }
      );

      tl.fromTo(
        ".page-header-title",
        { y: 50, opacity: 0, clipPath: "inset(0 100% 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 },
        "-=0.3"
      );

      tl.fromTo(
        ".page-header-subtitle",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return containerRef;
}
