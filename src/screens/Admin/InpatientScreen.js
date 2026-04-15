import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions ,
  StyleSheet,
  Platform,
  RefreshControl,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout, { useSidebar } from './AdminLayout';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

// ─── Constants & Options ──────────────────────────────────────────────────────
const WARD_TYPE_OPTIONS = ['ICU', 'GENERAL', 'EMERGENCY', 'PRIVATE'];
const BED_TYPE_OPTIONS = ['GENERAL', 'ICU', 'PRIVATE', 'EMERGENCY'];
const BED_STATUS_OPTIONS = ['available', 'occupied', 'maintenance', 'reserved'];

const HOSPITAL_ADMIN_WARDS = '/api/v1/hospital-admin/wards';
const HOSPITAL_ADMIN_BEDS = '/api/v1/hospital-admin/beds';
const INPATIENTS_URL = '/api/v1/hospital-admin/admissions';

// ─── Utility Functions ────────────────────────────────────────────────────────
function getPagedList(data) {
  const raw = data?.data ?? data;
  if (Array.isArray(raw?.items)) return { items: raw.items, total: raw.total ?? raw.total_count ?? raw.items.length };
  if (Array.isArray(raw?.wards)) return { items: raw.wards, total: raw.total ?? raw.wards.length };
  if (Array.isArray(raw?.beds)) return { items: raw.beds, total: raw.total ?? raw.beds.length };
  if (Array.isArray(raw?.inpatients)) return { items: raw.inpatients, total: raw.total ?? raw.inpatients.length };
  if (Array.isArray(raw?.admissions)) return { items: raw.admissions, total: raw.total ?? raw.admissions.length };
  if (Array.isArray(raw)) return { items: raw, total: raw.length };
  return { items: [], total: 0 };
}

function splitToStringArray(text) {
  return String(text || '')
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const ADMISSION_TYPE_OPTIONS = ['ELECTIVE', 'EMERGENCY', 'URGENT', 'ROUTINE', 'OBSERVATION'];

function mapInpatient(a) {
  const id = a?.id ?? a?.admission_id;
  const pid = id != null ? String(id) : '';
  const statusRaw = (a?.status ?? a?.admission_status ?? '').toString();
  const status = statusRaw.toUpperCase();
  const discharged = status === 'DISCHARGED' || Boolean(a?.discharge_date) || Boolean(a?.discharged_at);
  const bed = a?.bed && typeof a.bed === 'object' ? a.bed : {};
  const nameFromPatientObj = [a?.patient?.first_name, a?.patient?.last_name].filter(Boolean).join(' ').trim();
  const patientLabel =
    (a?.patient_name && String(a.patient_name).trim()) ||
    nameFromPatientObj ||
    a?.patient?.name ||
    a?.patient?.full_name ||
    a?.patient_ref ||
    'Unknown Patient';
    
  const admissionDateRaw = a?.admission_date ?? a?.admitted_at ?? '';
  const admissionDate = typeof admissionDateRaw === 'string' ? admissionDateRaw.split('T')[0] : '—';
  const dischargeDateRaw = a?.discharge_date ?? a?.discharged_at;
  const dischargeDate = dischargeDateRaw ? String(dischargeDateRaw).split('T')[0] : null;
  
  const bedIdStr = bed?.id != null ? String(bed.id) : (a?.bed_id != null ? String(a.bed_id) : '');
  const bedNo = bed?.bed_number ?? a?.bed_number ?? '—';
  const wardName = a?.ward_name ?? bed?.ward_name ?? a?.room ?? '—';

  return {
    id: pid,
    raw: a,
    patient: patientLabel,
    patient_ref: a?.patient_ref ?? '',
    roomNo: wardName,
    bedNo: bedNo,
    bed_id: bedIdStr,
    admissionDate,
    dischargeDate,
    doctor: a?.admitting_doctor ?? a?.doctor_name ?? a?.doctor?.name ?? '—',
    diagnosis: a?.diagnosis ?? '',
    treatmentPlan: a?.symptoms ?? a?.treatment_plan ?? '',
    emergencyContact: a?.emergency_contact ?? a?.emergency_contact_phone ?? '—',
    insurance: a?.insurance_details ?? a?.insurance_provider ?? '',
    status: status || '—',
    department: a?.department ?? '',
    admission_type: a?.admission_type ?? '',
    medical_history: a?.medical_history ?? '',
    discharged,
    needsBedAssignment: !discharged && !bedIdStr
  };
}

const defaultAdmissionCreateForm = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    patient_ref: '',
    admission_type: 'ELECTIVE',
    admission_date: now.toISOString().slice(0, 10),
    admission_time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    admitting_doctor: '',
    department: '',
    diagnosis: '',
    symptoms: '',
    medical_history: '',
    emergency_contact: '',
    insurance_details: '',
    estimated_stay_days: '1'
  };
};

// ─── Premium UI Components ───────────────────────────────────────────────────

