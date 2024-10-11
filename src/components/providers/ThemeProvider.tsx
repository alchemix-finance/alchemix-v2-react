import { lsService } from "@/lib/localStorage";
import { Theme, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

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

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [rainbowTheme, setRainbowTheme] = useState<Theme>(rainbowLightTheme);

  useEffect(() => {
    const initialDark =
      lsService.getItem(0, "theme") === "dark" ||
      (!lsService.getItem(0, "theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(initialDark);
    setRainbowTheme(initialDark ? rainbowDarkTheme : rainbowLightTheme);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleDarkModeToggle = useCallback(() => {
    setDarkMode((prevDarkMode) => {
      const newDarkMode = !prevDarkMode;
      setRainbowTheme(newDarkMode ? rainbowDarkTheme : rainbowLightTheme);
      document.documentElement.classList.toggle("dark", newDarkMode);
      lsService.setItem(0, "theme", newDarkMode ? "dark" : "light");
      return newDarkMode;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{ rainbowTheme, darkMode, handleDarkModeToggle }}
    >
      {children}
    </ThemeContext.Provider>
  );
};