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
    className={`mx-4 mb-2 flex-row items-center rounded-2xl px-4 py-4 ${isActive ? "bg-blue-50" : "bg-transparent"
      }`}
    activeOpacity={0.7}
  >
    <View
      className={`h-10 w-10 items-center justify-center rounded-xl ${isActive ? "bg-blue-600" : "bg-gray-100"
        }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isActive ? "white" : "#64748b"}
      />
    </View>
    <Text
      className={`ml-3 text-sm font-bold ${isActive ? "text-blue-700" : "text-gray-600"
        }`}
    >
      {label}
    </Text>
    {isActive && (
      <View className="absolute right-4 h-1.5 w-1.5 rounded-full bg-blue-600" />
    )}
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
      <View className="flex-1 py-6">
        {/* Sidebar Header */}
        <View className="px-6 mb-8 mt-4">
          <View className="flex-row items-center mb-6">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-300">
              <MaterialCommunityIcons name="heart-pulse" size={24} color="white" />
            </View>
            <View className="ml-3">
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#111827' }} className="tracking-tight">Clinical</Text>
              <Text className="text-sm font-bold text-blue-600 -mt-1">Curator Nurse</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ position: 'absolute', right: 0 }}>
                <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => handlePress('NurseProfile')}
            className="flex-row items-center p-3 bg-gray-50 rounded-2xl"
          >
            <View className="h-10 w-10 rounded-full bg-blue-100 items-center justify-center">
              <Text className="text-blue-700 font-bold text-lg">
                {currentUser?.name?.charAt(0) || "N"}
              </Text>
            </View>
            <View className="ml-3">
              <Text className="text-xs font-bold text-gray-900" numberOfLines={1}>
                {currentUser?.name || "Nurse"}
              </Text>
              <Text className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Nursing Professional</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <ScrollView
          showsVerticalScrollIndicator={false}
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

export default NurseSidebar;