const MetricCard = ({ label, value, icon, iconColor, bgColor, subtext }) => (
  <View style={[styles.metricCard, { backgroundColor: bgColor, borderColor: `${iconColor}15` }]}>
    <View style={[styles.decoratorCircle, { backgroundColor: iconColor, top: -20, right: -20, opacity: 0.1, width: 80, height: 80 }]} />
    <View className="flex-row items-center justify-between mb-4">
      <View className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm">
        <FontAwesome5 name={icon} size={16} color={iconColor} />
      </View>
      <View className="bg-white/50 px-2 py-0.5 rounded-md">
        <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{subtext}</Text>
      </View>
    </View>
    <View>
      <Text className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</Text>
      <Text className="text-xl font-black text-gray-900 mt-0.5 tracking-tighter">{value}</Text>
    </View>
  </View>
);

const InpatientCard = ({ patient, onView, onDischarge, onTransfer, onRoomShift }) => (
  <TouchableOpacity
    onPress={onView}
    activeOpacity={0.9}
    className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 mb-5 overflow-hidden"
    style={styles.shadowHigh}
  >
    <View style={{ position: 'absolute', right: 0, top: 40, width: 4, height: 24, backgroundColor: '#3b82f6', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }} />
    <View className="flex-row items-center justify-between mb-5">
      <View className="flex-row items-center flex-1">
        <View className="h-14 w-14 bg-blue-50 rounded-2xl items-center justify-center mr-4 border border-blue-100">
          <Text className="text-xl font-black text-blue-600">{patient.patient.split(' ').map(n => n[0]).join('')}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-black text-slate-900 leading-tight" numberOfLines={1}>{patient.patient}</Text>
          <Text className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {patient.id}</Text>
        </View>
      </View>
    </View>

    <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
      <View className="bg-slate-50 px-3 py-2 rounded-xl flex-row items-center">
        <Ionicons name="location-outline" size={12} color="#64748b" />
        <Text className="text-[11px] font-bold text-slate-700 ml-1.5">{patient.roomNo} - {patient.bedNo}</Text>
      </View>
      <View className="bg-slate-50 px-3 py-2 rounded-xl flex-row items-center">
        <Ionicons name="calendar-outline" size={12} color="#64748b" />
        <Text className="text-[11px] font-bold text-slate-700 ml-1.5">{patient.admissionDate}</Text>
      </View>
    </View>

    <View className="flex-row items-center justify-between pt-5 border-t border-slate-50">
      <View className="flex-row items-center">
        <Ionicons name="stethoscope-outline" size={14} color="#94a3b8" />
        <Text className="text-[11px] font-bold text-slate-500 ml-2">{patient.doctor}</Text>
      </View>
      <View className="flex-row gap-2">
        <ActionButton icon="chart-line" color="#3b82f6" bgColor="#eff6ff" onClick={onView} />
        <ActionButton icon="exchange-alt" color="#f97316" bgColor="#fff7ed" onClick={onTransfer} />
        <ActionButton icon="bed" color="#a855f7" bgColor="#f3e8ff" onClick={onRoomShift} />
        <ActionButton icon="sign-out-alt" color="#10b981" bgColor="#f0fdf4" onClick={onDischarge} />
      </View>
    </View>
  </TouchableOpacity>
);

const ActionButton = ({ icon, color, bgColor, onClick }) => (
  <TouchableOpacity
    onPress={onClick}
    style={{ backgroundColor: bgColor }}
    className="h-9 w-9 rounded-xl items-center justify-center"
  >
    <FontAwesome5 name={icon} size={12} color={color} />
  </TouchableOpacity>
);

const CustomModal = ({ isOpen, onClose, title, children }) => (
  <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 justify-end bg-black/50">
      <View className="bg-white rounded-t-[48px] shadow-2xl w-full h-[90%] pb-10">
        <View className="items-center py-4">
          <View className="w-16 h-1.5 bg-slate-100 rounded-full" />
        </View>
        <View className="flex-row justify-between items-center px-8 py-4">
          <Text className="text-2xl font-black text-slate-900 tracking-tighter">{title}</Text>
          <TouchableOpacity onPress={onClose} className="bg-slate-100 h-10 w-10 items-center justify-center rounded-full">
            <Ionicons name="close" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView className="px-8 py-2" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
            <View className="h-20" />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  </Modal>
);

// ─── Main Screen Component ────────────────────────────────────────────────────

