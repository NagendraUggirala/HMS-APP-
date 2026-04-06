import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";
import { useAppContext } from "../../context/AppContext";

const ProfileContent = () => {
  const { toggleSidebar } = useSidebar();
  const { currentUser } = useAppContext();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account</Text>
            <Text className="text-lg font-black text-gray-900">Admin Profile</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 items-center mb-8">
          <View className="h-24 w-24 bg-blue-600 rounded-[30px] items-center justify-center mb-5 shadow-lg shadow-blue-200">
            <Text className="text-white font-black text-3xl">{currentUser?.name?.charAt(0) || "A"}</Text>
          </View>
          <Text className="text-2xl font-black text-gray-900">{currentUser?.name || "Navin Kumar"}</Text>
          <Text className="text-blue-600 font-bold text-sm tracking-widest uppercase mt-1">Super Administrator</Text>

          <View className="flex-row mt-6 w-full justify-around border-t border-gray-50 pt-6">
            <View className="items-center">
              <Text className="text-lg font-black text-gray-900">ID-204</Text>
              <Text className="text-[10px] font-bold text-gray-400 uppercase">Employee ID</Text>
            </View>
            <View className="h-full w-[1px] bg-gray-100" />
            <View className="items-center">
              <Text className="text-lg font-black text-gray-900">Tier 1</Text>
              <Text className="text-[10px] font-bold text-gray-400 uppercase">Access Level</Text>
            </View>
          </View>
        </View>

        {/* Contact Info Group */}
        <View className="space-y-4">
          {/* ... Contact fields (Email, Phone, Dept) ... */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileScreen = () => (
  <AdminLayout>
    <ProfileContent />
  </AdminLayout>
);

export default ProfileScreen;
