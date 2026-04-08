import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";

const DischargeItem = ({ patient, bed, status, time }) => (
  <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-50">
    <View className="flex-row items-center justify-between mb-4">
      <View>
        <Text className="text-base font-bold text-gray-900">{patient}</Text>
        <Text className="text-xs text-gray-500 font-medium">Bed {bed}</Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${status === 'Ready' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
        <Text className={`text-[10px] font-black uppercase ${status === 'Ready' ? 'text-emerald-700' : 'text-blue-700'}`}>{status}</Text>
      </View>
    </View>

    <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#94a3b8" />
            <Text className="text-xs text-gray-500 font-medium ml-1">Etd: {time}</Text>
        </View>
        <TouchableOpacity className="flex-row items-center">
            <Text className="text-xs font-bold text-blue-600 mr-1">Checklist</Text>
            <Ionicons name="chevron-forward" size={14} color="#2563eb" />
        </TouchableOpacity>
    </View>

    <TouchableOpacity className={`py-4 rounded-xl items-center ${status === 'Ready' ? 'bg-blue-600' : 'bg-gray-100'}`}>
        <Text className={`text-xs font-bold ${status === 'Ready' ? 'text-white' : 'text-gray-400'}`}>
            {status === 'Ready' ? 'COMPLETE DISCHARGE' : 'PENDING MEDICAL CLEARANCE'}
        </Text>
    </TouchableOpacity>
  </View>
);

const DischargeContent = () => {
  const discharges = [
    { id: 1, patient: "Patricia Lebsack", bed: "104", status: "Ready", time: "11:30 AM" },
    { id: 2, patient: "Chelsey Dietrich", bed: "105", status: "Final Review", time: "02:00 PM" },
    { id: 3, patient: "Dennis Schulist", bed: "106", status: "Paperwork", time: "04:45 PM" },
  ];

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-8">
            <View>
                <Text className="text-2xl font-black text-gray-900">Patient Discharge</Text>
                <Text className="text-xs text-gray-500 font-medium">Tracking and processing final releases</Text>
            </View>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Ionicons name="filter" size={18} color="#64748b" />
            </TouchableOpacity>
        </View>

        <View className="bg-emerald-50 p-6 rounded-3xl mb-8 border border-emerald-100">
            <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text className="ml-2 text-emerald-800 font-bold text-lg">Daily Goal</Text>
            </View>
            <Text className="text-emerald-700 text-xs font-medium mb-4">2 of 5 discharges completed today.</Text>
            <View className="h-2 bg-white/50 rounded-full overflow-hidden">
                <View className="h-full bg-emerald-500" style={{ width: '40%' }} />
            </View>
        </View>

        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4 px-2">Pending Discharge Round</Text>

        {discharges.map(item => (
          <DischargeItem key={item.id} {...item} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function DischargeScreen() {
  return (
    <NurseLayout>
      <DischargeContent />
    </NurseLayout>
  );
}
