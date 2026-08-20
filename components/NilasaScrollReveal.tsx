"use client";

import { useEffect, useRef, ReactNode, ElementType } from "react";

interface NilasaScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "zoom-in" | "parallax-reveal";
  delay?: number; // delay in milliseconds
  duration?: number; // duration in milliseconds
  threshold?: number;
  as?: ElementType;
  [key: string]: any;
}

export function NilasaScrollReveal({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 800,
  threshold = 0.12,
  as: Component = "div",
  ...props
}: NilasaScrollRevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Use IntersectionObserver for high performance 60fps scroll detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                entry.target.classList.add("is-scroll-revealed");
              }, delay);
            } else {
              entry.target.classList.add("is-scroll-revealed");
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [delay, threshold]);

  return (
    <Component
      ref={elementRef}
      className={`nilasa-reveal nilasa-reveal--${animation} ${className}`}
      style={{
        "--reveal-duration": `${duration}ms`,
        "--reveal-delay": `${delay}ms`
      } as any}
      {...props}
    >
      {children}
    </Component>
  );
}