const InpatientManagementContent = () => {
  const { toggleSidebar } = useSidebar();
  const [mainTab, setMainTab] = useState('inpatients');
  const [inpatients, setInpatients] = useState([]);
  const [stats, setStats] = useState({ occupied: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalState, setModalState] = useState({
    view: false,
    discharge: false,
    assignBed: false,
    createAdmission: false,
    createWard: false,
    createBed: false
  });
  const [currentPatient, setCurrentPatient] = useState(null);
  const [admissionCreateForm, setAdmissionCreateForm] = useState(() => defaultAdmissionCreateForm());
  const [assignBedForm, setAssignBedForm] = useState({ bed_id: '', admission_notes: '' });
  const [dischargeForm, setDischargeForm] = useState({ discharge_notes: '', discharge_summary: '' });
  const [availableBeds, setAvailableBeds] = useState([]);
  const [bedsLoading, setBedsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadInpatients = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      
      const data = await api.get(`${INPATIENTS_URL}?${params.toString()}`);
      const mapped = getPagedList(data).items.map(mapInpatient);
      setInpatients(mapped);

      // Simple stats local calculation
      const admittedWithBed = mapped.filter(ip => !ip.discharged && ip.bed_id).length;
      const pendingBed = mapped.filter(ip => !ip.discharged && !ip.bed_id).length;
      setStats({
        admitted: admittedWithBed,
        pending: pendingBed,
        total: mapped.length
      });
    } catch (error) {
      console.warn("Failed to load inpatients:", error);
      setInpatients([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadInpatients();
  }, [loadInpatients]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInpatients(true);
  };

  const filteredInpatients = inpatients.filter(p =>
    !p.discharged && (
      p.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patient_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openModal = async (type, patient = null) => {
    setCurrentPatient(patient);
    if (type === 'assignBed' && patient) {
      setAssignBedForm({ bed_id: '', admission_notes: '' });
      setBedsLoading(true);
      try {
        const res = await api.get(`${HOSPITAL_ADMIN_BEDS}?status=available&limit=100`);
        setAvailableBeds(getPagedList(res).items);
      } catch (e) { console.warn(e); }
      finally { setBedsLoading(false); }
    }
    setModalState(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModalState(prev => ({ ...prev, [type]: false }));
  };

  const handleCreateAdmission = async () => {
    if (!admissionCreateForm.patient_ref.trim()) {
      Alert.alert("Error", "Patient reference is required.");
      return;
    }
    try {
      await api.post(INPATIENTS_URL, {
        ...admissionCreateForm,
        estimated_stay_days: Number(admissionCreateForm.estimated_stay_days)
      });
      Alert.alert("Success", "Admission created successfully.");
      closeModal('createAdmission');
      loadInpatients();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create admission.");
    }
  };

  const handleDischargePatient = async () => {
    if (!currentPatient) return;
    try {
      const body = {};
      if (dischargeForm.discharge_notes.trim()) body.discharge_notes = dischargeForm.discharge_notes.trim();
      if (dischargeForm.discharge_summary.trim()) body.discharge_summary = dischargeForm.discharge_summary.trim();
      
      await api.patch(`${INPATIENTS_URL}/${currentPatient.id}/discharge`, body);
      Alert.alert("Success", "Patient discharged successfully.");
      closeModal('discharge');
      loadInpatients();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to discharge patient.");
    }
  };

  const handleAssignBed = async () => {
    if (!currentPatient || !assignBedForm.bed_id) return;
    try {
      await api.patch(`${INPATIENTS_URL}/${currentPatient.id}/assign-bed`, {
        bed_id: assignBedForm.bed_id,
        admission_notes: assignBedForm.admission_notes.trim()
      });
      Alert.alert("Success", "Bed assigned successfully.");
      closeModal('assignBed');
      loadInpatients();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to assign bed.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="px-6 py-6 bg-white border-b border-slate-50 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
              <Ionicons name="menu-outline" size={26} color="#4F46E5" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">InpatientHub</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Care Management</Text>
            </View>
          </View>

          <View className="bg-slate-100 p-1 rounded-2xl flex-row items-center">
            <TouchableOpacity
              onPress={() => openModal('createAdmission')}
              className="mr-1 h-8 px-3 rounded-xl flex-row items-center bg-blue-600 shadow-sm"
            >
              <Ionicons name="add" size={14} color="white" />
              <Text className="text-[10px] font-black text-white ml-1 uppercase">New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMainTab('inpatients')}
              className={`px-4 py-2.5 rounded-xl flex-row items-center ${mainTab === 'inpatients' ? 'bg-white shadow-sm' : ''}`}
            >
              <FontAwesome5 name="procedures" size={12} color={mainTab === 'inpatients' ? '#4F46E5' : '#94a3b8'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMainTab('wardsBeds')}
              className={`px-4 py-2.5 rounded-xl flex-row items-center ml-1 ${mainTab === 'wardsBeds' ? 'bg-white shadow-sm' : ''}`}
            >
              <FontAwesome5 name="hospital" size={12} color={mainTab === 'wardsBeds' ? '#4F46E5' : '#94a3b8'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {mainTab === 'inpatients' ? (
          <>
            {/* ── Search ── */}
            <View className="bg-slate-50 p-4 rounded-[32px] border border-slate-100 mb-8 flex-row items-center">
              <Ionicons name="search" size={20} color="#94a3b8" />
              <TextInput
                placeholder="Search inpatients by name, ID or diagnosis..."
                className="flex-1 ml-3 text-sm font-bold text-slate-700"
                placeholderTextColor="#94a3b8"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {/* ── Metrics ── */}
            <View className="flex-row flex-wrap justify-between mb-8">
              <MetricCard label="Admitted Patients" value={stats.admitted || 0} icon="procedures" iconColor="#3B82F6" bgColor="#EFF6FF" subtext="IN BEDS" />
              <MetricCard label="Pending Bed" value={stats.pending || 0} icon="hourglass-half" iconColor="#EAB308" bgColor="#FFFBEB" subtext="TO ASSIGN" />
              <MetricCard label="Total Admissions" value={stats.total || 0} icon="clipboard-list" iconColor="#8B5CF6" bgColor="#F5F3FF" subtext="THIS PAGE" />
            </View>

            <View className="flex-row items-center justify-between mb-6 px-1">
              <Text className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Active Inpatients</Text>
              <View className="bg-blue-50 px-2 py-1 rounded-lg">
                <Text className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{filteredInpatients.length} VISIBLE</Text>
              </View>
            </View>

            {filteredInpatients.length === 0 ? (
              <View className="py-20 items-center bg-slate-50/50 rounded-[40px] border border-slate-100 border-dashed">
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-sm mb-4">
                  <Ionicons name="people-outline" size={32} color="#CBD5E1" />
                </View>
                <Text className="text-slate-900 font-black text-lg">No Results Found</Text>
                <Text className="text-slate-400 text-xs text-center px-16 mt-2">Adjust your filters or register a new admission via the 'New' button.</Text>
              </View>
            ) : (
              filteredInpatients.map(patient => (
                <InpatientCard
                  key={patient.id}
                  patient={patient}
                  onView={() => openModal('view', patient)}
                  onDischarge={() => openModal('discharge', patient)}
                  onAssignBed={() => openModal('assignBed', patient)}
                />
              ))
            )}

            {/* Recent Discharges Scroll */}
            {inpatients.some(ip => !!ip.dischargeDate) && (
              <View className="mt-10">
                <View className="flex-row items-center justify-between mb-6 px-1">
                  <Text className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Recent Discharges</Text>
                  <TouchableOpacity><Text className="text-[9px] font-black text-blue-600 uppercase tracking-widest">View Archives</Text></TouchableOpacity>
                </View>
                <View className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm">
                  {inpatients.filter(ip => ip.dischargeDate).map((ip, idx, arr) => (
                    <View key={ip.id} className={`py-4 flex-row items-center justify-between ${idx !== arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                          <Ionicons name="checkmark" size={18} color="#10B981" />
                        </View>
                        <View>
                          <Text className="text-sm font-bold text-slate-800">{ip.patient}</Text>
                          <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{ip.roomNo || 'NO WARD'} - {ip.bedNo || 'NO BED'} • OUT: {ip.dischargeDate}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-[9px] font-bold text-slate-400 uppercase">{ip.doctor}</Text>
                        <Text className="text-[8px] font-bold text-blue-500 mt-0.5">FINALIZED</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <WardBedManagementSection onCreateWard={() => openModal('createWard')} onCreateBed={() => openModal('createBed')} />
        )}
      </ScrollView>

      {/* ── Modals ── */}
      <ViewPatientModal isOpen={modalState.view} onClose={() => closeModal('view')} patient={currentPatient} />

      <CreateAdmissionModal
        isOpen={modalState.createAdmission}
        onClose={() => closeModal('createAdmission')}
        form={admissionCreateForm}
        setForm={setAdmissionCreateForm}
        onSubmit={handleCreateAdmission}
      />

      <AssignBedModal
        isOpen={modalState.assignBed}
        onClose={() => closeModal('assignBed')}
        patient={currentPatient}
        beds={availableBeds}
        bedsLoading={bedsLoading}
        form={assignBedForm}
        setForm={setAssignBedForm}
        onSubmit={handleAssignBed}
      />

      <DischargeModal
        isOpen={modalState.discharge}
        onClose={() => closeModal('discharge')}
        onConfirm={handleDischargePatient}
        patient={currentPatient}
        form={dischargeForm}
        setForm={setDischargeForm}
      />

      <CreateWardModal isOpen={modalState.createWard} onClose={() => closeModal('createWard')} />
      <CreateBedModal isOpen={modalState.createBed} onClose={() => closeModal('createBed')} />
    </View>
  );
};

// ─── Ward & Bed Management ───────────────────────────────────────────────────

function WardBedManagementSection({ onCreateWard, onCreateBed }) {
  const [subTab, setSubTab] = useState('wards');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, [subTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoint = subTab === 'wards' ? HOSPITAL_ADMIN_WARDS : HOSPITAL_ADMIN_BEDS;
      const res = await api.get(`${endpoint}?limit=50`);
      setData(getPagedList(res).items);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  };

  return (
    <View>
      <View className="flex-row bg-slate-100 p-1.5 rounded-[24px] mb-8">
        <TouchableOpacity
          onPress={() => setSubTab('wards')}
          className={`flex-1 py-3 items-center rounded-2xl ${subTab === 'wards' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-[11px] font-black uppercase ${subTab === 'wards' ? 'text-indigo-600' : 'text-slate-400'}`}>Ward Registry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSubTab('beds')}
          className={`flex-1 py-3 items-center rounded-2xl ${subTab === 'beds' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-[11px] font-black uppercase ${subTab === 'beds' ? 'text-indigo-600' : 'text-slate-400'}`}>Bed Inventory</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-8" style={{ gap: 15 }}>
        <TouchableOpacity
          onPress={onCreateWard}
          className="bg-indigo-600 p-6 rounded-[36px] flex-1 shadow-lg shadow-indigo-100 items-center"
        >
          <View className="bg-white/20 h-10 w-10 rounded-2xl items-center justify-center mb-3">
            <MaterialCommunityIcons name="plus-box" size={20} color="white" />
          </View>
          <Text className="text-white font-black text-xs uppercase tracking-tight">Create Ward</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCreateBed}
          className="bg-slate-900 p-6 rounded-[36px] flex-1 shadow-lg shadow-slate-100 items-center"
        >
          <View className="bg-white/10 h-10 w-10 rounded-2xl items-center justify-center mb-3">
            <MaterialCommunityIcons name="bed-empty" size={20} color="white" />
          </View>
          <Text className="text-white font-black text-xs uppercase tracking-tight">Create Bed</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm min-h-[400px]">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-xl font-black text-slate-900 tracking-tighter uppercase">
            {subTab === 'wards' ? 'Active Wards' : 'Total Inventory'}
          </Text>
          <TouchableOpacity onPress={loadData} className="h-10 w-10 bg-indigo-50 items-center justify-center rounded-full">
            <Ionicons name="repeat" size={18} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-20"><ActivityIndicator size="small" color="#4F46E5" /></View>
        ) : data.length === 0 ? (
          <View className="py-20 items-center">
            <View className="h-20 w-20 bg-slate-50 rounded-full items-center justify-center mb-4">
              <FontAwesome5 name={subTab === 'wards' ? 'hospital' : 'bed'} size={24} color="#CBD5E1" />
            </View>
            <Text className="text-slate-400 font-bold uppercase text-[10px]">No Records Found</Text>
          </View>
        ) : (
          data.map((item, idx) => (
            <View key={idx} className="mb-4 bg-slate-50/50 p-5 rounded-[24px] border border-slate-50">
              {subTab === 'wards' ? (
                <View>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm font-black text-slate-800">{item.name || item.ward_name}</Text>
                    <View className="bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <Text className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{item.is_active !== false ? 'ACTIVE' : 'OFF'}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <View>
                      <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TYPE</Text>
                      <Text className="text-[11px] font-bold text-slate-600">{item.ward_type}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FLOOR {item.floor_number}</Text>
                      <Text className="text-[11px] font-black text-indigo-600">{item.total_beds} BEDS</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm font-black text-slate-800">UNIT #{item.bed_number}</Text>
                    <View className="bg-blue-50 px-2.5 py-1 rounded-lg">
                      <Text className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{item.status}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest">W. NAME</Text>
                      <Text className="text-[11px] font-bold text-slate-600">{item.ward_name || item.ward?.name}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest">RATE</Text>
                      <Text className="text-[11px] font-black text-emerald-600">₹{item.daily_rate || '0'}/D</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

// ─── Specialized Modals ──────────────────────────────────────────────────────

const ViewPatientModal = ({ isOpen, onClose, patient }) => (
  <CustomModal isOpen={isOpen} onClose={onClose} title="Patient Overview">
    {patient && (
      <View>
        <View className="bg-indigo-50/50 p-8 rounded-[48px] border border-indigo-50 mb-8 items-center">
          <View className="h-24 w-24 bg-white rounded-3xl items-center justify-center shadow-md mb-5 border border-indigo-100">
            <Text className="text-3xl font-black text-indigo-600">{patient.patient.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <Text className="text-2xl font-black text-slate-900 tracking-tighter text-center">{patient.patient}</Text>
          <View className="bg-indigo-600 px-3 py-1 rounded-full mt-3">
            <Text className="text-[9px] font-black text-white uppercase tracking-widest">{patient.id}</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between mb-8" style={{ gap: 12 }}>
          <DetailTile label="PHYSICIAN" value={patient.doctor} icon="stethoscope" color="#6366f1" />
          <DetailTile label="ADMISSION" value={patient.admissionDate} icon="calendar" color="#3b82f6" />
          <DetailTile label="STATION" value={`${patient.roomNo} - ${patient.bedNo}`} icon="hospital" color="#8b5cf6" />
          <DetailTile label="EMERGENCY" value={patient.emergencyContact} icon="phone" color="#ef4444" />
        </View>

        {patient.insurance && (
          <View className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Insurance Profile</Text>
              <Ionicons name="shield-checkmark" size={18} color="#3b82f6" />
            </View>
            <View className="flex-row justify-between items-baseline">
              <View className="flex-1 pr-4">
                <Text className="text-base font-black text-slate-800 leading-tight">{patient.insurance}</Text>
                <Text className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: {patient.insuranceId}</Text>
              </View>
              <Text className="text-xl font-black text-blue-600 tracking-tighter">₹{patient.insuranceAmount}</Text>
            </View>
          </View>
        )}

        <View className="mb-10">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Clinical Details</Text>
          <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-4">
            <Text className="text-[9px] font-black text-indigo-500 uppercase mb-2">DIAGNOSIS</Text>
            <Text className="text-slate-800 font-bold leading-relaxed">{patient.diagnosis}</Text>
          </View>
          <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
            <Text className="text-[9px] font-black text-indigo-500 uppercase mb-2">TREATMENT PROTOCOL</Text>
            <Text className="text-slate-800 font-bold leading-relaxed">{patient.treatmentPlan}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onClose} className="w-full py-5 bg-slate-900 rounded-[28px] items-center mb-4 shadow-lg">
          <Text className="text-white font-black uppercase tracking-widest text-[10px]">Close Dossier</Text>
        </TouchableOpacity>
      </View>
    )}
  </CustomModal>
);

const DetailTile = ({ label, value, icon, color }) => (
  <View style={{ width: (width - 64 - 24) / 2 }} className="bg-slate-50 p-5 rounded-[28px] border border-slate-50">
    <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mb-3 shadow-sm">
      <FontAwesome5 name={icon} size={12} color={color} />
    </View>
    <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</Text>
    <Text className="text-[10px] font-black text-slate-800" numberOfLines={1}>{value}</Text>
  </View>
);

const DischargeModal = ({ isOpen, onClose, onConfirm, patient, form, setForm }) => (
  <CustomModal isOpen={isOpen} onClose={onClose} title="Execute Discharge">
    {patient && (
      <View className="items-center py-6">
        <View className="h-24 w-24 bg-emerald-50 rounded-[40px] items-center justify-center mb-8 border border-emerald-100">
          <FontAwesome5 name="sign-out-alt" size={32} color="#10b981" />
        </View>
        <Text className="text-xl font-black text-slate-900 tracking-tighter text-center mb-3">Confirm Discharge?</Text>
        <Text className="text-slate-400 text-center text-sm leading-6 mb-10 px-6 font-medium">
          Ready to finalize session for <Text className="font-black text-slate-900">{patient.patient}</Text>?
        </Text>
        
        <View className="w-full space-y-4 mb-10">
          <TextInput
            className="bg-slate-50 border border-slate-100 p-5 rounded-[24px] text-slate-900 font-bold"
            placeholder="DISCHARGE NOTES"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            value={form.discharge_notes}
            onChangeText={(v) => setForm(f => ({ ...f, discharge_notes: v }))}
          />
          <TextInput
            className="bg-slate-50 border border-slate-100 p-5 rounded-[24px] text-slate-900 font-bold"
            placeholder="DISCHARGE SUMMARY (OPTIONAL)"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={2}
            value={form.discharge_summary}
            onChangeText={(v) => setForm(f => ({ ...f, discharge_summary: v }))}
          />
        </View>

        <View className="flex-row w-full" style={{ gap: 15 }}>
          <TouchableOpacity onPress={onClose} className="flex-1 py-5 border border-slate-200 rounded-[28px] items-center">
            <Text className="font-black text-slate-400 uppercase tracking-widest text-[10px]">CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} className="flex-1 py-5 bg-emerald-600 rounded-[28px] items-center shadow-lg shadow-emerald-100">
            <Text className="font-black text-white uppercase tracking-widest text-[10px]">DISCHARGE</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  </CustomModal>
);

const AssignBedModal = ({ isOpen, onClose, patient, beds, bedsLoading, form, setForm, onSubmit }) => (
  <CustomModal isOpen={isOpen} onClose={onClose} title="Station Assignment">
    {patient && (
      <View>
        <View className="bg-indigo-50/50 p-8 rounded-[40px] mb-8 border border-indigo-100/50">
          <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">TARGET PATIENT</Text>
          <Text className="text-2xl font-black text-slate-800 tracking-tighter">{patient.patient}</Text>
          <Text className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {patient.id}</Text>
        </View>

        <View className="mb-10">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">SELECT AVAILABLE UNIT</Text>
          {bedsLoading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {beds.length === 0 ? (
                <Text className="text-xs text-orange-500 font-bold">No available beds found in registry.</Text>
              ) : (
                beds.map(b => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setForm(f => ({ ...f, bed_id: String(b.id) }))}
                    className={`px-4 py-3 rounded-2xl border ${form.bed_id === String(b.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <Text className={`text-xs font-black ${form.bed_id === String(b.id) ? 'text-white' : 'text-slate-600'}`}>
                      {b.bed_number} ({b.ward_name || 'Ward'})
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
          
          <TextInput
            className="bg-slate-50 border border-slate-100 p-5 rounded-[24px] text-slate-900 font-bold mt-8"
            placeholder="REASSIGNMENT NOTES"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={2}
            value={form.admission_notes}
            onChangeText={(v) => setForm(f => ({ ...f, admission_notes: v }))}
          />
        </View>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={!form.bed_id}
          className={`w-full py-5 bg-indigo-600 rounded-[28px] items-center shadow-lg shadow-indigo-200 ${!form.bed_id ? 'opacity-50' : ''}`}
        >
          <Text className="text-white font-black uppercase tracking-widest text-[10px]">ASSIGN UNIT</Text>
        </TouchableOpacity>
      </View>
    )}
  </CustomModal>
);

const CreateAdmissionModal = ({ isOpen, onClose, form, setForm, onSubmit }) => {
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="New Admission">
      <View>
        <View className="mb-6">
          <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">PATIENT REFERENCE *</Text>
          <TextInput
            className="bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-black h-14"
            placeholder="UUID, MRN, OR MOBILE"
            placeholderTextColor="#94a3b8"
            value={form.patient_ref}
            onChangeText={v => set('patient_ref', v)}
          />
        </View>
        
        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">TYPE</Text>
            <View className="bg-slate-100 p-1 rounded-2xl flex-row flex-wrap" style={{ gap: 4 }}>
              {ADMISSION_TYPE_OPTIONS.slice(0, 3).map(opt => (
                <TouchableOpacity key={opt} onPress={() => set('admission_type', opt)} className={`px-2 py-1.5 rounded-xl ${form.admission_type === opt ? 'bg-white shadow-sm' : ''}`}>
                  <Text className={`text-[8px] font-black ${form.admission_type === opt ? 'text-indigo-600' : 'text-slate-400'}`}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">STAY (DAYS)</Text>
            <TextInput
              keyboardType="numeric"
              className="bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-black h-14 text-center"
              value={String(form.estimated_stay_days)}
              onChangeText={v => set('estimated_stay_days', v)}
            />
          </View>
        </View>

        <View className="flex-row mt-6" style={{ gap: 12 }}>
          <View className="flex-1">
             <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">ADMISSION DATE</Text>
             <TextInput className="bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-bold" value={form.admission_date} onChangeText={v => set('admission_date', v)} />
          </View>
          <View className="flex-1">
             <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">TIME</Text>
             <TextInput className="bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-bold" value={form.admission_time} onChangeText={v => set('admission_time', v)} />
          </View>
        </View>

        <View className="mt-6">{renderAdmissionField('DOCTOR', 'admitting_doctor', 'Name of physician', form, set)}</View>
        <View className="mt-4">{renderAdmissionField('DEPARTMENT', 'department', 'e.g. Cardiology', form, set)}</View>
        <View className="mt-4">{renderAdmissionField('DIAGNOSIS', 'diagnosis', 'Initial findings', form, set)}</View>
        <View className="mt-4">{renderAdmissionField('SYMPTOMS', 'symptoms', 'Clinical presentation', form, set, true)}</View>
        <View className="mt-4">{renderAdmissionField('MEDICAL HISTORY', 'medical_history', 'Past conditions', form, set, true)}</View>
        <View className="mt-4">{renderAdmissionField('EMERGENCY CONTACT', 'emergency_contact', 'Name & Phone', form, set)}</View>
        <View className="mt-4 mb-10">{renderAdmissionField('INSURANCE DETAILS', 'insurance_details', 'Provider & ID', form, set, true)}</View>

        <TouchableOpacity onPress={onSubmit} className="w-full py-5 bg-blue-600 rounded-[28px] items-center mb-10 shadow-lg shadow-blue-100">
          <Text className="text-white font-black uppercase tracking-widest text-[10px]">Commit Admission</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

const renderAdmissionField = (label, key, placeholder, form, set, multiline = false) => (
  <View>
    <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">{label}</Text>
    <TextInput
      className={`bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-bold ${multiline ? 'h-24' : 'h-14'}`}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      multiline={multiline}
      value={form[key]}
      onChangeText={v => set(key, v)}
    />
  </View>
);

const CreateWardModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    name: '', ward_type: 'GENERAL', floor_number: '', total_beds: '',
    description: '', head_nurse: '', phone: '', facilitiesText: '',
    visiting_hours: '', emergency_access: false, isolation_capability: false,
    oxygen_supply: false, nurse_station_location: ''
  });

  const handleCreate = async () => {
    if (!form.name || !form.floor_number || !form.total_beds) {
      Alert.alert("Error", "Required fields: Name, Floor, and Capacity.");
      return;
    }
    try {
      await api.post(HOSPITAL_ADMIN_WARDS, {
        name: form.name,
        ward_type: form.ward_type,
        floor_number: Number(form.floor_number),
        total_beds: Number(form.total_beds),
        description: form.description,
        head_nurse: form.head_nurse,
        phone: form.phone,
        facilities: splitToStringArray(form.facilitiesText),
        visiting_hours: form.visiting_hours,
        emergency_access: form.emergency_access,
        isolation_capability: form.isolation_capability,
        oxygen_supply: form.oxygen_supply,
        nurse_station_location: form.nurse_station_location
      });
      Alert.alert("Success", "Ward created successfully.");
      onClose();
    } catch (e) { Alert.alert("Error", e.message || "Failed to create ward."); }
  };

  const renderField = (label, key, placeholder, numeric = false) => (
    <View className="mb-4">
      <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">{label}</Text>
      <TextInput
        className="bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-bold"
        placeholder={placeholder}
        value={String(form[key] || '')}
        keyboardType={numeric ? 'numeric' : 'default'}
        onChangeText={v => setForm({ ...form, [key]: v })}
      />
    </View>
  );

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Register Ward">
      <View>
        {renderField('WARD NAME *', 'name', 'e.g. ICU South')}
        <View className="mb-4">
          <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">WARD TYPE</Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {WARD_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setForm({ ...form, ward_type: opt })}
                className={`px-3 py-2 rounded-xl border ${form.ward_type === opt ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-100'}`}
              >
                <Text className={`text-[9px] font-black uppercase ${form.ward_type === opt ? 'text-white' : 'text-slate-400'}`}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">{renderField('FLOOR *', 'floor_number', 'Floor', true)}</View>
          <View className="flex-1">{renderField('BED COUNT *', 'total_beds', 'Count', true)}</View>
        </View>
        {renderField('HEAD NURSE', 'head_nurse', 'Name')}
        {renderField('PHONE', 'phone', 'Contact No')}
        {renderField('STATION LOCATION', 'nurse_station_location', 'Placement')}
        {renderField('VISITING HOURS', 'visiting_hours', 'e.g. 10AM - 2PM')}
        <View className="mb-4">
          <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">FACILITIES (COMMA SEPARATED)</Text>
          <TextInput
            className="bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-bold"
            placeholder="e.g. AC, TV, WIFI"
            value={form.facilitiesText}
            onChangeText={v => setForm({ ...form, facilitiesText: v })}
          />
        </View>

        <View className="space-y-4 mb-8">
          <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">CAPABILITIES</Text>
          <SwitchItem label="EMERGENCY ACCESS" value={form.emergency_access} onToggle={v => setForm({ ...form, emergency_access: v })} />
          <SwitchItem label="ISOLATION READY" value={form.isolation_capability} onToggle={v => setForm({ ...form, isolation_capability: v })} />
          <SwitchItem label="OXYGEN SUPPLY" value={form.oxygen_supply} onToggle={v => setForm({ ...form, oxygen_supply: v })} />
        </View>

        <TouchableOpacity onPress={handleCreate} className="w-full py-5 bg-indigo-600 rounded-[28px] items-center mb-10 shadow-lg shadow-indigo-100">
          <Text className="text-white font-black uppercase tracking-widest text-[10px]">Initialize Ward</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

const CreateBedModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    ward_name: '', bed_number: '', bed_type: 'GENERAL', equipmentText: '',
    daily_rate: '', notes: '', is_isolation: false, has_oxygen: false, has_monitor: false
  });

  const handleCreate = async () => {
    if (!form.ward_name || !form.bed_number) {
      Alert.alert("Error", "Required: Ward Name and Bed Number.");
      return;
    }
    try {
      await api.post(HOSPITAL_ADMIN_BEDS, {
        ward_name: form.ward_name,
        bed_number: form.bed_number,
        bed_type: form.bed_type,
        equipment: splitToStringArray(form.equipmentText),
        daily_rate: Number(form.daily_rate),
        notes: form.notes,
        is_isolation: form.is_isolation,
        has_oxygen: form.has_oxygen,
        has_monitor: form.has_monitor
      });
      Alert.alert("Success", "Bed registered.");
      onClose();
    } catch (e) { Alert.alert("Error", e.message || "Failed to add bed."); }
  };

  const renderField = (label, key, placeholder, numeric = false) => (
    <View className="mb-4">
      <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">{label}</Text>
      <TextInput
        className="bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-bold"
        placeholder={placeholder}
        value={String(form[key] || '')}
        keyboardType={numeric ? 'numeric' : 'default'}
        onChangeText={v => setForm({ ...form, [key]: v })}
      />
    </View>
  );

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Register Bed">
      <View>
        {renderField('PARENT WARD NAME *', 'ward_name', 'Full Ward Name')}
        {renderField('BED NUMBER *', 'bed_number', 'e.g. B-01')}
        <View className="mb-4">
          <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">BED TYPE</Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {BED_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setForm({ ...form, bed_type: opt })}
                className={`px-3 py-2 rounded-xl border ${form.bed_type === opt ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-100'}`}
              >
                <Text className={`text-[9px] font-black uppercase ${form.bed_type === opt ? 'text-white' : 'text-slate-400'}`}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {renderField('DAILY RATE (INR)', 'daily_rate', 'Rate per day', true)}
        <View className="mb-4">
          <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">EQUIPMENT (COMMA SEPARATED)</Text>
          <TextInput
            className="bg-slate-50 border border-slate-100 p-4 rounded-[20px] text-slate-900 font-bold"
            placeholder="e.g. Monitor, Pump"
            value={form.equipmentText}
            onChangeText={v => setForm({ ...form, equipmentText: v })}
          />
        </View>
        {renderField('PRIVATE NOTES', 'notes', 'Internal notes')}

        <View className="space-y-4 mb-8">
          <Text className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">UNIT SPECS</Text>
          <SwitchItem label="ISOLATION READY" value={form.is_isolation} onToggle={v => setForm({ ...form, is_isolation: v })} />
          <SwitchItem label="OXYGEN PORT" value={form.has_oxygen} onToggle={v => setForm({ ...form, has_oxygen: v })} />
          <SwitchItem label="MONITOR HUB" value={form.has_monitor} onToggle={v => setForm({ ...form, has_monitor: v })} />
        </View>

        <TouchableOpacity onPress={handleCreate} className="w-full py-5 bg-slate-900 rounded-[28px] items-center mb-10 shadow-lg">
          <Text className="text-white font-black uppercase tracking-widest text-[10px]">Add to Inventory</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

const SwitchItem = ({ label, value, onToggle }) => (
  <View className="flex-row items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-50">
    <Text className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{label}</Text>
    <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#cbd5e1', true: '#4F46E5' }} thumbColor="white" />
  </View>
);

const InpatientScreen = () => (
  <AdminLayout>
    <InpatientManagementContent />
  </AdminLayout>
);

const styles = StyleSheet.create({
  metricCard: {
    width: (width - 60) / 2,
    padding: 24,
    borderRadius: 36,
    marginBottom: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  decoratorCircle: {
    position: "absolute",
    borderRadius: 100,
  },
  shadowHigh: {
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  }
});

export default InpatientScreen;
