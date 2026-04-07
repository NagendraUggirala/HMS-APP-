import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AdminLayout, { useSidebar } from "./AdminLayout";

const NotificationDetailsContent = () => {
  const { toggleSidebar } = useSidebar();
  const navigation = useNavigation();
  const route = useRoute();
  const { notification } = route.params || { 
    notification: { 
      title: 'Detail View', 
      message: 'No details available', 
      type: 'system', 
      time: 'Just now' 
    } 
  };
  
  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="chevron-back" size={24} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notification</Text>
            <Text className="text-lg font-black text-gray-900">Details</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50"
          onPress={() => Alert.alert("Calendar", "View calendar for this event?")}
        >
          <Ionicons name="calendar-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 items-center">
          <View className={`h-24 w-24 rounded-[32px] items-center justify-center mb-6 ${
            notification.type === 'appointment' ? 'bg-indigo-50' :
            notification.type === 'lab' ? 'bg-rose-50' :
            notification.type === 'billing' ? 'bg-emerald-50' : 'bg-blue-50'
          }`}>
            <Ionicons 
              name={
                notification.type === 'appointment' ? 'calendar' :
                notification.type === 'lab' ? 'flask' :
                notification.type === 'billing' ? 'card' : 'notifications'
              } 
              size={44} 
              color={
                notification.type === 'appointment' ? '#4f46e5' :
                notification.type === 'lab' ? '#e11d48' :
                notification.type === 'billing' ? '#059669' : '#2563eb'
              } 
            />
          </View>
          
          <Text className="text-2xl font-black text-gray-900 text-center mb-2 px-4">{notification.title}</Text>
          <Text className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-6">{notification.time}</Text>
          
          <View className="w-full bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
            <Text className="text-sm font-semibold text-gray-600 leading-6 text-center">
              {notification.message}
            </Text>
          </View>

          <View className="w-full space-y-4">
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity 
                className="flex-1 bg-white border-2 border-blue-600 py-4 rounded-2xl items-center mr-2 flex-row justify-center"
                onPress={() => Alert.alert("Reschedule", "Opening rescheduling interface...")}
              >
                <Ionicons name="time-outline" size={20} color="#2563eb" className="mr-2" />
                <Text className="ml-2 font-black text-blue-600 text-[10px] uppercase">Reschedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-blue-700 py-4 rounded-2xl items-center ml-2 flex-row justify-center shadow-lg shadow-blue-200"
                onPress={() => Alert.alert("Calendar", "Adding to your primary calendar...")}
              >
                <Ionicons name="calendar" size={20} color="white" className="mr-2" />
                <Text className="ml-2 font-black text-white text-[10px] uppercase">To Calendar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="w-full bg-gray-900 py-5 rounded-2xl items-center flex-row justify-center"
              onPress={() => Alert.alert("Download", "Downloading record attachment...")}
            >
              <Ionicons name="download-outline" size={22} color="white" className="mr-2" />
              <Text className="ml-2 font-black text-white text-[10px] uppercase">Download Report PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8 px-2">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Related Actions</Text>
          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100" onPress={() => navigation.navigate("StaffManagement")}>
            <View className="h-10 w-10 bg-gray-100 rounded-xl items-center justify-center mr-4">
              <Ionicons name="people-outline" size={20} color="#64748b" />
            </View>
            <Text className="flex-1 font-bold text-gray-800">Contact Responsible Staff</Text>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100" onPress={() => navigation.navigate("RaiseTicket")}>
            <View className="h-10 w-10 bg-gray-100 rounded-xl items-center justify-center mr-4">
              <Ionicons name="help-buoy-outline" size={20} color="#64748b" />
            </View>
            <Text className="flex-1 font-bold text-gray-800">Raise a Support Ticket</Text>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Standard Bottom Tab Bar Mock */}
      <View className="w-full flex-row justify-around items-center bg-white border-t border-gray-100 py-3 pb-8">
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate("DashboardOverview")}
        >
          <Ionicons name="grid-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate("InpatientManagement")}
        >
          <Ionicons name="people-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate("ReportsManagement")}
        >
          <Ionicons name="stats-chart-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate("SettingsManagement")}
        >
          <Ionicons name="settings-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NotificationDetailsScreen = () => (
  <AdminLayout>
    <NotificationDetailsContent />
  </AdminLayout>
);

export default NotificationDetailsScreen;
