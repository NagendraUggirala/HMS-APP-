import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

const NurseSidebar = ({ onClose }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { logout, currentUser } = useAppContext();

  const activeRoute = route.name;

  const nurseMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline', screen: 'NurseDashboard' },
    { id: 'patients', label: 'Assigned Patients', icon: 'people-outline', screen: 'AssignedPatients' },
    { id: 'vitals', label: 'Vitals Monitoring', icon: 'pulse-outline', screen: 'VitalsMonitoring' },
    { id: 'medication', label: 'Medication Schedule', icon: 'medkit-outline', screen: 'MedicationSchedule' },
    { id: 'beds', label: 'Bed Management', icon: 'bed-outline', screen: 'BedManagement' },
    { id: 'lab', label: 'Lab Tests & Upload', icon: 'flask-outline', screen: 'LabTestsUpload' },
    { id: 'notes', label: 'Nursing Notes', icon: 'document-text-outline', screen: 'NursingNotes' },
    { id: 'discharge', label: 'Discharge Summary', icon: 'exit-outline', screen: 'DischargeSummary' },
    { id: 'profile', label: 'My Profile', icon: 'person-outline', screen: 'NurseProfile' },
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
          <Text className="text-lg font-bold text-gray-800">Nurse Dashboard</Text>
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
          {nurseMenu.map((item) => (
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

export default NurseSidebar;
