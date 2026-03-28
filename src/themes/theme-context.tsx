"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type LumoTokens, lumo } from "./theme-system";

/**
 * Lumo Theme Provider — canonical, no variants
 * Visual system is FROZEN (DEC-018)
 */

const LumoContext = createContext<LumoTokens>(lumo);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <LumoContext.Provider value={lumo}>
      {children}
    </LumoContext.Provider>
  );
}

export function useLumo(): LumoTokens {
  return useContext(LumoContext);
}
