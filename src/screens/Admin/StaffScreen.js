import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const staff = [
  { id: '1', name: 'Alice Johnson', role: 'Nurse Manager', department: 'Emergency', status: 'On Shift' },
  { id: '2', name: 'Robert Smith', role: 'Lab Tech', department: 'Diagnostics', status: 'Off Duty' },
  { id: '3', name: 'Linda Davis', role: 'Receptionist', department: 'Front Desk', status: 'On Shift' },
  { id: '4', name: 'Mark Wilson', role: 'IT Support', department: 'IT', status: 'Remote' },
];

const StaffContent = () => {
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
            <Text className="text-lg font-black text-gray-900">Hospital Staff</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="person-add" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {staff.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex-row items-center">
            <View className="h-14 w-14 bg-blue-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="people" size={28} color="#0052CC" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">{item.name}</Text>
              <Text className="text-gray-500 text-xs">{item.role} • {item.department}</Text>
              <View className="flex-row items-center mt-2">
                <View className={`h-2 w-2 rounded-full mr-2 ${item.status === 'On Shift' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.status}</Text>
              </View>
            </View>
            <TouchableOpacity className="px-4 py-2 bg-gray-50 rounded-xl items-center justify-center">
              <Text className="text-xs font-bold text-blue-700">PROFILE</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const StaffScreen = () => (
  <AdminLayout>
    <StaffContent />
  </AdminLayout>
);

export default StaffScreen;