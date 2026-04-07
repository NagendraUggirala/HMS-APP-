import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AdminLayout, { useSidebar } from "./AdminLayout";

const INITIAL_NOTIFICATIONS = [
  { id: '1', title: 'New Appointment', message: 'Dr. Smith has a new appointment at 2:00 PM', time: '5 mins ago', type: 'appointment', read: false, screen: 'AppointmentManagement' },
  { id: '2', title: 'Critical Lab Result', message: 'Urgent: Lab result for Patient Jane Doe is ready', time: '15 mins ago', type: 'lab', read: false, screen: 'LabManagement' },
  { id: '3', title: 'System Update', message: 'Hospital Management System updated to v1.0.4', time: '1 hour ago', type: 'system', read: true, screen: 'SettingsManagement' },
  { id: '4', title: 'Billing Alert', message: 'Monthly financial report for March is generated', time: '3 hours ago', type: 'billing', read: true, screen: 'BillingManagement' },
  { id: '5', title: 'Staff Check-in', message: 'Nurse Mary checked in for the night shift', time: '5 hours ago', type: 'staff', read: true, screen: 'StaffManagement' },
];

const NotificationContent = () => {
  const { toggleSidebar } = useSidebar();
  const navigation = useNavigation();
  const [notifList, setNotifList] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifList(notifList.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifList([]);
  };

  const handleNotifPress = (notif) => {
    // Mark as read when clicking
    setNotifList(notifList.map(n => n.id === notif.id ? { ...n, read: true } : n));

    // Requirement from user: clicking should show the full context (remaining entries)
    if (notif.screen) {
      navigation.navigate(notif.screen, { highlightId: notif.id });
    } else {
      navigation.navigate('NotificationDetails', { notification: notif });
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Indigo Accent Bar */}
      <View className="h-1 bg-indigo-600" />

      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
            <Ionicons name="notifications" size={24} color="#4f46e5" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Control</Text>
            <Text className="text-lg font-black text-indigo-900 uppercase italic">Notifications</Text>
          </View>
        </View>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-indigo-100/50"
          onPress={markAllAsRead}
        >
          <Ionicons name="checkmark-done" size={20} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <View className="flex-row items-center justify-between mb-8 px-1">
            <View>
              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">System Events</Text>
              <View className="h-0.5 w-8 bg-indigo-500 mt-1" />
            </View>
            {notifList.length > 0 && (
              <TouchableOpacity onPress={clearAll} className="bg-white border border-gray-100 px-3 py-1.5 rounded-xl">
                <Text className="text-[10px] font-bold text-gray-400 uppercase">Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {notifList.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="h-20 w-20 bg-indigo-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="notifications-off-outline" size={40} color="#818cf8" />
              </View>
              <Text className="text-gray-400 font-bold">Notifications Empty</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {notifList.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  onPress={() => handleNotifPress(notif)}
                  activeOpacity={0.8}
                  className={`mb-4 w-[48%] p-5 rounded-[32px] shadow-sm border ${notif.read ? 'bg-white border-gray-100' : 'bg-white border-indigo-200 shadow-indigo-100/50'}`}
                >
                  <View className={`h-10 w-10 rounded-2xl items-center justify-center mb-3 ${notif.type === 'appointment' ? 'bg-indigo-100' :
                    notif.type === 'lab' ? 'bg-rose-100' :
                      notif.type === 'billing' ? 'bg-emerald-100' : 'bg-blue-100'
                    }`}>
                    <Ionicons
                      name={
                        notif.type === 'appointment' ? 'calendar' :
                          notif.type === 'lab' ? 'flask' :
                            notif.type === 'billing' ? 'card' : 'notifications'
                      }
                      size={20}
                      color={
                        notif.type === 'appointment' ? '#4f46e5' :
                          notif.type === 'lab' ? '#e11d48' :
                            notif.type === 'billing' ? '#059669' : '#2563eb'
                      }
                    />
                  </View>
                  <View>
                    <Text className={`text-[11px] font-black leading-4 ${notif.read ? 'text-gray-900' : 'text-indigo-900'}`} numberOfLines={2}>
                      {notif.title}
                    </Text>
                    <Text className="text-[9px] text-gray-500 mt-2 leading-3" numberOfLines={2}>
                      {notif.message}
                    </Text>
                    <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <Text className="text-[8px] font-bold text-gray-400 uppercase">{notif.time}</Text>
                      {!notif.read && <View className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-sm" />}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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

const NotificationScreen = () => (
  <AdminLayout>
    <NotificationContent />
  </AdminLayout>
);

export default NotificationScreen;
