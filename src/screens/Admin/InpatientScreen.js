import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const inpatients = [
  { id: '1', name: 'John Doe', room: '302-A', admission: '2026-03-28', status: 'Stable' },
  { id: '2', name: 'Jane Smith', room: '105-B', admission: '2026-03-31', status: 'Critical' },
  { id: '3', name: 'Mike Ross', room: '212-C', admission: '2026-03-30', status: 'Improving' },
];

const InpatientContent = () => {
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
            <Text className="text-lg font-black text-gray-900">Inpatient Management</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="bed-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {inpatients.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex-row items-center">
            <View className="h-14 w-14 bg-indigo-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="bed" size={28} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">{item.name}</Text>
              <Text className="text-gray-500 text-xs">Room: {item.room} • Admitted: {item.admission}</Text>
              <View className="flex-row items-center mt-2">
                <View className={`h-2 w-2 rounded-full mr-2 ${item.status === 'Critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.status}</Text>
              </View>
            </View>
            <TouchableOpacity className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center">
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const InpatientScreen = () => (
  <AdminLayout>
    <InpatientContent />
  </AdminLayout>
);

export default InpatientScreen;