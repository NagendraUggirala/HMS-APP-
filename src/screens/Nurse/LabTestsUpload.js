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

const TestCard = ({ patient, bed, test, date, status }) => (
  <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-50">
    <View className="flex-row items-center justify-between mb-4">
      <View>
        <Text className="text-sm font-bold text-gray-900">{patient}</Text>
        <Text className="text-[10px] text-gray-400 font-bold">BED {bed}</Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${status === 'Result Ready' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
        <Text className={`text-[10px] font-black ${status === 'Result Ready' ? 'text-emerald-700' : 'text-amber-700'}`}>{status.toUpperCase()}</Text>
      </View>
    </View>

    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
        <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Test Name</Text>
        <Text className="text-base font-black text-gray-800">{test}</Text>
        <Text className="text-[10px] text-gray-500 font-medium mt-1">Requested: {date}</Text>
    </View>
    
    <View className="flex-row gap-3">
        <TouchableOpacity className="flex-1 bg-white border border-gray-100 py-3 rounded-xl items-center">
            <Text className="text-xs font-bold text-gray-500">VIEW DETAILS</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-xl items-center shadow-lg shadow-blue-100">
            <Text className="text-white text-xs font-bold">UPLOAD RESULTS</Text>
        </TouchableOpacity>
    </View>
  </View>
);

const LabTestsUploadContent = () => {
  const tests = [
    { id: 1, patient: "Leanne Graham", bed: "101", test: "Complete Blood Count", date: "Oct 16, 10:20 AM", status: "Pending" },
    { id: 2, patient: "Ervin Howell", bed: "102", test: "Chest X-Ray", date: "Oct 16, 09:15 AM", status: "Result Ready" },
    { id: 3, patient: "Clementine Bauch", bed: "103", test: "Lipid Profile", date: "Oct 15, 04:30 PM", status: "Result Ready" },
  ];

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-8">
            <View>
                <Text className="text-2xl font-black text-gray-900">Lab Reports</Text>
                <Text className="text-xs text-gray-500 font-medium">Manage and upload patient test results</Text>
            </View>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Ionicons name="filter" size={18} color="#64748b" />
            </TouchableOpacity>
        </View>

        <View className="mb-6">
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
                <Ionicons name="search" size={18} color="#94a3b8" />
                <TextInput 
                    placeholder="Search by test or patient..." 
                    className="flex-1 ml-3 text-sm text-gray-900" 
                    placeholderTextColor="#94a3b8" 
                />
            </View>
        </View>

        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4 px-2">Pending & Recent Tests</Text>

        {tests.map(test => (
          <TestCard key={test.id} {...test} />
        ))}

        <TouchableOpacity className="mt-4 p-8 rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center">
            <View className="bg-gray-50 h-12 w-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="cloud-upload" size={24} color="#94a3b8" />
            </View>
            <Text className="text-gray-400 font-bold text-xs">Tap to upload a new report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default function LabTestsUpload() {
  return (
    <NurseLayout>
      <LabTestsUploadContent />
    </NurseLayout>
  );
}
