import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

// ─── endpoint ─────────────────────────────────────────────────────────────────

const EP = { DASHBOARD: "/api/v1/nurse/dashboard" };
const { width } = Dimensions.get("window");

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, iconColor, bgColor, loading }) => (
  <View
    className="bg-white rounded-3xl p-5 mb-3 shadow-sm border border-gray-50"
    style={{ width: (width - 52) / 2 }}
  >
    <View
      className="h-11 w-11 rounded-2xl items-center justify-center mb-3"
      style={{ backgroundColor: bgColor }}
    >
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
      {label}
    </Text>
    {loading ? (
      <View className="h-8 w-12 bg-gray-100 rounded-lg animate-pulse" />
    ) : (
      <Text className="text-3xl font-black text-gray-900">{value ?? 0}</Text>
    )}
  </View>
);

// ─── VitalItem ────────────────────────────────────────────────────────────────

const VitalItem = ({ name, bed, temp, time, isLast }) => {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();

  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        !isLast ? "border-b border-gray-50" : ""
      }`}
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View className="h-10 w-10 rounded-2xl bg-blue-100 items-center justify-center mr-3">
          <Text className="text-blue-600 font-black text-xs">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
            {name || "Unknown Patient"}
          </Text>
          <Text className="text-[10px] text-gray-400 font-medium">
            {bed || "No Bed Info"}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-xs font-bold text-gray-800">{temp || "N/A"}</Text>
        <Text className="text-[10px] text-gray-400 font-medium">{time || ""}</Text>
      </View>
    </View>
  );
};

// ─── TaskItem ─────────────────────────────────────────────────────────────────

const TASK_STYLES = {
  red:    { bg: "#fff1f2", bar: "#ef4444" },
  yellow: { bg: "#fffbeb", bar: "#f59e0b" },
  blue:   { bg: "#eff6ff", bar: "#3b82f6" },
};

const TaskItem = ({ title, desc, type }) => {
  const style = TASK_STYLES[type] || TASK_STYLES.blue;
  return (
    <View
      className="flex-row items-center p-4 rounded-2xl mb-3"
      style={{ backgroundColor: style.bg }}
    >
      <View
        className="w-1 h-10 rounded-full mr-3"
        style={{ backgroundColor: style.bar }}
      />
      <View className="flex-1">
        <Text className="text-sm font-bold text-gray-900">{title || "Unknown Task"}</Text>
        {!!desc && (
          <Text className="text-[10px] text-gray-500 font-medium mt-0.5">{desc}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
    </View>
  );
};

// ─── Bar Chart (pure RN — no library) ────────────────────────────────────────

const CHART_BARS = [
  { key: "stable",     label: "Stable",     color: "#22c55e" },
  { key: "improving",  label: "Improving",  color: "#f59e0b" },
  { key: "critical",   label: "Critical",   color: "#ef4444" },
  { key: "monitoring", label: "Monitoring", color: "#3b82f6" },
];

const PatientBarChart = ({ status }) => {
  const vals = CHART_BARS.map((b) => status?.[b.key] ?? 0);
  const max = Math.max(...vals, 1);
  const chartHeight = 140;

  return (
    <View>
      <View className="flex-row items-end justify-around" style={{ height: chartHeight }}>
        {CHART_BARS.map((bar, i) => {
          const barH = Math.max(Math.round((vals[i] / max) * (chartHeight - 28)), 6);
          return (
            <View key={bar.key} className="items-center flex-1 mx-1">
              {/* Value label on top */}
              <Text className="text-[11px] font-black text-gray-700 mb-1">
                {vals[i]}
              </Text>
              {/* Bar */}
              <View
                style={{
                  height: barH,
                  backgroundColor: bar.color,
                  width: "100%",
                  borderRadius: 8,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              />
            </View>
          );
        })}
      </View>
      {/* X-axis labels */}
      <View className="flex-row justify-around mt-2">
        {CHART_BARS.map((bar) => (
          <View key={bar.key} className="flex-1 items-center">
            <View
              className="h-2 w-2 rounded-full mb-1"
              style={{ backgroundColor: bar.color }}
            />
            <Text className="text-[9px] font-bold text-gray-400 uppercase text-center">
              {bar.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon, label }) => (
  <View className="items-center py-8 gap-2">
    <MaterialCommunityIcons name={icon} size={32} color="#e2e8f0" />
    <Text className="text-xs text-gray-300 font-bold">{label}</Text>
  </View>
);

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, icon }) => (
  <View className="flex-row items-center mb-4">
    <Ionicons name={icon} size={16} color="#2563eb" />
    <Text className="text-base font-black text-gray-900 ml-2">{title}</Text>
  </View>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const NurseDashboardContent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try the new URL first
      let res;
      try {
        res = await api.get(EP.DASHBOARD);
      } catch (firstErr) {
        // If it fails, fallback to the original overview URL
        res = await api.get("/api/v1/nurse/dashboard/overview");
      }
      setData(res?.data ?? res);
    } catch (err) {
      console.error("Dashboard error:", err);
      // Ensure error is a string so React Native Text doesn't crash
      setError(String(err.message || err || "Unable to load dashboard data"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  const vitals = Array.isArray(data?.recent_vitals) ? data.recent_vitals : Array.isArray(data?.recentVitals) ? data.recentVitals : [];
  const tasks  = Array.isArray(data?.pending_tasks)  ? data.pending_tasks  : Array.isArray(data?.pendingTasks) ? data.pendingTasks : [];
  const statusData = data?.patient_status || data?.patientStatus || {};

  // ── loading skeleton ─────────────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-xs text-gray-400 font-medium mt-3">
          Loading dashboard…
        </Text>
      </View>
    );
  }

  // ── error fallback ───────────────────────────────────────────────────────
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-[#f8fafc]">
        <View className="h-16 w-16 rounded-full bg-rose-100 items-center justify-center mb-4">
          <Ionicons name="warning-outline" size={32} color="#ef4444" />
        </View>
        <Text className="text-rose-600 font-bold text-center text-lg mb-2">API Error</Text>
        <Text className="text-rose-500 font-medium text-center text-xs mb-6 px-4">{error}</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-6 py-3 rounded-xl shadow-sm"
          onPress={fetchDashboard}
        >
          <Text className="text-white font-black">Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2563eb"]}
          tintColor="#2563eb"
        />
      }
    >
      {/* ── Page Header ── */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-2xl font-black text-gray-900">Dashboard</Text>
          <Text className="text-xs text-gray-400 font-medium mt-0.5">
            Overview
          </Text>
        </View>
        <TouchableOpacity
          className="h-10 w-10 rounded-2xl bg-white items-center justify-center border border-gray-100 shadow-sm"
          onPress={fetchDashboard}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Ionicons name="refresh-outline" size={18} color="#64748b" />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Stats Grid (2×2) ── */}
      <View className="flex-row flex-wrap justify-between mb-2">
        <StatCard
          label="Assigned Patients"
          value={data?.assigned_patients ?? data?.assignedPatients ?? data?.assigned ?? 0}
          icon="people"
          iconColor="#2563eb"
          bgColor="#eff6ff"
          loading={loading}
        />
        <StatCard
          label="Medications Due"
          value={data?.medications_due ?? data?.medicationsDue ?? data?.medications ?? 0}
          icon="medical"
          iconColor="#10b981"
          bgColor="#ecfdf5"
          loading={loading}
        />
        <StatCard
          label="Available Beds"
          value={data?.available_beds ?? data?.availableBeds ?? data?.beds ?? 0}
          icon="bed-outline"
          iconColor="#f59e0b"
          bgColor="#fffbeb"
          loading={loading}
        />
        <StatCard
          label="Critical Patients"
          value={data?.critical_patients ?? data?.criticalPatients ?? data?.critical ?? 0}
          icon="warning"
          iconColor="#ef4444"
          bgColor="#fff1f2"
          loading={loading}
        />
      </View>

      {/* ── Recent Vitals ── */}
      <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-50">
        <SectionHeader title="Recent Vitals" icon="pulse-outline" />
        {vitals.length === 0 ? (
          <EmptyState icon="heart-off-outline" label="No recent vitals" />
        ) : (
          vitals.map((v, idx) => (
            <VitalItem
              key={idx}
              name={v?.patient_name || v?.name}
              bed={v?.room_number || v?.bed}
              temp={v?.temperature || v?.temp}
              time={
                v?.time ||
                (v?.timestamp
                  ? new Date(v.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "")
              }
              isLast={idx === vitals.length - 1}
            />
          ))
        )}
      </View>

      {/* ── Pending Tasks ── */}
      <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-50">
        <SectionHeader title="Pending Tasks" icon="checkmark-circle-outline" />
        {tasks.length === 0 ? (
          <EmptyState icon="clipboard-check-outline" label="No pending tasks" />
        ) : (
          tasks.map((task, idx) => (
            <TaskItem
              key={idx}
              title={task?.title}
              desc={task?.description || task?.desc}
              type={task?.type || task?.priority}
            />
          ))
        )}
      </View>

      {/* ── Patient Status Bar Chart ── */}
      <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-50">
        <SectionHeader title="Patient Status Overview" icon="stats-chart-outline" />

        {/* Legend strip */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {CHART_BARS.map((bar) => (
            <View key={bar.key} className="flex-row items-center gap-1.5">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: bar.color }}
              />
              <Text className="text-[10px] font-bold text-gray-500 uppercase">
                {bar.label}
              </Text>
            </View>
          ))}
        </View>

        <PatientBarChart status={statusData} />
      </View>

      <View className="h-4" />
    </ScrollView>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function NurseDashboardScreen() {
  return (
    <NurseLayout>
      <NurseDashboardContent />
    </NurseLayout>
  );
}
