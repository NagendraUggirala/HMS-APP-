import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");

const ProfileContent = () => {
  const { toggleSidebar } = useSidebar();
  const { currentUser } = useAppContext();

  const ProfileMetric = ({ label, value, icon, color }) => (
    <View className="flex-1 bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm items-center">
      <View
        className="h-10 w-10 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: `${color}10` }}
      >
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</Text>
      <Text className="text-base font-black text-gray-900 mt-1">{value}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Reverted Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={toggleSidebar}
            className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50"
          >
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account</Text>
            <Text className="text-lg font-black text-gray-900">Admin Profile</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      >
        {/* Profile Identity Card */}
        <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 items-center mb-8 relative">
          <View className="relative mb-6">
            <View className="h-28 w-28 bg-indigo-600 rounded-[36px] items-center justify-center shadow-xl shadow-indigo-200">
              <Text className="text-white font-black text-4xl">{currentUser?.name?.charAt(0) || "A"}</Text>
            </View>
            <View className="absolute -bottom-1 -right-1 h-9 w-9 bg-emerald-500 rounded-xl border-4 border-white items-center justify-center">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </View>

          <Text className="text-2xl font-black text-gray-900 tracking-tight">
            {currentUser?.name || "Navin Kumar"}
          </Text>
          <Text className="text-indigo-600 font-bold text-[10px] tracking-[4px] uppercase mt-2">Super Administrator</Text>

          <View className="flex-row mt-8 gap-4 w-full">
            <ProfileMetric label="Node ID" value="ADM-204" icon="hash" color="#6366F1" />
            <ProfileMetric label="Tier" value="Level 1" icon="shield" color="#10B981" />
          </View>
        </View>

        {/* Access Privileges */}
        <View className="mb-8">
          <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-4 ml-1">Secure Access</Text>
          <View className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="h-10 w-10 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                <Feather name="lock" size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm">Biometric Authentication</Text>
                <Text className="text-gray-400 text-[10px] font-bold uppercase mt-0.5">Device secure</Text>
              </View>
              <View className="h-6 w-10 bg-emerald-500 rounded-full items-center justify-center">
                <View className="h-4 w-4 bg-white rounded-full ml-3" />
              </View>
            </View>
            <View className="h-[1px] bg-gray-50 w-full mb-4" />
            <View className="flex-row items-center">
              <View className="h-10 w-10 bg-indigo-50 rounded-xl items-center justify-center mr-4">
                <Feather name="activity" size={18} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm">Last Session Audit</Text>
                <Text className="text-gray-400 text-[10px] font-bold uppercase mt-0.5">2 min ago • Hyderabad, IN</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </View>
          </View>
        </View>

        {/* Small Logout Action */}
        <TouchableOpacity className="bg-gray-900 h-12 w-48 self-center rounded-2xl items-center justify-center flex-row shadow-lg mt-4">
          <Feather name="log-out" size={16} color="white" />
          <Text className="text-white font-black text-[10px] ml-2 tracking-[1px] uppercase">Secure Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const ProfileScreen = () => (
  <AdminLayout>
    <ProfileContent />
  </AdminLayout>
);

export default ProfileScreen;
