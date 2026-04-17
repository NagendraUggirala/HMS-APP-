import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";

const SidebarItem = ({ label, icon, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mx-4 mb-1 flex-row items-center rounded-xl px-4 py-3 ${
      isActive ? "bg-blue-50" : "bg-transparent"
    }`}
    activeOpacity={0.7}
  >
    <Ionicons
      name={icon}
      size={20}
      color={isActive ? "#2563eb" : "#64748b"}
    />
    <Text
      className={`ml-3 text-sm font-semibold ${
        isActive ? "text-blue-600" : "text-gray-600"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const DoctorSidebar = ({ onClose }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { logout } = useAppContext();

  const activeRoute = route.name;

  const doctorMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline', screen: 'DoctorDashboard' },
    { id: 'appointments', label: 'Appointments', icon: 'calendar-outline', screen: 'DoctorAppointments' },
    { id: 'records', label: 'Patient Records', icon: 'people-outline', screen: 'PatientRecords' },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'medical-outline', screen: 'PrescriptionManagement' },
    { id: 'lab', label: 'Lab Results', icon: 'flask-outline', screen: 'LabResults' },
    { id: 'inpatient', label: 'Inpatient Visits', icon: 'bed-outline', screen: 'InpatientVisits' },
    { id: 'messaging', label: 'Messaging', icon: 'chatbubble-ellipses-outline', screen: 'DoctorMessaging' },
    { id: 'profile', label: 'My Profile', icon: 'person-outline', screen: 'DoctorProfile' },
    { id: 'scheduling', label: 'Scheduling', icon: 'time-outline', screen: 'SchedulingManagement' },
    { id: 'tickets', label: 'Raise Ticket', icon: 'help-circle-outline', screen: 'DoctorRaiseTicket' },
  ];

  const handlePress = (screen) => {
    try {
      navigation.navigate(screen);
    } catch (e) {
      console.warn(`Screen ${screen} not found`);
    }
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-1">
        {/* Sidebar Header */}
        <View className="px-6 py-6 border-b border-gray-50 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-800">Doctor Dashboard</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {doctorMenu.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeRoute === item.screen}
              onPress={() => handlePress(item.screen)}
            />
          ))}
        </ScrollView>

        {/* Footer */}
        <View className="p-4 border-t border-gray-50">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center px-4 py-3 rounded-xl bg-rose-50"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="ml-3 text-sm font-bold text-rose-600">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DoctorSidebar;
