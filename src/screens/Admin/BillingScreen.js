import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const transactions = [
  { id: '1', patient: 'John Doe', amount: '$150.00', date: '2026-04-01', status: 'Paid' },
  { id: '2', patient: 'Jane Smith', amount: '$45.00', date: '2026-04-01', status: 'Pending' },
  { id: '3', patient: 'Mike Ross', amount: '$1,200.00', date: '2026-03-31', status: 'Paid' },
  { id: '4', patient: 'Rachel Zane', amount: '$350.00', date: '2026-03-31', status: 'Failed' },
];

const BillingContent = () => {
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
            <Text className="text-lg font-black text-gray-900">Billing & Finance</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="card-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-blue-600 rounded-3xl p-6 mb-8 shadow-lg shadow-blue-200">
          <Text className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Total Daily Revenue</Text>
          <Text className="text-white text-3xl font-black mt-1">$12,450.00</Text>
          <View className="flex-row items-center mt-4">
            <Ionicons name="trending-up" size={16} color="#10b981" />
            <Text className="text-emerald-300 text-xs font-bold ml-1">+8.4% from yesterday</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</Text>
        {transactions.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex-row items-center">
            <View className="h-12 w-12 bg-gray-50 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="receipt-outline" size={24} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-gray-900">{item.patient}</Text>
              <Text className="text-[10px] text-gray-500 font-medium">{item.date}</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-bold text-gray-900">{item.amount}</Text>
              <View className={`px-2 py-0.5 rounded-md mt-1 ${item.status === 'Paid' ? 'bg-emerald-50' : item.status === 'Failed' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                <Text className={`text-[8px] font-bold uppercase ${item.status === 'Paid' ? 'text-emerald-600' : item.status === 'Failed' ? 'text-rose-600' : 'text-amber-600'}`}>{item.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const BillingScreen = () => (
  <AdminLayout>
    <BillingContent />
  </AdminLayout>
);

export default BillingScreen;