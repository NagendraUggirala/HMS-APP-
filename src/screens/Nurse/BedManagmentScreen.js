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
  Switch,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

// ─── endpoints ────────────────────────────────────────────────────────────────

const EP = {
  BEDS:       "/api/v1/nurse/beds",
  UPDATE_BED: (id) => `/api/v1/nurse/beds/${id}`,
};

// ─── constants ────────────────────────────────────────────────────────────────

const WARD_FILTERS = [
  { id: "all",        name: "All Wards"  },
  { id: "icu",        name: "ICU"        },
  { id: "general",    name: "General"    },
  { id: "pediatrics", name: "Pediatrics" },
  { id: "maternity",  name: "Maternity"  },
];

const STATUS_OPTIONS   = ["AVAILABLE", "CLEANING", "RESERVED"];
const BED_TYPE_OPTIONS = ["STANDARD", "ICU", "PEDIATRIC"];

const UTILIZATION = [
  { label: "General Ward", pct: 85, color: "#2563eb" },
  { label: "ICU",          pct: 92, color: "#ef4444" },
  { label: "Pediatrics",   pct: 65, color: "#16a34a" },
  { label: "Maternity",    pct: 78, color: "#7c3aed" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

const normalizeBed = (bed) => ({
  ...bed,
  id:        bed.id || bed.bed_id,
  number:    bed.bed_number || bed.number || "Unknown",
  status:    (bed.status || bed.bed_status || "available").toLowerCase(),
  patient:   bed.patient_name || bed.patient || null,
  condition: bed.patient_condition || bed.condition || null,
  doctor:    bed.doctor_name || bed.doctor || null,
  admitted:  bed.admission_date
    ? new Date(bed.admission_date).toLocaleDateString()
    : bed.admitted || null,
  ward: bed.ward || bed.department || "general",
});

const emptyForm = () => ({
  bed_number: "", bed_code: "", ward_id: "",
  status: "AVAILABLE", bed_type: "STANDARD",
  floor: "", room_number: "", bed_position: "",
  has_oxygen: false, has_suction: false,
  has_cardiac_monitor: false, has_ventilator: false, has_iv_pole: false,
  daily_rate: "",
});

const statusMeta = (status) => {
  switch (status) {
    case "occupied": return { label: "Occupied",  badge: "bg-rose-100",    text: "text-rose-700",    dot: "#ef4444" };
    case "cleaning": return { label: "Cleaning",  badge: "bg-amber-100",   text: "text-amber-700",   dot: "#f59e0b" };
    case "reserved": return { label: "Reserved",  badge: "bg-purple-100",  text: "text-purple-700",  dot: "#7c3aed" };
    default:         return { label: "Available", badge: "bg-emerald-100", text: "text-emerald-700", dot: "#22c55e" };
  }
};

const matchWard = (bed, filter) => {
  if (filter === "all") return true;
  const w = (bed.ward || "").toLowerCase();
  if (filter === "icu")        return w.includes("icu") || w.includes("intensive");
  if (filter === "general")    return w.includes("general");
  if (filter === "pediatrics") return w.includes("pediatric");
  if (filter === "maternity")  return w.includes("maternity");
  return w === filter;
};

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

const DonutChart = ({ beds }) => {
  const size   = 180;
  const R      = 70;
  const cx     = size / 2;
  const cy     = size / 2;
  const stroke = 28;

  const counts = {
    Occupied:  beds.filter((b) => b.status === "occupied").length,
    Available: beds.filter((b) => b.status === "available").length,
    Cleaning:  beds.filter((b) => b.status === "cleaning").length,
    Reserved:  beds.filter((b) => b.status === "reserved").length,
  };
  const colors = ["#ef4444", "#22c55e", "#f59e0b", "#a855f7"];
  const labels = Object.keys(counts);
  const values = Object.values(counts);
  const total  = values.reduce((s, v) => s + v, 0) || 1;

  const circumference = 2 * Math.PI * R;
  let offset = 0;

  const segments = values.map((v, i) => {
    const pct  = v / total;
    const dash = pct * circumference;
    const seg  = { color: colors[i], dash, offset, pct };
    offset += dash;
    return seg;
  });

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segments.map((seg, i) =>
          seg.pct > 0 ? (
            <Circle
              key={i}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset + circumference / 4}
              strokeLinecap="butt"
            />
          ) : null
        )}
        <SvgText x={cx} y={cy - 8}  fontSize={22} fontWeight="900" fill="#0f172a" textAnchor="middle">{total}</SvgText>
        <SvgText x={cx} y={cy + 12} fontSize={9}  fill="#94a3b8"   textAnchor="middle">Total Beds</SvgText>
      </Svg>
      <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {labels.map((label, i) => (
          <View key={label} className="flex-row items-center gap-1.5">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors[i] }} />
            <Text className="text-[10px] text-gray-600 font-semibold">{label}: {values[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Progress bar ─────────────────────────────────────────────────────────────

const UtilBar = ({ label, pct, color }) => (
  <View className="mb-4">
    <View className="flex-row justify-between mb-1.5">
      <Text className="text-sm font-semibold text-gray-700">{label}</Text>
      <Text className="text-sm font-bold text-gray-900">{pct}%</Text>
    </View>
    <View className="w-full h-2 rounded-full bg-gray-100">
      <View style={{ width: `${pct}%`, backgroundColor: color }} className="h-2 rounded-full" />
    </View>
  </View>
);

// ─── Info line ────────────────────────────────────────────────────────────────

const InfoLine = ({ icon, label, value }) => (
  <View className="flex-row items-center gap-2">
    <Ionicons name={icon} size={11} color="#94a3b8" />
    <Text className="text-xs font-bold text-gray-500 w-16">{label}</Text>
    <Text className="text-xs text-gray-700 flex-1 font-medium" numberOfLines={1}>{value}</Text>
  </View>
);

// ─── Equipment chip ───────────────────────────────────────────────────────────

const EquipChip = ({ label }) => (
  <View className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
    <Text className="text-[9px] font-bold text-blue-600">{label}</Text>
  </View>
);

// ─── Bed Card (full-width) ────────────────────────────────────────────────────

const BedCard = ({ bed, onEdit }) => {
  const meta = statusMeta(bed.status);

  return (
    <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50 mb-4">
      {/* top row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-2xl bg-blue-50 items-center justify-center">
            <MaterialCommunityIcons name="bed" size={20} color="#2563eb" />
          </View>
          <View>
            <Text className="text-sm font-black text-gray-900">Bed {bed.number}</Text>
            {!!bed.ward && (
              <Text className="text-[10px] text-gray-400 font-medium capitalize">{bed.ward}</Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${meta.badge}`}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: meta.dot }} />
            <Text className={`text-[9px] font-black uppercase ${meta.text}`}>{meta.label}</Text>
          </View>
          <TouchableOpacity
            className="h-8 w-8 rounded-xl bg-gray-100 items-center justify-center"
            onPress={() => onEdit(bed)} activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={14} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* info block */}
      <View className="bg-gray-50 rounded-2xl px-4 py-3 mb-3 gap-1.5">
        {bed.status === "occupied" ? (
          <>
            <InfoLine icon="person-outline"   label="Patient"   value={bed.patient   || "N/A"} />
            <InfoLine icon="medical-outline"  label="Doctor"    value={bed.doctor    || "N/A"} />
            <InfoLine icon="calendar-outline" label="Admitted"  value={bed.admitted  || "N/A"} />
            {!!bed.condition && (
              <InfoLine icon="fitness-outline" label="Condition" value={bed.condition} />
            )}
          </>
        ) : bed.status === "reserved" ? (
          <>
            <InfoLine icon="bookmark-outline" label="Reserved" value="Emergency" />
            <InfoLine icon="time-outline"     label="Expected"
              value={new Date(Date.now() + 2 * 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
          </>
        ) : (
          <>
            <InfoLine icon="checkmark-circle-outline" label="Status"
              value={bed.status === "available" ? "Ready for admission" : "Under maintenance"} />
            {!!bed.bed_type    && <InfoLine icon="layers-outline"   label="Type"  value={bed.bed_type}    />}
            {!!bed.floor       && <InfoLine icon="business-outline" label="Floor" value={bed.floor}       />}
            {!!bed.room_number && <InfoLine icon="home-outline"     label="Room"  value={bed.room_number} />}
          </>
        )}
      </View>

      {/* equipment chips */}
      {(bed.has_oxygen || bed.has_suction || bed.has_cardiac_monitor || bed.has_ventilator || bed.has_iv_pole) && (
        <View className="flex-row flex-wrap gap-1.5 mb-3">
          {bed.has_oxygen          && <EquipChip label="O2"        />}
          {bed.has_suction         && <EquipChip label="Suction"   />}
          {bed.has_cardiac_monitor && <EquipChip label="Cardiac"   />}
          {bed.has_ventilator      && <EquipChip label="Ventilator"/>}
          {bed.has_iv_pole         && <EquipChip label="IV Pole"   />}
        </View>
      )}

      {/* action buttons */}
      {bed.status === "occupied" ? (
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-blue-50 py-2.5 rounded-2xl"
            onPress={() => Alert.alert("Transfer", `Transfer ${bed.patient}`)} activeOpacity={0.7}
          >
            <Ionicons name="swap-horizontal-outline" size={13} color="#2563eb" />
            <Text className="text-xs font-bold text-blue-600">Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-rose-50 py-2.5 rounded-2xl"
            onPress={() => Alert.alert("Discharge", `Discharge ${bed.patient}`)} activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={13} color="#e11d48" />
            <Text className="text-xs font-bold text-rose-600">Discharge</Text>
          </TouchableOpacity>
        </View>
      ) : bed.status === "reserved" ? (
        <TouchableOpacity
          className="flex-row items-center justify-center gap-1.5 bg-amber-50 py-2.5 rounded-2xl"
          onPress={() => Alert.alert("Cancel Reserve", `Cancel reservation for Bed ${bed.number}`)} activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={13} color="#d97706" />
          <Text className="text-xs font-bold text-amber-600">Cancel Reserve</Text>
        </TouchableOpacity>
      ) : (
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-emerald-50 py-2.5 rounded-2xl"
            onPress={() => Alert.alert("Assign", `Assign Bed ${bed.number}`)} activeOpacity={0.7}
          >
            <Ionicons name="person-add-outline" size={13} color="#16a34a" />
            <Text className="text-xs font-bold text-emerald-600">Assign</Text>
          </TouchableOpacity>
          {bed.status === "cleaning" && (
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 bg-blue-50 py-2.5 rounded-2xl"
              onPress={() => Alert.alert("Mark Clean", `Mark Bed ${bed.number} as clean`)} activeOpacity={0.7}
            >
              <Ionicons name="sparkles-outline" size={13} color="#2563eb" />
              <Text className="text-xs font-bold text-blue-600">Mark Clean</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// ─── PickerField ──────────────────────────────────────────────────────────────

const PickerField = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <View className="flex-1">
      <Text className="text-xs font-bold text-gray-600 mb-1.5">{label}</Text>
      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-200 rounded-2xl px-4 py-3 bg-white"
        onPress={() => setOpen(true)} activeOpacity={0.7}
      >
        <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>{value}</Text>
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
          <ScrollView style={{ maxHeight: 300 }}>
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

// ─── Equipment toggle ─────────────────────────────────────────────────────────

const EquipToggle = ({ label, value, onChange }) => (
  <View className="flex-row items-center justify-between py-2.5 border-b border-gray-50">
    <Text className="text-sm text-gray-700 font-medium">{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
      thumbColor={value ? "#2563eb" : "#cbd5e1"}
    />
  </View>
);

// ─── Field input ──────────────────────────────────────────────────────────────

const FInput = ({ label, value, onChangeText, placeholder, keyboardType }) => (
  <View className="flex-1">
    <Text className="text-xs font-bold text-gray-600 mb-1.5">{label}</Text>
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

// ─── Bed Form Modal ───────────────────────────────────────────────────────────

const BedFormModal = ({ visible, isEditing, form, setForm, onSubmit, onCancel, saving }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="flex-1 bg-gray-50">
        {/* header */}
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <Text className="text-base font-black text-gray-900">
            {isEditing ? "Edit Bed Details" : "Add New Bed"}
          </Text>
          <TouchableOpacity
            className="h-9 w-9 rounded-xl bg-gray-100 items-center justify-center"
            onPress={onCancel} activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Bed Number + Bed Code */}
          <View className="flex-row gap-3 mb-4">
            <FInput label="Bed Number *" value={form.bed_number}
              onChangeText={(v) => setForm({ ...form, bed_number: v })} placeholder="e.g., B-101" />
            <FInput label="Bed Code *" value={form.bed_code}
              onChangeText={(v) => setForm({ ...form, bed_code: v })} placeholder="e.g., BED-ICU-101" />
          </View>

          {/* Ward + Status */}
          <View className="flex-row gap-3 mb-4">
            <FInput label="Ward ID / Name *" value={form.ward_id}
              onChangeText={(v) => setForm({ ...form, ward_id: v })} placeholder="UUID or Name" />
            <PickerField label="Status" value={form.status}
              options={STATUS_OPTIONS} onSelect={(v) => setForm({ ...form, status: v })} />
          </View>

          {/* Bed Type + Daily Rate */}
          <View className="flex-row gap-3 mb-4">
            <PickerField label="Bed Type" value={form.bed_type}
              options={BED_TYPE_OPTIONS} onSelect={(v) => setForm({ ...form, bed_type: v })} />
            <FInput label="Daily Rate (Rs.)" value={form.daily_rate}
              onChangeText={(v) => setForm({ ...form, daily_rate: v })}
              placeholder="e.g., 2500" keyboardType="numeric" />
          </View>

          {/* Floor + Room + Position */}
          <View className="flex-row gap-3 mb-4">
            <FInput label="Floor" value={form.floor}
              onChangeText={(v) => setForm({ ...form, floor: v })} placeholder="1st" />
            <FInput label="Room" value={form.room_number}
              onChangeText={(v) => setForm({ ...form, room_number: v })} placeholder="R-12" />
            <FInput label="Position" value={form.bed_position}
              onChangeText={(v) => setForm({ ...form, bed_position: v })} placeholder="Window" />
          </View>

          {/* Equipment toggles */}
          <View className="bg-white rounded-3xl px-4 py-2 mb-4 shadow-sm border border-gray-50">
            <Text className="text-sm font-black text-gray-900 mb-1 pt-2">Equipment</Text>
            <EquipToggle label="Oxygen"         value={form.has_oxygen}          onChange={(v) => setForm({ ...form, has_oxygen: v })} />
            <EquipToggle label="Suction"         value={form.has_suction}         onChange={(v) => setForm({ ...form, has_suction: v })} />
            <EquipToggle label="Cardiac Monitor" value={form.has_cardiac_monitor} onChange={(v) => setForm({ ...form, has_cardiac_monitor: v })} />
            <EquipToggle label="Ventilator"      value={form.has_ventilator}      onChange={(v) => setForm({ ...form, has_ventilator: v })} />
            <EquipToggle label="IV Pole"         value={form.has_iv_pole}         onChange={(v) => setForm({ ...form, has_iv_pole: v })} />
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
                  {isEditing ? "Update Bed" : "Add Bed"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

// ─── Main Content ─────────────────────────────────────────────────────────────

const BedManagementContent = () => {
  const [beds,         setBeds]         = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [selectedWard, setSelectedWard] = useState("all");
  const [showModal,    setShowModal]    = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [editingBedId, setEditingBedId] = useState(null);
  const [form,         setForm]         = useState(emptyForm());
  const [saving,       setSaving]       = useState(false);

  const fetchBeds = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(EP.BEDS);
      const raw  = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setBeds(raw.map(normalizeBed));
    } catch (err) {
      console.warn("beds:", err.message);
      setBeds([]);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBeds(); }, []);

  const filteredBeds = beds.filter((b) => matchWard(b, selectedWard));
  const cnt = (status) => beds.filter((b) => b.status === status).length;

  const handleSubmit = async () => {
    if (!form.bed_number.trim() || !form.bed_code.trim() || !form.ward_id.trim()) {
      Alert.alert("Validation", "Bed number, bed code, and ward are required.");
      return;
    }
    setSaving(true);
    const payload = { ...form, daily_rate: form.daily_rate ? parseFloat(form.daily_rate) : 0 };
    try {
      if (isEditing && editingBedId) {
        await api.patch(EP.UPDATE_BED(editingBedId), payload);
      } else {
        await api.post(EP.BEDS, payload);
      }
      await fetchBeds();
      setShowModal(false);
      resetForm();
    } catch (err) {
      Alert.alert("Error", err.message || `Failed to ${isEditing ? "update" : "add"} bed`);
    } finally { setSaving(false); }
  };

  const openEdit = (bed) => {
    setIsEditing(true);
    setEditingBedId(bed.id);
    setForm({
      bed_number:          bed.bed_number || bed.number || "",
      bed_code:            bed.bed_code   || "",
      ward_id:             bed.ward_id    || bed.ward || "",
      status:              (bed.status    || "AVAILABLE").toUpperCase(),
      bed_type:            bed.bed_type   || "STANDARD",
      floor:               bed.floor      || "",
      room_number:         bed.room_number || "",
      bed_position:        bed.bed_position || "",
      has_oxygen:          bed.has_oxygen          || false,
      has_suction:         bed.has_suction         || false,
      has_cardiac_monitor: bed.has_cardiac_monitor || false,
      has_ventilator:      bed.has_ventilator      || false,
      has_iv_pole:         bed.has_iv_pole         || false,
      daily_rate:          bed.daily_rate ? String(bed.daily_rate) : "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingBedId(null);
    setForm(emptyForm());
  };

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-black text-gray-900">Bed Management</Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {beds.length} beds · {cnt("available")} available
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2.5 rounded-2xl flex-row items-center gap-2 shadow-lg shadow-blue-200"
            onPress={() => { resetForm(); setShowModal(true); }} activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text className="text-xs font-bold text-white">Add Bed</Text>
          </TouchableOpacity>
        </View>

        {/* Stats grid – 2 × 2 */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {[
            { label: "Available", status: "available", bg: "bg-emerald-50", num: "text-emerald-600", txt: "text-emerald-700" },
            { label: "Occupied",  status: "occupied",  bg: "bg-rose-50",    num: "text-rose-600",    txt: "text-rose-700"   },
            { label: "Cleaning",  status: "cleaning",  bg: "bg-amber-50",   num: "text-amber-600",   txt: "text-amber-700"  },
            { label: "Reserved",  status: "reserved",  bg: "bg-purple-50",  num: "text-purple-600",  txt: "text-purple-700" },
          ].map((s) => (
            <View key={s.label} style={{ width: "47.5%" }} className={`${s.bg} rounded-3xl p-4 shadow-sm items-center`}>
              <Text className={`text-2xl font-black ${s.num}`}>{cnt(s.status)}</Text>
              <Text className={`text-[9px] font-bold uppercase ${s.txt} mt-0.5`}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Ward filter tabs */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          className="mb-6"
        >
          {WARD_FILTERS.map((w) => (
            <TouchableOpacity
              key={w.id}
              className={`px-4 py-2 rounded-2xl border ${
                selectedWard === w.id ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
              }`}
              onPress={() => setSelectedWard(w.id)} activeOpacity={0.7}
            >
              <Text className={`text-xs font-bold ${selectedWard === w.id ? "text-white" : "text-gray-600"}`}>
                {w.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bed list (full-width single column) */}
        {isLoading ? (
          <View className="py-16 items-center gap-3">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-xs text-gray-400 font-medium">Loading beds...</Text>
          </View>
        ) : filteredBeds.length === 0 ? (
          <View className="py-16 items-center gap-3">
            <MaterialCommunityIcons name="bed-empty" size={44} color="#cbd5e1" />
            <Text className="text-sm font-bold text-gray-400">No beds found for this ward</Text>
          </View>
        ) : (
          filteredBeds.map((bed) => (
            <BedCard key={bed.id} bed={bed} onEdit={openEdit} />
          ))
        )}

        {/* Bed Status Summary donut */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 mt-2 mb-4">
          <Text className="text-sm font-black text-gray-900 mb-4">Bed Status Summary</Text>
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : (
            <DonutChart beds={beds} />
          )}
        </View>

        {/* Utilization bars */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
          <Text className="text-sm font-black text-gray-900 mb-5">Bed Utilization</Text>
          {UTILIZATION.map((u) => (
            <UtilBar key={u.label} label={u.label} pct={u.pct} color={u.color} />
          ))}
        </View>

        <View className="h-6" />
      </ScrollView>

      <BedFormModal
        visible={showModal}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={() => { setShowModal(false); resetForm(); }}
        saving={saving}
      />
    </View>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function BedManagmentScreen() {
  return (
    <NurseLayout>
      <BedManagementContent />
    </NurseLayout>
  );
}
