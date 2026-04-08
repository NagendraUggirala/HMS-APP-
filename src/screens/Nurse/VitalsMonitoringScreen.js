import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";

const VitalRow = ({ name, bed, temp, hr, bp, spo2, status }) => (
  <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-50">
    <View className="flex-row items-center justify-between mb-4">
      <View>
        <Text className="text-base font-bold text-gray-900">{name}</Text>
        <Text className="text-xs text-gray-500 font-medium">Bed {bed}</Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${status === 'Alert' ? 'bg-rose-100' : 'bg-emerald-100'}`}>
        <Text className={`text-[10px] font-black ${status === 'Alert' ? 'text-rose-600' : 'text-emerald-700'}`}>{status.toUpperCase()}</Text>
      </View>
    </View>

    <View className="flex-row justify-between">
      <View className="items-center">
        <View className="bg-orange-50 p-2 rounded-xl mb-1">
            <FontAwesome5 name="thermometer-half" size={14} color="#f97316" />
        </View>
        <Text className="text-[10px] text-gray-400 font-bold">TEMP</Text>
        <Text className="text-sm font-bold text-gray-800">{temp}</Text>
      </View>
      <View className="items-center">
        <View className="bg-rose-50 p-2 rounded-xl mb-1">
            <Ionicons name="heart" size={14} color="#ef4444" />
        </View>
        <Text className="text-[10px] text-gray-400 font-bold">HR</Text>
        <Text className="text-sm font-bold text-gray-800">{hr}</Text>
      </View>
      <View className="items-center">
        <View className="bg-blue-50 p-2 rounded-xl mb-1">
            <Ionicons name="speedometer" size={14} color="#3b82f6" />
        </View>
        <Text className="text-[10px] text-gray-400 font-bold">BP</Text>
        <Text className="text-sm font-bold text-gray-800">{bp}</Text>
      </View>
      <View className="items-center">
        <View className="bg-emerald-50 p-2 rounded-xl mb-1">
            <Ionicons name="water" size={14} color="#10b981" />
        </View>
        <Text className="text-[10px] text-gray-400 font-bold">SpO2</Text>
        <Text className="text-sm font-bold text-gray-800">{spo2}</Text>
      </View>
    </View>
    
    <TouchableOpacity className="mt-4 bg-gray-50 py-3 rounded-xl items-center border border-gray-100">
        <Text className="text-xs font-bold text-blue-600">CHECK NOW</Text>
    </TouchableOpacity>
  </View>
);

const VitalsMonitoringContent = () => {
  const vitals = [
    { id: 1, name: "Leanne Graham", bed: "101", temp: "98.6°F", hr: "72 bpm", bp: "120/80", spo2: "98%", status: "Stable" },
    { id: 2, name: "Ervin Howell", bed: "102", temp: "101.4°F", hr: "95 bpm", bp: "140/90", spo2: "94%", status: "Alert" },
    { id: 3, name: "Clementine Bauch", bed: "103", temp: "97.8°F", hr: "68 bpm", bp: "115/75", spo2: "99%", status: "Stable" },
    { id: 4, name: "Patricia Lebsack", bed: "104", temp: "98.9°F", hr: "75 bpm", bp: "125/82", spo2: "97%", status: "Stable" },
  ];

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
            <View>
                <Text className="text-2xl font-black text-gray-900">Vitals Monitoring</Text>
                <Text className="text-xs text-gray-500 font-medium">Last full round: 10:30 AM</Text>
            </View>
            <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>

        <View className="flex-row bg-white rounded-2xl p-4 mb-6 items-center shadow-sm">
            <Ionicons name="time-outline" size={20} color="#3b82f6" />
            <Text className="ml-3 text-xs font-bold text-gray-800 flex-1">Next round starts in 25 minutes</Text>
            <TouchableOpacity className="bg-blue-50 px-3 py-1.5 rounded-lg">
                <Text className="text-blue-600 text-[10px] font-black">SET ALARM</Text>
            </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4 px-2">Patient Vitals Overview</Text>

        {vitals.map(v => (
          <VitalRow key={v.id} {...v} />
        ))}

        <TouchableOpacity className="py-6 items-center">
          <Text className="text-sm font-bold text-gray-400">View History Logs</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default function VitalsMonitoringScreen() {
  return (
    <NurseLayout>
      <VitalsMonitoringContent />
    </NurseLayout>
  );
}
