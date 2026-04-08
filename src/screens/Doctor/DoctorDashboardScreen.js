import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorLayout from "./DoctorLayout";

const { width } = Dimensions.get("window");

const StatCard = ({ label, value, icon, color, iconBg }) => (
  <View className="bg-white rounded-3xl p-4 flex-row items-center justify-between mb-4 shadow-sm" style={{ width: (width - 60) / 2 }}>
    <View>
      <View className={`${iconBg} h-10 w-10 rounded-2xl items-center justify-center mb-2`}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{label}</Text>
      <Text className="text-2xl font-black text-gray-900">{value}</Text>
    </View>
  </View>
);

const AppointmentItem = ({ name, time, reason, status }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
    <View className="flex-row items-center">
      <View className={`h-2.5 w-2.5 rounded-full mr-3 ${status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <View>
        <Text className="text-sm font-bold text-gray-900">{name}</Text>
        <Text className="text-[10px] text-gray-500 font-medium">{time} - {reason}</Text>
      </View>
    </View>
    <View className={`px-2 py-1 rounded-md ${status === 'Confirmed' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
      <Text className={`text-[9px] font-bold ${status === 'Confirmed' ? 'text-emerald-600' : 'text-amber-600'}`}>{status}</Text>
    </View>
  </View>
);

const EmergencyItem = ({ condition, patient, time }) => (
  <View className="p-4 rounded-2xl mb-3 flex-row items-center justify-between bg-rose-50/50">
    <View className="flex-row items-center flex-1">
      <View className="w-1 h-10 rounded-full bg-rose-500 mr-3" />
      <View className="flex-1">
        <Text className="text-sm font-bold text-rose-700">{condition}</Text>
        <Text className="text-[10px] text-rose-600 font-medium">{patient} • {time}</Text>
      </View>
    </View>
    <Ionicons name="alert-circle" size={18} color="#ef4444" />
  </View>
);

const DoctorDashboardContent = () => {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
      {/* Header Info */}
      <View className="mb-6">
        <Text className="text-2xl font-black text-gray-900">Health Overview</Text>
        <Text className="text-sm text-gray-500 font-medium">Welcome back, Dr. Prasad!</Text>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between">
        <StatCard 
            label="Appointments" 
            value="12" 
            icon="calendar" 
            color="#2563eb" 
            iconBg="bg-blue-50" 
        />
        <StatCard 
            label="Pending Reports" 
            value="4" 
            icon="document-text" 
            color="#10b981" 
            iconBg="bg-emerald-50" 
        />
        <StatCard 
            label="Upcoming" 
            value="5" 
            icon="time" 
            color="#f59e0b" 
            iconBg="bg-amber-50" 
        />
        <StatCard 
            label="New Messages" 
            value="8" 
            icon="chatbubbles" 
            color="#8b5cf6" 
            iconBg="bg-violet-50" 
        />
      </View>

      <View className="mt-4">
        {/* Emergencies Section */}
        <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Critical Alerts</Text>
            <View className="bg-rose-500 px-2 py-0.5 rounded-full">
                <Text className="text-white text-[10px] font-bold">2 NEW</Text>
            </View>
        </View>
        <EmergencyItem condition="Cardiac Arrest" patient="John Doe" time="10 min ago" />
        <EmergencyItem condition="Severe Trauma" patient="Sarah Smith" time="25 min ago" />

        {/* Today's Schedule */}
        <View className="bg-white rounded-3xl p-6 my-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Today's Schedule</Text>
            <TouchableOpacity><Text className="text-blue-600 text-[10px] font-bold">VIEW ALL</Text></TouchableOpacity>
          </View>
          <AppointmentItem name="Ravi Kumar" time="10:30 AM" reason="High Fever" status="Confirmed" />
          <AppointmentItem name="Anita Sharma" time="11:00 AM" reason="Back Pain" status="Pending" />
          <AppointmentItem name="Suresh Patel" time="11:30 AM" reason="Routine Checkup" status="Confirmed" />
          <AppointmentItem name="Priya Singh" time="12:00 PM" reason="Migraine" status="Confirmed" />
        </View>

        {/* Lab Results Summary */}
        <View className="bg-white rounded-3xl p-6 mb-10 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Pending Reviews</Text>
          <View className="flex-row items-center justify-between py-2">
            <View>
                <Text className="text-sm font-bold text-gray-800">Blood Analysis</Text>
                <Text className="text-[10px] text-gray-400">Ravi Kumar • 2 hours ago</Text>
            </View>
            <TouchableOpacity className="bg-blue-600 px-3 py-1 rounded-lg">
                <Text className="text-white text-[10px] font-bold">REVIEW</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-between py-2 border-t border-gray-50">
            <View>
                <Text className="text-sm font-bold text-gray-800">Radiology Report</Text>
                <Text className="text-[10px] text-gray-400">Anita Sharma • 4 hours ago</Text>
            </View>
            <TouchableOpacity className="bg-blue-600 px-3 py-1 rounded-lg">
                <Text className="text-white text-[10px] font-bold">REVIEW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default function DoctorDashboardScreen() {
  return (
    <DoctorLayout>
      <DoctorDashboardContent />
    </DoctorLayout>
  );
}
