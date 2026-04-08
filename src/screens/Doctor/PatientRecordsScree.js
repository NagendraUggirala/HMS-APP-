import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorLayout from "./DoctorLayout";

const PatientRecordCard = ({ name, age, gender, bloodType, lastVisit }) => (
  <TouchableOpacity className="bg-white rounded-3xl p-4 mb-3 shadow-sm">
    <View className="flex-row items-center mb-4">
      <View className="width-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
        <Text className="text-blue-600 font-bold text-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">{name}</Text>
        <Text className="text-xs text-gray-500 font-medium">
          {age} yrs • {gender} • {bloodType}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </View>
    <View className="flex-row items-center pt-4 border-t border-gray-50">
      <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-2">Last Visit:</Text>
      <Text className="text-xs text-gray-600 font-bold">{lastVisit}</Text>
    </View>
  </TouchableOpacity>
);

const PatientRecordsContent = () => {
  const patients = [
    { id: 1, name: "Alice Johnson", age: 28, gender: "Female", bloodType: "O+", lastVisit: "Oct 10, 2023" },
    { id: 2, name: "Bob Smith", age: 45, gender: "Male", bloodType: "A-", lastVisit: "Sep 25, 2023" },
    { id: 3, name: "Charlie Brown", age: 10, gender: "Male", bloodType: "B+", lastVisit: "Oct 12, 2023" },
    { id: 4, name: "Diana Prince", age: 32, gender: "Female", bloodType: "AB+", lastVisit: "Oct 05, 2023" },
    { id: 5, name: "Ethan Hunt", age: 50, gender: "Male", bloodType: "O-", lastVisit: "Aug 30, 2023" },
    { id: 6, name: "Sarah Connor", age: 38, gender: "Female", bloodType: "O+", lastVisit: "Oct 15, 2023" },
  ];

  return (
    <View className="flex-1">
      <View className="bg-white px-6 pb-6 pt-2 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-black text-gray-900">Patient Records</Text>
            <TouchableOpacity><Ionicons name="filter" size={20} color="#64748b" /></TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput 
            placeholder="Search patients..." 
            className="flex-1 ml-3 text-sm text-gray-900" 
            placeholderTextColor="#94a3b8" 
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-50">
            <Text className="text-2xl font-black text-gray-900">1,248</Text>
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Records</Text>
          </View>
          <View className="flex-1 bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-200">
            <Text className="text-2xl font-black text-white">42</Text>
            <Text className="text-[10px] text-white/70 font-bold uppercase tracking-wider">New This Month</Text>
          </View>
        </View>

        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">Recently Accessed</Text>
        {patients.map(patient => (
          <PatientRecordCard key={patient.id} {...patient} />
        ))}
        
        <TouchableOpacity className="py-6 items-center">
          <Text className="text-sm font-bold text-blue-600">View All Records</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default function PatientRecordsScree() {
  return (
    <DoctorLayout>
      <PatientRecordsContent />
    </DoctorLayout>
  );
}
