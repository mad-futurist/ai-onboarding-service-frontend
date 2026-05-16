import * as React from "react";

type ReadySetLogoVariant = "light" | "dark" | "mono";

interface ReadySetLogoProps extends Omit<React.SVGProps<SVGSVGElement>, "viewBox"> {
  size?: number;
  variant?: ReadySetLogoVariant;
  title?: string;
}

const PALETTES: Record<ReadySetLogoVariant, {
  ring: string;
  arcTop: string;
  arcBottom: string;
  innerFill: string;
  innerStroke: string;
  check: string;
  dot: string;
}> = {
  light: {
    ring: "#FFD199",
    arcTop: "#FF8C00",
    arcBottom: "#CC5500",
    innerFill: "#FFF0E0",
    innerStroke: "#FFAA55",
    check: "#CC5500",
    dot: "#FF8C00",
  },
  dark: {
    ring: "#3D2000",
    arcTop: "#FF8C00",
    arcBottom: "#FF6600",
    innerFill: "#2A1200",
    innerStroke: "#7A3800",
    check: "#FFB566",
    dot: "#FF8C00",
  },
  mono: {
    ring: "currentColor",
    arcTop: "currentColor",
    arcBottom: "currentColor",
    innerFill: "transparent",
    innerStroke: "currentColor",
    check: "currentColor",
    dot: "currentColor",
  },
};

export function ReadySetLogo({
  size = 32,
  variant = "light",
  title,
  ...svgProps
}: ReadySetLogoProps) {
  const palette = PALETTES[variant];
  const small = size < 32;
  const ringWidth = small ? 3 : 2.5;
  const arcWidth = small ? 6 : 5;
  const innerWidth = small ? 2 : 1.5;
  const checkWidth = small ? 4 : 3;
  const dotRadius = small ? 4 : 3.5;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...svgProps}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="36" cy="36" r="30" stroke={palette.ring} strokeWidth={ringWidth} />
      <path
        d="M36 6 A30 30 0 0 1 66 36"
        stroke={palette.arcTop}
        strokeWidth={arcWidth}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M66 36 A30 30 0 0 1 36 66"
        stroke={palette.arcBottom}
        strokeWidth={arcWidth}
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="36"
        cy="36"
        r="16"
        fill={palette.innerFill}
        stroke={palette.innerStroke}
        strokeWidth={innerWidth}
      />
      <path
        d="M27 36.5L33 43L46 29"
        stroke={palette.check}
        strokeWidth={checkWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="36" cy="6" r={dotRadius} fill={palette.dot} />
    </svg>
  );
}

export default ReadySetLogo;
