import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SidebarItem = ({ label, icon, isActive, onPress, color = "#0052CC" }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mx-4 mb-2 flex-row items-center rounded-2xl px-4 py-4 ${
      isActive ? "bg-blue-50" : "bg-transparent"
    }`}
    activeOpacity={0.7}
  >
    <View
      className={`h-10 w-10 items-center justify-center rounded-xl ${
        isActive ? "bg-blue-600" : "bg-gray-100"
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isActive ? "white" : "#64748b"}
      />
    </View>
    <Text
      className={`ml-3 text-sm font-bold ${
        isActive ? "text-blue-700" : "text-gray-600"
      }`}
    >
      {label}
    </Text>
    {isActive && (
      <View className="absolute right-4 h-1.5 w-1.5 rounded-full bg-blue-600" />
    )}
  </TouchableOpacity>
);

const Sidebar = ({ onClose }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { logout, currentUser } = useAppContext();

  // Find which screen is active based on navigation state or local state
  // For now we use the route name if available
  const activeRoute = route.name;

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'grid-outline', screen: 'DashboardOverview' },
    { id: 'profile', label: 'Hospital Profile', icon: 'business-outline', screen: 'HospitalProfile' },
    { id: 'doctors', label: 'Doctor Management', icon: 'medical-outline', screen: 'DoctorManagement' },
    { id: 'staff', label: 'Staff Management', icon: 'people-outline', screen: 'StaffManagement' },
    { id: 'departments', label: 'Departments', icon: 'layers-outline', screen: 'DepartmentManagement' },
    { id: 'appointments', label: 'Appointments', icon: 'calendar-outline', screen: 'AppointmentManagement' },
    { id: 'billing', label: 'Billing & Finance', icon: 'card-outline', screen: 'BillingManagement' },
    { id: 'pharmacy', label: 'Pharmacy', icon: 'bandage-outline', screen: 'PharmacyManagement' },
    { id: 'lab', label: 'LAB & Diagnostics', icon: 'flask-outline', screen: 'LabManagement' },
    { id: 'reports', label: 'Analytics Reports', icon: 'bar-chart-outline', screen: 'ReportsManagement' },
    { id: 'settings', label: 'System Settings', icon: 'settings-outline', screen: 'SettingsManagement' }
  ];

  const handlePress = (screen) => {
    navigation.navigate(screen);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-1 py-6">
        {/* Sidebar Header */}
        <View className="px-6 mb-8 mt-4">
          <View className="flex-row items-center mb-6">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-300">
              <MaterialCommunityIcons name="hospital-building" size={24} color="white" />
            </View>
            <View className="ml-3">
              <Text className="text-lg font-black text-gray-900 tracking-tight">Clinical</Text>
              <Text className="text-sm font-bold text-blue-600 -mt-1">Curator Admin</Text>
            </View>
          </View>
          
          <View className="flex-row items-center p-3 bg-gray-50 rounded-2xl">
            <View className="h-10 w-10 rounded-full bg-blue-100 items-center justify-center">
              <Text className="text-blue-700 font-bold text-lg">
                {currentUser?.name?.charAt(0) || "A"}
              </Text>
            </View>
            <View className="ml-3">
              <Text className="text-xs font-bold text-gray-900" numberOfLines={1}>
                {currentUser?.name || "Admin User"}
              </Text>
              <Text className="text-[10px] text-gray-500 font-medium">Administrator</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {adminMenu.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeRoute === item.screen}
              onPress={() => handlePress(item.screen)}
            />
          ))}
        </ScrollView>

        {/* Footer / Logout */}
        <View className="px-4 mt-4 pt-4 border-t border-gray-100">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center px-4 py-4 rounded-2xl bg-rose-50"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text className="ml-3 text-sm font-bold text-rose-600">Logout Session</Text>
          </TouchableOpacity>
          <Text className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest">
            v1.0.4 • Stable
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Sidebar;
