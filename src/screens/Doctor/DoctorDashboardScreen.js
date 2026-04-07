import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";
import { useAppContext } from "../../context/AppContext";
import DoctorLayout, { useSidebar } from "./DoctorLayout";

const { width } = Dimensions.get("window");

const StatCard = ({ title, count, icon, color, iconColor }) => (
  <View className="w-full bg-white rounded-2xl p-4 shadow-sm flex-row items-center justify-between">

    {/* Left Content */}
    <View>
      <Text className="text-gray-500 text-sm">{title}</Text>
      <Text className="text-2xl font-bold text-gray-800 mt-1">{count}</Text>
    </View>

    {/* Icon Container */}
    <View
      className="p-3 rounded-xl"
      style={{ backgroundColor: color }}
    >
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>

  </View>
);

const AppointmentItem = ({ name, time, reason, status }) => (
  <View className="flex-row items-center justify-between py-4 border-b border-gray-50">
    <View className="flex-row items-center flex-1">
      <View className={`h-2.5 w-2.5 rounded-full mr-3 ${status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <View>
        <Text className="text-sm font-bold text-gray-900">{name}</Text>
        <Text className="text-[10px] text-gray-500 font-medium">{time} - {reason}</Text>
      </View>
    </View>
    <View className={`px-3 py-1 rounded-full ${status === 'Confirmed' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
      <Text className={`text-[10px] font-bold ${status === 'Confirmed' ? 'text-emerald-700' : 'text-amber-700'}`}>{status}</Text>
    </View>
  </View>
);

const LabResultItem = ({ patient, test, date, status }) => (
  <View className="flex-row items-center justify-between py-4 border-b border-gray-50">
    <View className="flex-1">
      <Text className="text-sm font-bold text-gray-900">{patient}</Text>
      <Text className="text-[10px] text-gray-500 font-medium">{test} - {date}</Text>
    </View>
    <View className={`px-3 py-1 rounded-full ${status === 'Reviewed' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
      <Text className={`text-[10px] font-bold ${status === 'Reviewed' ? 'text-emerald-700' : 'text-amber-700'}`}>{status}</Text>
    </View>
  </View>
);

const EmergencyCaseItem = ({ initial, name, time, condition }) => (
  <View className="flex-row items-center justify-between py-3 mb-2">
    <View className="flex-row items-center">
      <View className="h-10 w-10 rounded-full bg-rose-50 items-center justify-center border border-rose-100">
        <Text className="text-rose-600 font-bold text-xs">{initial}</Text>
      </View>
      <View className="ml-3">
        <Text className="text-sm font-bold text-gray-900">{name}</Text>
        <Text className="text-[10px] text-gray-500 font-medium">{time}</Text>
      </View>
    </View>
    <View className="bg-rose-50 px-2 py-1 rounded-md">
      <Text className="text-rose-600 font-bold text-[9px] uppercase">{condition}</Text>
    </View>
  </View>
);

const TodoItem = ({ task, priority, completed }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
    <View className="flex-row items-center">
      <View className="h-5 w-5 rounded border border-gray-300 items-center justify-center mr-3">
        {completed && <Ionicons name="checkmark" size={14} color="#10b981" />}
      </View>
      <Text className={`text-sm ${completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>{task}</Text>
    </View>
    <Text className={`text-[10px] font-bold ${priority === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>{priority}</Text>
  </View>
);

const StatusItem = ({ initial, name, degree, status }) => (
  <View className="flex-row items-center justify-between py-3">
    <View className="flex-row items-center">
      <View className="h-10 w-10 rounded-full bg-gray-100 items-center justify-center">
        <Text className="text-gray-600 font-bold text-xs">{initial}</Text>
      </View>
      <View className="ml-3">
        <Text className="text-sm font-bold text-gray-900">{name}</Text>
        <Text className="text-[10px] text-gray-400 font-medium">{degree}</Text>
      </View>
    </View>
    <View className={`px-2 py-1 rounded-md ${status === 'Available' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
      <Text className={`text-[9px] font-bold ${status === 'Available' ? 'text-emerald-600' : 'text-amber-600'}`}>{status}</Text>
    </View>
  </View>
);

const PatientsChart = () => {
  const data = [40, 60, 45, 80, 55, 90, 75, 100, 65, 110];
  const barWidth = 12;
  const gap = 8;
  const chartHeight = 100;

  return (
    <View className="mt-4">
      <Svg height={chartHeight} width="100%">
        {data.map((val, i) => (
          <Rect
            key={i}
            x={i * (barWidth + gap)}
            y={chartHeight - val}
            width={barWidth}
            height={val}
            fill={i % 2 === 0 ? "#818cf8" : "#e2e8f0"}
            rx={4}
          />
        ))}
      </Svg>
      <View className="flex-row justify-between mt-2">
        {[40, 60, 80, 100, 120].reverse().map(l => (
          <Text key={l} className="text-[8px] text-gray-400 font-bold">{l}</Text>
        ))}
      </View>
    </View>
  );
};

const DoctorDashboardContent = () => {
  const { toggleSidebar } = useSidebar();
  const { currentUser } = useAppContext();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Navbar */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={toggleSidebar}
            className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50 mr-4"
          >
            <Ionicons name="menu-outline" size={24} color="#2563eb" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-black text-gray-900 tracking-tight">Levitica</Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest -mt-1">Hospital Management System</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-gray-50 mr-3">
            <Ionicons name="notifications-outline" size={20} color="#64748b" />
            <View className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-500 border-2 border-white" />
          </TouchableOpacity>
          <View className="h-10 w-10 rounded-full bg-blue-600 items-center justify-center border-2 border-blue-100">
            <Text className="text-white font-bold text-xs">PC</Text>
          </View>
          <View className="ml-2 hidden md:flex">
            <Text className="text-xs font-bold text-gray-900">Prasad Chandragiri</Text>
            <Ionicons name="chevron-down" size={12} color="gray" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Title Section */}
        <View className="px-6 py-6">
          <Text className="text-2xl font-black text-gray-900">Doctor Dashboard</Text>
        </View>

        {/* Stats Cards Row */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="px-4 mb-6"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="gap-4">

            <StatCard
              title="Today's Appointments"
              count="12"
              icon="calendar-outline"
              color="#DBEAFE"   // light blue
              iconColor="#2563EB"
              trendIcon="chart-bar"
            />

            <StatCard
              title="Pending Reports"
              count="4"
              icon="document-text-outline"
              color="#FEF9C3"   // light yellow
              iconColor="#CA8A04"
              trendIcon="chart-line"
            />

            <StatCard
              title="Upcoming Schedule"
              count="5"
              icon="time-outline"
              color="#E0E7FF"   // light indigo
              iconColor="#4F46E5"
              trendIcon="chart-bar"
            />

            <StatCard
              title="Messages"
              count="8"
              icon="chatbubbles-outline"
              color="#D1FAE5"   // light green
              iconColor="#059669"
              trendIcon="chart-line"
            />

          </View>
        </ScrollView>

        <View className="px-6 flex-row flex-wrap justify-between">
          {/* Today's Appointments */}
          <View className="w-full lg:w-[48%] bg-white rounded-3xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Today's Appointments</Text>
            </View>
            <AppointmentItem name="Ravi Kumar" time="10:30 AM" reason="Fever" status="Confirmed" />
            <AppointmentItem name="Anita Sharma" time="11:00 AM" reason="Back Pain" status="Pending" />
            <AppointmentItem name="Suresh Patel" time="11:30 AM" reason="Routine Checkup" status="Confirmed" />
            <AppointmentItem name="Priya Singh" time="12:00 PM" reason="Migraine" status="Confirmed" />
            <TouchableOpacity className="mt-4 items-center">
              <Text className="text-blue-600 font-bold text-xs">View All Appointments →</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Lab Results */}
          <View className="w-full lg:w-[48%] bg-white rounded-3xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Recent Lab Results</Text>
            </View>
            <LabResultItem patient="Ravi Kumar" test="Blood Test" date="2023-10-10" status="Reviewed" />
            <LabResultItem patient="Anita Sharma" test="X-Ray" date="2023-10-09" status="Pending Review" />
            <LabResultItem patient="Suresh Patel" test="CT Scan" date="2023-10-08" status="Reviewed" />
            <LabResultItem patient="Rajesh Kumar" test="Blood Sugar" date="2023-10-12" status="Pending Review" />
            <TouchableOpacity className="mt-4 items-center">
              <Text className="text-blue-600 font-bold text-xs">View All Results →</Text>
            </TouchableOpacity>
          </View>

          {/* Emergency Cases */}
          <View className="w-full bg-white rounded-3xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center mb-4">
              <View className="h-8 w-8 rounded-lg bg-rose-50 items-center justify-center mr-2">
                <Ionicons name="warning" size={18} color="#f43f5e" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Emergency Cases</Text>
              <View className="bg-rose-500 h-5 w-5 rounded-full items-center justify-center ml-2">
                <Text className="text-white text-[10px] font-bold">4</Text>
              </View>
            </View>
            <EmergencyCaseItem initial="JD" name="John Doe" time="10 min ago" condition="Cardiac Arrest" />
            <EmergencyCaseItem initial="SS" name="Sarah Smith" time="25 min ago" condition="Severe Trauma" />
            <EmergencyCaseItem initial="MJ" name="Mike Johnson" time="45 min ago" condition="Stroke" />
            <EmergencyCaseItem initial="ED" name="Emily Davis" time="1 hr ago" condition="Severe Burn" />
            <TouchableOpacity className="mt-4 flex-row items-center justify-center">
              <Ionicons name="medical" size={16} color="#f43f5e" className="mr-2" />
              <Text className="text-rose-600 font-bold text-xs ml-2">Manage Emergencies</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Grid */}
          <View className="w-full lg:w-[31%] bg-white rounded-3xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Todo List</Text>
              <TouchableOpacity><Text className="text-blue-600 text-[10px] font-bold">View All</Text></TouchableOpacity>
            </View>
            <TodoItem task="Prepare for medical meeting" priority="High" completed={false} />
            <TodoItem task="Answer patient queries" priority="Normal" completed={false} />
            <TodoItem task="Attend medical staff meeting" priority="High" completed={false} />
          </View>

          <View className="w-full lg:w-[31%] bg-white rounded-3xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Doctor Status</Text>
              <TouchableOpacity><Text className="text-blue-600 text-[10px] font-bold">View All</Text></TouchableOpacity>
            </View>
            <StatusItem initial="DJ" name="Dr. Jay Soni" degree="MBBS, MD" status="Available" />
            <StatusItem initial="DS" name="Dr. Sarah Sn" degree="BDS, MDS" status="Absent" />
            <StatusItem initial="DM" name="Dr. Megha T" degree="BHMS" status="Available" />
          </View>

          <View className="w-full lg:w-[31%] bg-white rounded-3xl p-6 shadow-sm mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Number Of Patients</Text>
            <PatientsChart />
            <TouchableOpacity className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-blue-600 items-center justify-center shadow-lg shadow-blue-300">
              <Ionicons name="chatbubble-ellipses" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default function DoctorDashboardScreen({ navigation }) {
  return (
    <DoctorLayout>
      <DoctorDashboardContent />
    </DoctorLayout>
  );
}

const styles = StyleSheet.create({
  statCard: {
    width: 200,
    height: 120,
    borderRadius: 24,
    padding: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
