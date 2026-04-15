import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorLayout from "./DoctorLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

// Premium Stat Card (Mobile Version)
const StatCard = ({ label, value, icon, color, bgColor, subtext }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor, borderColor: `${color}15` }]}>
    <View style={[styles.decoratorCircle, { backgroundColor: color, top: -20, right: -20, opacity: 0.1, width: 80, height: 80 }]} />
    <View style={[styles.decoratorCircle, { backgroundColor: color, bottom: -20, left: -20, opacity: 0.05, width: 60, height: 60 }]} />

    <View className="flex-row items-center justify-between mb-4">
      <View style={{ backgroundColor: 'white' }} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View className="bg-white/50 px-2 py-0.5 rounded-md">
        <Text style={{ color: color }} className="text-[8px] font-black uppercase tracking-widest">{subtext}</Text>
      </View>
    </View>

    <View>
      <Text className="text-[8px] font-bold text-gray-500 uppercase tracking-widest" numberOfLines={1}>{label}</Text>
      <Text className="text-lg font-black text-gray-900 mt-0.5 tracking-tighter">{value}</Text>
    </View>

  </View>
);

const AppointmentItem = ({ appointment }) => {
  const status = appointment.status || 'Pending';
  const getStatusColor = (s) => {
    if (s === 'Confirmed' || s === 'Completed') return '#10b981';
    if (s === 'Cancelled') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-50 px-2">
      <View className="flex-row items-center flex-1 mr-4">
        <View style={{ backgroundColor: getStatusColor(status) }} className="h-2 w-2 rounded-full mr-3 shadow-sm" />
        <View className="flex-1">
          <Text className="text-sm font-black text-slate-800" numberOfLines={1}>{appointment.patient_name || appointment.patient || 'Unknown'}</Text>
          <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
            {appointment.appointment_time || appointment.time || 'N/A'} • {appointment.reason || 'General'}
          </Text>
        </View>
      </View>
      <View style={{ backgroundColor: `${getStatusColor(status)}10` }} className="px-3 py-1 rounded-full">
        <Text style={{ color: getStatusColor(status) }} className="text-[9px] font-black uppercase tracking-tighter">{status}</Text>
      </View>
    </View>
  );
};

const DoctorDashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    stats: {},
    appointments: [],
    recentPatients: [],
    admittedPatients: [],
    tasks: [],
    quickStats: {}
  });

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [overviewRes, appointmentsRes, recentPatientsRes, admittedPatientsRes, tasksRes, quickStatsRes] = await Promise.all([
        api.get('/api/v1/doctor-dashboard/overview').catch(() => ({})),
        api.get('/api/v1/doctor-dashboard/appointments/today').catch(() => ({})),
        api.get('/api/v1/doctor-dashboard/patients/recent?limit=10').catch(() => ({})),
        api.get('/api/v1/doctor-dashboard/patients/admitted').catch(() => ({})),
        api.get('/api/v1/doctor-dashboard/tasks/pending').catch(() => ({})),
        api.get('/api/v1/doctor-dashboard/stats/quick?period=week').catch(() => ({}))
      ]);

      const overviewData = overviewRes.data || overviewRes || {};
      const statsObj = overviewData.statistics || {};

      setDashboardData({
        overview: overviewData,
        stats: {
          todaysAppointments: statsObj.todays_appointments || 0,
          completedToday: statsObj.completed_today || 0,
          pendingAppointments: statsObj.pending_appointments || 0,
          admittedPatients: statsObj.admitted_patients || 0,
          totalPatientsLifetime: statsObj.total_patients_lifetime || 0,
          pendingDischargeSummaries: statsObj.pending_discharge_summaries || 0,
          weekAppointments: statsObj.week_appointments || 0,
        },
        appointments: appointmentsRes.appointments || appointmentsRes.data?.appointments || [],
        recentPatients: recentPatientsRes.patients || recentPatientsRes.data?.patients || [],
        admittedPatients: admittedPatientsRes.patients || admittedPatientsRes.data?.patients || [],
        tasks: tasksRes.tasks || tasksRes.data?.tasks || [],
        quickStats: quickStatsRes.data || quickStatsRes || {}
      });
    } catch (err) {
      console.warn('Failed to load dashboard data:', err);
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

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Gathering Clinical Data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Greeting */}
        <View className="mb-8 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-black text-slate-900 tracking-tighter">Doctor Portal</Text>
            <Text className="text-sm text-slate-500 font-bold mt-1">
              Welcome back, {dashboardData.overview?.doctor_name || 'Dr. Prasad'}! 👋
            </Text>
            {dashboardData.overview?.specialization && (
              <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                {dashboardData.overview.specialization} • {dashboardData.overview.department}
              </Text>
            )}
          </View>

        </View>

        {/* Stats Grid - 3 per row */}
        <View className="flex-row flex-wrap justify-start gap-x-2 mb-8">
          <StatCard label="Appointments" value={dashboardData.stats.todaysAppointments} icon="calendar" color="#3B82F6" bgColor="#EFF6FF" subtext="TODAY" />
          <StatCard label="Completed" value={dashboardData.stats.completedToday} icon="checkmark-circle" color="#10B981" bgColor="#ECFDF5" subtext="DONE" />
          <StatCard label="Pending" value={dashboardData.stats.pendingAppointments} icon="time" color="#F59E0B" bgColor="#FFFBEB" subtext="AWAITED" />
          <StatCard label="Admitted" value={dashboardData.stats.admittedPatients} icon="bed" color="#8B5CF6" bgColor="#F5F3FF" subtext="IPD" />
          <StatCard label="Lifetime" value={dashboardData.stats.totalPatientsLifetime} icon="people" color="#6366F1" bgColor="#EEF2FF" subtext="TOTAL" />
          <StatCard label="Discharge" value={dashboardData.stats.pendingDischargeSummaries} icon="document-text" color="#EC4899" bgColor="#FDF2F8" subtext="PENDING" />
        </View>


        {/* Performance Highlights (Grid) */}
        {dashboardData.quickStats?.statistics && (
          <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-10">
            <Text className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Weekly Performance</Text>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {[
                { label: 'Total Appts', value: dashboardData.quickStats.statistics.total_appointments, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Completed', value: dashboardData.quickStats.statistics.completed_appointments, color: '#10b981', bg: '#ecfdf5' },
                { label: 'Unique Pts', value: dashboardData.quickStats.statistics.unique_patients_treated, color: '#8b5cf6', bg: '#f5f3ff' },
                { label: 'Records', value: dashboardData.quickStats.statistics.medical_records_created, color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Success %', value: `${dashboardData.quickStats.statistics.completion_rate}%`, color: '#6366f1', bg: '#eef2ff' },
              ].map((p, i) => (
                <View key={i} style={{ width: '31%', backgroundColor: p.bg }} className="p-3 rounded-2xl items-center">
                  <Text style={{ color: p.color }} className="text-lg font-black">{p.value || 0}</Text>
                  <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{p.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions (Buttons) */}
        {dashboardData.overview?.quick_actions && dashboardData.overview.quick_actions.length > 0 && (
          <View className="mb-10">
            <Text className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 ml-2">Clinical Shortcuts</Text>
            <View className="flex-row flex-wrap gap-2">
              {dashboardData.overview.quick_actions.map((action, idx) => (
                <TouchableOpacity key={idx} className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                  <Text className="text-blue-600 font-bold text-xs">{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Main Lists Section */}
        <View className="gap-y-8">
          {/* Today's Appointments */}
          <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900 tracking-tight">Today's Appointments</Text>
              <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                {dashboardData.appointments.length} ACTIVE
              </Text>
            </View>
            <View>
              {dashboardData.appointments.length > 0 ? (
                dashboardData.appointments.map((apt, idx) => <AppointmentItem key={idx} appointment={apt} />)
              ) : (
                <Text className="py-8 text-center text-slate-400 font-bold uppercase text-[9px]">No appointments booked for today</Text>
              )}
            </View>
          </View>

          {/* Admitted Patients */}
          <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900 tracking-tight">Inpatient Status</Text>
              <View className="bg-purple-50 px-3 py-1 rounded-full">
                <Text className="text-purple-600 font-black text-[10px] uppercase">{dashboardData.admittedPatients.length} ADMITTED</Text>
              </View>
            </View>
            <View>
              {dashboardData.admittedPatients.length > 0 ? (
                dashboardData.admittedPatients.map((pt, idx) => (
                  <View key={idx} className="flex-row items-center justify-between py-4 border-b border-gray-50 px-2">
                    <View className="flex-row items-center flex-1 mr-4">
                      <View className="h-10 w-10 rounded-2xl bg-purple-50 items-center justify-center mr-3">
                        <Ionicons name="bed-outline" size={20} color="#8B5CF6" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-black text-slate-800" numberOfLines={1}>{pt.name || pt.patient_name || 'Unknown'}</Text>
                        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                          ROOM {pt.room_no || pt.room || 'N/A'} • {pt.department || 'GENERAL'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </View>
                ))
              ) : (
                <Text className="py-8 text-center text-slate-400 font-bold uppercase text-[9px]">No patients currently admitted</Text>
              )}
            </View>
          </View>

          {/* Pending Tasks (Checklist) */}
          <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <Text className="text-lg font-black text-slate-900 tracking-tight mb-4">Clinical Tasklist</Text>
            <View>
              {dashboardData.tasks.length > 0 ? (
                dashboardData.tasks.map((task, idx) => (
                  <View key={idx} className="flex-row items-center py-4 border-b border-gray-50 px-2">
                    <View className="h-6 w-6 rounded-lg border-2 border-slate-200 mr-4 items-center justify-center">
                      {task.status === 'Completed' && <Ionicons name="checkmark" size={14} color="#10b981" />}
                    </View>
                    <View className="flex-1">
                      <Text className={`text-sm font-black text-slate-800 ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>
                        {task.title || task.task || 'Untitled Task'}
                      </Text>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                        {task.priority || 'NORMAL'} PRIORITY
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="py-8 text-center text-slate-400 font-bold uppercase text-[9px]">No pending tasks</Text>
              )}
            </View>
          </View>

          {/* Recent Patients (Avatars) */}
          <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-black text-slate-900 tracking-tight">Recent Interactions</Text>
              <TouchableOpacity><Text className="text-blue-600 font-black text-[10px] uppercase">HISTORY</Text></TouchableOpacity>
            </View>
            <View>
              {dashboardData.recentPatients.length > 0 ? (
                dashboardData.recentPatients.map((rpt, idx) => (
                  <View key={idx} className="flex-row items-center justify-between py-4 border-b border-gray-50 px-2">
                    <View className="flex-row items-center flex-1">
                      <View className="h-10 w-10 rounded-full bg-slate-100 items-center justify-center mr-3 border-2 border-white shadow-sm">
                        <Text className="text-[10px] font-black text-slate-600 uppercase">
                          {(rpt.name || rpt.patient_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-black text-slate-800">{rpt.name || rpt.patient_name || 'Unknown'}</Text>
                        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                          ID: {rpt.patient_id || rpt.id || 'N/A'} • {rpt.last_visit ? new Date(rpt.last_visit).toLocaleDateString() : 'RECENT'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="ellipsis-vertical" size={16} color="#CBD5E1" />
                  </View>
                ))
              ) : (
                <Text className="py-8 text-center text-slate-400 font-bold uppercase text-[9px]">No recent patient history</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: (width - 56) / 3, // Fits 3 columns with gaps
    padding: 12,
    borderRadius: 24,
    marginBottom: 8,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  decoratorCircle: {
    position: "absolute",
    borderRadius: 100,
  }
});

export default function DoctorDashboardScreen() {
  return (
    <DoctorLayout>
      <DoctorDashboardContent />
    </DoctorLayout>
  );
}
