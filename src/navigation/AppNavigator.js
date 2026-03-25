import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BillingDashboardScreen from "../screens/Billing/BillingDashboardScreen";
import DoctorDashboardScreen from "../screens/Doctor/DoctorDashboardScreen";
import LabTechnicianDashboardScreen from "../screens/LabTechnician/LabTechnicianDashboardScreen";
import LoginScreen from "../screens/LoginScreen";
import NurseDashboardScreen from "../screens/Nurse/NurseDashboardScreen";
import PharmacyDashboardScreen from "../screens/Pharmacy/PharmacyDashboardScreen";
import ReceptionistDashboardScreen from "../screens/Receptionist/ReceptionistDashboardScreen";
import SplashScreen from "../screens/SplashScreen";
import HospitalAdminDashboardScreen from "../screens/SuperAdmin/HospitalAdminDashboardScreen";
import { useTheme } from "../context/ThemeContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#fff8ef",
      card: "#fffdf8",
      text: "#251f33",
      border: "#ece3d8",
      primary: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fffdf8",
          },
          headerTintColor: "#251f33",
          headerTitleStyle: {
            fontWeight: "700",
          },
          contentStyle: {
            backgroundColor: "#fff8ef",
          },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HospitalAdminDashboard"
          component={HospitalAdminDashboardScreen}
          options={{ title: "Hospital Admin Dashboard" }}
        />
        <Stack.Screen
          name="DoctorDashboard"
          component={DoctorDashboardScreen}
          options={{ title: "Doctor Dashboard" }}
        />
        <Stack.Screen
          name="NurseDashboard"
          component={NurseDashboardScreen}
          options={{ title: "Nurse Dashboard" }}
        />
        <Stack.Screen
          name="LabTechnicianDashboard"
          component={LabTechnicianDashboardScreen}
          options={{ title: "Lab Technician Dashboard" }}
        />
        <Stack.Screen
          name="ReceptionistDashboard"
          component={ReceptionistDashboardScreen}
          options={{ title: "Receptionist Dashboard" }}
        />
        <Stack.Screen
          name="BillingDashboard"
          component={BillingDashboardScreen}
          options={{ title: "Billing Dashboard" }}
        />
        <Stack.Screen
          name="PharmacyDashboard"
          component={PharmacyDashboardScreen}
          options={{ title: "Pharmacy Dashboard" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
