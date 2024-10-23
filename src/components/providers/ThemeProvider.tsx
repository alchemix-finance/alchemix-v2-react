import { lsService } from "@/lib/localStorage";
import { Theme, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { createContext, useCallback, useContext, useState } from "react";

interface ThemeStore {
  rainbowTheme: Theme;
  darkMode: boolean;
  handleDarkModeToggle: () => void;
}

const lightThemeNoBorderRadius = lightTheme({
  borderRadius: "none",
});
const darkThemeNoBorderRadius = darkTheme({
  borderRadius: "none",
});

export const rainbowLightTheme = {
  ...lightThemeNoBorderRadius,
  fonts: {
    body: "Montserrat",
  },
  shadows: {
    connectButton: "none",
    dialog: "none",
    profileDetailsAction: "none",
    selectedOption: "none",
    selectedWallet: "none",
    walletLogo: "none",
  },
  colors: {
    ...lightThemeNoBorderRadius.colors,
    accentColor: "#0a3a60",
    accentColorForeground: "#dcd7cc",
    connectButtonBackground: "#DEDBD3",
    connectButtonInnerBackground: "#E8E4DB",
    modalBackground: "#D6D2C6",
    modalBorder: "#DEDBD3",
    modalText: "#000",
    modalTextSecondary: "#68645d",
    profileAction: "#dcd7cc",
    profileActionHover: "#DEDBD3",
  },
} as const satisfies Theme;

export const rainbowDarkTheme = {
  ...darkThemeNoBorderRadius,
  fonts: {
    body: "Montserrat",
  },
  shadows: {
    connectButton: "none",
    dialog: "none",
    profileDetailsAction: "none",
    selectedOption: "none",
    selectedWallet: "none",
    walletLogo: "none",
  },
  colors: {
    ...darkThemeNoBorderRadius.colors,
    accentColor: "#F5C59F",
    accentColorForeground: "#232833",
    connectButtonBackground: "#20242C",
    connectButtonInnerBackground: "#171B24",
    modalBackground: "#282D3A",
    modalBorder: "#20242C",
    modalTextSecondary: "#979BA2",
    profileAction: "#232833",
    profileActionHover: "#20242C",
  },
} as const satisfies Theme;

const defaultValue: ThemeStore = {
  rainbowTheme: rainbowLightTheme,
  darkMode: false,
  handleDarkModeToggle: () => {},
};

const ThemeContext = createContext(defaultValue);

export const useTheme = () => {
  return useContext(ThemeContext);
};

// Whenever the user explicitly chooses to respect the OS preference
// localStorage.removeItem("theme");

let initialHandled = false;

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const initialDark =
    lsService.getItem(0, "theme") === "dark" ||
    (!lsService.getItem(0, "theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (initialDark && !initialHandled) {
    document.documentElement.classList.add("dark");
    initialHandled = true;
  }

  const [darkMode, setDarkMode] = useState<boolean>(initialDark);

  const [rainbowTheme, setRainbowTheme] = useState<Theme>(
    initialDark ? rainbowDarkTheme : rainbowLightTheme,
  );

  const handleDarkModeToggle = useCallback(() => {
    if (darkMode === false) {
      setDarkMode(true);
      setRainbowTheme(rainbowDarkTheme);
      document.documentElement.classList.add("dark");
      lsService.setItem(0, "theme", "dark");
      return;
    }
    setDarkMode(false);
    setRainbowTheme(rainbowLightTheme);
    document.documentElement.classList.remove("dark");
    lsService.setItem(0, "theme", "light");
  }, [darkMode]);

  return (
    <ThemeContext.Provider
      value={{ rainbowTheme, darkMode, handleDarkModeToggle }}
    >
      {children}
    </ThemeContext.Provider>
  );
};