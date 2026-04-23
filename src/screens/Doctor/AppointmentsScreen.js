import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,

  RefreshControl,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import DoctorLayout from './DoctorLayout';

const { width } = Dimensions.get('window');

// --- CONSTANTS & HELPERS ---
const STATUS_OPTIONS = [
  { value: '', label: 'All status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function formatClockTime(timeStr) {
  if (!timeStr) return '-';
  const part = String(timeStr).slice(0, 5);
  const [hRaw, mRaw] = part.split(':');
  const h = parseInt(hRaw, 10);
  const m = mRaw ?? '00';
  if (Number.isNaN(h)) return String(timeStr);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function normalizedStatus(status) {
  return String(status || '').toUpperCase();
}

function normalizeStatusLabel(status) {
  const s = normalizedStatus(status);
  if (s === 'REQUESTED' || s === 'PENDING') return 'Pending';
  if (s === 'CONFIRMED') return 'Confirmed';
  if (s === 'COMPLETED') return 'Completed';
  if (s === 'CANCELLED') return 'Cancelled';
  return String(status || 'Unknown').replace(/_/g, ' ');
}

function statusBucket(status) {
  const s = normalizedStatus(status);
  if (s === 'REQUESTED' || s === 'PENDING') return 'Pending';
  if (s === 'CONFIRMED') return 'Confirmed';
  if (s === 'COMPLETED') return 'Completed';
  if (s === 'CANCELLED') return 'Cancelled';
  return null;
}

function canEditOrTransition(status) {
  const s = normalizedStatus(status);
  return s !== 'COMPLETED' && s !== 'CANCELLED';
}

function getStatusStyling(status) {
  const s = normalizedStatus(status);
  if (s === 'CONFIRMED') return { bg: '#ecfdf5', text: '#059669', border: '#10b981' };
  if (s === 'COMPLETED') return { bg: '#eff6ff', text: '#2563eb', border: '#3b82f6' };
  if (s === 'CANCELLED') return { bg: '#fef2f2', text: '#dc2626', border: '#ef4444' };
  return { bg: '#fffbeb', text: '#d97706', border: '#f59e0b' };
}

// --- COMPONENTS ---

const StatCard = ({ label, value, icon, colors }) => (
  <View style={[styles.statCard, { backgroundColor: colors.start }]} className="rounded-3xl p-5 mb-4 shadow-sm overflow-hidden">
    <View style={styles.decoratorCircle} />
    <View className="flex-row justify-between items-center relative z-10">
      <View>
        <Text className="text-white/80 text-[10px] font-black uppercase tracking-widest">{label}</Text>
        <Text className="text-3xl font-black text-white mt-1">{value}</Text>
      </View>
      <View className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
        <Ionicons name={icon} size={24} color="white" />
      </View>
    </View>
  </View>
);

const AppointmentCard = ({ item, onView, onEdit, onComplete, onCancel, actionLoadingRef }) => {
  const styles = getStatusStyling(item.status);
  const isActionDisabled = !canEditOrTransition(item.status) || actionLoadingRef === item.appointment_ref;

  return (
    <View className="bg-white rounded-[32px] p-5 mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-sm font-black text-gray-500 uppercase tracking-widest mb-1">REF: {item.appointment_ref || '-'}</Text>
          <Text className="text-lg font-black text-gray-900 mb-1">{item.patient_name || 'Patient'}</Text>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text className="text-xs font-bold text-gray-500 ml-1">{item.appointment_date || '-'} • {formatClockTime(item.appointment_time)}</Text>
          </View>
        </View>
        <View style={{ backgroundColor: styles.bg }} className="px-3 py-1 rounded-full">
          <Text style={{ color: styles.text }} className="text-[10px] font-black uppercase tracking-tighter">
            {normalizeStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-50 pt-4 mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="medical-outline" size={14} color="#64748b" />
          <Text className="text-[11px] text-gray-600 ml-2 font-bold">{item.appointment_type || 'General'}</Text>
        </View>
        <Text className="text-[11px] text-gray-500 font-medium italic" numberOfLines={1}>Reason: {item.reason || 'No reason provided'}</Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => onView(item)}
          className="flex-1 h-12 rounded-2xl bg-gray-50 flex-row items-center justify-center border border-gray-100"
        >
          <Ionicons name="eye-outline" size={18} color="#64748b" />
          <Text className="text-[10px] font-black text-gray-500 uppercase ml-2">Details</Text>
        </TouchableOpacity>

        {canEditOrTransition(item.status) && (
          <>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100"
            >
              <Ionicons name="pencil" size={18} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onComplete(item)}
              disabled={isActionDisabled}
              className={`w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 ${isActionDisabled ? 'opacity-50' : ''}`}
            >
              <Ionicons name="checkmark" size={18} color="#059669" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onCancel(item)}
              disabled={isActionDisabled}
              className={`w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 ${isActionDisabled ? 'opacity-50' : ''}`}
            >
              <Ionicons name="close" size={18} color="#dc2626" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

// --- MAIN SCREEN ---

const AppointmentsScreenContent = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoadingRef, setActionLoadingRef] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cancelState, setCancelState] = useState({
    isOpen: false,
    appointmentRef: '',
    reason: '',
  });
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    limit: 50,
  });
  const [editForm, setEditForm] = useState({
    appointment_date: '',
    appointment_time: '',
    duration_minutes: '',
    appointment_type: '',
    notes: '',
    consultation_fee: '',
  });

  // Synced with latest doctorApi candidates
  const getCandidatePaths = (type, ref = '') => {
    const bases = [
      '/api/v1/doctor-management',
      '/api/v1/doctor-dashboard',
      '/api/v1/doctor',
      '/api/v1/doctors',
      '/api/v1/doctor-appointments',
    ];

    return bases.map(base => {
      if (type === 'list') return `${base}/appointments`;
      if (type === 'details') return `${base}/appointments/${encodeURIComponent(ref)}`;
      if (type === 'update') return `${base}/appointments/${encodeURIComponent(ref)}`;
      if (type === 'complete') return `${base}/appointments/${encodeURIComponent(ref)}/complete`;
      if (type === 'cancel') return `${base}/appointments/${encodeURIComponent(ref)}/cancel`;
      return '';
    }).filter(Boolean);
  };

  const apiFetch = async (paths, method = 'get', body = null) => {
    let lastError = null;
    for (const path of paths) {
      try {
        return await api[method.toLowerCase()](path, body);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error('API Request Failed');
  };

  const loadAppointments = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    try {
      // Filter out empty strings from filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );
      const query = new URLSearchParams(cleanFilters).toString();
      const paths = getCandidatePaths('list').map(p => query ? `${p}?${query}` : p);

      const data = await apiFetch(paths);
      // Synced with normalizeDoctorAppointmentList
      const normalizedData = data?.data ?? data ?? {};
      const rawAppointments = Array.isArray(normalizedData)
        ? normalizedData
        : Array.isArray(normalizedData?.appointments)
          ? normalizedData.appointments
          : Array.isArray(normalizedData?.items)
            ? normalizedData.items
            : [];

      const list = rawAppointments.map((item) => ({
        appointment_ref: item?.appointment_ref || item?.reference || String(item?.id || ''),
        patient_name: item?.patient_name || item?.patient || 'Unknown',
        appointment_date: item?.appointment_date || item?.date || '',
        appointment_time: item?.appointment_time || item?.time || '',
        status: item?.status || 'PENDING',
        appointment_type: item?.appointment_type || item?.type || 'Regular',
        reason: item?.chief_complaint || item?.reason || '-',
        duration_minutes: item?.duration_minutes ?? item?.duration ?? null,
        notes: item?.notes || '',
        consultation_fee: item?.consultation_fee ?? null,
      }));
      setAppointments(list);
    } catch (err) {
      console.warn('Load Appointments Error:', err);
      Alert.alert('Error', 'Could not load appointments.');
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAppointments(true);
  }, [loadAppointments]);

  const stats = useMemo(() => {
    return {
      confirmed: appointments.filter((a) => statusBucket(a.status) === 'Confirmed').length,
      pending: appointments.filter((a) => statusBucket(a.status) === 'Pending').length,
      cancelled: appointments.filter((a) => statusBucket(a.status) === 'Cancelled').length,
      completed: appointments.filter((a) => statusBucket(a.status) === 'Completed').length,
    };
  }, [appointments]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewDetails = async (item) => {
    if (!item?.appointment_ref) return;
    setDetailLoading(true);
    try {
      const data = await apiFetch(getCandidatePaths('details', item.appointment_ref));
      // Synced with normalizeDoctorAppointmentDetails
      const raw = data?.data ?? data ?? {};
      const details = {
        appointment_ref: raw?.appointment_ref || raw?.reference || '',
        patient_name: raw?.patient_name || raw?.patient || 'Unknown',
        patient_phone: raw?.patient_phone || raw?.phone || '',
        appointment_date: raw?.appointment_date || raw?.date || '',
        appointment_time: raw?.appointment_time || raw?.time || '',
        status: raw?.status || 'PENDING',
        appointment_type: raw?.appointment_type || raw?.type || 'Regular',
        reason: raw?.chief_complaint || raw?.reason || '',
        duration_minutes: raw?.duration_minutes ?? raw?.duration ?? '',
        notes: raw?.notes || '',
        consultation_fee: raw?.consultation_fee ?? '',
      };
      setSelectedAppointment(details);
    } catch {
      Alert.alert('Error', 'Could not fetch appointment details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEditAppointment = async (item) => {
    if (!item?.appointment_ref) return;
    setDetailLoading(true);
    try {
      const data = await apiFetch(getCandidatePaths('details', item.appointment_ref));
      const raw = data?.data ?? data ?? {};
      const details = {
        appointment_ref: raw?.appointment_ref || raw?.reference || '',
        patient_name: raw?.patient_name || raw?.patient || 'Unknown',
        appointment_date: raw?.appointment_date || raw?.date || '',
        appointment_time: raw?.appointment_time || raw?.time || '',
        status: raw?.status || 'PENDING',
        appointment_type: raw?.appointment_type || raw?.type || 'Regular',
        reason: raw?.chief_complaint || raw?.reason || '',
        duration_minutes: raw?.duration_minutes ?? raw?.duration ?? '',
        notes: raw?.notes || '',
        consultation_fee: raw?.consultation_fee ?? '',
      };
      setSelectedAppointment(details);
      setEditForm({
        appointment_date: details.appointment_date || '',
        appointment_time: String(details.appointment_time || '').slice(0, 5),
        duration_minutes: details.duration_minutes === '' ? '' : String(details.duration_minutes ?? ''),
        appointment_type: details.appointment_type || '',
        notes: details.notes || '',
        consultation_fee: details.consultation_fee === '' ? '' : String(details.consultation_fee ?? ''),
      });
      setIsEditModalOpen(true);
    } catch {
      Alert.alert('Error', 'Could not fetch details for editing.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment?.appointment_ref) return;
    const payload = {
      appointment_date: editForm.appointment_date || null,
      appointment_time: editForm.appointment_time || null,
      duration_minutes: editForm.duration_minutes === '' ? null : Number(editForm.duration_minutes),
      appointment_type: editForm.appointment_type || null,
      notes: String(editForm.notes || '').trim() || null,
      consultation_fee: editForm.consultation_fee === '' ? null : Number(editForm.consultation_fee),
    };

    setSubmitLoading(true);
    try {
      await apiFetch(getCandidatePaths('update', selectedAppointment.appointment_ref), 'PUT', payload);
      Alert.alert('Success', 'Appointment updated successfully.');
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
      await loadAppointments(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not update appointment.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCompleteAppointment = async (item) => {
    if (!item?.appointment_ref) return;
    Alert.alert('Complete', 'Mark this appointment as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          setActionLoadingRef(item.appointment_ref);
          try {
            await apiFetch(getCandidatePaths('complete', item.appointment_ref), 'POST');
            Alert.alert('Success', 'Appointment completed.');
            await loadAppointments(false);
          } catch {
            Alert.alert('Error', 'Could not complete appointment.');
          } finally {
            setActionLoadingRef('');
          }
        }
      }
    ]);
  };

  const handleCancelAppointment = async () => {
    if (!cancelState.appointmentRef) return;
    setActionLoadingRef(cancelState.appointmentRef);
    try {
      await apiFetch(getCandidatePaths('cancel', cancelState.appointmentRef), 'POST', {
        cancellation_reason: String(cancelState.reason || '').trim() || 'Cancelled by doctor'
      });
      Alert.alert('Success', 'Appointment cancelled.');
      setCancelState({ isOpen: false, appointmentRef: '', reason: '' });
      await loadAppointments(false);
    } catch {
      Alert.alert('Error', 'Could not cancel appointment.');
    } finally {
      setActionLoadingRef('');
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Fetching Appointments...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAppointments(false)} />}
      >
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-black text-slate-900 tracking-tighter">Appointments</Text>
            <Text className="text-sm text-slate-500 font-bold mt-1">Manage patient schedule</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm ${showFilters ? 'bg-blue-600' : 'bg-white'}`}
          >
            <Ionicons name="filter" size={20} color={showFilters ? 'white' : '#64748b'} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between">
          <StatCard label="Confirmed" value={stats.confirmed} icon="checkmark-circle" colors={{ start: '#3B82F6' }} />
          <StatCard label="Pending" value={stats.pending} icon="time" colors={{ start: '#F59E0B' }} />
          <StatCard label="Cancelled" value={stats.cancelled} icon="close-circle" colors={{ start: '#EF4444' }} />
          <StatCard label="Completed" value={stats.completed} icon="checkmark-done-circle" colors={{ start: '#10B981' }} />
        </View>

        {/* Filters Section */}
        {showFilters && (
          <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-6 animate-fade-in">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Search & Filter</Text>
            <View className="gap-4">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Text className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">From Date</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={filters.date_from}
                    onChangeText={(v) => handleFilterChange('date_from', v)}
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">To Date</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={filters.date_to}
                    onChangeText={(v) => handleFilterChange('date_to', v)}
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold"
                  />
                </View>
              </View>
              <View>
                <Text className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {STATUS_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => handleFilterChange('status', opt.value)}
                      className={`px-4 py-2 rounded-xl mr-2 border ${filters.status === opt.value ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-100'}`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${filters.status === opt.value ? 'text-white' : 'text-slate-500'}`}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <TouchableOpacity
                onPress={() => loadAppointments(true)}
                className="bg-slate-900 h-12 rounded-2xl items-center justify-center mt-2"
              >
                <Text className="text-white font-black uppercase text-[10px] tracking-widest">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* List */}
        <View>
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Record History ({appointments.length})</Text>
          {appointments.length > 0 ? (
            appointments.map((item, idx) => (
              <AppointmentCard
                key={item.appointment_ref || idx}
                item={item}
                onView={handleViewDetails}
                onEdit={handleEditAppointment}
                onComplete={handleCompleteAppointment}
                onCancel={(row) => setCancelState({ isOpen: true, appointmentRef: row.appointment_ref, reason: '' })}
                actionLoadingRef={actionLoadingRef}
              />
            ))
          ) : (
            <View className="bg-white p-20 rounded-[32px] items-center border border-dashed border-slate-200">
              <Ionicons name="calendar-outline" size={48} color="#E2E8F0" />
              <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4">No appointments found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal visible={Boolean(selectedAppointment) && !isEditModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[48px] p-8 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-gray-900 tracking-tighter">Details</Text>
              <TouchableOpacity onPress={() => setSelectedAppointment(null)} className="p-2 bg-gray-50 rounded-full">
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            {selectedAppointment && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center mb-8 bg-blue-50/50 p-4 rounded-3xl">
                  <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center shadow-sm">
                    <Text className="text-lg font-black text-blue-600">
                      {(selectedAppointment.patient_name || 'P').charAt(0)}
                    </Text>
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-black text-gray-900">{selectedAppointment.patient_name}</Text>
                    <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedAppointment.appointment_ref}</Text>
                  </View>
                  <View style={{ backgroundColor: getStatusStyling(selectedAppointment.status).bg }} className="px-3 py-1 rounded-full">
                    <Text style={{ color: getStatusStyling(selectedAppointment.status).text }} className="text-[10px] font-black uppercase">
                      {normalizeStatusLabel(selectedAppointment.status)}
                    </Text>
                  </View>
                </View>

                <View className="grid grid-cols-2 gap-y-6">
                  <View className="w-1/2 pr-2 mb-6">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</Text>
                    <Text className="text-sm font-black text-gray-800">{selectedAppointment.appointment_date || '-'}</Text>
                  </View>
                  <View className="w-1/2 pl-2 mb-6">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Time</Text>
                    <Text className="text-sm font-black text-gray-800">{formatClockTime(selectedAppointment.appointment_time)}</Text>
                  </View>
                  <View className="w-1/2 pr-2 mb-6">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</Text>
                    <Text className="text-sm font-black text-gray-800">{selectedAppointment.appointment_type || '-'}</Text>
                  </View>
                  <View className="w-1/2 pl-2 mb-6">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</Text>
                    <Text className="text-sm font-black text-gray-800">{selectedAppointment.duration_minutes ? `${selectedAppointment.duration_minutes}m` : '-'}</Text>
                  </View>
                  <View className="w-full mb-6">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Reason</Text>
                    <Text className="text-sm font-bold text-gray-700">{selectedAppointment.reason || '-'}</Text>
                  </View>
                  <View className="w-full mb-6">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Doctor Notes</Text>
                    <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <Text className="text-xs text-gray-600 leading-relaxed font-medium">{selectedAppointment.notes || 'No specialized notes added yet.'}</Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-3 pt-4">
                  <TouchableOpacity onPress={() => setSelectedAppointment(null)} className="flex-1 h-14 rounded-2xl bg-gray-100 items-center justify-center">
                    <Text className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Close</Text>
                  </TouchableOpacity>
                  {canEditOrTransition(selectedAppointment.status) && (
                    <TouchableOpacity onPress={() => handleEditAppointment(selectedAppointment)} className="flex-1 h-14 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-200">
                      <Text className="text-white font-black uppercase text-[10px] tracking-widest">Edit Entry</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={isEditModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[48px] p-8 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-black text-gray-900 tracking-tighter">Edit Record</Text>
                <TouchableOpacity onPress={() => setIsEditModalOpen(false)} className="p-2 bg-gray-50 rounded-full">
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-5">
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date</Text>
                      <TextInput
                        value={editForm.appointment_date}
                        onChangeText={(v) => setEditForm(p => ({ ...p, appointment_date: v }))}
                        className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold"
                        placeholder="YYYY-MM-DD"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Time</Text>
                      <TextInput
                        value={editForm.appointment_time}
                        onChangeText={(v) => setEditForm(p => ({ ...p, appointment_time: v }))}
                        className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold"
                        placeholder="HH:MM"
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Duration (m)</Text>
                      <TextInput
                        value={editForm.duration_minutes}
                        onChangeText={(v) => setEditForm(p => ({ ...p, duration_minutes: v }))}
                        keyboardType="numeric"
                        className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fee (Rs)</Text>
                      <TextInput
                        value={editForm.consultation_fee}
                        onChangeText={(v) => setEditForm(p => ({ ...p, consultation_fee: v }))}
                        keyboardType="numeric"
                        className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type</Text>
                    <TextInput
                      value={editForm.appointment_type}
                      onChangeText={(v) => setEditForm(p => ({ ...p, appointment_type: v }))}
                      className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold"
                      placeholder="Regular / Urgent / Follow-up"
                    />
                  </View>

                  <View>
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Clinical Notes</Text>
                    <TextInput
                      value={editForm.notes}
                      onChangeText={(v) => setEditForm(p => ({ ...p, notes: v }))}
                      multiline
                      numberOfLines={4}
                      style={{ textAlignVertical: 'top' }}
                      className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold h-32"
                      placeholder="Add observation details..."
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleUpdateAppointment}
                    disabled={submitLoading}
                    className="bg-blue-600 h-16 rounded-[28px] items-center justify-center shadow-xl shadow-blue-200 mt-4"
                  >
                    {submitLoading ? <ActivityIndicator color="white" /> : (
                      <Text className="text-white font-black uppercase tracking-widest">Update Appointment</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CANCEL MODAL */}
      <Modal visible={cancelState.isOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-white w-full rounded-[40px] p-8">
            <Text className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Cancel Appointment</Text>
            <Text className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">REF: {cancelState.appointmentRef}</Text>

            <View>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Reason for Cancellation</Text>
              <TextInput
                value={cancelState.reason}
                onChangeText={(v) => setCancelState(p => ({ ...p, reason: v }))}
                multiline
                numberOfLines={3}
                style={{ textAlignVertical: 'top' }}
                className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold h-24 mb-6"
                placeholder="Patient could not attend / Doctor unavailable..."
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setCancelState({ isOpen: false, appointmentRef: '', reason: '' })}
                className="flex-1 h-14 rounded-2xl bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-500 font-black uppercase text-[10px]">Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelAppointment}
                className="flex-1 h-14 rounded-2xl bg-rose-600 items-center justify-center shadow-lg shadow-rose-200"
              >
                <Text className="text-white font-black uppercase text-[10px]">Cancel It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {detailLoading && (
        <View style={styles.loaderOverlay}>
          <View className="bg-white p-6 rounded-3xl shadow-xl items-center">
            <ActivityIndicator size="small" color="#2563eb" />
            <Text className="mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Data...</Text>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: (width - 50) / 2, // 2 columns
    overflow: 'hidden',
  },
  decoratorCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -30,
    right: -30,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }
});

export default function AppointmentsScreen() {
  return (
    <DoctorLayout>
      <AppointmentsScreenContent />
    </DoctorLayout>
  );
}
