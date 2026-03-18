import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import CreateAdminScreen from "../screens/CreateAdminScreen";
import CreateDoctorScreen from "../screens/CreateDoctorScreen";
import CreateHospitalScreen from "../screens/CreateHospitalScreen";
import CreateNurseScreen from "../screens/CreateNurseScreen";
import CreatePatientScreen from "../screens/CreatePatientScreen";
import DoctorHomeScreen from "../screens/DoctorHomeScreen";
import HospitalDashboardScreen from "../screens/HospitalDashboardScreen";
import LoginScreen from "../screens/LoginScreen";
import NurseHomeScreen from "../screens/NurseHomeScreen";
import PatientHomeScreen from "../screens/PatientHomeScreen";
import SplashScreen from "../screens/SplashScreen";
import SuperAdminDashboardScreen from "../screens/SuperAdminDashboardScreen";

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#fff8ef",
    card: "#fffdf8",
    text: "#251f33",
    border: "#ece3d8",
    primary: "#7353ea",
  },
};

export default function AppNavigator() {
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
          name="SuperAdminDashboard"
          component={SuperAdminDashboardScreen}
          options={{ title: "Superadmin Dashboard" }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ title: "Admin Dashboard" }}
        />
        <Stack.Screen
          name="DoctorHome"
          component={DoctorHomeScreen}
          options={{ title: "Doctor Home" }}
        />
        <Stack.Screen
          name="NurseHome"
          component={NurseHomeScreen}
          options={{ title: "Nurse Home" }}
        />
        <Stack.Screen
          name="PatientHome"
          component={PatientHomeScreen}
          options={{ title: "Patient Home" }}
        />
        <Stack.Screen
          name="CreateHospital"
          component={CreateHospitalScreen}
          options={{ title: "Create Hospital" }}
        />
        <Stack.Screen
          name="CreateAdmin"
          component={CreateAdminScreen}
          options={{ title: "Create Admin" }}
        />
        <Stack.Screen
          name="HospitalDashboard"
          component={HospitalDashboardScreen}
          options={{ title: "Hospital Dashboard" }}
        />
        <Stack.Screen
          name="CreateDoctor"
          component={CreateDoctorScreen}
          options={{ title: "Create Doctor" }}
        />
        <Stack.Screen
          name="CreateNurse"
          component={CreateNurseScreen}
          options={{ title: "Create Nurse" }}
        />
        <Stack.Screen
          name="CreatePatient"
          component={CreatePatientScreen}
          options={{ title: "Create Patient" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
