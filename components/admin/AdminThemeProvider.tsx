"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AdminThemePalette = "burgundy" | "indigo" | "emerald" | "rose" | "amber";
export type AdminThemeMode = "day" | "night";

interface AdminThemeContextType {
  palette: AdminThemePalette;
  mode: AdminThemeMode;
  searchQuery: string;
  isCustomizerOpen: boolean;
  setPalette: (p: AdminThemePalette) => void;
  setMode: (m: AdminThemeMode) => void;
  setSearchQuery: (q: string) => void;
  setIsCustomizerOpen: (open: boolean) => void;
  toggleCustomizer: () => void;
  toggleMode: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  palette: "burgundy",
  mode: "day",
  searchQuery: "",
  isCustomizerOpen: false,
  setPalette: () => {},
  setMode: () => {},
  setSearchQuery: () => {},
  setIsCustomizerOpen: () => {},
  toggleCustomizer: () => {},
  toggleMode: () => {}
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<AdminThemePalette>("burgundy");
  const [mode, setModeState] = useState<AdminThemeMode>("day");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedPalette = localStorage.getItem("nilasa_admin_palette") as AdminThemePalette;
      const savedMode = localStorage.getItem("nilasa_admin_mode") as AdminThemeMode;
      if (savedPalette && ["burgundy", "indigo", "emerald", "rose", "amber"].includes(savedPalette)) {
        setPaletteState(savedPalette);
      }
      if (savedMode && ["day", "night"].includes(savedMode)) {
        setModeState(savedMode);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-admin-theme", palette);
      document.documentElement.setAttribute("data-admin-mode", mode);
    }
  }, [palette, mode]);

  const setPalette = (p: AdminThemePalette) => {
    setPaletteState(p);
    try {
      localStorage.setItem("nilasa_admin_palette", p);
    } catch {}
  };

  const setMode = (m: AdminThemeMode) => {
    setModeState(m);
    try {
      localStorage.setItem("nilasa_admin_mode", m);
    } catch {}
  };

  const toggleMode = () => {
    const next = mode === "day" ? "night" : "day";
    setMode(next);
  };

  const toggleCustomizer = () => {
    setIsCustomizerOpen((prev) => !prev);
  };

  return (
    <AdminThemeContext.Provider
      value={{
        palette,
        mode,
        searchQuery,
        isCustomizerOpen,
        setPalette,
        setMode,
        setSearchQuery,
        setIsCustomizerOpen,
        toggleCustomizer,
        toggleMode
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
