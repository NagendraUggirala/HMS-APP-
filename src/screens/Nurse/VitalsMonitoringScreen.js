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
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Polyline, Circle, Line, Text as SvgText } from "react-native-svg";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

// ─── endpoints ────────────────────────────────────────────────────────────────

const EP = {
  PATIENTS:      "/api/v1/nurse/assigned-patients",
  GET_VITALS:    "/api/v1/nurse/vitals",
  ADD_VITALS:    "/api/v1/nurse/vitals",
  UPDATE_VITALS: (id) => `/api/v1/nurse/vitals/${id}`,
};

const { width: SW } = Dimensions.get("window");

// ─── helpers ──────────────────────────────────────────────────────────────────

const normalizeVitalsItem = (item, admissionNumber) => {
  let vs = item.vital_signs || item.vitalSigns || item.vitals || {};
  if (typeof vs === "string") { try { vs = JSON.parse(vs); } catch { vs = {}; } }

  const bpRaw = vs.blood_pressure || vs.bp || vs.bloodPressure || "";
  let bpSys = vs.blood_pressure_systolic ?? vs.bp_systolic ?? vs.bloodPressureSystolic ?? null;
  let bpDia = vs.blood_pressure_diastolic ?? vs.bp_diastolic ?? vs.bloodPressureDiastolic ?? null;
  if ((!bpSys || !bpDia) && typeof bpRaw === "string" && bpRaw.includes("/")) {
    const [s, d] = bpRaw.split("/").map((x) => parseInt(x, 10));
    if (!bpSys && isFinite(s)) bpSys = s;
    if (!bpDia && isFinite(d)) bpDia = d;
  }

  const ts = vs.recorded_at || vs.recordedAt || item.created_at || item.createdAt || Date.now();
  return {
    id:               item.id || item.record_id || vs.record_id || vs.id || null,
    record_id:        item.record_id || vs.record_id || item.id || null,
    patient_id:       item.patient_id || item.patientId || vs.patient_id || null,
    admission_number: item.admission_number || item.admissionNumber || vs.admission_number || admissionNumber,
    patient_name:     item.patient_name || item.name || vs.patient_name || "",
    temperature:      vs.temperature_f ?? vs.temperature ?? vs.temp ?? vs.body_temperature ?? null,
    pulse:            vs.pulse_rate ?? vs.pulse ?? vs.heart_rate ?? vs.heartRate ?? null,
    bp_systolic:      bpSys,
    bp_diastolic:     bpDia,
    bp_raw:           bpRaw || null,
    oxygen_saturation:vs.oxygen_saturation ?? vs.oxygen ?? vs.spO2 ?? vs.o2 ?? null,
    respiratory_rate: vs.respiratory_rate ?? vs.respiratoryRate ?? vs.resp_rate ?? null,
    height:           vs.height ?? vs.body_height ?? vs.height_cm ?? null,
    weight:           vs.weight ?? vs.body_weight ?? vs.weight_kg ?? null,
    notes:            vs.notes ?? vs.comment ?? vs.comments ?? null,
    created_at:       ts,
    time:             new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

const getStatus = (vital) => {
  const t = vital?.temperature ?? 98.6;
  return (t > 100 || t < 97)
    ? { label: "Critical", rowBg: "bg-rose-50",    badge: "bg-rose-100",    badgeText: "text-rose-700" }
    : { label: "Stable",   rowBg: "bg-transparent", badge: "bg-emerald-100", badgeText: "text-emerald-700" };
};

const emptyForm = (admNo = "") => ({
  admission_number: admNo,
  temperature: "", pulse: "", bp_systolic: "", bp_diastolic: "",
  oxygen_saturation: "", respiratory_rate: "", weight: "", height: "", notes: "",
});

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

const VitalsTrendChart = ({ vitals }) => {
  const W = SW - 48;
  const H = 180;
  const PAD = { t: 16, r: 16, b: 36, l: 38 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const data = [...vitals].reverse().slice(-10);
  if (data.length < 2) {
    return (
      <View className="items-center py-8 gap-2">
        <Ionicons name="analytics-outline" size={32} color="#cbd5e1" />
        <Text className="text-xs text-gray-400 font-medium text-center">
          At least 2 readings needed to show trend
        </Text>
      </View>
    );
  }

  const temps  = data.map((v) => v.temperature ?? 98.6);
  const pulses = data.map((v) => v.pulse ?? 72);
  const allVals = [...temps, ...pulses];
  const minV = Math.min(...allVals) - 2;
  const maxV = Math.max(...allVals) + 2;
  const range = maxV - minV || 1;

  const xStep = iW / (data.length - 1);
  const toX = (i) => i * xStep + PAD.l;
  const toY = (v) => iH - ((v - minV) / range) * iH + PAD.t;
  const pts  = (arr) => arr.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  return (
    <View>
      {/* legend */}
      <View className="flex-row gap-4 mb-3">
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full bg-red-500" />
          <Text className="text-xs font-semibold text-gray-600">Temperature (°F)</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full bg-blue-500" />
          <Text className="text-xs font-semibold text-gray-600">Heart Rate (bpm)</Text>
        </View>
      </View>

      <Svg width={W} height={H}>
        {/* grid */}
        {[0, 0.5, 1].map((f, i) => {
          const y = toY(minV + f * range);
          return (
            <React.Fragment key={i}>
              <Line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <SvgText x={PAD.l - 4} y={y + 4} fontSize={8} fill="#94a3b8" textAnchor="end">
                {Math.round(minV + f * range)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* temp line */}
        <Polyline points={pts(temps)} fill="none" stroke="#ef4444" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round" />
        {temps.map((v, i) => <Circle key={`t${i}`} cx={toX(i)} cy={toY(v)} r={3.5} fill="#ef4444" />)}

        {/* pulse line */}
        <Polyline points={pts(pulses)} fill="none" stroke="#3b82f6" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round" />
        {pulses.map((v, i) => <Circle key={`p${i}`} cx={toX(i)} cy={toY(v)} r={3.5} fill="#3b82f6" />)}

        {/* X labels */}
        {data.map((v, i) => (
          <SvgText key={`x${i}`} x={toX(i)} y={H - 4}
            fontSize={7} fill="#94a3b8" textAnchor="middle">
            {v.time}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

// ─── Vital Row (table-row style card) ─────────────────────────────────────────

const VitalRow = ({ vital, onEdit, isLast }) => {
  const st  = getStatus(vital);
  const bp  = vital.bp_systolic || vital.bp_diastolic
    ? `${vital.bp_systolic ?? "--"}/${vital.bp_diastolic ?? "--"}`
    : vital.bp_raw || "--";

  return (
    <View className={`${st.rowBg} ${!isLast ? "border-b border-gray-100" : ""} px-4 py-3`}>
      {/* row 1: name + badge + edit */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
            {vital.patient_name || vital.admission_number || "Unknown Patient"}
          </Text>
          <Text className="text-[10px] text-gray-400 font-semibold mt-0.5">{vital.time}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className={`px-2.5 py-0.5 rounded-full ${st.badge}`}>
            <Text className={`text-[9px] font-black uppercase ${st.badgeText}`}>
              {st.label}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-50 p-1.5 rounded-xl"
            onPress={() => onEdit(vital)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={14} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* row 2: vitals chips */}
      <View className="flex-row justify-between">
        <MetricChip iconBg="bg-orange-50"
          icon={<FontAwesome5 name="thermometer-half" size={10} color="#f97316" />}
          label="TEMP"
          value={vital.temperature != null ? `${vital.temperature}°F` : "N/A"}
          valueColor="text-red-600"
        />
        <MetricChip iconBg="bg-blue-50"
          icon={<Ionicons name="speedometer" size={10} color="#3b82f6" />}
          label="BP"
          value={bp}
          valueColor="text-blue-700"
        />
        <MetricChip iconBg="bg-rose-50"
          icon={<Ionicons name="heart" size={10} color="#ef4444" />}
          label="PULSE"
          value={vital.pulse != null ? `${vital.pulse} bpm` : "N/A"}
          valueColor="text-gray-800"
        />
        <MetricChip iconBg="bg-emerald-50"
          icon={<Ionicons name="water" size={10} color="#10b981" />}
          label="O₂"
          value={vital.oxygen_saturation != null ? `${vital.oxygen_saturation}%` : "N/A"}
          valueColor="text-emerald-700"
        />
      </View>

      {/* optional extras */}
      {(vital.respiratory_rate != null || vital.weight != null || vital.height != null) && (
        <View className="flex-row flex-wrap gap-3 mt-2 pt-2 border-t border-gray-100">
          {vital.respiratory_rate != null && (
            <Text className="text-[10px] text-gray-500 font-semibold">
              Resp: {vital.respiratory_rate} bpm
            </Text>
          )}
          {vital.weight != null && (
            <Text className="text-[10px] text-gray-500 font-semibold">
              Wt: {vital.weight} kg
            </Text>
          )}
          {vital.height != null && (
            <Text className="text-[10px] text-gray-500 font-semibold">
              Ht: {vital.height} cm
            </Text>
          )}
        </View>
      )}

      {!!vital.notes && (
        <Text className="text-[10px] text-gray-400 italic mt-1.5" numberOfLines={2}>
          📝 {vital.notes}
        </Text>
      )}
    </View>
  );
};

const MetricChip = ({ iconBg, icon, label, value, valueColor }) => (
  <View className="items-center flex-1">
    <View className={`${iconBg} p-1.5 rounded-xl mb-1`}>{icon}</View>
    <Text className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">{label}</Text>
    <Text className={`text-[11px] font-bold ${valueColor}`}>{value}</Text>
  </View>
);

// ─── Patient select bottom sheet ──────────────────────────────────────────────

const PatientSelectSheet = ({ visible, onClose, patients, onSelect }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={StyleSheet.absoluteFillObject}
      className="bg-black/40" onPress={onClose} activeOpacity={1} />
    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8"
      style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 }}>
      <Text className="text-sm font-black text-gray-900 text-center py-4 border-b border-gray-100">
        Select Patient
      </Text>
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
    </View>
  </Modal>
);

// ─── Form field helpers ───────────────────────────────────────────────────────

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType, required }) => (
  <View className="mb-4">
    <Text className="text-xs font-bold text-gray-600 mb-1.5">
      {label}{required ? " *" : ""}
    </Text>
    <TextInput
      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      keyboardType={keyboardType || "default"}
    />
  </View>
);

// ─── Vitals Form Modal ────────────────────────────────────────────────────────

const VitalsFormModal = ({
  visible, isEditing, form, setForm,
  onSubmit, onCancel, saving, message, patientsList, selectedAdmission,
}) => {
  const currentPatient = patientsList.find(
    (p) => (p.admission_number || p.admissionNumber || p.id?.toString()) === selectedAdmission
  );

  return (
    <Modal visible={visible} animationType="slide"
      presentationStyle="pageSheet" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 bg-gray-50">
          {/* header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
            <Text className="text-base font-black text-gray-900">
              {isEditing ? "Edit Vitals Reading" : "Add Vitals Reading"}
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
                message.type === "error"
                  ? "bg-rose-50 border-rose-200"
                  : "bg-emerald-50 border-emerald-200"
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

            {/* Admission Number */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Admission Number</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.admission_number}
                onChangeText={(v) => setForm({ ...form, admission_number: v })}
                placeholder="Enter Admission Number"
                placeholderTextColor="#94a3b8"
              />
              {currentPatient && (
                <Text className="text-[10px] text-gray-400 mt-1 px-1">
                  Patient: {currentPatient.patient_name || currentPatient.name}
                </Text>
              )}
            </View>

            <FormInput label="Temperature (°F)" required value={form.temperature}
              onChangeText={(v) => setForm({ ...form, temperature: v })}
              placeholder="e.g., 98.6" keyboardType="decimal-pad" />

            <FormInput label="Pulse (bpm)" required value={form.pulse}
              onChangeText={(v) => setForm({ ...form, pulse: v })}
              placeholder="e.g., 72" keyboardType="numeric" />

            {/* BP row */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-600 mb-1.5">BP Systolic</Text>
                <TextInput
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                  value={form.bp_systolic}
                  onChangeText={(v) => setForm({ ...form, bp_systolic: v })}
                  placeholder="120" placeholderTextColor="#94a3b8" keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-600 mb-1.5">BP Diastolic</Text>
                <TextInput
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                  value={form.bp_diastolic}
                  onChangeText={(v) => setForm({ ...form, bp_diastolic: v })}
                  placeholder="80" placeholderTextColor="#94a3b8" keyboardType="numeric" />
              </View>
            </View>

            {/* O2 + Resp Rate row */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-600 mb-1.5">O₂ Saturation (%)</Text>
                <TextInput
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                  value={form.oxygen_saturation}
                  onChangeText={(v) => setForm({ ...form, oxygen_saturation: v })}
                  placeholder="98" placeholderTextColor="#94a3b8" keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-600 mb-1.5">Resp. Rate (bpm)</Text>
                <TextInput
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                  value={form.respiratory_rate}
                  onChangeText={(v) => setForm({ ...form, respiratory_rate: v })}
                  placeholder="16" placeholderTextColor="#94a3b8" keyboardType="numeric" />
              </View>
            </View>

            {/* Weight + Height row */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-600 mb-1.5">Weight (kg)</Text>
                <TextInput
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                  value={form.weight}
                  onChangeText={(v) => setForm({ ...form, weight: v })}
                  placeholder="70" placeholderTextColor="#94a3b8" keyboardType="decimal-pad" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-600 mb-1.5">Height (cm)</Text>
                <TextInput
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                  value={form.height}
                  onChangeText={(v) => setForm({ ...form, height: v })}
                  placeholder="170" placeholderTextColor="#94a3b8" keyboardType="decimal-pad" />
              </View>
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Notes</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.notes}
                onChangeText={(v) => setForm({ ...form, notes: v })}
                placeholder="Any additional observations…"
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
                  <Ionicons name="save-outline" size={16} color="#fff" />
                  <Text className="text-sm font-bold text-white">
                    {isEditing ? "Update Vitals" : "Save Vitals"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Content ─────────────────────────────────────────────────────────────

const VitalsMonitoringContent = () => {
  const [selectedAdmission, setSelectedAdmission] = useState("ADM-2026-DB2AB787");
  const [admissionInput,    setAdmissionInput]    = useState("ADM-2026-DB2AB787");
  const [patientsList,      setPatientsList]      = useState([]);
  const [vitals,            setVitals]            = useState([]);
  const [isLoadingData,     setIsLoadingData]     = useState(false);
  const [showPatientSheet,  setShowPatientSheet]  = useState(false);

  const [showModal,       setShowModal]       = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const isEditing = Boolean(editingRecordId);
  const [form,    setForm]    = useState(emptyForm("ADM-2026-DB2AB787"));
  const [saving,  setSaving]  = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  // ── fetch vitals ───────────────────────────────────────────────────
  const fetchVitals = async (admNo) => {
    if (!admNo) return;
    setIsLoadingData(true);
    try {
      const data = await api.get(`${EP.GET_VITALS}?admission_number=${encodeURIComponent(admNo)}`);
      const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const normalized = raw
        .map((item) => normalizeVitalsItem(item, admNo))
        .filter((v) => v.temperature != null || v.pulse != null || v.bp_systolic != null || v.oxygen_saturation != null);

      const byId = new Map(patientsList.map((p) => [
        p.id || p.patient_id || p.admission_number || p.admissionNumber || "", p,
      ]));
      setVitals(normalized.map((v) => {
        if (!v.patient_name) {
          const found = byId.get(v.patient_id) || byId.get(v.admission_number);
          return { ...v, patient_name: found?.patient_name || found?.name || found?.full_name || "" };
        }
        return v;
      }));
    } catch (err) {
      console.warn("vitals:", err.message);
      setVitals([]);
    } finally { setIsLoadingData(false); }
  };

  useEffect(() => { fetchPatients(); }, []);
  useEffect(() => { if (selectedAdmission) fetchVitals(selectedAdmission); }, [selectedAdmission]);

  // ── submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.temperature || !form.pulse) {
      Alert.alert("Validation", "Temperature and Pulse are required.");
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    const payload = {
      admission_number:  form.admission_number,
      temperature:       parseFloat(form.temperature),
      pulse:             parseInt(form.pulse),
      bp_systolic:       form.bp_systolic       ? parseInt(form.bp_systolic)       : null,
      bp_diastolic:      form.bp_diastolic      ? parseInt(form.bp_diastolic)      : null,
      oxygen_saturation: form.oxygen_saturation ? parseInt(form.oxygen_saturation) : null,
      respiratory_rate:  form.respiratory_rate  ? parseInt(form.respiratory_rate)  : null,
      weight:            form.weight            ? parseFloat(form.weight)           : null,
      height:            form.height            ? parseFloat(form.height)           : null,
      notes:             form.notes || "",
    };
    try {
      if (isEditing) {
        await api.patch(EP.UPDATE_VITALS(editingRecordId), payload);
      } else {
        await api.post(EP.ADD_VITALS, payload);
      }
      setMessage({ type: "success", text: isEditing ? "Vitals updated!" : "Vitals recorded!" });
      await fetchVitals(selectedAdmission);
      setTimeout(() => { setShowModal(false); resetForm(); }, 800);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save vitals" });
    } finally { setSaving(false); }
  };

  // ── edit ───────────────────────────────────────────────────────────
  const openEdit = (vital) => {
    setEditingRecordId(vital.record_id || vital.id || null);
    setForm({
      admission_number:  vital.admission_number || selectedAdmission || "",
      temperature:       vital.temperature       != null ? String(vital.temperature)       : "",
      pulse:             vital.pulse             != null ? String(vital.pulse)             : "",
      bp_systolic:       vital.bp_systolic       != null ? String(vital.bp_systolic)       : "",
      bp_diastolic:      vital.bp_diastolic      != null ? String(vital.bp_diastolic)      : "",
      oxygen_saturation: vital.oxygen_saturation != null ? String(vital.oxygen_saturation) : "",
      respiratory_rate:  vital.respiratory_rate  != null ? String(vital.respiratory_rate)  : "",
      weight:            vital.weight            != null ? String(vital.weight)            : "",
      height:            vital.height            != null ? String(vital.height)            : "",
      notes:             vital.notes || "",
    });
    setMessage({ type: "", text: "" });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRecordId(null);
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

  const selectedPatientName = patientsList.find(
    (p) => (p.admission_number || p.admissionNumber || p.id?.toString()) === selectedAdmission
  )?.patient_name || patientsList.find(
    (p) => (p.admission_number || p.admissionNumber || p.id?.toString()) === selectedAdmission
  )?.name || "";

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
            <Text className="text-2xl font-black text-gray-900">Vitals Monitoring</Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {vitals.length} record{vitals.length !== 1 ? "s" : ""}
              {selectedPatientName ? ` · ${selectedPatientName}` : ""}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2.5 rounded-2xl flex-row items-center gap-2 shadow-lg shadow-blue-200"
            onPress={() => { resetForm(); setShowModal(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text className="text-xs font-bold text-white">Add Vitals</Text>
          </TouchableOpacity>
        </View>

        {/* ── Admission lookup ── */}
        <View className="flex-row items-center gap-2 mb-6">
          <TouchableOpacity
            className="h-11 w-11 rounded-2xl bg-blue-50 items-center justify-center border border-blue-100"
            onPress={() => setShowPatientSheet(true)}
            activeOpacity={0.7}
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
            className={`bg-blue-600 px-4 py-2.5 rounded-2xl flex-row items-center gap-1.5 ${isLoadingData ? "opacity-70" : ""}`}
            onPress={handleLoad} disabled={isLoadingData} activeOpacity={0.8}
          >
            {isLoadingData ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="cloud-download-outline" size={14} color="#fff" />
                <Text className="text-xs font-bold text-white">Load</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Vitals Table Card ── */}
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-50 mb-6">
          {/* table header */}
          <View className="flex-row items-center px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <Text className="flex-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Patient
            </Text>
            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16 text-center">
              Temp
            </Text>
            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16 text-center">
              BP
            </Text>
            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16 text-center">
              Pulse
            </Text>
            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider w-12 text-center">
              O₂
            </Text>
          </View>

          {isLoadingData ? (
            <View className="py-10 items-center gap-3">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-xs text-gray-400 font-medium">Loading vitals…</Text>
            </View>
          ) : vitals.length === 0 ? (
            <View className="py-12 items-center gap-3">
              <MaterialCommunityIcons name="heart-pulse" size={40} color="#cbd5e1" />
              <Text className="text-sm font-bold text-gray-400">No vitals recorded yet</Text>
              <Text className="text-xs text-gray-400 text-center px-6">
                Enter an admission number and tap Load, or add a new reading
              </Text>
            </View>
          ) : (
            vitals.map((vital, idx) => (
              <VitalRow
                key={vital.id || idx}
                vital={vital}
                onEdit={openEdit}
                isLast={idx === vitals.length - 1}
              />
            ))
          )}
        </View>

        {/* ── Vitals Trend Chart ── */}
        {vitals.length > 0 && (
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
            <Text className="text-lg font-bold text-gray-900 mb-1">Vitals Trends</Text>
            <Text className="text-[10px] text-gray-400 font-semibold mb-4">
              Last {Math.min(vitals.length, 10)} readings
            </Text>
            <VitalsTrendChart vitals={vitals} />
          </View>
        )}

        {/* scroll spacer */}
        <View className="h-6" />
      </ScrollView>

      {/* ── Patient select sheet ── */}
      <PatientSelectSheet
        visible={showPatientSheet}
        onClose={() => setShowPatientSheet(false)}
        patients={patientsList}
        onSelect={handlePatientSelect}
      />

      {/* ── Vitals form modal ── */}
      <VitalsFormModal
        visible={showModal}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={() => { setShowModal(false); resetForm(); }}
        saving={saving}
        message={message}
        patientsList={patientsList}
        selectedAdmission={selectedAdmission}
      />
    </View>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function VitalsMonitoringScreen() {
  return (
    <NurseLayout>
      <VitalsMonitoringContent />
    </NurseLayout>
  );
}
