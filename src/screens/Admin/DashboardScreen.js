import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Svg, { G, Circle } from "react-native-svg";
import { useAppContext } from "../../context/AppContext";
import AdminLayout, { useSidebar } from "./AdminLayout";

const { width } = Dimensions.get("window");

const StatsCard = ({ label, value, trend, trendType, icon, color, bgIcon }) => (
  <View className="mb-4 flex-row items-center justify-between rounded-3xl bg-white p-5 shadow-sm">
    <View className="flex-1">
      <View
        className={`mb-3 h-10 w-10 items-center justify-center rounded-2xl ${color}20`}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-xs font-medium text-gray-500">{label}</Text>
      <Text className="mt-1 text-2xl font-bold text-gray-900">{value}</Text>
    </View>
    <View className="items-end">
      <View className="flex-row items-center">
        <Ionicons
          name={trendType === "up" ? "trending-up" : "trending-down"}
          size={14}
          color={trendType === "up" ? "#10b981" : "#ef4444"}
        />
        <Text
          className={`ml-1 text-xs font-bold ${trendType === "up" ? "text-emerald-500" : "text-rose-500"
            }`}
        >
          {trend}
        </Text>
      </View>
      <Ionicons
        name="stats-chart"
        size={40}
        color={`${color}10`}
        style={{ marginTop: 10 }}
      />
    </View>
    <View className="absolute bottom-0 right-0 opacity-5">
      <Ionicons name={bgIcon} size={80} color={color} />
    </View>
  </View>
);

const StaffAction = ({ label, icon, color }) => (
  <TouchableOpacity
    className="mb-4 w-[48%] items-center justify-center rounded-3xl bg-white py-6 shadow-sm"
    activeOpacity={0.7}
  >
    <View
      className={`mb-3 h-12 w-12 items-center justify-center rounded-full ${color}15`}
    >
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-900">
      {label}
    </Text>
  </TouchableOpacity>
);

const DepartmentItem = ({ name, status, statusColor, capacity, trend }) => (
  <View className="flex-row items-center justify-between py-4 border-b border-gray-50">
    <View className="flex-row items-center flex-1">
      <View className={`h-2 w-2 rounded-full mr-3 ${statusColor === "emerald" ? "bg-emerald-500" : statusColor === "rose" ? "bg-rose-500" : "bg-blue-500"}`} />
      <Text className="text-sm font-semibold text-gray-800">{name}</Text>
    </View>
    <View className="flex-1 items-center">
      <View className={`${statusColor === "emerald" ? "bg-emerald-50" : statusColor === "rose" ? "bg-rose-50" : "bg-blue-50"} px-2 py-1 rounded-md`}>
        <Text className={`text-[10px] font-bold uppercase ${statusColor === "emerald" ? "text-emerald-600" : statusColor === "rose" ? "text-rose-600" : "text-blue-600"}`}>
          {status}
        </Text>
      </View>
    </View>
    <Text className="text-sm font-medium text-gray-600 flex-1 text-center">{capacity}</Text>
    <View className="flex-1 items-end">
      <Ionicons name={trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "remove"} size={16} color={trend === "up" ? "#ef4444" : trend === "down" ? "#10b981" : "#9ca3af"} />
    </View>
  </View>
);

const DonutChart = ({ data }) => {
  const size = 180;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <View className="items-center justify-center py-6">
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {data.map((item, index) => {
            const strokeDashoffset = circumference - (item.percent / 100) * circumference;
            const offset = currentOffset;
            currentOffset += (item.percent / 100) * circumference;
            return (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circumference - (item.percent / 100) * circumference}
                transform={`rotate(${(offset / circumference) * 360}, ${size / 2}, ${size / 2})`}
                strokeLinecap="round"
              />
            );
          })}
        </G>
        <View className="absolute inset-0 items-center justify-center" style={{ width: size, height: size }}>
          <Text className="text-2xl font-bold text-gray-900">1,248</Text>
          <Text className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Total Logs</Text>
        </View>
      </Svg>
    </View>
  );
};

