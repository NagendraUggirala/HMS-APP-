import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../services/api";
import AdminLayout, { useSidebar } from "./AdminLayout";

const { width } = Dimensions.get("window");

const MetricCard = ({ title, value, subtitle, icon, iconColor, bgColor, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.metricCard, { backgroundColor: bgColor }]}
    className="relative overflow-hidden"
  >
    <View className="relative z-10">
      <View
        className="w-10 h-10 items-center justify-center rounded-full mb-3 shadow-sm"
        style={{ backgroundColor: iconColor }}
      >
        <Ionicons name={icon} size={18} color="white" />
      </View>
      <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{title}</Text>
      <Text className="text-2xl font-black text-slate-900 mt-1">{value}</Text>
      <Text className="text-[9px] text-slate-400 font-medium mt-1">{subtitle}</Text>
    </View>
    <View
      className="absolute -right-4 -bottom-4 opacity-10"
      style={{ transform: [{ rotate: '-15deg' }] }}
    >
      <Ionicons name={icon} size={80} color={iconColor} />
    </View>
  </TouchableOpacity>
);

const DashSection = ({ title, subtitle, onActionPress, actionLabel, children, icon, iconColor, iconBg }) => (
  <View className="mb-6 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100/50">
    <View className="flex-row items-center justify-between mb-6">
      <View className="flex-row items-center">
        {icon && (
          <View
            className="w-10 h-10 items-center justify-center rounded-full mr-3 shadow-sm"
            style={{ backgroundColor: iconBg }}
          >
            <Ionicons name={icon} size={20} color="white" />
          </View>
        )}
        <View>
          <Text className="text-lg font-black text-slate-800 tracking-tight">{title}</Text>
          {subtitle && <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          className="bg-slate-50 px-4 py-2 rounded-xl"
        >
          <Text className="text-xs font-bold text-blue-600">{actionLabel || "View All"}</Text>
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);

const ActionItem = ({ label, icon, iconBg, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-full flex-row items-center justify-between p-4 mb-3 border border-slate-100 rounded-[22px] bg-slate-50/30"
    activeOpacity={0.6}
  >
    <View className="flex-row items-center">
      <View
        className="w-10 h-10 items-center justify-center rounded-xl mr-4"
        style={{ backgroundColor: `${iconBg}20` }}
      >
        <Ionicons name={icon} size={18} color={iconBg} />
      </View>
      <Text className="text-sm font-bold text-slate-700">{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
  </TouchableOpacity>
);

const DashboardContent = () => {
  const navigation = useNavigation();
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [warning, setWarning] = useState("");
  const [dashboardData, setDashboardData] = useState({
    dashboard_type: "",
    total_hospitals: 0,
    active_hospitals: 0,
    total_admins: 0,
    active_admins: 0,
    total_patients: 0,
    total_appointments: 0,
    patient_metrics: { total_patients: 0, active_patients: 0, patient_activity_rate: 0 },
    staff_metrics: { total_staff: 0, total_doctors: 0, active_doctors: 0, doctor_utilization_rate: 0 },
    appointment_metrics: { todays_appointments: 0, monthly_appointments: 0, completed_appointments: 0, appointment_completion_rate: 0 },
    bed_metrics: { total_beds: 0, occupied_beds: 0, available_beds: 0, bed_occupancy_rate: 0, current_admissions: 0, todays_admissions: 0, todays_discharges: 0 },
    revenue_metrics: { monthly_consultation_revenue: 0, monthly_payments: 0, total_monthly_revenue: 0 },
    appointments_today: 0,
    appointments_this_week: 0,
    appointments_by_status: {},
    appointments_by_department: {},
    total_staff: 0,
    active_staff: 0,
    staff_by_role: {},
    staff_by_department: {},
    criticalAlerts: [
      { id: 1, type: "bed", severity: "high", message: "ICU beds at 95% capacity", time: "2 hours ago" },
      { id: 2, type: "staff", severity: "medium", message: "3 nurses on leave tomorrow", time: "4 hours ago" },
      { id: 3, type: "equipment", severity: "low", message: "MRI maintenance due in 3 days", time: "1 day ago" }
    ],
  });

  const loadDashboardData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setWarning("");

    try {
      const toDictOfNumbers = (maybeObj) => {
        if (!maybeObj || typeof maybeObj !== "object" || Array.isArray(maybeObj)) return {};
        return Object.fromEntries(
          Object.entries(maybeObj).map(([k, v]) => [k, typeof v === "number" ? v : Number(v) || 0])
        );
      };

      const parseAppointmentStats = (raw) => {
        const overall = raw?.overall_statistics ?? {};
        const time = raw?.time_period_breakdown ?? {};
        const departmentBreakdown = raw?.department_breakdown;

        let appointments_by_department = {};
        if (departmentBreakdown) {
          if (typeof departmentBreakdown === "object" && !Array.isArray(departmentBreakdown)) {
            appointments_by_department = toDictOfNumbers(departmentBreakdown);
          } else if (Array.isArray(departmentBreakdown)) {
            appointments_by_department = Object.fromEntries(
              departmentBreakdown.map((item) => {
                const dept = item?.department ?? item?.department_name ?? item?.name ?? item?.dept ?? item?.department_id;
                const count = item?.total_appointments ?? item?.total ?? item?.count ?? 0;
                return dept ? [String(dept), Number(count) || 0] : null;
              }).filter(Boolean)
            );
          }
        }

        return {
          total_appointments: raw?.total_appointments ?? overall?.total_appointments ?? 0,
          appointments_today: raw?.appointments_today ?? time?.today?.total ?? 0,
          appointments_this_week: raw?.appointments_this_week ?? time?.this_week?.total ?? 0,
          appointments_by_status: toDictOfNumbers(raw?.appointments_by_status || {
            completed: overall?.completed_appointments ?? 0,
            cancelled: overall?.cancelled_appointments ?? 0,
            no_show: overall?.no_show_appointments ?? 0,
            pending: overall?.pending_appointments ?? 0,
          }),
          appointments_by_department,
        };
      };

      const parseStaffStats = (raw) => {
        const summary = raw?.summary ?? {};
        const roleBreakdown = Array.isArray(raw?.role_breakdown) ? raw.role_breakdown : [];
        const departmentDistribution = Array.isArray(raw?.department_distribution) ? raw.department_distribution : [];

        const staff_by_role = Object.fromEntries(
          roleBreakdown.map((item) => {
            const role = item?.role ?? item?.name ?? item?.position ?? null;
            const count = item?.active_count ?? item?.total_count ?? item?.total ?? item?.count ?? 0;
            return role ? [String(role), Number(count) || 0] : null;
          }).filter(Boolean)
        );

        const staff_by_department = Object.fromEntries(
          departmentDistribution.map((item) => {
            const dept = item?.department ?? item?.department_name ?? item?.name ?? null;
            const count = item?.active_count ?? item?.total_count ?? item?.total ?? item?.count ?? 0;
            return dept ? [String(dept), Number(count) || 0] : null;
          }).filter(Boolean)
        );

        return {
          total_staff: raw?.total_staff ?? summary?.total_staff ?? 0,
          active_staff: raw?.active_staff ?? summary?.active_staff ?? 0,
          staff_by_role,
          staff_by_department,
        };
      };

      const [overviewRes, appointmentRes, staffRes] = await Promise.allSettled([
        api.get("/api/v1/hospital-admin/dashboard/overview"),
        api.get("/api/v1/hospital-admin/dashboard/appointment-stats"),
        api.get("/api/v1/hospital-admin/dashboard/staff-stats"),
      ]);

      const warnings = [];
      let overview = overviewRes.status === "fulfilled" ? overviewRes.value : {};
      let appointmentRaw = appointmentRes.status === "fulfilled" ? appointmentRes.value : null;
      let staffRaw = staffRes.status === "fulfilled" ? staffRes.value : null;

      if (overviewRes.status === "rejected") warnings.push("Overview failed");

      const appointmentParsed = appointmentRaw ? parseAppointmentStats(appointmentRaw) : null;
      const staffParsed = staffRaw ? parseStaffStats(staffRaw) : null;

      setDashboardData((prev) => ({
        ...prev,
        dashboard_type: overview?.dashboard_type ?? "",
        total_hospitals: overview?.total_hospitals ?? 0,
        active_hospitals: overview?.active_hospitals ?? 0,
        total_admins: overview?.total_admins ?? 0,
        active_admins: overview?.active_admins ?? 0,
        total_patients: overview?.patient_metrics?.total_patients ?? 0,

        patient_metrics: overview?.patient_metrics ?? prev.patient_metrics,
        staff_metrics: overview?.staff_metrics ?? prev.staff_metrics,
        appointment_metrics: overview?.appointment_metrics ?? prev.appointment_metrics,
        bed_metrics: overview?.bed_metrics ?? prev.bed_metrics,
        revenue_metrics: overview?.revenue_metrics ?? prev.revenue_metrics,

        total_appointments: appointmentParsed?.total_appointments ?? 0,
        appointments_today: appointmentParsed?.appointments_today ?? overview?.appointment_metrics?.todays_appointments ?? 0,
        appointments_this_week: appointmentParsed?.appointments_this_week ?? 0,
        appointments_by_status: appointmentParsed?.appointments_by_status ?? {},
        appointments_by_department: appointmentParsed?.appointments_by_department ?? {},

        total_staff: staffParsed?.total_staff ?? overview?.staff_metrics?.total_staff ?? 0,
        active_staff: staffParsed?.active_staff ?? overview?.staff_metrics?.total_staff ?? 0,
        staff_by_role: staffParsed?.staff_by_role ?? {},
        staff_by_department: staffParsed?.staff_by_department ?? {},
      }));

      if (warnings.length) setWarning(warnings.join(" • "));
    } catch (err) {
      setWarning(err.message || "An error occurred.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0052CC" />
        <Text className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Command Center Readying...</Text>
      </View>
    );
  }

  const staffOnLeave = dashboardData.total_staff - dashboardData.active_staff;
  const topStaffRoles = Object.entries(dashboardData.staff_by_role).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const statusBreakdown = Object.entries(dashboardData.appointments_by_status);
  const topAppointmentDepts = Object.entries(dashboardData.appointments_by_department).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const percent = (num, den) => (den > 0 ? Math.min(100, Math.max(0, (num / den) * 100)) : 0);

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
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">Dashboard</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hospital Admin Core</Text>
            </View>
          </View>
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
            onPress={() => navigation.navigate("Notification")}
          >
            <Ionicons name="notifications" size={20} color="#64748b" />
            <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row mt-6 gap-3">
          <TouchableOpacity
            onPress={() => navigation.navigate("InpatientManagement")}
            className="flex-1 flex-row items-center justify-center bg-rose-50 border border-rose-100 py-3 rounded-2xl"
          >
            <Ionicons name="medical" size={16} color="#e11d48" />
            <Text className="ml-2 text-xs font-black text-rose-700">Emergency Protocol</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ReportsManagement")}
            className="flex-1 flex-row items-center justify-center bg-blue-50 border border-blue-100 py-3 rounded-2xl"
          >
            <Ionicons name="stats-chart" size={16} color="#2563eb" />
            <Text className="ml-2 text-xs font-black text-blue-700">Generate Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Critical Alert */}
        {dashboardData.criticalAlerts?.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate("InpatientManagement")}
            className="mb-8 bg-rose-600 rounded-[32px] p-6 flex-row items-center shadow-lg shadow-rose-200"
          >
            <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mr-5">
              <Ionicons name="flash" size={26} color="white" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Critical Alert</Text>
                <View className="ml-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </View>
              <Text className="text-white font-bold text-lg leading-tight mt-1">{dashboardData.criticalAlerts[0].message}</Text>
              <Text className="text-white/70 text-[10px] font-bold mt-1 uppercase">{dashboardData.criticalAlerts[0].time} • ACTION REQUIRED</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="white" />
          </TouchableOpacity>
        )}

        {/* Global Metrics Grid (6 fields) */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <MetricCard
            title="Total Hospitals"
            value={dashboardData.total_hospitals}
            subtitle="Regional network"
            icon="business"
            iconColor="#3b82f6"
            bgColor="#eff6ff"
            onPress={() => navigation.navigate("HospitalManagement")}
          />
          <MetricCard
            title="Active Hospitals"
            value={dashboardData.active_hospitals}
            subtitle="Operational now"
            icon="checkmark-circle"
            iconColor="#10b981"
            bgColor="#f0fdf4"
            onPress={() => navigation.navigate("HospitalManagement")}
          />
          <MetricCard
            title="Total Admins"
            value={dashboardData.total_admins}
            subtitle="System curators"
            icon="shield-checkmark"
            iconColor="#8b5cf6"
            bgColor="#f5f3ff"
          />
          <MetricCard
            title="Active Admins"
            value={dashboardData.active_admins}
            subtitle="Logged in session"
            icon="pulse"
            iconColor="#f59e0b"
            bgColor="#fffbeb"
          />
          <MetricCard
            title="Total Patients"
            value={dashboardData.total_patients}
            subtitle="Lifetime registry"
            icon="people"
            iconColor="#f43f5e"
            bgColor="#fff1f2"
            onPress={() => navigation.navigate("PatientManagement")}
          />
          <MetricCard
            title="Appointments"
            value={dashboardData.total_appointments}
            subtitle="All-time bookings"
            icon="calendar"
            iconColor="#6366f1"
            bgColor="#f5f3ff"
            onPress={() => navigation.navigate("AppointmentsManagement")}
          />
        </View>

        {/* Staff Status */}
        <DashSection
          title="Staff Status"
          subtitle="Real-time Team Distribution"
          icon="people"
          iconBg="#3b82f6"
          onActionPress={() => navigation.navigate("StaffManagement")}
        >
          <View className="flex-row flex-wrap justify-between gap-3 mb-6">
            <View className="bg-slate-50 rounded-2xl p-4 w-[48%] border border-slate-100">
              <Text className="text-2xl font-black text-blue-600">{dashboardData.total_staff}</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Staff</Text>
            </View>
            <View className="bg-slate-50 rounded-2xl p-4 w-[48%] border border-slate-100">
              <Text className="text-2xl font-black text-emerald-600">{dashboardData.active_staff}</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Duty</Text>
            </View>
            <View className="bg-slate-50 rounded-2xl p-4 w-[48%] border border-slate-100">
              <Text className="text-2xl font-black text-rose-600">{staffOnLeave}</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">On Leave</Text>
            </View>
            <View className="bg-slate-50 rounded-2xl p-4 w-[48%] border border-slate-100">
              <Text className="text-2xl font-black text-violet-600">{Object.keys(dashboardData.staff_by_role).length}</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Role Types</Text>
            </View>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Roles</Text>
              <View className="h-[1px] flex-1 bg-slate-100 ml-4" />
            </View>
            {topStaffRoles.map(([role, count]) => (
              <View key={role} className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-bold text-slate-700 capitalize w-24">{role}</Text>
                <View className="flex-row items-center flex-1 ml-4">
                  <View className="h-1.5 flex-1 bg-slate-100 rounded-full mr-4">
                    <View className="h-full bg-blue-600 rounded-full" style={{ width: `${percent(count, dashboardData.total_staff)}%` }} />
                  </View>
                  <Text className="text-xs font-black text-slate-900 w-6 text-right">{count}</Text>
                </View>
              </View>
            ))}
          </View>
        </DashSection>

        {/* Quick Command Center */}
        <DashSection title="Quick Actions" subtitle="Direct Tactical Access" icon="flash" iconBg="#a855f7">
          <ActionItem label="Bed Allocation" icon="bed" iconBg="#3b82f6" onPress={() => navigation.navigate("InpatientManagement")} />
          <ActionItem label="Schedule Roster" icon="calendar-number" iconBg="#10b981" onPress={() => navigation.navigate("StaffManagement")} />
          <ActionItem label="Medical Inventory" icon="cube" iconBg="#f59e0b" onPress={() => navigation.navigate("PharmacyManagement")} />
          <ActionItem label="Pending Approvals" icon="shield-checkmark" iconBg="#8b5cf6" onPress={() => navigation.navigate("SettingsManagement")} />
        </DashSection>

        {/* Appointments Section */}
        <DashSection
          title="Appointments Overview"
          subtitle="Real‑time appointment metrics"
          icon="calendar-outline"
          iconBg="#0ea5e9"
          onActionPress={() => navigation.navigate("AppointmentsManagement")}
        >
          <View className="flex-row justify-between items-center mb-8 bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <View className="items-center">
              <Text className="text-2xl font-black text-slate-900">{dashboardData.appointments_today}</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase mt-1">Today</Text>
            </View>
            <View className="w-[1px] h-8 bg-slate-200" />
            <View className="items-center">
              <Text className="text-2xl font-black text-slate-900">{dashboardData.appointments_this_week}</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase mt-1">Weekly</Text>
            </View>
            <View className="w-[1px] h-8 bg-slate-200" />
            <View className="items-center">
              <Text className="text-2xl font-black text-slate-900">{dashboardData.total_appointments}</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase mt-1">Total</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <Text className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-tighter">By Status</Text>
              {statusBreakdown.slice(0, 4).map(([status, count]) => (
                <View key={status} className="flex-row justify-between mb-2">
                  <Text className="text-[10px] font-bold text-slate-600 capitalize">{status}</Text>
                  <Text className="text-[10px] font-black text-slate-900">{count}</Text>
                </View>
              ))}
            </View>
            <View className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <Text className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-tighter">Top Depts</Text>
              {topAppointmentDepts.map(([dept, count]) => (
                <View key={dept} className="flex-row justify-between mb-2">
                  <Text className="text-[10px] font-bold text-slate-600 capitalize">{dept}</Text>
                  <Text className="text-[10px] font-black text-blue-600">{count}</Text>
                </View>
              ))}
            </View>
          </View>
        </DashSection>
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View className="absolute bottom-0 w-full flex-row justify-around items-center bg-white border-t border-slate-100 py-4 pb-10 shadow-2xl">
        <TouchableOpacity className="items-center">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 mb-1 shadow-lg shadow-blue-200">
            <Ionicons name="grid" size={20} color="white" />
          </View>
          <Text className="text-[10px] font-black text-blue-600 uppercase">Home</Text>
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
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("SettingsManagement")}
        >
          <Ionicons name="settings-outline" size={22} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-bold text-slate-400 uppercase">Config</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DashboardScreen = () => {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    width: (width - 52) / 2,
    borderRadius: 32,
    padding: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
});

export default DashboardScreen;