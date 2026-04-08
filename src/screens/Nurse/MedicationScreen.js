import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";

const MedItem = ({ patient, bed, med, dose, time, status }) => (
  <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm flex-row items-center border border-gray-50">
    <View className="flex-1">
      <View className="flex-row items-center mb-1">
        <Text className="text-sm font-bold text-gray-900">{patient}</Text>
        <Text className="text-[10px] text-gray-400 font-bold ml-2">BED {bed}</Text>
      </View>
      <Text className="text-base font-black text-blue-600">{med}</Text>
      <Text className="text-xs text-gray-500 font-medium">{dose} • {time}</Text>
    </View>
    <View className="items-center">
      <TouchableOpacity className={`h-12 w-12 rounded-2xl items-center justify-center ${status === 'Done' ? 'bg-emerald-100' : 'bg-blue-600'}`}>
        {status === 'Done' ? (
            <Ionicons name="checkmark-circle" size={28} color="#10b981" />
        ) : (
            <MaterialCommunityIcons name="pill" size={24} color="#fff" />
        )}
      </TouchableOpacity>
      <Text className={`text-[9px] font-black uppercase mt-1 ${status === 'Done' ? 'text-emerald-600' : 'text-blue-600'}`}>{status === 'Done' ? 'ADMINISTERED' : 'PENDING'}</Text>
    </View>
  </View>
);

const MedicationContent = () => {
  const schedule = [
    { id: 1, patient: "Leanne Graham", bed: "101", med: "Metformin 500mg", dose: "1 Tablet", time: "10:00 AM", status: "Done" },
    { id: 2, patient: "Ervin Howell", bed: "102", med: "Amlodipine 5mg", dose: "1 Tablet", time: "10:30 AM", status: "Pending" },
    { id: 3, patient: "Clementine Bauch", bed: "103", med: "Amoxicillin 250mg", dose: "1 Capsule", time: "11:00 AM", status: "Pending" },
    { id: 4, patient: "Patricia Lebsack", bed: "104", med: "Ibuprofen 400mg", dose: "1 Tablet", time: "12:00 PM", status: "Pending" },
  ];

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-8">
            <View>
                <Text className="text-2xl font-black text-gray-900">Medication Round</Text>
                <Text className="text-xs text-gray-500 font-medium">Shift: Morning Round</Text>
            </View>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Ionicons name="filter" size={18} color="#64748b" />
            </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mb-6">
            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-full shadow-lg shadow-blue-100">
                <Text className="text-xs font-bold text-white">Full Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-full border border-gray-100">
                <Text className="text-xs font-bold text-gray-400">Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-full border border-gray-100">
                <Text className="text-xs font-bold text-gray-400">Past Due</Text>
            </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4 px-2">Current Hourly Tasks</Text>

        {schedule.map(item => (
          <MedItem key={item.id} {...item} />
        ))}

        <View className="bg-blue-50 p-6 rounded-3xl mt-6">
            <Text className="text-blue-700 font-bold text-lg mb-2">Medication Note</Text>
            <Text className="text-[11px] text-blue-600 font-medium leading-4">Ensure all High-Alert medications are double-checked with another staff member before administration.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default function MedicationScreen() {
  return (
    <NurseLayout>
      <MedicationContent />
    </NurseLayout>
  );
}
