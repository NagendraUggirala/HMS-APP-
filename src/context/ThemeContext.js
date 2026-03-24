import React, { createContext, useContext, useState } from "react";
import Constants from 'expo-constants';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const extra = Constants.expoConfig?.extra || {};
  const [theme, setTheme] = useState({
    colors: {
      primary: extra.PRIMARY_COLOR || "#1C3F60",
      secondary: extra.SECONDARY_COLOR || "#FDBA21",
      background: "#FFFFFF",
      text: "#333333",
    },
    logo: extra.LOGO_PATH || "apollo/logo.png",
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
