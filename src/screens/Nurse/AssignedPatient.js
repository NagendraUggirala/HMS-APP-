import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";

const PatientCard = ({ name, age, gender, bed, condition, admissionDate }) => (
  <TouchableOpacity className="bg-white rounded-3xl p-4 mb-4 shadow-sm">
    <View className="flex-row items-center mb-4">
      <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
        <Text className="text-blue-600 font-bold text-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">{name}</Text>
        <Text className="text-xs text-gray-500 font-medium">
          {age} yrs • {gender} • Bed {bed}
        </Text>
      </View>
      <View className={`px-2 py-1 rounded-md ${condition === 'Critical' ? 'bg-rose-50' : 'bg-emerald-50'}`}>
        <Text className={`text-[9px] font-black uppercase ${condition === 'Critical' ? 'text-rose-600' : 'text-emerald-600'}`}>
          {condition}
        </Text>
      </View>
    </View>
    
    <View className="flex-row justify-between items-center pt-4 border-t border-gray-50">
      <View>
        <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Admitted</Text>
        <Text className="text-xs text-gray-700 font-bold">{admissionDate}</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-xl">
          <Text className="text-white text-[10px] font-bold">CHECK VITALS</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-50 px-3 py-2 rounded-xl">
          <Ionicons name="ellipsis-horizontal" size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const AssignedPatientContent = () => {
  const patients = [
    { id: 1, name: "Leanne Graham", age: 32, gender: "Female", bed: "101", condition: "Stable", admissionDate: "Oct 12, 2023" },
    { id: 2, name: "Ervin Howell", age: 45, gender: "Male", bed: "102", condition: "Critical", admissionDate: "Oct 14, 2023" },
    { id: 3, name: "Clementine Bauch", age: 28, gender: "Female", bed: "103", condition: "Stable", admissionDate: "Oct 15, 2023" },
    { id: 4, name: "Patricia Lebsack", age: 50, gender: "Female", bed: "104", condition: "Stable", admissionDate: "Oct 10, 2023" },
    { id: 5, name: "Chelsey Dietrich", age: 37, gender: "Female", bed: "105", condition: "Stable", admissionDate: "Oct 16, 2023" },
    { id: 6, name: "Dennis Schulist", age: 55, gender: "Male", bed: "106", condition: "Monitoring", admissionDate: "Oct 11, 2023" },
  ];

  return (
    <View className="flex-1">
      <View className="bg-white px-6 pb-6 pt-2 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-black text-gray-900">Assigned Patients</Text>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
                <Ionicons name="options" size={18} color="#64748b" />
            </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput 
            placeholder="Search by name or bed..." 
            className="flex-1 ml-3 text-sm text-gray-900" 
            placeholderTextColor="#94a3b8" 
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-4 px-2">
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Ward A • South Wing</Text>
            <Text className="text-blue-600 text-[10px] font-bold uppercase">{patients.length} Active</Text>
        </View>

        {patients.map(patient => (
          <PatientCard key={patient.id} {...patient} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function AssignedPatient() {
  return (
    <NurseLayout>
      <AssignedPatientContent />
    </NurseLayout>
  );
}
