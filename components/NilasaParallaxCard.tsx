"use client";

import { useRef, useEffect, ReactNode, ElementType } from "react";

interface NilasaParallaxCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number; // max tilt angle in degrees (default 6deg)
  scale?: number; // scale on hover (default 1.018)
  as?: ElementType;
  href?: string;
  [key: string]: any;
}

export function NilasaParallaxCard({
  children,
  className = "",
  maxTilt = 6,
  scale = 1.018,
  as: Component = "div",
  href,
  ...props
}: NilasaParallaxCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Check if pointer supports hover (desktop/laptop)
    const isHoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isHoverCapable) return;

    let bounds: DOMRect | null = null;

    const handleMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = "transform 0.15s ease-out, box-shadow 0.25s ease-out";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!bounds) bounds = card.getBoundingClientRect();

      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      // Normalised coordinates (-1 to 1)
      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      const tiltX = -normY * maxTilt;
      const tiltY = normX * maxTilt;
      const shiftX = -normX * 8; // subtle image parallax translation
      const shiftY = -normY * 8;

      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
        card.style.setProperty("--shift-x", `${shiftX.toFixed(1)}px`);
        card.style.setProperty("--shift-y", `${shiftY.toFixed(1)}px`);
        card.style.setProperty("--card-scale", `${scale}`);
        card.classList.add("is-parallax-active");
      });
    };

    const handleMouseLeave = () => {
      bounds = null;
      if (rafId.current) cancelAnimationFrame(rafId.current);

      card.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--shift-x", "0px");
      card.style.setProperty("--shift-y", "0px");
      card.style.setProperty("--card-scale", "1");
      card.classList.remove("is-parallax-active");
    };

    card.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    card.addEventListener("mousemove", handleMouseMove, { passive: true });
    card.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [maxTilt, scale]);

  return (
    <Component
      ref={cardRef}
      href={href}
      className={`nilasa-parallax-card-wrap ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
