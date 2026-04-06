import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// User dashboards
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import DoctorDashboardScreen from "../screens/Doctor/DoctorDashboardScreen";
import NurseDashboardScreen from "../screens/Nurse/NurseDashboardScreen";
import LabTechnicianDashboardScreen from "../screens/LabTechnician/LabTechnicianDashboardScreen";
import ReceptionistDashboardScreen from "../screens/Receptionist/ReceptionistDashboardScreen";
import BillingDashboardScreen from "../screens/Billing/BillingDashboardScreen";
import PharmacyDashboardScreen from "../screens/Pharmacy/PharmacyDashboardScreen";

// Admin screens
import AdminSidebarScreen from "../screens/Admin/AdminsidebarScreen";
import DashboardOverview from "../screens/Admin/DashboardScreen";
import HospitalProfile from "../screens/Admin/HospitalScreen";
import DoctorManagement from "../screens/Admin/DocterScreen";
import StaffManagement from "../screens/Admin/StaffScreen";
import DepartmentManagement from "../screens/Admin/DepartmentsScreen";
import AssignDepartments from "../screens/Admin/AssignDepartmentsScreen";
import AppointmentManagement from "../screens/Admin/AppointmentsScreen";
import BillingManagement from "../screens/Admin/BillingScreen";
import InpatientManagement from "../screens/Admin/InpatientScreen";
import PharmacyManagement from "../screens/Admin/PharmacyScreen";
import LabManagement from "../screens/Admin/LabScreen";
import ReportsManagement from "../screens/Admin/ReportsScreen";
import SettingsManagement from "../screens/Admin/SettingsScreen";


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
          headerStyle: { backgroundColor: "#fffdf8" },
          headerTintColor: "#251f33",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#fff8ef" },
        }}
      >
        {/* Public / Entry Screens */}
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

        {/* Admin Dashboard & Management */}
        <Stack.Screen name="HospitalAdminDashboard" component={AdminSidebarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DashboardOverview" component={DashboardOverview} options={{ headerShown: false }} />
        <Stack.Screen name="HospitalProfile" component={HospitalProfile} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorManagement" component={DoctorManagement} options={{ headerShown: false }} />
        <Stack.Screen name="StaffManagement" component={StaffManagement} options={{ headerShown: false }} />
        <Stack.Screen name="DepartmentManagement" component={DepartmentManagement} options={{ headerShown: false }} />
        <Stack.Screen name="AssignDepartments" component={AssignDepartments} options={{ headerShown: false }} />
        <Stack.Screen name="AppointmentManagement" component={AppointmentManagement} options={{ headerShown: false }} />
        <Stack.Screen name="BillingManagement" component={BillingManagement} options={{ headerShown: false }} />
        <Stack.Screen name="InpatientManagement" component={InpatientManagement} options={{ headerShown: false }} />
        <Stack.Screen name="PharmacyManagement" component={PharmacyManagement} options={{ headerShown: false }} />
        <Stack.Screen name="LabManagement" component={LabManagement} options={{ headerShown: false }} />
        <Stack.Screen name="ReportsManagement" component={ReportsManagement} options={{ headerShown: false }} />
        <Stack.Screen name="SettingsManagement" component={SettingsManagement} options={{ headerShown: false }} />


        {/* General User Dashboards */}
        <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} options={{ title: "Doctor Dashboard" }} />
        <Stack.Screen name="NurseDashboard" component={NurseDashboardScreen} options={{ title: "Nurse Dashboard" }} />
        <Stack.Screen name="LabTechnicianDashboard" component={LabTechnicianDashboardScreen} options={{ title: "Lab Technician Dashboard" }} />
        <Stack.Screen name="ReceptionistDashboard" component={ReceptionistDashboardScreen} options={{ title: "Receptionist Dashboard" }} />
        <Stack.Screen name="BillingDashboard" component={BillingDashboardScreen} options={{ title: "Billing Dashboard" }} />
        <Stack.Screen name="PharmacyDashboard" component={PharmacyDashboardScreen} options={{ title: "Pharmacy Dashboard" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}