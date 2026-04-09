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
      className={`ml-4 text-sm font-semibold ${
        isActive ? "text-blue-600" : "text-gray-600"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const ReceptionistSidebar = ({ onClose }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { logout, currentUser } = useAppContext();

  const activeRoute = route.name;

  const receptionistMenu = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'grid-outline', screen: 'ReceptionistDashboard' },
    { id: 'registration', label: 'Patient Registration', icon: 'person-add-outline', screen: 'PatientRegistration' },
    { id: 'scheduling', label: 'Appointment Scheduling', icon: 'calendar-outline', screen: 'AppointmentScheduling' },
    { id: 'records', label: 'Patient Records', icon: 'folder-open-outline', screen: 'PatientRecord' },
    { id: 'opd', label: 'OPD Management', icon: 'medical-outline', screen: 'OPDManagement' },
    { id: 'ipd', label: 'IPD Management', icon: 'bed-outline', screen: 'IPDManagement' },
    { id: 'documents', label: 'Document Management', icon: 'document-text-outline', screen: 'DocumentManagement' },
    { id: 'billing', label: 'Billing', icon: 'cash-outline', screen: 'Billing' },
    { id: 'discharge', label: 'Discharge Summary', icon: 'exit-outline', screen: 'ReceptionistDischarge' },
    { id: 'profile', label: 'My Profile', icon: 'person-circle-outline', screen: 'ReceptionistProfile' },
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
        <View className="px-6 py-6 border-b border-gray-50">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-xl font-black text-gray-900 tracking-tight">Reception Desk</Text>
              <View className="h-1 w-8 bg-blue-600 rounded-full mt-1" />
            </View>
            <TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* User Profile Info in Sidebar */}
          <TouchableOpacity 
            onPress={() => handlePress('ReceptionistProfile')}
            className="flex-row items-center p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50"
          >
            <View className="h-12 w-12 rounded-full bg-blue-600 items-center justify-center shadow-lg shadow-blue-200">
              <Text className="text-white font-bold text-lg">
                {currentUser?.name?.substring(0, 1).toUpperCase() || "N"}
              </Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                {currentUser?.name || "Nagendra Uggirala"}
              </Text>
              <Text className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Senior Receptionist</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {receptionistMenu.map((item) => (
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

export default ReceptionistSidebar;
