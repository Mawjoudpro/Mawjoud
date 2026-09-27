import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const IconBag = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M5 8h14l-1.2 13H6.2L5 8z" /><path d="M9 8V6.5a3 3 0 016 0V8" /></svg>
);
export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
);
export const IconMenu = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 8h18M3 16h18" /></svg>
);
export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconArrow = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);
export const IconArrowLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M20 12H4M10 6l-6 6 6 6" /></svg>
);
export const IconTag = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 12V4h8l10 10-8 8L3 12z" /><circle cx="7.5" cy="8.5" r="1.3" /></svg>
);
export const IconTruck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7z" /><circle cx="6" cy="18" r="1.7" /><circle cx="17" cy="18" r="1.7" /></svg>
);
export const IconCard = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3 10h18M7 15h3" /></svg>
);
export const IconReturn = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 9h11a5 5 0 010 10H9" /><path d="M8 5L4 9l4 4" /></svg>
);
export const IconChat = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 5h16v11H9l-5 4V5z" /></svg>
);
export const IconCube = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></svg>
);
export const IconFilter = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
);
export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconMinus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M5 12h14" /></svg>
);
export const IconReset = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.7" /><path d="M4 4v4h4" /></svg>
);
