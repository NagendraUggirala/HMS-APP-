import React from "react";
import { View, Text, TouchableOpacity, ScrollView,  } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const inventory = [
  { id: '1', name: 'Amoxicillin 500mg', stock: '250 units', status: 'In Stock', refill: 'Weekly' },
  { id: '2', name: 'Paracetamol 650mg', stock: '1,200 units', status: 'In Stock', refill: 'Daily' },
  { id: '3', name: 'Insulin (Rapid)', stock: '12 units', status: 'Low Stock', refill: 'Urgent' },
];

const PharmacyContent = () => {
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
            <Text className="text-lg font-black text-gray-900">Pharmacy Inventory</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="bandage-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {inventory.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex-row items-center">
            <View className={`h-14 w-14 ${item.status === 'Low Stock' ? 'bg-rose-100' : 'bg-emerald-100'} rounded-2xl items-center justify-center mr-4`}>
              <Ionicons name="bandage" size={28} color={item.status === 'Low Stock' ? '#ef4444' : '#10b981'} />
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">{item.name}</Text>
              <Text className="text-gray-500 text-xs">Stock Level: {item.stock}</Text>
              <View className="flex-row items-center mt-2">
                <View className={`h-2 w-2 rounded-full mr-2 ${item.status === 'Low Stock' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.status} • {item.refill} refill</Text>
              </View>
            </View>
            <TouchableOpacity className="px-3 py-1.5 bg-gray-50 rounded-xl">
              <Text className="text-[10px] font-bold text-blue-700 uppercase">Order</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const PharmacyScreen = () => (
  <AdminLayout>
    <PharmacyContent />
  </AdminLayout>
);

export default PharmacyScreen;