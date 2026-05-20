import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

// ─── endpoints ────────────────────────────────────────────────────────────────

const EP = {
  PATIENTS:           "/api/v1/nurse/assigned-patients",
  MEDICATIONS:        "/api/v1/nurse/medications",
  UPDATE_MEDICATION:  (id) => `/api/v1/nurse/medications/${id}`,
};

// ─── constants ────────────────────────────────────────────────────────────────

const FREQUENCIES = ["Once daily","Twice daily","Three times","With meals","At bedtime","As needed"];
const ROUTES      = ["Oral","Injection","Topical","IV","Inhalation"];

// ─── helpers ──────────────────────────────────────────────────────────────────

const isSynthetic = (id) =>
  typeof id === "string" && (id.startsWith("ADM-") || id.startsWith("med-"));

const normalizeMed = (item, idx, admissionNumber = "", recordPatient = {}) => {
  const admission  = item.admission_number || item.admissionNumber || item.admissionId || item.admission || admissionNumber || "";
  const patientName = item.patient_name || item.patientName || item.name || item.full_name
    || recordPatient.name || recordPatient.patient_name || recordPatient.full_name || "";

  let recordId = null;
  if (item.id          && !isSynthetic(item.id))           recordId = item.id;
  else if (item.record_id    && !isSynthetic(item.record_id))     recordId = item.record_id;
  else if (item._id          && !isSynthetic(item._id))           recordId = item._id;
  else if (item.medication_id && !isSynthetic(item.medication_id)) recordId = item.medication_id;
  else if (item.prescription_id && !isSynthetic(item.prescription_id)) recordId = item.prescription_id;
  else if (item.uuid   && !isSynthetic(item.uuid))          recordId = item.uuid;

  return {
    ...item,
    id:               recordId || `${admission || "med"}-${idx}`,
    record_id:        recordId,
    patient_name:     patientName || "Patient",
    admission_number: admission || "Not available",
    medication_name:  item.medication_name || item.medicine_name || item.medicine || item.medication || item.name || "N/A",
    scheduled_time:   item.scheduled_time || item.time || item.schedule || "N/A",
    dose:             item.dose || item.dosage || item.quantity || "N/A",
    instructions:     item.instructions || item.notes || item.description || "",
    frequency:        item.frequency || item.dosage_frequency || item.schedule_frequency || "Once daily",
    route:            item.route || item.administration_route || item.method || "Oral",
    duration_days:    item.duration_days || item.duration || item.days || "",
    end_date:         item.end_date || item.expiry_date || item.endDate || "",
    status:           item.status || item.medication_status || "Pending",
  };
};

const emptyForm = (admNo = "") => ({
  admission_number: admNo,
  medication_name: "",
  dose: "",
  scheduled_time: "",
  instructions: "",
  frequency: "Once daily",
  start_date: "",
  end_date: "",
  route: "Oral",
  duration_days: "",
});

const statusStyle = (status) => {
  switch ((status || "").toLowerCase()) {
    case "given":   return { badge: "bg-emerald-100", text: "text-emerald-700" };
    case "missed":  return { badge: "bg-rose-100",    text: "text-rose-700"    };
    case "delayed": return { badge: "bg-purple-100",  text: "text-purple-700"  };
    default:        return { badge: "bg-amber-100",   text: "text-amber-700"   }; // Pending
  }
};

// ─── SelectSheet ─────────────────────────────────────────────────────────────

const BottomSheet = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity
      style={StyleSheet.absoluteFillObject}
      className="bg-black/40"
      onPress={onClose}
      activeOpacity={1}
    />
    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8"
      style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 }}>
      <Text className="text-sm font-black text-gray-900 text-center py-4 border-b border-gray-100">
        {title}
      </Text>
      {children}
    </View>
  </Modal>
);

// ─── Stats cards ─────────────────────────────────────────────────────────────

