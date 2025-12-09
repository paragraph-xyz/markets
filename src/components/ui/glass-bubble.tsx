"use client";

import {
  type HTMLMotionProps,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { forwardRef, type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlassBubbleProps
  extends Omit<HTMLMotionProps<"div">, "ref" | "children"> {
  /**
   * 'icon' - Circular bubble for single icon buttons
   * 'pill' - Pill-shaped for groups of items
   * 'auto' - Rounded corners, adapts to content
   */
  variant?: "icon" | "pill" | "auto";
  /**
   * Size variants affecting internal spacing
   */
  size?: "sm" | "md" | "lg";
  /**
   * Tint opacity level
   * 'heavy' - Highest opacity for maximum contrast
   * 'normal' - Default, higher opacity for better contrast
   * 'light' - Lower opacity, more transparent
   * 'none' - Fully transparent tint
   */
  tint?: "heavy" | "normal" | "light" | "none";
  /**
   * Color scheme for the bubble
   * 'default' - Uses background color for tint
   * 'primary' - Uses primary color for tint and glare
   * 'secondary' - Uses secondary color for tint and glare
   * 'cobalt' - Uses cobalt blue for tint and glare
   * 'accent' - Uses accent color (author's theme color on blog pages)
   * @default 'default'
   */
  color?: "default" | "primary" | "secondary" | "cobalt" | "accent";
  /**
   * Backdrop blur intensity
   * 'minimal' - Subtle blur (2px)
   * 'normal' - Standard blur level
   * 'large' - Stronger blur and saturation
   * @default 'minimal'
   */
  blur?: "minimal" | "normal" | "large";
  /**
   * Hover animation style
   * 'follow' - Bubble stretches toward mouse position like being pulled
   * 'expand' - Bubble scales up uniformly on hover
   * 'none' - No hover animation on the bubble itself
   * @default 'follow'
   */
  hoverEffect?: "follow" | "expand" | "none";
  /**
   * Content to render inside the bubble
   */
  children?: ReactNode;
}

/**
 * A reusable liquid glass bubble component inspired by macOS/iOS 26.
 * Uses a multi-layer structure with SVG distortion filter for
 * authentic liquid glass effect: effect layer, tint layer, shine layer, content.
 */
const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 17,
} as const;

const GlassBubble = forwardRef<HTMLDivElement, GlassBubbleProps>(
  (
    {
      className,
      variant = "auto",
      size = "md",
      tint = "normal",
      color = "default",
      blur = "minimal",
      hoverEffect = "follow",
      children,
      onMouseMove: onMouseMoveProp,
      onMouseLeave: onMouseLeaveProp,
      ...props
    },
    ref,
  ) => {
    const directionX = useMotionValue(0);
    const directionY = useMotionValue(0);
    const distance = useMotionValue(0);

    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      return () => {
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
      };
    }, []);

    const maxOffset = 20;
    const originXPx = useTransform(
      directionX,
      [-1, 0, 1],
      [maxOffset, 0, -maxOffset],
    );
    const originYPx = useTransform(
      directionY,
      [-1, 0, 1],
      [maxOffset, 0, -maxOffset],
    );

    const followScale = useTransform(distance, [0, 1], [1, 1.1]);

    const springConfig = { stiffness: 500, damping: 25 };
    const springFollowScale = useSpring(followScale, springConfig);
    const springOriginX = useSpring(originXPx, springConfig);
    const springOriginY = useSpring(originYPx, springConfig);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      // Call prop handler if provided
      onMouseMoveProp?.(event);

      if (hoverEffect !== "follow") return;

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = event.clientX - rect.left - centerX;
      const y = event.clientY - rect.top - centerY;

      const normalizedX = Math.max(-1, Math.min(1, x / centerX));
      const normalizedY = Math.max(-1, Math.min(1, y / centerY));

      const dist = Math.min(1, Math.sqrt(normalizedX ** 2 + normalizedY ** 2));

      directionX.set(normalizedX);
      directionY.set(normalizedY);
      distance.set(dist);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
      // Call prop handler if provided
      onMouseLeaveProp?.(event);

      // Reset follow effect with delay (coyote time)
      resetTimeoutRef.current = setTimeout(() => {
        directionX.set(0);
        directionY.set(0);
        distance.set(0);
        resetTimeoutRef.current = null;
      }, 300);
    };

    const followStyle = {
      scale: springFollowScale,
      transformOrigin: useTransform(
        [springOriginX, springOriginY],
        ([x, y]) => `calc(50% + ${x}px) calc(50% + ${y}px)`,
      ),
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "liquid-glass-wrapper",
          variant === "icon" && "liquid-glass-icon",
          variant === "pill" && "liquid-glass-pill",
          variant === "auto" && "liquid-glass-auto",
          size === "sm" && "gap-0.5",
          size === "md" && "gap-1",
          size === "lg" && "gap-2",
          tint === "heavy" && "liquid-glass-tint-heavy",
          tint === "light" && "liquid-glass-tint-light",
          tint === "none" && "liquid-glass-tint-none",
          color === "primary" && "liquid-glass-primary",
          color === "secondary" && "liquid-glass-secondary",
          color === "cobalt" && "liquid-glass-cobalt",
          color === "accent" && "liquid-glass-accent",
          blur === "minimal" && "liquid-glass-blur-minimal",
          blur === "normal" && "liquid-glass-blur-normal",
          blur === "large" && "liquid-glass-blur-large",
          className,
        )}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.div
          className="liquid-glass-visual-layers"
          style={hoverEffect === "follow" ? followStyle : undefined}
          variants={
            hoverEffect === "expand"
              ? {
                  rest: { scale: 1 },
                  hover: { scale: 1.05 },
                  tap: { scale: 0.95 },
                }
              : hoverEffect === "none"
                ? undefined
                : {
                    tap: { scale: 0.95 },
                  }
          }
          transition={springTransition}
        >
          {/* Effect layer - applies SVG distortion filter */}
          <div className="liquid-glass-effect" />
          {/* Tint layer - semi-transparent overlay */}
          <div className="liquid-glass-tint" />
          {/* Shine layer - inner glow/shadow */}
          <div className="liquid-glass-shine" />
        </motion.div>
        {/* Content layer - stays static so dropdowns don't move */}
        <div className="liquid-glass-content">{children}</div>
      </motion.div>
    );
  },
);
GlassBubble.displayName = "GlassBubble";

export { GlassBubble };
