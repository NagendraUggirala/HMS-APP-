import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";
import Svg, { Rect } from "react-native-svg";

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

const VitalItem = ({ name, bed, temp, time, avatar }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
    <View className="flex-row items-center">
      <View className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
        {avatar ? (
          <Image source={{ uri: avatar }} className="h-full w-full" />
        ) : (
          <View className="h-full w-full items-center justify-center bg-blue-100">
            <Text className="text-blue-600 font-bold text-xs">{name.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View>
        <Text className="text-sm font-bold text-gray-900">{name}</Text>
        <Text className="text-[10px] text-gray-500 font-medium">Bed {bed}</Text>
      </View>
    </View>
    <View className="items-end">
      <Text className="text-xs font-bold text-gray-900">{temp}</Text>
      <Text className="text-[10px] text-gray-400 font-medium">{time}</Text>
    </View>
  </View>
);

const TaskItem = ({ title, desc, color, accentColor }) => (
  <View className={`p-4 rounded-2xl mb-3 flex-row items-center justify-between ${color}`}>
    <View className="flex-row items-center flex-1">
      <View className={`w-1 h-10 rounded-full ${accentColor} mr-3`} />
      <View className="flex-1">
        <Text className="text-sm font-bold text-gray-900">{title}</Text>
        <Text className="text-[10px] text-gray-500 font-medium">{desc}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
  </View>
);

const PatientChart = () => {
    const data = [
        { value: 80, color: '#10b981' }, // Green
        { value: 60, color: '#f59e0b' }, // Orange
        { value: 30, color: '#ef4444' }, // Red
        { value: 60, color: '#3b82f6' }, // Blue
    ];
    
    return (
        <View className="h-40 w-full mt-4 flex-row items-end justify-around pb-4">
            {data.map((item, index) => (
                <View key={index} className="items-center">
                    <View 
                        style={{ height: item.value, backgroundColor: item.color }} 
                        className="w-16 rounded-t-lg"
                    />
                </View>
            ))}
        </View>
    );
};

const NurseDashboardContent = () => {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
      <Text className="text-2xl font-black text-gray-900 mb-6">Dashboard Overview</Text>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between">
        <StatCard 
            label="Assigned Patients" 
            value="6" 
            icon="person" 
            color="#2563eb" 
            iconBg="bg-blue-50" 
        />
        <StatCard 
            label="Medications Due" 
            value="3" 
            icon="medical" 
            color="#10b981" 
            iconBg="bg-emerald-50" 
        />
        <StatCard 
            label="Available Beds" 
            value="2" 
            icon="bed" 
            color="#f59e0b" 
            iconBg="bg-amber-50" 
        />
        <StatCard 
            label="Critical Patients" 
            value="1" 
            icon="warning" 
            color="#ef4444" 
            iconBg="bg-rose-50" 
        />
      </View>

      <View className="flex-row flex-wrap justify-between mt-4">
        {/* Recent Vitals */}
        <View className="w-full bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Recent Vitals</Text>
          <VitalItem name="Leanne Graham" bed="101" temp="98.6°F" time="10:30 AM" />
          <VitalItem name="Ervin Howell" bed="102" temp="99.1°F" time="10:25 AM" />
          <VitalItem name="Clementine Bauch" bed="103" temp="97.8°F" time="10:20 AM" />
          <VitalItem name="Patricia Lebsack" bed="104" temp="98.9°F" time="10:15 AM" />
        </View>

        {/* Pending Tasks */}
        <View className="w-full bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Pending Tasks</Text>
          <TaskItem 
            title="Medication Round" 
            desc="Evening doses for 3 patients" 
            color="bg-blue-50/50" 
            accentColor="bg-blue-500" 
          />
          <TaskItem 
            title="Lab Reports" 
            desc="2 reports pending upload" 
            color="bg-amber-50/50" 
            accentColor="bg-amber-500" 
          />
          <TaskItem 
            title="Critical Patient" 
            desc="Patient 3 needs attention" 
            color="bg-rose-50/50" 
            accentColor="bg-rose-500" 
          />
        </View>
      </View>

      {/* Patient Status Overview */}
      <View className="w-full bg-white rounded-3xl p-6 mb-10 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-2">Patient Status Overview</Text>
        <PatientChart />
      </View>
    </ScrollView>
  );
};

export default function NurseDashboardScreen() {
  return (
    <NurseLayout>
      <NurseDashboardContent />
    </NurseLayout>
  );
}
