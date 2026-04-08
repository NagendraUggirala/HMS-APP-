import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DoctorLayout from "./DoctorLayout";

const PrescriptionItem = ({ patientName, medicine, dosage, duration, date, active }) => (
  <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm">
    <View className="flex-row items-center mb-4">
      <View className="width-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
        <MaterialCommunityIcons name="pill" size={24} color="#2563eb" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">{medicine}</Text>
        <Text className="text-xs text-gray-500 font-medium">{patientName}</Text>
      </View>
      <View className={`px-2 py-1 rounded-md ${active ? 'bg-emerald-50' : 'bg-gray-100'}`}>
        <Text className={`text-[9px] font-black uppercase ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
          {active ? 'Active' : 'Completed'}
        </Text>
      </View>
    </View>

    <View className="flex-row justify-between py-3 border-t border-b border-gray-50 mb-4">
      <View className="flex-row items-center">
        <Ionicons name="time-outline" size={14} color="#94a3b8" />
        <Text className="text-[10px] text-gray-500 font-bold ml-1 uppercase">{dosage}</Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
        <Text className="text-[10px] text-gray-500 font-bold ml-1 uppercase">{duration}</Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
        <Text className="text-[10px] text-gray-400 font-bold ml-1 uppercase">{date}</Text>
      </View>
    </View>

    <View className="flex-row gap-3">
      <TouchableOpacity className="flex-1 py-3 rounded-xl bg-gray-50 flex-row items-center justify-center">
        <Ionicons name="repeat-outline" size={16} color="#64748b" />
        <Text className="text-xs font-bold text-gray-500 ml-2">Renew</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 py-3 rounded-xl bg-blue-50 flex-row items-center justify-center">
        <Ionicons name="create-outline" size={16} color="#2563eb" />
        <Text className="text-xs font-bold text-blue-600 ml-2">Edit</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const PrescriptionsContent = () => {
  const prescriptions = [
    { id: 1, patientName: "Sarah Connor", medicine: "Amlodipine 5mg", dosage: "Once daily", duration: "30 Days", date: "Oct 12, 2023", active: true },
    { id: 2, patientName: "John Smith", medicine: "Amoxicillin 500mg", dosage: "Three times daily", duration: "7 Days", date: "Oct 14, 2023", active: true },
    { id: 3, patientName: "Michael Brown", medicine: "Metformin 500mg", dosage: "Twice daily", duration: "90 Days", date: "Sep 01, 2023", active: false },
    { id: 4, patientName: "Emily Davis", medicine: "Ibuprofen 400mg", dosage: "As needed", duration: "14 Days", date: "Oct 15, 2023", active: true },
  ];

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-black text-gray-900">Prescriptions</Text>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 mb-6">
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput 
            placeholder="Search prescriptions..." 
            className="flex-1 ml-3 text-sm text-gray-900" 
            placeholderTextColor="#94a3b8" 
          />
        </View>

        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-xs font-bold text-white">All</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white px-4 py-2 rounded-full border border-gray-100">
            <Text className="text-xs font-bold text-gray-400">Active</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white px-4 py-2 rounded-full border border-gray-100">
            <Text className="text-xs font-bold text-gray-400">Recent</Text>
          </TouchableOpacity>
        </View>

        {prescriptions.map(item => (
          <PrescriptionItem key={item.id} {...item} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function Prescriptions() {
  return (
    <DoctorLayout>
      <PrescriptionsContent />
    </DoctorLayout>
  );
}
