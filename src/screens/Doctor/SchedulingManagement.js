import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Switch,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorLayout from "./DoctorLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const EMPTY_FORM = {
  day_of_week: 'MONDAY',
  start_time: '',
  end_time: '',
  slot_duration_minutes: '30',
  max_patients_per_slot: '1',
  break_start_time: '',
  break_end_time: '',
  notes: '',
  is_emergency_available: false
};

const StatCard = ({ title, value, color, icon }) => {
  const bgColors = {
    green: "#10b981",
    yellow: "#f59e0b",
    blue: "#3b82f6",
  };

  return (
    <View
      style={[styles.statCard, { backgroundColor: bgColors[color] || bgColors.blue, width: width - 36 }]}
      className="mb-4 rounded-3xl p-6"
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-white opacity-90 text-[10px] font-black uppercase tracking-widest">{title}</Text>
          <Text className="text-3xl font-black text-white mt-1">{value}</Text>
        </View>
        <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center">
          <Ionicons name={icon} size={24} color="white" />
        </View>
      </View>
    </View>
  );
};


const TableRow = ({ label, date, schedule, total, booked, available }) => (
  <View className="flex-row items-center border-b border-gray-50 bg-white px-4 py-4">
    <View style={{ width: 90 }}>
      <Text className="text-xs font-black text-gray-900">{label}</Text>
      <Text className="text-[10px] font-medium text-gray-400 mt-0.5">{date}</Text>
    </View>
    <View className="flex-1 px-2">
      <Text className="text-[11px] font-bold text-gray-600">{schedule}</Text>
    </View>
    <View className="flex-row items-center justify-end gap-3" style={{ width: 110 }}>
      <View className="items-center">
        <Text className="text-[8px] text-gray-400 font-black">SLOTS</Text>
        <Text className="text-xs font-black text-gray-900">{total}</Text>
      </View>
      <View className="items-center">
        <Text className="text-[8px] text-gray-400 font-black">BOKD</Text>
        <Text className="text-xs font-black text-blue-600">{booked}</Text>
      </View>
      <View className="items-center">
        <Text className="text-[8px] text-gray-400 font-black">AVAIL</Text>
        <Text className="text-xs font-black text-emerald-600">{available}</Text>
      </View>
    </View>
  </View>
);

