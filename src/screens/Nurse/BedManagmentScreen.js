import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";

const { width } = Dimensions.get("window");

const BedCard = ({ bedNumber, status, patient }) => {
  const isOccupied = status === 'Occupied';
  const isAvailable = status === 'Available';
  
  return (
    <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-gray-50" style={{ width: (width - 60) / 2 }}>
      <View className="flex-row items-center justify-between mb-3">
        <View className={`h-10 w-10 rounded-2xl items-center justify-center ${isOccupied ? 'bg-blue-50' : isAvailable ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          <Ionicons name="bed" size={20} color={isOccupied ? '#2563eb' : isAvailable ? '#10b981' : '#f59e0b'} />
        </View>
        <Text className="text-sm font-black text-gray-900">#{bedNumber}</Text>
      </View>
      
      <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</Text>
      <View className={`px-2 py-0.5 rounded-md inline-block self-start mb-3 ${isOccupied ? 'bg-blue-100' : isAvailable ? 'bg-emerald-100' : 'bg-amber-100'}`}>
        <Text className={`text-[9px] font-black uppercase ${isOccupied ? 'text-blue-700' : isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>{status}</Text>
      </View>

      {isOccupied ? (
        <View>
          <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Patient</Text>
          <Text className="text-xs font-bold text-gray-900" numberOfLines={1}>{patient}</Text>
        </View>
      ) : (
        <TouchableOpacity className="bg-gray-50 py-2 rounded-xl items-center">
          <Text className="text-[10px] font-bold text-blue-600">ASSIGN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const BedManagmentContent = () => {
  const beds = [
    { number: "101", status: "Occupied", patient: "Leanne Graham" },
    { number: "102", status: "Occupied", patient: "Ervin Howell" },
    { number: "103", status: "Available", patient: null },
    { number: "104", status: "Occupied", patient: "Patricia Lebsack" },
    { number: "105", status: "Cleaning", patient: null },
    { number: "106", status: "Available", patient: null },
    { number: "107", status: "Occupied", patient: "Dennis Schulist" },
    { number: "108", status: "Available", patient: null },
  ];

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-8">
            <View>
                <Text className="text-2xl font-black text-gray-900">Bed Management</Text>
                <Text className="text-xs text-gray-500 font-medium">Ward A • Availability: 38%</Text>
            </View>
            <View className="flex-row gap-2">
                <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Ionicons name="map-outline" size={18} color="#64748b" />
                </TouchableOpacity>
            </View>
        </View>

        <View className="flex-row flex-wrap justify-between">
            <View className="width-full flex-row gap-4 mb-6">
                <View className="flex-1 bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
                    <Text className="text-2xl font-black text-emerald-700">3</Text>
                    <Text className="text-[10px] text-emerald-600 font-bold uppercase">Vacant</Text>
                </View>
                <View className="flex-1 bg-blue-50 p-4 rounded-3xl border border-blue-100">
                    <Text className="text-2xl font-black text-blue-700">5</Text>
                    <Text className="text-[10px] text-blue-600 font-bold uppercase">Occupied</Text>
                </View>
            </View>

            {beds.map(bed => (
                <BedCard key={bed.number} bedNumber={bed.number} status={bed.status} patient={bed.patient} />
            ))}
        </View>

        <TouchableOpacity className="bg-blue-600 p-4 rounded-2xl flex-row items-center justify-center mt-6">
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text className="ml-2 text-sm font-bold text-white">ADD NEW BED RECORD</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default function BedManagmentScreen() {
  return (
    <NurseLayout>
      <BedManagmentContent />
    </NurseLayout>
  );
}