const DashboardContent = ({ navigation }) => {
  const { currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState("Occupancy");
  const { toggleSidebar } = useSidebar();

  return (
    
    <View className="flex-1 ">

      {/* Header with Sidebar Trigger */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={toggleSidebar}
            className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50"
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-black text-gray-900">Clinical curator</Text>
              <View className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </View>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
            <Ionicons name="search-outline" size={22} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-gray-50 relative">
            <Ionicons name="notifications-outline" size={22} color="#64748b" />
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white" />
          </TouchableOpacity>
        </View>
      </View>


      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}

        <View className="px-6 pt-4">
          <StatsCard
            label="Total Appointments"
            value="240"
            trend="+12%"
            trendType="up"
            icon="calendar"
            color="#0052CC"
            bgIcon="calendar"
          />
          <StatsCard
            label="Today's Revenue"
            value="$12,450"
            trend="+8.4%"
            trendType="up"
            icon="cash-outline"
            color="#10b981"
            bgIcon="cash"
          />
          <StatsCard
            label="Active Patients"
            value="85"
            trend="-2%"
            trendType="down"
            icon="people-outline"
            color="#6366f1"
            bgIcon="person"
          />
        </View>

        {/* Manage Staff Section */}
        <View className="mt-6 px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Manage Staff</Text>
            <TouchableOpacity>
              <Text className="text-xs font-bold text-blue-700">View Directory</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            <StaffAction label="Doctors" icon="medical" color="#0052CC" />
            <StaffAction label="Pharmacy" icon="bandage" color="#10b981" />
            <StaffAction label="Lab Techs" icon="flask" color="#3b82f6" />
            <StaffAction label="Reception" icon="briefcase" color="#6366f1" />
          </View>
        </View>

        {/* Department Overview */}
        <View className="mt-4 px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Department Overview</Text>
            <View className="flex-row bg-gray-200 rounded-full p-1">
              <TouchableOpacity
                onPress={() => setActiveTab("Occupancy")}
                className={`px-4 py-1.5 rounded-full ${activeTab === "Occupancy" ? "bg-blue-800" : ""}`}
              >
                <Text className={`text-[10px] font-bold ${activeTab === "Occupancy" ? "text-white" : "text-gray-500"}`}>Occupancy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("Wait Time")}
                className={`px-4 py-1.5 rounded-full ${activeTab === "Wait Time" ? "bg-blue-800" : ""}`}
                style={activeTab === "Wait Time" ? {} : { backgroundColor: 'transparent' }}
              >
                <Text className={`text-[10px] font-bold ${activeTab === "Wait Time" ? "text-white" : "text-gray-500"}`}>Wait Time</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="rounded-3xl bg-white p-5 shadow-sm">
            <View className="flex-row border-b border-gray-50 pb-2">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex-1">Department</Text>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex-1 text-center">Status</Text>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex-1 text-center">Capacity</Text>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex-1 text-end">Trend</Text>
            </View>
            <DepartmentItem name="Emergency Care" status="Stable" statusColor="emerald" capacity="82%" trend="down" />
            <DepartmentItem name="Cardiology" status="Critical" statusColor="rose" capacity="96%" trend="up" />
            <DepartmentItem name="Pediatrics" status="Optimal" statusColor="blue" capacity="64%" trend="neutral" />
          </View>
        </View>

        {/* Reports Summary */}
        <View className="mt-8 px-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Reports Summary</Text>
          <View className="rounded-3xl bg-white p-6 shadow-sm items-center">
            <DonutChart data={[
              { percent: 65, color: "#1e3a8a" },
              { percent: 25, color: "#065f46" },
              { percent: 10, color: "#475569" },
            ]} />

            <View className="w-full mt-4">
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <View className="h-3 w-3 rounded-full bg-blue-900 mr-2" />
                  <Text className="text-xs font-medium text-gray-600">In-Patient Billing</Text>
                </View>
                <Text className="text-xs font-bold text-gray-900">65%</Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <View className="h-3 w-3 rounded-full bg-emerald-800 mr-2" />
                  <Text className="text-xs font-medium text-gray-600">Lab Results</Text>
                </View>
                <Text className="text-xs font-bold text-gray-900">25%</Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <View className="h-3 w-3 rounded-full bg-slate-500 mr-2" />
                  <Text className="text-xs font-medium text-gray-600">Discharge Reports</Text>
                </View>
                <Text className="text-xs font-bold text-gray-900">10%</Text>
              </View>
            </View>

            <TouchableOpacity className="mt-6 w-full flex-row items-center justify-center rounded-2xl bg-blue-700 py-4">
              <Ionicons name="download-outline" size={18} color="white" className="mr-2" />
              <Text className="ml-2 text-sm font-bold text-white">Generate Monthly PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-24 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-800 shadow-lg shadow-blue-500/50"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Bottom Tab Bar Mock */}
      <View className="absolute bottom-0 w-full flex-row justify-around items-center bg-white border-t border-gray-100 py-3 pb-8">
        <TouchableOpacity className="items-center">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 mb-1">
            <Ionicons name="grid" size={22} color="#0052CC" />
          </View>
          <Text className="text-[10px] font-bold text-blue-700 uppercase">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="people-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="stats-chart-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="settings-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
   
  );
};

const DashboardScreen = ({ navigation }) => {
  return (
    <AdminLayout>
      <DashboardContent navigation={navigation} />
    </AdminLayout>
  );
};




export default DashboardScreen;