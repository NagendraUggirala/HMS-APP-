import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const SettingsContent = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</Text>
            <Text className="text-lg font-black text-gray-900">System Settings</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="settings-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 mb-6">
           <Text className="text-sm font-bold text-gray-900 mb-6">GENERAL CONFIGURATION</Text>
           
           <View className="flex-row items-center justify-between mb-6">
             <View className="flex-row items-center">
               <View className="h-9 w-9 bg-blue-50 rounded-xl items-center justify-center mr-3">
                 <Ionicons name="notifications-outline" size={18} color="#0052CC" />
               </View>
               <Text className="text-sm font-medium text-gray-700">Push Notifications</Text>
             </View>
             <Switch value={true} trackColor={{ false: "#d1d5db", true: "#bfdbfe" }} thumbColor={true ? "#0052CC" : "#f4f3f4"} />
           </View>

           <View className="flex-row items-center justify-between mb-6">
             <View className="flex-row items-center">
               <View className="h-9 w-9 bg-blue-50 rounded-xl items-center justify-center mr-3">
                 <Ionicons name="shield-checkmark-outline" size={18} color="#0052CC" />
               </View>
               <Text className="text-sm font-medium text-gray-700">Two-Factor Auth</Text>
             </View>
             <Switch value={true} trackColor={{ false: "#d1d5db", true: "#bfdbfe" }} thumbColor={true ? "#0052CC" : "#f4f3f4"} />
           </View>

           <View className="flex-row items-center justify-between">
             <View className="flex-row items-center">
               <View className="h-9 w-9 bg-blue-50 rounded-xl items-center justify-center mr-3">
                 <Ionicons name="cloud-upload-outline" size={18} color="#0052CC" />
               </View>
               <Text className="text-sm font-medium text-gray-700">Auto Backup</Text>
             </View>
             <Switch value={false} trackColor={{ false: "#d1d5db", true: "#bfdbfe" }} thumbColor={false ? "#0052CC" : "#f4f3f4"} />
           </View>
        </View>

        <TouchableOpacity className="bg-rose-50 p-5 rounded-3xl items-center flex-row justify-center border border-rose-100">
           <Ionicons name="trash-outline" size={18} color="#ef4444" className="mr-2" />
           <Text className="ml-2 text-rose-600 font-bold">Wipe App Cache</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingsScreen = () => (
  <AdminLayout>
    <SettingsContent />
  </AdminLayout>
);

export default SettingsScreen;