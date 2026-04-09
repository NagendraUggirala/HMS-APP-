import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// User dashboards
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import ForgetScreen from "../screens/ForgetScreen";
import DoctorDashboardScreen from "../screens/Doctor/DoctorDashboardScreen";
import NurseDashboardScreen from "../screens/Nurse/NurseDashboardScreen";
import AssignedPatients from "../screens/Nurse/AssignedPatient";
import VitalsMonitoringScreen from "../screens/Nurse/VitalsMonitoringScreen";
import MedicationScreen from "../screens/Nurse/MedicationScreen";
import BedManagmentScreen from "../screens/Nurse/BedManagmentScreen";
import LabTestsUpload from "../screens/Nurse/LabTestsUpload";
import NursingNotes from "../screens/Nurse/NursingNotes";
import DischargeScreen from "../screens/Nurse/DischargeScreen";
import MyProfileScreen from "../screens/Nurse/MyProfileScreen";
import LabTechnicianDashboardScreen from "../screens/LabTechnician/LabTechnicianDashboardScreen";
import ReceptionistDashboardScreen from "../screens/Receptionist/ReceptionistDashboardScreen";
import BillingDashboardScreen from "../screens/Billing/BillingDashboardScreen";
import PharmacyDashboardScreen from "../screens/Pharmacy/PharmacyDashboardScreen";

// Receptionist specific screens
import PatientRegistrationScreen from "../screens/Receptionist/PatientRegistrationScreen";
import AppointmentSchedulingScreen from "../screens/Receptionist/AppointmentSchedulingScreen";
import PatientRecordScreen from "../screens/Receptionist/PatientRecordScreen";
import OPDManagemenntScreen from "../screens/Receptionist/OPDManagemenntScreen";
import IPDManagement from "../screens/Receptionist/IPDManagement";
import DocumentManagementScreen from "../screens/Receptionist/DocumentManagementScreen";
import BillingScreen from "../screens/Receptionist/BillingScreen";
import DischargeSummaryScreen from "../screens/Receptionist/DischargeSummaryScreen";
import ReceptionistProfileScreen from "../screens/Receptionist/MyProfileScreen";

// Doctor specific screens
import AppointmentsScreen from "../screens/Doctor/AppointmentsScreen";
import PatientRecordsScree from "../screens/Doctor/PatientRecordsScree";
import Prescriptions from "../screens/Doctor/Prescriptions";
import LabResults from "../screens/Doctor/LabResults";
import InpatientVisits from "../screens/Doctor/InpatientVisits";
import Messaging from "../screens/Doctor/Messaging";
import MyProfile from "../screens/Doctor/MyProfile";

// Admin screens
import AdminSidebarScreen from "../screens/Admin/AdminsidebarScreen";
import DashboardOverview from "../screens/Admin/DashboardScreen";
import HospitalProfile from "../screens/Admin/HospitalScreen";
import AdminProfile from "../screens/Admin/ProfileScreen";
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
import RaiseTicketScreen from "../screens/Admin/RaiseTicketScreen";
import AuditLogsScreen from "../screens/Admin/AuditLogsScreen";
import NotificationScreen from "../screens/Admin/NotificationScreen";
import NotificationDetailsScreen from "../screens/Admin/NotificationDetailsScreen";


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
        <Stack.Screen name="ForgetPassword" component={ForgetScreen} options={{ headerShown: false }} />

        {/* Admin Dashboard & Management */}
        <Stack.Screen name="HospitalAdminDashboard" component={AdminSidebarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DashboardOverview" component={DashboardOverview} options={{ headerShown: false }} />
        <Stack.Screen name="HospitalProfile" component={HospitalProfile} options={{ headerShown: false }} />
        <Stack.Screen name="AdminProfile" component={AdminProfile} options={{ headerShown: false }} />
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
        <Stack.Screen name="RaiseTicket" component={RaiseTicketScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AuditLogs" component={AuditLogsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} options={{ headerShown: false }} />


        {/* Doctor Dashboard & Management */}
        <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorAppointments" component={AppointmentsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PatientRecords" component={PatientRecordsScree} options={{ headerShown: false }} />
        <Stack.Screen name="PrescriptionManagement" component={Prescriptions} options={{ headerShown: false }} />
        <Stack.Screen name="LabResults" component={LabResults} options={{ headerShown: false }} />
        <Stack.Screen name="InpatientVisits" component={InpatientVisits} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorMessaging" component={Messaging} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorProfile" component={MyProfile} options={{ headerShown: false }} />

        {/* General User Dashboards */}
        {/* Nurse Dashboard & Management */}
        <Stack.Screen name="NurseDashboard" component={NurseDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AssignedPatients" component={AssignedPatients} options={{ headerShown: false }} />
        <Stack.Screen name="VitalsMonitoring" component={VitalsMonitoringScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MedicationSchedule" component={MedicationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BedManagement" component={BedManagmentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LabTestsUpload" component={LabTestsUpload} options={{ headerShown: false }} />
        <Stack.Screen name="NursingNotes" component={NursingNotes} options={{ headerShown: false }} />
        <Stack.Screen name="DischargeSummary" component={DischargeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NurseProfile" component={MyProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LabTechnicianDashboard" component={LabTechnicianDashboardScreen} options={{ title: "Lab Technician Dashboard" }} />
        <Stack.Screen name="ReceptionistDashboard" component={ReceptionistDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PatientRegistration" component={PatientRegistrationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AppointmentScheduling" component={AppointmentSchedulingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PatientRecord" component={PatientRecordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OPDManagement" component={OPDManagemenntScreen} options={{ headerShown: false }} />
        <Stack.Screen name="IPDManagement" component={IPDManagement} options={{ headerShown: false }} />
        <Stack.Screen name="DocumentManagement" component={DocumentManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Billing" component={BillingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReceptionistDischarge" component={DischargeSummaryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReceptionistProfile" component={ReceptionistProfileScreen} options={{ headerShown: false }} />
        
        <Stack.Screen name="BillingDashboard" component={BillingDashboardScreen} options={{ title: "Billing Dashboard" }} />
        <Stack.Screen name="PharmacyDashboard" component={PharmacyDashboardScreen} options={{ title: "Pharmacy Dashboard" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}