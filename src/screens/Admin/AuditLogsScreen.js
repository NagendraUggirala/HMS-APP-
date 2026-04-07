import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AdminLayout, { useSidebar } from "./AdminLayout";

const auditLogs = [
  { id: '1', user: 'Admin John', action: 'Modified Doctor Profile', target: 'Dr. Smith', timestamp: '2026-03-28 10:15:22', severity: 'Low' },
  { id: '2', user: 'Admin Sarah', action: 'Changed Hospital Settings', target: 'Logo', timestamp: '2026-03-27 15:45:10', severity: 'Medium' },
  { id: '3', user: 'System', action: 'Auto-Backup Completed', target: 'Database', timestamp: '2026-03-27 00:00:01', severity: 'Info' },
  { id: '4', user: 'Admin John', action: 'Emergency Access Granted', target: 'Ward B', timestamp: '2026-03-26 23:12:45', severity: 'High' },
  { id: '5', user: 'Admin Mike', action: 'New Staff Registered', target: 'Receptionist Jane', timestamp: '2026-03-26 09:30:12', severity: 'Low' },
];

const AuditLogsContent = () => {
  const { toggleSidebar } = useSidebar();
  const navigation = useNavigation();
  
  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Slate Accent Bar */}
      <View className="h-1 bg-slate-800" />

      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-slate-50">
            <Ionicons name="shield-checkmark" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Security Console</Text>
            <Text className="text-lg font-black text-slate-900 uppercase tracking-tighter">System Audit</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
          onPress={() => Alert.alert("Filter", "Filter options will appear here.")}
        >
          <Ionicons name="options-outline" size={20} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
              <View className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Monitoring</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert("Export", "Audit logs exported as CSV.")}>
              <Text className="text-[10px] font-bold text-blue-600 uppercase">Export Record</Text>
            </TouchableOpacity>
          </View>

          {auditLogs.map((log, index) => (
            <View key={log.id} className="flex-row mb-8">
              {/* Timeline Line */}
              <View className="items-center mr-4">
                <View className={`h-4 w-4 rounded-full border-2 bg-white ${
                   log.severity === 'High' ? 'border-rose-500' : 
                   log.severity === 'Medium' ? 'border-amber-500' : 'border-slate-300'
                }`} />
                {index !== auditLogs.length - 1 && <View className="w-0.5 flex-1 bg-slate-100 my-1" />}
              </View>
              
              <View className="flex-1 bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 -mt-1">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[10px] font-black text-slate-400 uppercase">{log.timestamp.split(' ')[1]}</Text>
                  <View className={`px-2 py-0.5 rounded-md ${
                    log.severity === 'High' ? 'bg-rose-50' : 
                    log.severity === 'Medium' ? 'bg-amber-50' : 'bg-slate-50'
                  }`}>
                    <Text className={`text-[8px] font-bold uppercase ${
                      log.severity === 'High' ? 'text-rose-600' : 
                      log.severity === 'Medium' ? 'text-amber-600' : 'text-slate-500'
                    }`}>{log.severity}</Text>
                  </View>
                </View>
                <Text className="text-sm font-black text-slate-800">{log.action}</Text>
                <View className="flex-row items-center mt-3">
                   <Ionicons name="person-circle-outline" size={14} color="#94a3b8" />
                   <Text className="text-[10px] font-bold text-gray-400 ml-1 uppercase">{log.user}</Text>
                   <Text className="text-[10px] text-gray-300 mx-2">•</Text>
                   <Text className="text-[10px] font-medium text-gray-500">{log.target}</Text>
                </View>
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            className="w-full bg-slate-900 h-14 rounded-2xl items-center justify-center mt-4"
            onPress={() => Alert.alert("Load More", "Loading older logs...")}
          >
            <Text className="text-white text-[10px] font-black uppercase tracking-widest">Load Previous History</Text>
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

const AuditLogsScreen = () => (
  <AdminLayout>
    <AuditLogsContent />
  </AdminLayout>
);

export default AuditLogsScreen;
