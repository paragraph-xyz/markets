"use client";

import { useEffect } from "react";

/**
 * Detects if the browser properly supports complex SVG filters applied to HTML elements.
 * Uses multiple detection methods:
 * 1. Known problematic browsers (Firefox has issues with feTurbulence + feSpecularLighting)
 * 2. CSS.supports() for basic syntax support
 * 3. Computed style check on actual filter
 */
function detectSVGFilterSupport(): boolean {
  if (typeof window === "undefined") return true;

  // Firefox accepts the syntax but renders complex filters (feTurbulence,
  // feSpecularLighting, feDisplacementMap) incorrectly. Use CSS fallback.
  const isFirefox = navigator.userAgent.includes("Firefox");
  if (isFirefox) {
    console.log(
      "[SVG Filter Detection] Firefox detected - using CSS fallback for complex filters"
    );
    return false;
  }

  // Check if browser supports filter: url() syntax
  if (typeof CSS !== "undefined" && CSS.supports) {
    const syntaxSupported = CSS.supports("filter", "url(#test)");
    if (!syntaxSupported) {
      console.log(
        "[SVG Filter Detection] CSS.supports failed for filter: url()"
      );
      return false;
    }
  }

  // Check if the filter element exists
  const filterEl = document.getElementById("glass-distortion");
  if (!filterEl) {
    console.log("[SVG Filter Detection] Filter element not found");
    return false;
  }

  // Check computed style accepts the filter
  const testEl = document.createElement("div");
  testEl.style.cssText =
    "position:absolute;width:10px;height:10px;filter:url(#glass-distortion);pointer-events:none;opacity:0";
  document.body.appendChild(testEl);

  const computed = window.getComputedStyle(testEl).filter;
  document.body.removeChild(testEl);

  const supported = computed !== "none" && computed !== "";

  console.log("[SVG Filter Detection]", {
    computed,
    supported,
  });

  return supported;
}

/**
 * SVG filter for the liquid glass distortion effect.
 * This component should be rendered once at the app root level.
 * The filter is referenced by ID (#glass-distortion) in CSS.
 *
 * Also detects SVG filter support and adds a fallback class if needed.
 */
export function LiquidGlassFilter() {
  useEffect(() => {
    const supported = detectSVGFilterSupport();
    if (!supported) {
      document.documentElement.classList.add("no-svg-filters");
    }
  }, []);

  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0 }}
      aria-hidden="true"
    >
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.001 0.005"
          numOctaves={1}
          seed={17}
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
          <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
          <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale={5}
          specularConstant={1}
          specularExponent={100}
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x={-200} y={-200} z={300} />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1={0}
          k2={1}
          k3={1}
          k4={0}
          result="litImage"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale={100}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
