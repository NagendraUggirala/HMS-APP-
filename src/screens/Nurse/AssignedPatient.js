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
  Image,
  FlatList,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

// ─── constants ────────────────────────────────────────────────────────────────

const CONDITIONS = [
  "Fever", "Diabetes", "Hypertension", "Cardiac Care",
  "Fracture", "Migraine", "Infection", "Post-op Recovery",
  "Pneumonia", "Asthma", "Arthritis", "Other",
];

const STATUS_OPTIONS = ["Stable", "Critical", "Improving", "Admitted", "Discharged"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const DOCTOR_OPTIONS = ["Dr. Meena Rao", "Dr. Rajesh Kumar", "Dr. Priya Sharma"];

const MOCK_TESTS = [
  { name: "Blood Test", status: "Completed" },
  { name: "Urine Test", status: "Pending" },
  { name: "X-Ray", status: "Pending" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

const transformPatient = (patient, index) => ({
  id: patient.id || index + 1,
  patient_id: patient.patient_id,
  name: patient.patient_name || patient.name || "Unknown",
  gender: patient.gender || "Not Specified",
  room: patient.room_number || patient.ward || "N/A",
  bed: patient.bed_number || "N/A",
  condition: patient.provisional_diagnosis || patient.condition || "N/A",
  treatment: patient.chief_complaint || patient.treatment || "To be determined",
  status: patient.is_active ? "Admitted" : "Discharged",
  lastVital: patient.last_vital_timestamp
    ? new Date(patient.last_vital_timestamp).toLocaleTimeString()
    : new Date().toLocaleTimeString(),
  avatar: patient.avatar || `https://i.pravatar.cc/60?img=${(index % 20) + 11}`,
  temperature: patient.temperature || patient.vital_temperature || 98.6,
  bloodPressure: patient.blood_pressure || "120/80",
  pulse: patient.pulse || patient.heart_rate || 72,
  oxygen: patient.oxygen_saturation || patient.oxygen || 98,
  notes: patient.admission_notes || patient.notes || patient.nursing_notes || "",
  medications: patient.medications || patient.current_medications || "",
  doctor: patient.doctor_name || "Not Assigned",
  department: patient.department_name || "Not Assigned",
});

const emptyForm = () => ({
  name: "", gender: "Male", room: "", condition: "",
  treatment: "", status: "", doctor: "Dr. Meena Rao",
  temperature: "", bloodPressureSystolic: "", bloodPressureDiastolic: "",
  pulse: "", oxygen: "",
});

const getStatusStyle = (status) => {
  switch (status) {
    case "Critical":   return { bg: "#fff1f2", text: "#e11d48" };
    case "Stable":     return { bg: "#f0fdf4", text: "#16a34a" };
    case "Improving":  return { bg: "#fefce8", text: "#ca8a04" };
    case "Admitted":   return { bg: "#eff6ff", text: "#2563eb" };
    default:           return { bg: "#f1f5f9", text: "#64748b" };
  }
};

const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// ─── SelectSheet ─────────────────────────────────────────────────────────────

const SelectSheet = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectText} numberOfLines={1}>
          {value || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={13} color="#64748b" />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.selectOverlay}
          onPress={() => setOpen(false)}
          activeOpacity={1}
        />
        <View style={styles.selectDropdown}>
          <Text style={styles.dropdownTitle}>{label}</Text>
          <ScrollView>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.dropdownItem,
                  opt === value && { backgroundColor: "#eff6ff" },
                ]}
                onPress={() => { onChange(opt); setOpen(false); }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    opt === value && { color: "#2563eb", fontWeight: "700" },
                  ]}
                >
                  {opt}
                </Text>
                {opt === value && (
                  <Ionicons name="checkmark" size={16} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ─── VitalChip ────────────────────────────────────────────────────────────────

const VitalChip = ({ icon, iconColor, iconBg, label, value }) => (
  <View style={styles.vitalChip}>
    <View style={[styles.vitalIcon, { backgroundColor: iconBg }]}>
      {icon}
    </View>
    <Text style={styles.vitalLabel}>{label}</Text>
    <Text style={styles.vitalValue}>{value}</Text>
  </View>
);

// ─── TestsSection ─────────────────────────────────────────────────────────────

const TestsSection = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <View style={styles.testsPanel}>
      <View style={styles.testsPanelHeader}>
        <Text style={styles.testsPanelTitle}>Lab Tests</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>
      {MOCK_TESTS.map((test, i) => (
        <View
          key={i}
          style={[
            styles.testRow,
            i < MOCK_TESTS.length - 1 && styles.testRowBorder,
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.testName}>{test.name}</Text>
            <View style={styles.testStatusRow}>
              <View
                style={[
                  styles.testStatusDot,
                  {
                    backgroundColor:
                      test.status === "Completed" ? "#16a34a" : "#f59e0b",
                  },
                ]}
              />
              <Text style={styles.testStatusText}>{test.status}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() =>
              Alert.alert("Upload", `Upload feature requires device file picker. Coming soon.`)
            }
          >
            <Ionicons name="cloud-upload-outline" size={14} color="#2563eb" />
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

// ─── PatientCard ──────────────────────────────────────────────────────────────

const PatientCard = ({ patient, onEdit, onNotes, onMeds }) => {
  const [showTests, setShowTests] = useState(false);
  const ss = getStatusStyle(patient.status);

  return (
    <View style={styles.card}>
      {/* header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials(patient.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {patient.name}
            </Text>
            <View style={styles.cardTitleRight}>
              <TouchableOpacity
                style={styles.editIconBtn}
                onPress={() => onEdit(patient)}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={16} color="#2563eb" />
              </TouchableOpacity>
              <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
                <Text style={[styles.statusBadgeText, { color: ss.text }]}>
                  {patient.status}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardSub} numberOfLines={1}>
            {patient.gender} · Ward {patient.room} · Bed {patient.bed}
          </Text>
        </View>
      </View>

      {/* info rows */}
      <View style={styles.infoSection}>
        <InfoRow label="Doctor" value={patient.doctor} />
        <InfoRow label="Department" value={patient.department} />
        <InfoRow label="Condition" value={patient.condition} />
        <InfoRow label="Treatment" value={patient.treatment} />
      </View>

      {/* vitals */}
      <View style={styles.vitalsRow}>
        <VitalChip
          icon={<FontAwesome5 name="thermometer-half" size={12} color="#f97316" />}
          iconBg="#fff7ed"
          label="TEMP"
          value={`${patient.temperature}°F`}
        />
        <VitalChip
          icon={<Ionicons name="heart" size={12} color="#ef4444" />}
          iconBg="#fff1f2"
          label="PULSE"
          value={`${patient.pulse} bpm`}
        />
        <VitalChip
          icon={<Ionicons name="speedometer" size={12} color="#3b82f6" />}
          iconBg="#eff6ff"
          label="BP"
          value={patient.bloodPressure}
        />
        <VitalChip
          icon={<Ionicons name="water" size={12} color="#10b981" />}
          iconBg="#f0fdf4"
          label="O₂"
          value={`${patient.oxygen}%`}
        />
      </View>

      <Text style={styles.lastVital}>Last vitals: {patient.lastVital}</Text>

      {/* action buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#eff6ff" }]}
          onPress={() => setShowTests((s) => !s)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="flask-outline" size={14} color="#2563eb" />
          <Text style={[styles.actionBtnText, { color: "#2563eb" }]}>Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#f0fdf4" }]}
          onPress={() => onNotes(patient)}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={14} color="#16a34a" />
          <Text style={[styles.actionBtnText, { color: "#16a34a" }]}>Notes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#faf5ff" }]}
          onPress={() => onMeds(patient)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pill" size={14} color="#7c3aed" />
          <Text style={[styles.actionBtnText, { color: "#7c3aed" }]}>Meds</Text>
        </TouchableOpacity>
      </View>

      {/* tests panel */}
      <TestsSection
        visible={showTests}
        onClose={() => setShowTests(false)}
      />
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value || "N/A"}</Text>
  </View>
);

// ─── PatientFormModal ─────────────────────────────────────────────────────────

const PatientFormModal = ({
  visible, title, form, setForm, onSubmit, onCancel, saving,
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
      <View style={styles.modalContainer}>
        {/* header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onCancel} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Full Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            placeholder="Enter patient's full name"
            placeholderTextColor="#94a3b8"
          />

          {/* Gender + Room */}
          <View style={[styles.row, { marginTop: 14, gap: 10 }]}>
            <SelectSheet
              label="Gender"
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v })}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Room/Bed *</Text>
              <TextInput
                style={styles.input}
                value={form.room}
                onChangeText={(v) => setForm({ ...form, room: v })}
                placeholder="e.g., 101"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Condition */}
          <View style={{ marginTop: 14 }}>
            <SelectSheet
              label="Condition *"
              options={CONDITIONS}
              value={form.condition}
              onChange={(v) => setForm({ ...form, condition: v })}
            />
          </View>

          {/* Treatment */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>Treatment</Text>
            <TextInput
              style={styles.input}
              value={form.treatment}
              onChangeText={(v) => setForm({ ...form, treatment: v })}
              placeholder="e.g., Antibiotics, IV Fluids"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Status */}
          <View style={{ marginTop: 14 }}>
            <SelectSheet
              label="Status *"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
            />
          </View>

          {/* Vitals section */}
          <View style={styles.vitalsSection}>
            <Text style={styles.vitalsSectionTitle}>Initial Vital Signs</Text>

            <View style={[styles.row, { gap: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Temperature (°F)</Text>
                <TextInput
                  style={styles.input}
                  value={form.temperature}
                  onChangeText={(v) => setForm({ ...form, temperature: v })}
                  placeholder="e.g., 98.6"
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Pulse (bpm)</Text>
                <TextInput
                  style={styles.input}
                  value={form.pulse}
                  onChangeText={(v) => setForm({ ...form, pulse: v })}
                  placeholder="e.g., 72"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.row, { gap: 10, marginTop: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>BP Systolic</Text>
                <TextInput
                  style={styles.input}
                  value={form.bloodPressureSystolic}
                  onChangeText={(v) => setForm({ ...form, bloodPressureSystolic: v })}
                  placeholder="e.g., 120"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>BP Diastolic</Text>
                <TextInput
                  style={styles.input}
                  value={form.bloodPressureDiastolic}
                  onChangeText={(v) => setForm({ ...form, bloodPressureDiastolic: v })}
                  placeholder="e.g., 80"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Oxygen Saturation (%)</Text>
              <TextInput
                style={styles.input}
                value={form.oxygen}
                onChangeText={(v) => setForm({ ...form, oxygen: v })}
                placeholder="e.g., 98"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Doctor */}
          <View style={{ marginTop: 14 }}>
            <SelectSheet
              label="Assigned Doctor"
              options={DOCTOR_OPTIONS}
              value={form.doctor}
              onChange={(v) => setForm({ ...form, doctor: v })}
            />
          </View>
        </ScrollView>

        {/* footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.cancelBtn]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={16} color="#64748b" />
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                <Text style={styles.saveBtnText}>Save Patient</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

// ─── TextAreaModal ────────────────────────────────────────────────────────────

const TextAreaModal = ({
  visible, title, value, onChange, onSave, onCancel,
  placeholder, saveLabel, saveColor,
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
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle} numberOfLines={1}>{title}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onCancel} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalBody}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[styles.input, styles.bigTextarea]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.cancelBtn]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, { backgroundColor: saveColor, elevation: 4 }]}
            onPress={onSave}
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{saveLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

// ─── Main Content ─────────────────────────────────────────────────────────────

const AssignedPatientContent = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showMedsModal, setShowMedsModal] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState("");
  const [saving, setSaving] = useState(false);

  // ── fetch ────────────────────────────────────────────────────────────
  const fetchAssignedPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(
        "/api/v1/nurse/assigned-patients?include_inactive=true"
      );
      const list = data?.data || data || [];
      setPatients((Array.isArray(list) ? list : []).map(transformPatient));
    } catch (err) {
      setError(err?.message || "Unable to load assigned patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignedPatients(); }, []);

  // ── filter ───────────────────────────────────────────────────────────
  const filteredPatients = patients.filter((p) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      !s ||
      p.name.toLowerCase().includes(s) ||
      p.condition.toLowerCase().includes(s) ||
      p.room.toLowerCase().includes(s);
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── add patient ──────────────────────────────────────────────────────
  const handleAddPatient = () => {
    if (!form.name.trim() || !form.room.trim() || !form.condition || !form.status) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }
    const newP = {
      id: patients.length + 1,
      name: form.name,
      gender: form.gender,
      room: form.room,
      bed: "N/A",
      condition: form.condition,
      treatment: form.treatment || "To be determined",
      status: form.status,
      lastVital: new Date().toLocaleTimeString(),
      avatar: `https://i.pravatar.cc/60?img=${patients.length + 15}`,
      temperature: parseFloat(form.temperature) || 98.6,
      bloodPressure:
        form.bloodPressureSystolic && form.bloodPressureDiastolic
          ? `${form.bloodPressureSystolic}/${form.bloodPressureDiastolic}`
          : "120/80",
      pulse: parseInt(form.pulse) || 72,
      oxygen: parseInt(form.oxygen) || 98,
      notes: "",
      medications: "",
      doctor: form.doctor,
      department: "General",
    };
    setPatients((prev) => [...prev, newP]);
    Alert.alert("Success", `Patient ${form.name} added successfully!`);
    setShowAddModal(false);
    setForm(emptyForm());
  };

  // ── edit patient ─────────────────────────────────────────────────────
  const openEdit = (patient) => {
    setSelectedPatient(patient);
    const [sys, dia] = (patient.bloodPressure || "120/80").split("/");
    setForm({
      name: patient.name,
      gender: patient.gender,
      room: patient.room,
      condition: patient.condition,
      treatment: patient.treatment,
      status: patient.status,
      doctor: patient.doctor || "Dr. Meena Rao",
      temperature: String(patient.temperature || ""),
      bloodPressureSystolic: sys || "",
      bloodPressureDiastolic: dia || "",
      pulse: String(patient.pulse || ""),
      oxygen: String(patient.oxygen || ""),
    });
    setShowEditModal(true);
  };

  const handleUpdatePatient = () => {
    if (!form.name.trim() || !form.room.trim() || !form.condition || !form.status) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              name: form.name,
              gender: form.gender,
              room: form.room,
              condition: form.condition,
              treatment: form.treatment,
              status: form.status,
              temperature: parseFloat(form.temperature) || p.temperature,
              bloodPressure:
                form.bloodPressureSystolic && form.bloodPressureDiastolic
                  ? `${form.bloodPressureSystolic}/${form.bloodPressureDiastolic}`
                  : p.bloodPressure,
              pulse: parseInt(form.pulse) || p.pulse,
              oxygen: parseInt(form.oxygen) || p.oxygen,
            }
          : p
      )
    );
    Alert.alert("Success", "Patient details updated successfully!");
    setShowEditModal(false);
  };

  // ── notes ────────────────────────────────────────────────────────────
  const openNotes = (patient) => {
    setSelectedPatient(patient);
    setNotes(patient.notes || "");
    setShowNotesModal(true);
  };
  const handleSaveNotes = () => {
    setPatients((prev) =>
      prev.map((p) => p.id === selectedPatient.id ? { ...p, notes } : p)
    );
    setShowNotesModal(false);
    Alert.alert("Success", "Notes saved successfully!");
  };

  // ── meds ─────────────────────────────────────────────────────────────
  const openMeds = (patient) => {
    setSelectedPatient(patient);
    setMedications(patient.medications || "");
    setShowMedsModal(true);
  };
  const handleSaveMedications = () => {
    setPatients((prev) =>
      prev.map((p) => p.id === selectedPatient.id ? { ...p, medications } : p)
    );
    setShowMedsModal(false);
    Alert.alert("Success", "Medications saved successfully!");
  };

  // ─────────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
      {/* ── sticky top bar ── */}
      <View style={styles.topBar}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Assigned Patients</Text>
            <Text style={styles.pageSubtitle}>
              {patients.length} total · {filteredPatients.length} shown
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowFilterSheet(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={statusFilter ? "#2563eb" : "#64748b"}
              />
              {!!statusFilter && <View style={styles.filterDot} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => { setForm(emptyForm()); setShowAddModal(true); }}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add Patient</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, condition or room…"
            placeholderTextColor="#94a3b8"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {!!searchTerm && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* active filter chip */}
        {!!statusFilter && (
          <View style={styles.filterChipRow}>
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Status: {statusFilter}</Text>
              <TouchableOpacity onPress={() => setStatusFilter("")}>
                <Ionicons name="close" size={12} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* ── body ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading patients…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color="#e11d48" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchAssignedPatients}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredPatients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyTitle}>No patients found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filter
              </Text>
            </View>
          ) : (
            filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={openEdit}
                onNotes={openNotes}
                onMeds={openMeds}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* ── Status Filter Sheet ── */}
      <Modal visible={showFilterSheet} transparent animationType="fade">
        <TouchableOpacity
          style={styles.selectOverlay}
          onPress={() => setShowFilterSheet(false)}
          activeOpacity={1}
        />
        <View style={styles.selectDropdown}>
          <Text style={styles.dropdownTitle}>Filter by Status</Text>
          {["", ...STATUS_OPTIONS].map((opt) => (
            <TouchableOpacity
              key={opt || "all"}
              style={[
                styles.dropdownItem,
                opt === statusFilter && { backgroundColor: "#eff6ff" },
              ]}
              onPress={() => { setStatusFilter(opt); setShowFilterSheet(false); }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  opt === statusFilter && { color: "#2563eb", fontWeight: "700" },
                ]}
              >
                {opt || "All Status"}
              </Text>
              {opt === statusFilter && (
                <Ionicons name="checkmark" size={16} color="#2563eb" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* ── Add Patient Modal ── */}
      <PatientFormModal
        visible={showAddModal}
        title="Add New Patient"
        form={form}
        setForm={setForm}
        onSubmit={handleAddPatient}
        onCancel={() => { setShowAddModal(false); setForm(emptyForm()); }}
        saving={saving}
      />

      {/* ── Edit Patient Modal ── */}
      <PatientFormModal
        visible={showEditModal}
        title="Edit Patient Details"
        form={form}
        setForm={setForm}
        onSubmit={handleUpdatePatient}
        onCancel={() => setShowEditModal(false)}
        saving={saving}
      />

      {/* ── Notes Modal ── */}
      <TextAreaModal
        visible={showNotesModal}
        title={`Nursing Notes — ${selectedPatient?.name || ""}`}
        value={notes}
        onChange={setNotes}
        onSave={handleSaveNotes}
        onCancel={() => setShowNotesModal(false)}
        placeholder="Enter nursing notes, observations, and patient progress…"
        saveLabel="Save Notes"
        saveColor="#16a34a"
      />

      {/* ── Medications Modal ── */}
      <TextAreaModal
        visible={showMedsModal}
        title={`Medications — ${selectedPatient?.name || ""}`}
        value={medications}
        onChange={setMedications}
        onSave={handleSaveMedications}
        onCancel={() => setShowMedsModal(false)}
        placeholder="Enter current medications, dosage, and schedule…"
        saveLabel="Save Medications"
        saveColor="#7c3aed"
      />
    </View>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function AssignedPatient() {
  return (
    <NurseLayout>
      <AssignedPatientContent />
    </NurseLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── top bar
  topBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pageTitle: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  pageSubtitle: { fontSize: 11, color: "#94a3b8", fontWeight: "600", marginTop: 1 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    height: 38,
    width: 38,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  // ── search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#1e293b" },

  // ── filter chip
  filterChipRow: { flexDirection: "row", marginTop: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  filterChipText: { fontSize: 11, color: "#2563eb", fontWeight: "700" },

  // ── states
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  loadingText: { marginTop: 12, color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  errorText: { color: "#e11d48", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 10 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },

  // ── patient card
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 13, fontWeight: "900", color: "#2563eb" },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  cardName: { fontSize: 14, fontWeight: "800", color: "#0f172a", flex: 1 },
  cardTitleRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardSub: { fontSize: 11, color: "#94a3b8" },
  editIconBtn: {
    backgroundColor: "#eff6ff",
    padding: 5,
    borderRadius: 8,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusBadgeText: { fontSize: 9, fontWeight: "900", textTransform: "uppercase" },

  // ── info rows
  infoSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 4,
  },
  infoRow: { flexDirection: "row" },
  infoLabel: { fontSize: 11, fontWeight: "700", color: "#64748b", width: 80 },
  infoValue: { fontSize: 11, color: "#334155", flex: 1 },

  // ── vitals row
  vitalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  vitalChip: { alignItems: "center", flex: 1 },
  vitalIcon: { padding: 6, borderRadius: 10, marginBottom: 4 },
  vitalLabel: { fontSize: 8, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" },
  vitalValue: { fontSize: 11, fontWeight: "800", color: "#1e293b" },
  lastVital: { fontSize: 10, color: "#94a3b8", textAlign: "right", marginBottom: 10 },

  // ── card action buttons
  cardActions: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  actionBtnText: { fontSize: 11, fontWeight: "700" },

  // ── tests panel
  testsPanel: {
    marginTop: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  testsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  testsPanelTitle: { fontSize: 12, fontWeight: "800", color: "#1e293b" },
  testRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  testRowBorder: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  testName: { fontSize: 12, fontWeight: "700", color: "#334155" },
  testStatusRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 5 },
  testStatusDot: { width: 6, height: 6, borderRadius: 3 },
  testStatusText: { fontSize: 10, color: "#64748b", fontWeight: "600" },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  uploadBtnText: { fontSize: 10, color: "#2563eb", fontWeight: "700" },

  // ── form inputs
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#1e293b",
    backgroundColor: "#fff",
  },
  bigTextarea: { minHeight: 180, paddingTop: 12 },
  label: { fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 },
  row: { flexDirection: "row" },

  // ── vitals form section
  vitalsSection: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#f8fafc",
    gap: 4,
  },
  vitalsSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 10,
  },

  // ── select
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  selectText: { fontSize: 13, color: "#1e293b", flex: 1, marginRight: 6 },
  selectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  selectDropdown: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 400,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  dropdownItemText: { fontSize: 14, color: "#334155" },

  // ── modal
  modalContainer: { flex: 1, backgroundColor: "#f8fafc" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#0f172a", flex: 1 },
  closeBtn: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  modalBody: { padding: 20, paddingBottom: 10 },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  cancelBtn: { backgroundColor: "#f1f5f9" },
  cancelBtnText: { color: "#64748b", fontWeight: "700", fontSize: 14 },
  saveBtn: {
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
