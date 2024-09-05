import { createContext, useCallback, useContext, useState } from "react";

import { lsService } from "@/lib/localStorage";
import { SupportedCurrency } from "@/lib/types";

interface SettingsStore {
  currency: SupportedCurrency;
  handleCurrencyChange: () => void;
}

const defaultValue: SettingsStore = {
  currency: "USD",
  handleCurrencyChange: () => {},
};

const SettingsContext = createContext(defaultValue);

export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const initialCurrency = lsService.getItem(0, "currency");
  const [currency, setCurrency] = useState<SupportedCurrency>(
    initialCurrency ?? defaultValue.currency,
  );

  const handleCurrencyChange = useCallback(() => {
    if (currency === "USD") {
      setCurrency("ETH");
      lsService.setItem(0, "currency", "ETH");
      return;
    }
    setCurrency("USD");
    lsService.setItem(0, "currency", "USD");
  }, [currency]);

  return (
    <SettingsContext.Provider value={{ currency, handleCurrencyChange }}>
      {children}
    </SettingsContext.Provider>
  );
};
