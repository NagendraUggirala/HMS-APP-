import React from "react";
import { View, Text, TouchableOpacity, ScrollView, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const reports = [
  { id: '1', title: 'Monthly Revenue PDF', date: 'April 2026', type: 'Financial' },
  { id: '2', title: 'Staff Attendance', date: 'March 2026', type: 'HR' },
  { id: '3', title: 'Inventory Audit', date: 'Q1 2026', type: 'Pharmacy' },
  { id: '4', title: 'Patient Satisfaction', date: '2026', type: 'Service' },
];

const ReportsContent = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</Text>
            <Text className="text-lg font-black text-gray-900">Analytics Reports</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="bar-chart-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 items-center">
          <Ionicons name="pie-chart" size={100} color="#0052CC" style={{ opacity: 0.1 }} />
          <Text className="text-sm font-medium text-gray-500 text-center mt-4">Generating visual analytics for April...</Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">Historical Archives</Text>
        {reports.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex-row items-center">
            <View className="h-12 w-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="document-text-outline" size={24} color="#0052CC" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-gray-900">{item.title}</Text>
              <Text className="text-[10px] text-gray-500 font-medium">{item.type} • {item.date}</Text>
            </View>
            <TouchableOpacity className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center">
              <Ionicons name="download-outline" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const ReportsScreen = () => (
  <AdminLayout>
    <ReportsContent />
  </AdminLayout>
);

export default ReportsScreen;