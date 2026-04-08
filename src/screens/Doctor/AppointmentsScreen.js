import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorLayout from "./DoctorLayout";

const AppointmentCard = ({ patientName, time, type, status, phone }) => (
  <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm">
    <View className="flex-row justify-between items-start mb-4">
      <View>
        <Text className="text-lg font-bold text-gray-900">{patientName}</Text>
        <Text className="text-xs text-gray-500 font-medium">{time}</Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${status === 'Confirmed' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
        <Text className={`text-[10px] font-bold ${status === 'Confirmed' ? 'text-emerald-700' : 'text-amber-700'}`}>{status}</Text>
      </View>
    </View>
    
    <View className="border-t border-gray-50 pt-4 mb-4">
      <View className="flex-row items-center mb-2">
        <Ionicons name="medical-outline" size={16} color="#64748b" />
        <Text className="text-xs text-gray-600 ml-2 font-medium">{type}</Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="call-outline" size={16} color="#64748b" />
        <Text className="text-xs text-gray-600 ml-2 font-medium">{phone}</Text>
      </View>
    </View>

    <View className="flex-row gap-3">
      <TouchableOpacity className="flex-1 py-3 rounded-xl bg-gray-50 items-center">
        <Text className="text-xs font-bold text-gray-500">Reschedule</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 py-3 rounded-xl bg-blue-600 items-center">
        <Text className="text-xs font-bold text-white">Check In</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const AppointmentsContent = () => {
  const appointments = [
    { id: 1, patientName: "John Doe", time: "09:00 AM", type: "Follow-up", status: "Confirmed", phone: "+1 234 567 890" },
    { id: 2, patientName: "Sarah Smith", time: "10:30 AM", type: "First Visit", status: "Pending", phone: "+1 987 654 321" },
    { id: 3, patientName: "Michael Johnson", time: "11:45 AM", type: "Consultation", status: "Confirmed", phone: "+1 555 123 456" },
    { id: 4, patientName: "Emily Davis", time: "02:15 PM", type: "Routine Checkup", status: "Confirmed", phone: "+1 444 777 888" },
    { id: 5, patientName: "Robert Wilson", time: "03:30 PM", type: "Medical Review", status: "Confirmed", phone: "+1 333 999 000" },
    { id: 6, patientName: "Jessica Brown", time: "04:45 PM", type: "Follow-up", status: "Pending", phone: "+1 222 888 111" },
  ];

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-black text-gray-900">Appointments</Text>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Ionicons name="filter" size={20} color="#64748b" />
            </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">Today's Schedule</Text>
        {appointments.map(apt => (
          <AppointmentCard key={apt.id} {...apt} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function AppointmentsScreen() {
  return (
    <DoctorLayout>
      <AppointmentsContent />
    </DoctorLayout>
  );
}