const StatCard = ({ label, count, bgColor, textColor, numColor }) => (
  <View className={`flex-1 ${bgColor} rounded-3xl p-4 shadow-sm`}>
    <Text className={`text-xs font-bold ${textColor} uppercase tracking-wide`}>{label}</Text>
    <Text className={`text-3xl font-black ${numColor} mt-1`}>{count}</Text>
  </View>
);

// ─── Medication Row card ──────────────────────────────────────────────────────

const MedCard = ({ med, onEdit, onAction, isLast }) => {
  const st = statusStyle(med.status);
  const initial = (med.patient_name || "P").charAt(0).toUpperCase();

  return (
    <View className={`px-4 py-4 ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Patient row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View className="h-9 w-9 rounded-full bg-blue-100 items-center justify-center">
            <Text className="text-blue-600 text-sm font-black">{initial}</Text>
          </View>
          <View>
            <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
              {med.patient_name}
            </Text>
            <Text className="text-[10px] text-gray-400 font-medium">{med.admission_number}</Text>
          </View>
        </View>
        <View className={`px-2.5 py-1 rounded-full ${st.badge}`}>
          <Text className={`text-[9px] font-black uppercase ${st.text}`}>{med.status}</Text>
        </View>
      </View>

      {/* Medicine info */}
      <View className="bg-gray-50 rounded-2xl p-3 mb-3">
        <Text className="text-sm font-bold text-gray-900 mb-0.5">{med.medication_name}</Text>
        {!!med.instructions && (
          <Text className="text-[10px] text-gray-500" numberOfLines={1}>{med.instructions}</Text>
        )}

        <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-2">
          <InfoPill icon="flask-outline" label={med.dose} />
          <InfoPill icon="time-outline" label={med.scheduled_time} />
          <InfoPill icon="repeat-outline" label={med.frequency} />
          <InfoPill icon="medical-outline" label={med.route} />
          {!!med.duration_days && (
            <InfoPill icon="calendar-outline" label={`${med.duration_days} day${med.duration_days > 1 ? "s" : ""}`} />
          )}
          {!!med.end_date && (
            <InfoPill icon="calendar-clear-outline" label={`Until ${med.end_date}`} />
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-indigo-50 px-3 py-2 rounded-xl flex-1 justify-center"
          onPress={() => onEdit(med)} activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={13} color="#4f46e5" />
          <Text className="text-[11px] font-bold text-indigo-600">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl flex-1 justify-center"
          onPress={() => onAction("give", med.id)} activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle-outline" size={13} color="#16a34a" />
          <Text className="text-[11px] font-bold text-emerald-600">Give</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-blue-50 px-3 py-2 rounded-xl flex-1 justify-center"
          onPress={() => onAction("delay", med.id)} activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={13} color="#2563eb" />
          <Text className="text-[11px] font-bold text-blue-600">Delay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-rose-50 px-3 py-2 rounded-xl flex-1 justify-center"
          onPress={() => onAction("skip", med.id)} activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={13} color="#e11d48" />
          <Text className="text-[11px] font-bold text-rose-600">Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InfoPill = ({ icon, label }) => (
  <View className="flex-row items-center gap-1">
    <Ionicons name={icon} size={10} color="#94a3b8" />
    <Text className="text-[10px] text-gray-500 font-semibold">{label}</Text>
  </View>
);

// ─── SelectRow (for bottom-sheet pickers inside modal) ────────────────────────

const PickerField = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-gray-600 mb-1.5">{label}</Text>
      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-200 rounded-2xl px-4 py-3 bg-white"
        onPress={() => setOpen(true)} activeOpacity={0.7}
      >
        <Text className="text-sm text-gray-900">{value}</Text>
        <Ionicons name="chevron-down" size={14} color="#94a3b8" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          className="bg-black/40"
          onPress={() => setOpen(false)} activeOpacity={1}
        />
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8"
          style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 }}>
          <Text className="text-sm font-black text-gray-900 text-center py-4 border-b border-gray-100">
            {label}
          </Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                className={`flex-row items-center justify-between px-5 py-3.5 border-b border-gray-50 ${opt === value ? "bg-blue-50" : ""}`}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text className={`text-sm ${opt === value ? "text-blue-600 font-bold" : "text-gray-800"}`}>{opt}</Text>
                {opt === value && <Ionicons name="checkmark" size={16} color="#2563eb" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ─── Medication Form Modal ────────────────────────────────────────────────────

const MedFormModal = ({
  visible, isEditing, form, setForm,
  onSubmit, onCancel, saving, message,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onCancel}
  >
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-gray-50">
        {/* header */}
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <Text className="text-base font-black text-gray-900">
            {isEditing ? "Edit Medication" : "Add New Medication"}
          </Text>
          <TouchableOpacity
            className="h-9 w-9 rounded-xl bg-gray-100 items-center justify-center"
            onPress={onCancel} activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* message banner */}
          {!!message.text && (
            <View className={`flex-row items-center gap-2 p-3 rounded-2xl mb-4 border ${
              message.type === "error" ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
            }`}>
              <Ionicons
                name={message.type === "error" ? "alert-circle-outline" : "checkmark-circle-outline"}
                size={16}
                color={message.type === "error" ? "#e11d48" : "#16a34a"}
              />
              <Text className={`text-xs font-semibold flex-1 ${
                message.type === "error" ? "text-rose-700" : "text-emerald-700"
              }`}>{message.text}</Text>
            </View>
          )}

          {/* Row 1: Admission + Medication Name */}
          <View className="flex-row gap-3">
            <View className="flex-1 mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Admission Number</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.admission_number}
                onChangeText={(v) => setForm({ ...form, admission_number: v })}
                placeholder="Admission No."
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View className="flex-1 mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Medication Name *</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.medication_name}
                onChangeText={(v) => setForm({ ...form, medication_name: v })}
                placeholder="e.g., Paracetamol"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Row 2: Dose + Time */}
          <View className="flex-row gap-3">
            <View className="flex-1 mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Dose *</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.dose}
                onChangeText={(v) => setForm({ ...form, dose: v })}
                placeholder="e.g., 500mg"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View className="flex-1 mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Scheduled Time *</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.scheduled_time}
                onChangeText={(v) => setForm({ ...form, scheduled_time: v })}
                placeholder="e.g., 08:00"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Frequency picker */}
          <PickerField
            label="Frequency"
            value={form.frequency}
            options={FREQUENCIES}
            onSelect={(v) => setForm({ ...form, frequency: v })}
          />

          {/* Row 3: Start Date + Route */}
          <View className="flex-row gap-3">
            <View className="flex-1 mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Start Date *</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.start_date}
                onChangeText={(v) => setForm({ ...form, start_date: v })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View className="flex-1">
              <PickerField
                label="Route"
                value={form.route}
                options={ROUTES}
                onSelect={(v) => setForm({ ...form, route: v })}
              />
            </View>
          </View>

          {/* Row 4: Duration + End Date */}
          <View className="flex-row gap-3">
            <View className="flex-1 mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Duration (days)</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.duration_days}
                onChangeText={(v) => setForm({ ...form, duration_days: v })}
                placeholder="e.g., 5"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">End Date</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.end_date}
                onChangeText={(v) => setForm({ ...form, end_date: v })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Instructions */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-gray-600 mb-1.5">Instructions *</Text>
            <TextInput
              className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
              value={form.instructions}
              onChangeText={(v) => setForm({ ...form, instructions: v })}
              placeholder="Special instructions…"
              placeholderTextColor="#94a3b8"
              multiline numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 72 }}
            />
          </View>
        </ScrollView>

        {/* footer */}
        <View className="flex-row gap-3 px-5 py-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 py-3.5 rounded-2xl"
            onPress={onCancel} activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={16} color="#64748b" />
            <Text className="text-sm font-bold text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center gap-2 bg-blue-600 py-3.5 rounded-2xl shadow-lg shadow-blue-200 ${saving ? "opacity-70" : ""}`}
            onPress={onSubmit} disabled={saving} activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name={isEditing ? "save-outline" : "add-circle-outline"} size={16} color="#fff" />
                <Text className="text-sm font-bold text-white">
                  {isEditing ? "Update Medication" : "Add Medication"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

// ─── Patient select sheet ─────────────────────────────────────────────────────

const PatientSheet = ({ visible, onClose, patients, onSelect }) => (
  <BottomSheet visible={visible} onClose={onClose} title="Select Patient">
    <ScrollView style={{ maxHeight: 340 }}>
      {patients.length === 0 ? (
        <Text className="text-center text-gray-400 text-sm py-6">No patients loaded</Text>
      ) : (
        patients.map((p) => {
          const admNo = p.admission_number || p.admissionNumber || p.id?.toString() || "";
          return (
            <TouchableOpacity
              key={p.id || admNo}
              className="px-5 py-3.5 border-b border-gray-50"
              onPress={() => { onSelect(admNo); onClose(); }}
            >
              <Text className="text-sm font-bold text-gray-900">
                {p.patient_name || p.name || "Unknown"}
              </Text>
              <Text className="text-[10px] text-gray-400 mt-0.5">{admNo}</Text>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  </BottomSheet>
);

// ─── Main Content ─────────────────────────────────────────────────────────────

const MedicationContent = () => {
  const [selectedAdmission, setSelectedAdmission]   = useState("");
  const [admissionInput,    setAdmissionInput]       = useState("");
  const [patientsList,      setPatientsList]          = useState([]);
  const [medications,       setMedications]           = useState([]);
  const [loadingMeds,       setLoadingMeds]           = useState(false);
  const [showPatientSheet,  setShowPatientSheet]      = useState(false);
  const [showModal,         setShowModal]             = useState(false);
  const [isEditing,         setIsEditing]             = useState(false);
  const [editingRecordId,   setEditingRecordId]       = useState("");
  const [form,              setForm]                  = useState(emptyForm());
  const [saving,            setSaving]                = useState(false);
  const [message,           setMessage]               = useState({ type: "", text: "" });

  // ── counts ─────────────────────────────────────────────────────────
  const count = (status) =>
    medications.filter((m) => (m.status || "").toLowerCase() === status).length;

  // ── fetch patients ─────────────────────────────────────────────────
  const fetchPatients = async () => {
    try {
      const data = await api.get(EP.PATIENTS);
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setPatientsList(list);
      if (list.length > 0 && !selectedAdmission) {
        const first = list[0].admission_number || list[0].admissionNumber || list[0].id?.toString() || "";
        setSelectedAdmission(first);
        setAdmissionInput(first);
        setForm((p) => ({ ...p, admission_number: first }));
      }
    } catch (err) { console.warn("patients:", err.message); }
  };

  // ── fetch medications ──────────────────────────────────────────────
  const fetchMedications = async (admNo) => {
    if (!admNo) return;
    setLoadingMeds(true);
    try {
      const data = await api.get(`${EP.MEDICATIONS}?admission_number=${encodeURIComponent(admNo)}`);
      const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

      const medList = raw.flatMap((record, rIdx) => {
        if (Array.isArray(record.prescriptions) && record.prescriptions.length > 0) {
          const recAdm = record.admission_number || record.admissionNumber || record.admission || admNo;
          const recPat = record.patient || {};
          return record.prescriptions.map((presc, pIdx) => {
            const enriched = { ...presc, record_id: presc.record_id || presc.id || record.id };
            return normalizeMed(enriched, pIdx, recAdm, recPat);
          });
        }
        const recAdm = record.admission_number || record.admissionNumber || record.admission || admNo;
        return [normalizeMed(record, rIdx, recAdm, record.patient || {})];
      });

      setMedications(medList);
    } catch (err) {
      console.warn("medications:", err.message);
      setMedications([]);
    } finally { setLoadingMeds(false); }
  };

  useEffect(() => { fetchPatients(); }, []);
  useEffect(() => { if (selectedAdmission) fetchMedications(selectedAdmission); }, [selectedAdmission]);

  const refreshAll = () => { fetchPatients(); if (selectedAdmission) fetchMedications(selectedAdmission); };

  // ── actions ────────────────────────────────────────────────────────
  const handleMedAction = (action, id) => {
    const statusMap = { give: "Given", delay: "Pending", skip: "Missed" };
    setMedications((prev) =>
      prev.map((m) => m.id === id ? { ...m, status: statusMap[action] || m.status } : m)
    );
  };

  // ── edit ───────────────────────────────────────────────────────────
  const openEdit = (med) => {
    const recordId = med.record_id || med._id || med.id || med.medication_id || med.prescription_id || med.uuid || "";
    setIsEditing(true);
    setEditingRecordId(recordId);
    setForm({
      admission_number: med.admission_number || selectedAdmission,
      medication_name:  med.medication_name  || "",
      dose:             med.dose             || "",
      scheduled_time:   med.scheduled_time   || "",
      instructions:     med.instructions     || "",
      frequency:        med.frequency        || "Once daily",
      start_date:       med.start_date       || "",
      end_date:         med.end_date         || "",
      route:            med.route            || "Oral",
      duration_days:    med.duration_days    ? String(med.duration_days) : "",
    });
    setMessage({ type: "", text: "" });
    setShowModal(true);
  };

  // ── submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.medication_name.trim() || !form.dose.trim() || !form.scheduled_time.trim()) {
      Alert.alert("Validation", "Medication name, dose, and time are required.");
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });

    // Build partial payload (exclude_unset style)
    const payload = {};
    if (form.admission_number) payload.admission_number = form.admission_number;
    if (form.medication_name)  payload.medication_name  = form.medication_name;
    if (form.dose)             payload.dose             = form.dose;
    if (form.scheduled_time)   payload.scheduled_time   = form.scheduled_time;
    if (form.frequency)        payload.frequency        = form.frequency;
    if (form.instructions)     payload.instructions     = form.instructions;
    if (form.start_date)       payload.start_date       = form.start_date;
    if (form.end_date)         payload.end_date         = form.end_date;
    if (form.route)            payload.route            = form.route;
    if (form.duration_days)    payload.duration_days    = parseInt(form.duration_days);

    try {
      if (isEditing && editingRecordId) {
        await api.patch(EP.UPDATE_MEDICATION(editingRecordId), payload);
      } else {
        await api.post(EP.MEDICATIONS, payload);
      }
      setMessage({
        type: "success",
        text: isEditing ? "Medication updated successfully!" : "Medication added successfully!",
      });
      await fetchMedications(selectedAdmission);
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 700);
    } catch (err) {
      setMessage({ type: "error", text: err.message || `Failed to ${isEditing ? "update" : "add"} medication` });
    } finally { setSaving(false); }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingRecordId("");
    setForm(emptyForm(selectedAdmission));
    setMessage({ type: "", text: "" });
  };

  const handlePatientSelect = (admNo) => {
    setSelectedAdmission(admNo);
    setAdmissionInput(admNo);
    setForm((p) => ({ ...p, admission_number: admNo }));
  };

  const handleLoad = () => {
    const t = admissionInput.trim();
    if (!t) { Alert.alert("Validation", "Please enter an admission number."); return; }
    setSelectedAdmission(t);
    setForm((p) => ({ ...p, admission_number: t }));
  };

  // ─────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-black text-gray-900">Medication Schedule</Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {medications.length} medication{medications.length !== 1 ? "s" : ""} scheduled
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 shadow-sm shadow-blue-200"
            onPress={() => { resetForm(); setShowModal(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={14} color="#fff" />
            <Text className="text-[10px] font-bold text-white">Add Medication</Text>
          </TouchableOpacity>
        </View>

        {/* ── Admission lookup ── */}
        <View className="flex-row items-center gap-2 mb-6">
          <TouchableOpacity
            className="h-11 w-11 rounded-2xl bg-blue-50 items-center justify-center border border-blue-100"
            onPress={() => setShowPatientSheet(true)} activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={16} color="#2563eb" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 bg-white"
            value={admissionInput}
            onChangeText={setAdmissionInput}
            placeholder="Enter Admission No…"
            placeholderTextColor="#94a3b8"
            onSubmitEditing={handleLoad}
            returnKeyType="search"
          />
          <TouchableOpacity
            className={`bg-blue-600 px-4 py-2.5 rounded-2xl flex-row items-center gap-1.5 ${loadingMeds ? "opacity-70" : ""}`}
            onPress={handleLoad} disabled={loadingMeds} activeOpacity={0.8}
          >
            {loadingMeds
              ? <ActivityIndicator size="small" color="#fff" />
              : <>
                  <MaterialCommunityIcons name="cloud-download-outline" size={14} color="#fff" />
                  <Text className="text-xs font-bold text-white">Load</Text>
                </>
            }
          </TouchableOpacity>
        </View>

        {/* ── Stats cards ── */}
        <View className="flex-row gap-3 mb-6">
          <StatCard label="Pending" count={count("pending")}
            bgColor="bg-amber-50"  textColor="text-amber-700"  numColor="text-amber-600" />
          <StatCard label="Given"   count={count("given")}
            bgColor="bg-emerald-50" textColor="text-emerald-700" numColor="text-emerald-600" />
        </View>
        <View className="flex-row gap-3 mb-6">
          <StatCard label="Missed"  count={count("missed")}
            bgColor="bg-rose-50"   textColor="text-rose-700"   numColor="text-rose-600" />
          <StatCard label="Delayed" count={count("delayed")}
            bgColor="bg-purple-50" textColor="text-purple-700"  numColor="text-purple-600" />
        </View>

        {/* ── Medications table card ── */}
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-50">
          {/* table header strip */}
          <View className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <Text className="text-sm font-bold text-gray-700">Scheduled Medications</Text>
          </View>

          {loadingMeds ? (
            <View className="py-12 items-center gap-3">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-xs text-gray-400 font-medium">Loading medications…</Text>
            </View>
          ) : medications.length === 0 ? (
            <View className="py-14 items-center gap-3 px-8">
              <View className="h-16 w-16 rounded-full bg-gray-100 items-center justify-center mb-1">
                <MaterialCommunityIcons name="pill" size={30} color="#94a3b8" />
              </View>
              <Text className="text-base font-bold text-gray-700 text-center">No medications scheduled</Text>
              <Text className="text-xs text-gray-400 text-center">
                Enter an admission number and tap Load, or add a new medication.
              </Text>
              <TouchableOpacity
                className="flex-row items-center gap-1.5 mt-2"
                onPress={() => { resetForm(); setShowModal(true); }}
              >
                <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
                <Text className="text-sm font-bold text-blue-600">Add First Medication</Text>
              </TouchableOpacity>
            </View>
          ) : (
            medications.map((med, idx) => (
              <MedCard
                key={med.id}
                med={med}
                onEdit={openEdit}
                onAction={handleMedAction}
                isLast={idx === medications.length - 1}
              />
            ))
          )}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* ── Patient Sheet ── */}
      <PatientSheet
        visible={showPatientSheet}
        onClose={() => setShowPatientSheet(false)}
        patients={patientsList}
        onSelect={handlePatientSelect}
      />

      {/* ── Medication Form Modal ── */}
      <MedFormModal
        visible={showModal}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={() => { setShowModal(false); resetForm(); }}
        saving={saving}
        message={message}
      />
    </View>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function MedicationScreen() {
  return (
    <NurseLayout>
      <MedicationContent />
    </NurseLayout>
  );
}
