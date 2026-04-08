import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AdminLayout, { useSidebar } from "./AdminLayout";
import { api } from '../../services/api';

const { width } = Dimensions.get("window");

const MetricCard = ({ title, value, subtitle, icon, color, bgColor }) => (
  <View
    style={[styles.metricCard, { backgroundColor: bgColor, borderColor: `${color}20` }]}
    className="relative overflow-hidden"
  >
    {/* Decorative circles mimicking the web design */}
    <View
      className="absolute top-[-20] right-[-20] w-20 h-20 rounded-full opacity-10"
      style={{ backgroundColor: color }}
    />
    <View
      className="absolute bottom-[-20] left-[-20] w-16 h-16 rounded-full opacity-5"
      style={{ backgroundColor: color }}
    />

    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: color }}>
          {title}
        </Text>
        <Text className="text-2xl font-black text-slate-900 mt-1">{value}</Text>
      </View>
      <View
        className="w-10 h-10 items-center justify-center rounded-xl shadow-sm"
        style={{ backgroundColor: color }}
      >
        <Ionicons name={icon} size={20} color="white" />
      </View>
    </View>

    <View className="mt-4 pt-3 border-t" style={{ borderColor: `${color}10` }}>
      <Text className="text-[9px] font-bold" style={{ color: color }}>
        {subtitle}
      </Text>
    </View>
  </View>
);

const AuditLogsContent = () => {
  const { toggleSidebar } = useSidebar();
  const navigation = useNavigation();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const cacheBuster = `t=${Date.now()}`;
      const fetchOptions = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      };

      // Using the central api service for consistent handling
      const posts = await api.get(
        `https://jsonplaceholder.typicode.com/posts?_limit=10&${cacheBuster}`,
        fetchOptions
      );
      const usersData = await api.get(
        `https://jsonplaceholder.typicode.com/users?${cacheBuster}`,
        fetchOptions
      );

      const users = usersData.slice(0, 12).map((u, i) => ({
        id: `USR-${4000 + i}`,
        name: u.name,
        role: ["Admin", "Manager", "User", "Super Admin"][i % 4],
        email: u.email,
      }));

      const logs = posts.map((p, i) => ({
        id: `LOG-${5000 + i}`,
        user: users[i % users.length].name,
        action: ["Login", "Update", "Create", "Delete"][i % 4],
        resource: ["User", "Settings", "Subscription", "System"][i % 4],
        timestamp: new Date(Date.now() - i * 600000).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        ip: `192.168.1.${i + 1}`,
      }));

      setAuditLogs(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
          Securing Logs...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 py-6 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={toggleSidebar}
              className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50"
              activeOpacity={0.7}
            >
              <Ionicons name="menu-outline" size={26} color="#4F46E5" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">
                Audit Logs
              </Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                System Activity Monitor
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={fetchAuditLogs}
            className="h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
          >
            <Ionicons name="refresh" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <MetricCard
            title="Total Logs"
            value={auditLogs.length}
            subtitle="All system activities"
            icon="list"
            color="#3b82f6"
            bgColor="#eff6ff"
          />
          <MetricCard
            title="User Logins"
            value={auditLogs.filter((log) => log.action === "Login").length}
            subtitle="Successful access"
            icon="log-in"
            color="#10b981"
            bgColor="#f0fdf4"
          />
          <MetricCard
            title="Updates"
            value={auditLogs.filter((log) => log.action === "Update").length}
            subtitle="Data modifications"
            icon="create"
            color="#a855f7"
            bgColor="#f5f3ff"
          />
          <MetricCard
            title="Creations"
            value={auditLogs.filter((log) => log.action === "Create").length}
            subtitle="New records added"
            icon="add-circle"
            color="#f59e0b"
            bgColor="#fffbeb"
          />
        </View>

        {/* Activity Table */}
        <View className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
          <View className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex-row items-center justify-between">
            <Text className="font-black text-slate-800 uppercase tracking-widest text-[10px]">
              Activity History
            </Text>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-[9px] font-bold text-emerald-600 uppercase">Live</Text>
            </View>
          </View>

          {auditLogs.map((log, index) => (
            <TouchableOpacity
              key={log.id}
              className={`px-6 py-5 flex-row items-center border-b border-slate-50 ${index === auditLogs.length - 1 ? 'border-b-0' : ''}`}
              activeOpacity={0.6}
            >
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-black text-slate-800">{log.user}</Text>
                  <View className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    <Text className="text-[8px] font-bold text-blue-600 uppercase">{log.action}</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-[10px] font-medium text-slate-500">{log.resource}</Text>
                  <Text className="mx-2 text-slate-300">•</Text>
                  <Text className="text-[10px] font-medium text-slate-500">{log.timestamp}</Text>

                </View>

                <View className="mt-2 flex-row items-center">
                  <Ionicons name="globe-outline" size={10} color="#94a3b8" />
                  <Text className="ml-1 text-[9px] font-bold text-slate-400">{log.ip}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" className="ml-2" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View className="absolute bottom-0 w-full flex-row justify-around items-center bg-white border-t border-slate-100 py-4 pb-10 shadow-2xl">
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("DashboardScreen")}
        >
          <Ionicons name="grid-outline" size={22} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-bold text-slate-400 uppercase">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("DoctorManagement")}
        >
          <Ionicons name="people-outline" size={22} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-bold text-slate-400 uppercase">Doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("ReportsManagement")}
        >
          <Ionicons name="stats-chart-outline" size={22} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-bold text-slate-400 uppercase">Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 mb-1 shadow-lg shadow-indigo-200">
            <Ionicons name="shield-checkmark" size={20} color="white" />
          </View>
          <Text className="text-[10px] font-black text-indigo-600 uppercase">Audit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AuditLogsScreen = () => {
  return (
    <AdminLayout>
      <AuditLogsContent />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    width: (width - 52) / 2,
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
});

export default AuditLogsScreen;

