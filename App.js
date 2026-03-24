import "react-native-reanimated";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./src/context/AppContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { HospitalProvider } from "./src/context/HospitalContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
        <ThemeProvider>
          <HospitalProvider>
            <AppProvider>
              <StatusBar style="light" />
              <AppNavigator />
            </AppProvider>
          </HospitalProvider>
        </ThemeProvider>
    </SafeAreaProvider>
  );
}
