export type AppStyle = "dark" | "light" | "bold";

export interface StyleColors {
  backgroundColor: string;
  textColor: string;
}

export const STYLE_COLORS: Record<AppStyle, StyleColors> = {
  dark: { backgroundColor: "#0D0D18", textColor: "#FFFFFF" },
  light: { backgroundColor: "#F5F5F7", textColor: "#1D1D1F" },
  bold: { backgroundColor: "#000000", textColor: "#FFFFFF" },
} as const;

export function resolveStyleColors(style: AppStyle): StyleColors {
  return STYLE_COLORS[style];
}
