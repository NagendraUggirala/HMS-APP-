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

const NoteItem = ({ patient, bed, note, time, type }) => (
  <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-50">
    <View className="flex-row items-center justify-between mb-3">
      <View>
        <Text className="text-sm font-bold text-gray-900">{patient}</Text>
        <Text className="text-[10px] text-gray-400 font-bold">BED {bed}</Text>
      </View>
      <View className={`px-2 py-1 rounded-md ${type === 'Critical' ? 'bg-rose-50' : 'bg-blue-50'}`}>
        <Text className={`text-[9px] font-black uppercase ${type === 'Critical' ? 'text-rose-600' : 'text-blue-600'}`}>{type}</Text>
      </View>
    </View>
    
    <Text className="text-gray-700 text-sm leading-5 mb-3">{note}</Text>
    
    <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
        <Text className="text-[10px] text-gray-400 font-bold tracking-wider">{time}</Text>
        <View className="flex-row gap-2">
            <TouchableOpacity><Ionicons name="create-outline" size={16} color="#64748b" /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="share-outline" size={16} color="#64748b" /></TouchableOpacity>
        </View>
    </View>
  </View>
);

const NursingNotesContent = () => {
  const notes = [
    { id: 1, patient: "Leanne Graham", bed: "101", note: "Patient reported mild headache. Vitals checked and within normal range. Administered prescribed analgesic.", time: "10:45 AM", type: "Observation" },
    { id: 2, patient: "Ervin Howell", bed: "102", note: "SpO2 levels dropped to 92%. Oxygen administered. Resident doctor notified. Monitoring closely.", time: "09:30 AM", type: "Critical" },
    { id: 3, patient: "Clementine Bauch", bed: "103", note: "Regular wound dressing completed. No signs of infection noted. Healing well.", time: "08:15 AM", type: "Nursing Task" },
  ];

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-8">
            <View>
                <Text className="text-2xl font-black text-gray-900">Nursing Notes</Text>
                <Text className="text-xs text-gray-500 font-medium">Record and track patient observations</Text>
            </View>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Ionicons name="search" size={18} color="#64748b" />
            </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-blue-600 p-5 rounded-3xl flex-row items-center justify-center mb-8 shadow-lg shadow-blue-200">
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text className="ml-3 text-sm font-bold text-white">ADD NEW OBSERVATION</Text>
        </TouchableOpacity>

        <View className="flex-row gap-2 mb-6">
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
                <Text className="text-xs font-bold text-gray-600">All Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-blue-50 px-4 py-2 rounded-full">
                <Text className="text-xs font-bold text-blue-600">My Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-rose-50 px-4 py-2 rounded-full">
                <Text className="text-xs font-bold text-rose-600">Alerts</Text>
            </TouchableOpacity>
        </View>

        {notes.map(note => (
          <NoteItem key={note.id} {...note} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function NursingNotes() {
  return (
    <NurseLayout>
      <NursingNotesContent />
    </NurseLayout>
  );
}