const SlotRow = ({ slot, onEdit, onDelete }) => (
  <View className="bg-white mx-4 mt-4 p-5 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center">
    <View className="flex-1">
      <View className="flex-row items-center mb-2">
        <Text className="text-base font-black text-gray-900 mr-2">{humanizeDay(slot.day_of_week)}</Text>
        <View className={`px-2.5 py-1 rounded-full ${slot.is_active ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <Text className={`text-[9px] font-black uppercase ${slot.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
            {slot.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <Text className="text-sm font-bold text-gray-600 mb-2">{slot.start_time} - {slot.end_time}</Text>
      <View className="flex-row items-center">
        <View className="flex-row items-center mr-4 bg-gray-50 px-2 py-1 rounded-lg">
          <Ionicons name="time-outline" size={14} color="#94a3b8" />
          <Text className="text-[10px] text-gray-500 font-bold ml-1 uppercase">{slot.slot_duration_minutes}m</Text>
        </View>
        <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
          <Ionicons name="people-outline" size={14} color="#94a3b8" />
          <Text className="text-[10px] text-gray-500 font-bold ml-1 uppercase">{slot.max_patients_per_slot} Max</Text>
        </View>
      </View>
    </View>
    <View className="flex-row items-center">
      <TouchableOpacity onPress={() => onEdit(slot)} className="w-11 h-11 items-center justify-center rounded-2xl bg-blue-50 mr-2">
        <Ionicons name="pencil" size={20} color="#2563eb" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(slot)} className="w-11 h-11 items-center justify-center rounded-2xl bg-rose-50">
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
);

const SchedulingContent = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState(null);
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [error, setError] = useState('');
  const [selectedWeekStart, setSelectedWeekStart] = useState(getStartOfWeekISO(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Constants from web version
  const DOCTOR_SCHEDULE_WEEKLY = '/api/v1/doctor-management/schedule/weekly';
  const DOCTOR_SCHEDULE_SLOTS = '/api/v1/doctor-management/schedule/slots';
  const DOCTOR_SCHEDULE_CREATE = '/api/v1/doctor-management/schedule/create';
  
  const buildCandidatePaths = (type, { scheduleId, weekStart } = {}) => {
    const weekQuery = weekStart ? `?week_start=${encodeURIComponent(weekStart)}` : '';
    const scheduleIdSafe = scheduleId ? encodeURIComponent(scheduleId) : '';
    
    const candidatesByType = {
      weekly: [
        `${DOCTOR_SCHEDULE_WEEKLY}${weekQuery}`,
        `${DOCTOR_SCHEDULE_WEEKLY}/${weekQuery}`,
        `/api/v1/doctor/schedules/weekly${weekQuery}`,
        `/api/v1/doctors/schedule/weekly${weekQuery}`,
      ],
      slots: [
        DOCTOR_SCHEDULE_SLOTS,
        `${DOCTOR_SCHEDULE_SLOTS}/`,
        '/api/v1/doctor/schedules/slots',
        '/api/v1/doctors/schedule/slots',
      ],
      create: [
        DOCTOR_SCHEDULE_CREATE,
        '/api/v1/doctor/schedule/create',
      ],
      slotById: [
        `/api/v1/doctor-management/schedule/${scheduleIdSafe}`,
        `/api/v1/doctor/schedules/slots/${scheduleIdSafe}`,
      ]
    };
    return candidatesByType[type] || [];
  };

  const apiFetchWithFallback = async (paths, options = {}) => {
    let lastError = null;
    for (const path of paths) {
      try {
        const method = options.method?.toLowerCase() || 'get';
        const res = await api[method](path, options.body);
        return res;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError;
  };

  const loadData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError('');

    try {
      const [weeklyRes, slotsRes] = await Promise.all([
        apiFetchWithFallback(buildCandidatePaths('weekly', { weekStart: selectedWeekStart })),
        apiFetchWithFallback(buildCandidatePaths('slots'))
      ]);

      setWeeklySchedule(weeklyRes.data || weeklyRes || {});
      setScheduleSlots(normalizeScheduleSlots(slotsRes.data || slotsRes || []));
    } catch (loadError) {
      console.error("Load schedule error:", loadError);
      setError('Unable to load schedule information.');
      setWeeklySchedule(null);
      setScheduleSlots([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedWeekStart]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const stats = useMemo(() => {
    const totalSlots = Number(weeklySchedule?.total_slots || 0);
    const totalAppointments = Number(weeklySchedule?.total_appointments || 0);
    const availableSlots = Number(weeklySchedule?.available_slots || 0);
    return { totalSlots, totalAppointments, availableSlots };
  }, [weeklySchedule]);

  const openAddModal = () => {
    setCurrentSlot(null);
    setFormData(EMPTY_FORM);
    setModalType('add');
    setShowModal(true);
  };

  const openEditModal = (slot) => {
    setCurrentSlot(slot);
    setFormData({
      day_of_week: slot.day_of_week || 'MONDAY',
      start_time: slot.start_time || '',
      end_time: slot.end_time || '',
      slot_duration_minutes: String(slot.slot_duration_minutes || 30),
      max_patients_per_slot: String(slot.max_patients_per_slot || 1),
      break_start_time: slot.break_start_time || '',
      break_end_time: slot.break_end_time || '',
      notes: slot.notes || '',
      is_emergency_available: Boolean(slot.is_emergency_available)
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.day_of_week || !formData.start_time || !formData.end_time) {
      Alert.alert('Required', 'Please fill day, start and end time.');
      return;
    }
    setSubmitLoading(true);
    try {
      const payload = {
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        slot_duration_minutes: Number(formData.slot_duration_minutes),
        max_patients_per_slot: Number(formData.max_patients_per_slot),
        break_start_time: formData.break_start_time || null,
        break_end_time: formData.break_end_time || null,
        notes: formData.notes || null,
        is_emergency_available: Boolean(formData.is_emergency_available)
      };

      if (modalType === 'add') {
        await apiFetchWithFallback(buildCandidatePaths('create'), { method: 'POST', body: payload });
      } else {
        await apiFetchWithFallback(buildCandidatePaths('slotById', { scheduleId: currentSlot.schedule_id }), { method: 'PUT', body: payload });
      }
      setShowModal(false);
      loadData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Operation failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteSlot = (slot) => {
    Alert.alert('Confirm', 'Delete this slot?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiFetchWithFallback(buildCandidatePaths('slotById', { scheduleId: slot.schedule_id }), { method: 'DELETE' });
          loadData();
        } catch (e) { Alert.alert('Error', 'Delete failed'); }
      }}
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Synchronizing...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#fcfdff]">
      {/* Header */}
      <View className="px-6 py-5 bg-white border-b border-gray-100 flex-row items-center justify-between shadow-sm">
        <View>
          <Text className="text-2xl font-black text-gray-900 tracking-tighter">Scheduling</Text>
          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Global Management</Text>
        </View>
        <TouchableOpacity onPress={openAddModal} className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-200">
          <Ionicons name="add" size={26} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="bg-blue-600/5 px-6 py-3 border-b border-blue-100/50 flex-row items-center justify-between">
          <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Week</Text>
          <View className="flex-row items-center">
             <Text className="text-xs font-bold text-gray-700 mr-2">{selectedWeekStart}</Text>
             <Ionicons name="calendar" size={16} color="#3b82f6" />
          </View>
        </View>

        {/* Stats Section - ONE BY ONE */}
        <View className="px-4 mt-6">
          <StatCard title="Total Scheduled Slots" value={stats.totalSlots} color="blue" icon="calendar" />
          <StatCard title="Booked Appointments" value={stats.totalAppointments} color="yellow" icon="people" />
          <StatCard title="Currently Available" value={stats.availableSlots} color="green" icon="time" />
        </View>

        {/* Weekly Overview - Force showing if data exists */}
        <View className="mt-8">
           <View className="px-6 mb-4">
              <Text className="text-sm font-black text-gray-900 uppercase tracking-widest">Weekly Distribution</Text>
           </View>
           <View className="bg-white border-y border-gray-50">
              {(weeklySchedule?.daily_schedules || []).length === 0 ? (
                <View className="p-10 items-center">
                  <Text className="text-gray-400 font-bold text-[10px] uppercase">No Weekly Data Found</Text>
                </View>
              ) : (
                (weeklySchedule.daily_schedules).map((day, idx) => (
                  <TableRow 
                    key={idx}
                    label={humanizeDay(day.day_name)}
                    date={day.date}
                    schedule={day.has_schedule ? `${day.start_time} - ${day.end_time}` : 'Unscheduled'}
                    total={day.total_slots ?? 0}
                    booked={day.booked_appointments ?? 0}
                    available={day.available_slots ?? 0}
                  />
                ))
              )}
           </View>
        </View>

        {/* Slots Configuration */}
        <View className="mt-10">
           <Text className="px-6 mb-2 text-sm font-black text-gray-900 uppercase tracking-widest">Slot Definitions</Text>
           {scheduleSlots.length === 0 ? (
             <View className="p-10 items-center bg-white border-y border-gray-50">
               <Ionicons name="layers-outline" size={40} color="#e2e8f0" />
               <Text className="mt-3 text-gray-400 font-bold text-[10px] uppercase">No configurations available</Text>
             </View>
           ) : (
             scheduleSlots.map((slot) => (
               <SlotRow key={slot.schedule_id} slot={slot} onEdit={openEditModal} onDelete={handleDeleteSlot} />
             ))
           )}
        </View>
      </ScrollView>

      {/* FORM MODAL - Ported from web logic */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[48px] p-8 max-h-[90%] shadow-2xl">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-3xl font-black text-gray-900 tracking-tighter">{modalType === 'add' ? 'New Slot' : 'Edit Slot'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} className="bg-gray-100 p-2 rounded-full">
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                <View className="mb-6">
                   <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Preferred Day</Text>
                   <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                      {WEEK_DAYS.map((d) => (
                        <TouchableOpacity 
                          key={d} 
                          onPress={() => setFormData({...formData, day_of_week: d})}
                          className={`px-5 py-3 rounded-2xl mr-2 border ${formData.day_of_week === d ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-100'}`}
                        >
                          <Text className={`text-[10px] font-black uppercase ${formData.day_of_week === d ? 'text-white' : 'text-gray-500'}`}>{humanizeDay(d)}</Text>
                        </TouchableOpacity>
                      ))}
                   </ScrollView>
                </View>

                <View className="flex-row gap-4 mb-6">
                   <View className="flex-1">
                     <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Starts</Text>
                     <TextInput 
                       value={formData.start_time}
                       onChangeText={(t) => setFormData({...formData, start_time: t})}
                       placeholder="09:00"
                       className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 text-gray-900 font-bold"
                     />
                   </View>
                   <View className="flex-1">
                     <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Ends</Text>
                     <TextInput 
                       value={formData.end_time}
                       onChangeText={(t) => setFormData({...formData, end_time: t})}
                       placeholder="17:00"
                       className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 text-gray-900 font-bold"
                     />
                   </View>
                </View>

                <View className="flex-row gap-4 mb-6">
                   <View className="flex-1">
                     <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Duration (Min)</Text>
                     <TextInput 
                       value={formData.slot_duration_minutes}
                       onChangeText={(t) => setFormData({...formData, slot_duration_minutes: t})}
                       keyboardType="numeric"
                       className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 text-gray-900 font-bold"
                     />
                   </View>
                   <View className="flex-1">
                     <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Patient Limit</Text>
                     <TextInput 
                       value={formData.max_patients_per_slot}
                       onChangeText={(t) => setFormData({...formData, max_patients_per_slot: t})}
                       keyboardType="numeric"
                       className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 text-gray-900 font-bold"
                     />
                   </View>
                </View>

                <View className="bg-blue-600/5 p-6 rounded-[32px] border border-blue-50 mb-8 flex-row items-center justify-between">
                   <View>
                      <Text className="text-gray-900 font-black text-sm uppercase">Emergency Care</Text>
                      <Text className="text-[10px] text-gray-500 font-medium">Toggle urgent priority bookings</Text>
                   </View>
                   <Switch 
                     value={formData.is_emergency_available}
                     onValueChange={(v) => setFormData({...formData, is_emergency_available: v})}
                     trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
                     thumbColor={formData.is_emergency_available ? "#2563eb" : "#f1f5f9"}
                   />
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={submitLoading}
                  className="bg-blue-600 h-16 rounded-[28px] items-center justify-center shadow-xl shadow-blue-200"
                >
                  {submitLoading ? <ActivityIndicator color="white" /> : (
                    <Text className="text-white font-black uppercase tracking-widest">
                      {modalType === 'add' ? 'SAVE CONFIGURATION' : 'UPDATE CONFIGURATION'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
});

function getStartOfWeekISO(currentDate) {
  const date = new Date(currentDate);
  const day = date.getDay() === 0 ? 7 : date.getDay();
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function humanizeDay(day) {
  const raw = String(day || '').toLowerCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function normalizeScheduleSlots(rawData) {
  const res = rawData?.data || rawData;
  const schedules = Array.isArray(res?.schedules)
    ? res.schedules
    : Array.isArray(res)
      ? res
      : [];

  return schedules.map((item) => ({
    schedule_id: item?.schedule_id || item?.id || '',
    day_of_week: item?.day_of_week || '',
    start_time: item?.start_time || '',
    end_time: item?.end_time || '',
    slot_duration_minutes: Number(item?.slot_duration_minutes || 0),
    break_start_time: item?.break_start_time || '',
    break_end_time: item?.break_end_time || '',
    max_patients_per_slot: Number(item?.max_patients_per_slot || 1),
    is_active: item?.is_active !== false,
    notes: item?.notes || '',
    is_emergency_available: Boolean(item?.is_emergency_available)
  }));
}

const SchedulingManagement = () => (
  <DoctorLayout>
    <SchedulingContent />
  </DoctorLayout>
);

export default SchedulingManagement;
