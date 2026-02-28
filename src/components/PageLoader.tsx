"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════════════════
 * Grass Loader — blades grow up from bottom while navigating
 * ═══════════════════════════════════════════════════════════════════════════ */

// Each blade: [ leftPercent, heightPx, rotationDeg, widthPx, hue-shift ]
const BLADES: [number, number, number, number, number][] = [
  [2,  72, -12, 5,  0],
  [5,  90,   4, 4,  8],
  [8,  60, -18, 6,  0],
  [11, 100,  8, 5, 12],
  [14, 78,  -6, 4,  0],
  [18, 110,  14, 6,  5],
  [22, 65,  -10, 5,  0],
  [26, 95,   6, 4, 10],
  [30, 82, -16, 5,  0],
  [34, 105, 10, 6,  8],
  [38, 70,  -8, 4,  0],
  [42, 92,  12, 5,  5],
  [46, 58, -14, 6,  0],
  [50, 108,  5, 4, 12],
  [54, 75,  -9, 5,  0],
  [58, 98,  16, 6,  8],
  [62, 68, -12, 4,  0],
  [66, 88,   7, 5,  5],
  [70, 72, -18, 6,  0],
  [74, 102, 11, 4, 10],
  [78, 63,  -7, 5,  0],
  [82, 94,  13, 6,  8],
  [86, 80,  -5, 4,  0],
  [90, 106,  9, 5, 12],
  [93, 66, -15, 6,  0],
  [96, 85,   3, 4,  5],
  [99, 74, -11, 5,  0],
];

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const overlayRef = useRef<HTMLDivElement>(null);
  const bladesRef = useRef<(HTMLDivElement | null)[]>([]);
  const swayTlRef = useRef<gsap.core.Timeline | null>(null);

  const [visible, setVisible] = useState(false);
  const first = useRef(true);
  const prev = useRef(pathname);
  const busy = useRef(false);

  const setBladeRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => { bladesRef.current[i] = el; },
    []
  );

  const play = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setVisible(true);

    requestAnimationFrame(() => {
      const o = overlayRef.current;
      const blades = bladesRef.current.filter(Boolean) as HTMLDivElement[];
      if (!o || blades.length === 0) { busy.current = false; return; }

      // Kill any running sway
      swayTlRef.current?.kill();

      // Reset blades: start collapsed at bottom
      gsap.set(blades, { scaleY: 0, transformOrigin: "bottom center", opacity: 1 });
      gsap.set(o, { visibility: "visible", pointerEvents: "all" });

      const tl = gsap.timeline({
        onComplete() { setVisible(false); busy.current = false; },
      });

      // ── Blades grow UP ─────────────────────────────────────────
      tl.to(blades, {
        scaleY: 1,
        duration: 0.45,
        ease: "power2.out",
        stagger: { each: 0.018, from: "random" },
      }, 0);

      // ── Gentle sway while visible ──────────────────────────────
      tl.call(() => {
        const st = gsap.timeline({ repeat: -1, yoyo: true });
        st.to(blades, {
          rotation: (i) => BLADES[i][2] + (i % 2 === 0 ? 5 : -5),
          duration: 0.7,
          ease: "sine.inOut",
          stagger: { each: 0.04, from: "start" },
        });
        swayTlRef.current = st;
      }, [], 0.5);

      // ── Blades retract DOWN ────────────────────────────────────
      tl.call(() => { swayTlRef.current?.kill(); }, [], 0.85);
      tl.to(blades, {
        scaleY: 0,
        duration: 0.3,
        ease: "power3.in",
        stagger: { each: 0.012, from: "random" },
      }, 0.88);

      tl.set(o, { visibility: "hidden", pointerEvents: "none" });
    });
  }, [pathname]);

  useEffect(() => {
    if (first.current) { first.current = false; prev.current = pathname; return; }
    if (pathname !== prev.current) { prev.current = pathname; play(); }
  }, [pathname, searchParams, play]);

  return (
    <div
      ref={overlayRef}
      className="grass-loader"
      style={visible ? undefined : { visibility: "hidden", pointerEvents: "none" }}
    >
      {BLADES.map(([left, height, rotation, width, hue], i) => (
        <div
          key={i}
          ref={setBladeRef(i)}
          className="grass-blade"
          style={{
            left: `${left}%`,
            height: `${height}px`,
            width: `${width}px`,
            rotate: `${rotation}deg`,
            filter: hue ? `hue-rotate(${hue}deg)` : undefined,
          }}
        />
      ))}
    </div>
  );
}
