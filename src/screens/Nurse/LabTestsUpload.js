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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

// ─── endpoints ────────────────────────────────────────────────────────────────

const EP = {
  LAB_TESTS:          "/api/v1/nurse/lab-tests",
  PATIENTS:           "/api/v1/nurse/assigned-patients",
  UPDATE_LAB_TEST:    (id) => `/api/v1/nurse/lab-tests/${id}`,
  UPLOAD_LAB_REPORT:  (id) => `/api/v1/nurse/lab-tests/${id}/upload`,
};

// ─── base URL (mirrors api.js resolution) ────────────────────────────────────

const _extra = Constants.expoConfig?.extra || {};
const _BASE_URL = (() => {
  let raw = _extra.API_BASE_URL || "http://localhost:3000";
  raw = String(raw).trim();
  if (!raw || /ngrok/i.test(raw)) return "http://localhost:3000";
  return raw.replace(/\/+$/, "");
})();
const _HOSPITAL_ID = _extra.HOSPITAL_ID || "apollo";

/** Upload a PDF file as multipart/form-data with auth token. */
async function uploadLabReport(labId, fileAsset) {
  let token = null;
  let hospitalId = _HOSPITAL_ID;
  try {
    token = await AsyncStorage.getItem("authToken");
    const storedUser = await AsyncStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.hospitalId) hospitalId = user.hospitalId;
    }
  } catch (_) {}

  const url = `${_BASE_URL}${EP.UPLOAD_LAB_REPORT(labId)}`;

  const formData = new FormData();
  formData.append("file", {
    uri: fileAsset.uri,
    name: fileAsset.name || "lab_report.pdf",
    type: fileAsset.mimeType || "application/pdf",
  });

  const headers = {
    "X-Hospital-ID": hospitalId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Do NOT set Content-Type — fetch sets it automatically for FormData
  };

  const response = await fetch(url, { method: "POST", headers, body: formData });

  const text = await response.text();
  let json = {};
  try { json = JSON.parse(text); } catch (_) {}

  if (!response.ok) {
    throw new Error(json?.message || json?.detail || `Upload failed (${response.status})`);
  }
  return json;
}

// ─── constants ────────────────────────────────────────────────────────────────

const TEST_TYPES = [
  "Blood Test",
  "Urine Test",
  "X-Ray",
  "CT Scan",
  "MRI",
  "Ultrasound",
  "ECG",
  "Other",
];

const PRIORITIES = ["Routine", "Urgent", "Emergency"];

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
};

const normalizeLabRecord = (record) => {
  const orders =
    Array.isArray(record.lab_orders) && record.lab_orders.length > 0
      ? record.lab_orders
      : [record];

  return orders.map((order, idx) => ({
    ...record,
    _rowKey: `${record.id}-${idx}`,
    id: record.id,
    patient:
      record.patient_name || record.patient || record.patient_id || "N/A",
    admission_number: record.admission_number || record.patient_id || "",
    testType:
      order.test_type || order.test_name || record.test_type || "N/A",
    doctor:
      order.requesting_doctor || record.doctor_name || record.doctor_id || "N/A",
    orderedDate: order.requested_at
      ? formatDate(order.requested_at)
      : formatDate(record.created_at),
    status: (record.status || "pending").toLowerCase(),
    result: record.result || null,
    reason: order.reason_for_test || record.reason || "",
    priority: order.priority || record.priority || "Routine",
  }));
};

const emptyForm = () => ({
  patient: "",
  testType: "",
  reason: "",
  priority: "Routine",
  doctor: "Dr. Meena Rao",
});

// ─── Status helpers ────────────────────────────────────────────────────────────

const statusStyle = (status) => {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return { bg: "#d1fae5", text: "#065f46", label: "Completed" };
    case "urgent":
      return { bg: "#fee2e2", text: "#991b1b", label: "Urgent" };
    default:
      return { bg: "#fef3c7", text: "#92400e", label: "Pending" };
  }
};

const resultStyle = (result) => {
  switch (result) {
    case "Normal":
      return { bg: "#d1fae5", text: "#065f46" };
    case "Abnormal":
      return { bg: "#fef3c7", text: "#92400e" };
    case "Inconclusive":
      return { bg: "#fee2e2", text: "#991b1b" };
    default:
      return { bg: "#f1f5f9", text: "#475569" };
  }
};

// ─── PickerField (bottom-sheet dropdown) ─────────────────────────────────────

const PickerField = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-gray-600 mb-1.5">{label}</Text>
      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-200 rounded-2xl px-4 py-3 bg-white"
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
          {value || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#94a3b8" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          className="bg-black/40"
          onPress={() => setOpen(false)}
          activeOpacity={1}
        />
        <View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8"
          style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 }}
        >
          <Text className="text-sm font-black text-gray-900 text-center py-4 border-b border-gray-100">
            {label}
          </Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                className={`flex-row items-center justify-between px-5 py-3.5 border-b border-gray-50 ${
                  opt === value ? "bg-blue-50" : ""
                }`}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text className={`text-sm ${opt === value ? "text-blue-600 font-bold" : "text-gray-800"}`}>
                  {opt}
                </Text>
                {opt === value && <Ionicons name="checkmark" size={16} color="#2563eb" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ─── PatientSheet ─────────────────────────────────────────────────────────────

const PatientSheet = ({ visible, onClose, patients, onSelect }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity
      style={StyleSheet.absoluteFillObject}
      className="bg-black/40"
      onPress={onClose}
      activeOpacity={1}
    />
    <View
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8"
      style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 }}
    >
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

// ─── Lab Test Card ────────────────────────────────────────────────────────────

const LabCard = ({ lab, onEdit, onUpload, isUploading, isLast }) => {
  const ss = statusStyle(lab.status);
  const rs = resultStyle(lab.result);
  const isComplete = lab.status === "completed" || lab.status === "ready";

  return (
    <View
      className={`bg-white rounded-3xl p-4 mb-3 shadow-sm border border-gray-50 ${
        isLast ? "mb-0" : ""
      }`}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-black text-gray-900" numberOfLines={1}>
            {lab.testType}
          </Text>
          <Text className="text-[10px] text-gray-400 font-medium mt-0.5">
            {lab.patient}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="h-7 w-7 rounded-xl bg-blue-50 items-center justify-center"
            onPress={() => onEdit(lab)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={13} color="#2563eb" />
          </TouchableOpacity>
          <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: ss.bg }}>
            <Text className="text-[9px] font-black uppercase" style={{ color: ss.text }}>
              {ss.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Info block */}
      <View className="bg-gray-50 rounded-2xl p-3 mb-3">
        <View className="flex-row items-center gap-2 mb-1.5">
          <Ionicons name="person-outline" size={12} color="#94a3b8" />
          <Text className="text-[11px] text-gray-600 font-medium flex-1" numberOfLines={1}>
            <Text className="font-bold">Doctor: </Text>{lab.doctor}
          </Text>
        </View>
        <View className="flex-row items-center gap-2 mb-1.5">
          <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
          <Text className="text-[11px] text-gray-600 font-medium">
            <Text className="font-bold">Ordered: </Text>{lab.orderedDate}
          </Text>
        </View>
        {!!lab.priority && (
          <View className="flex-row items-center gap-2">
            <Ionicons name="flag-outline" size={12} color="#94a3b8" />
            <Text className="text-[11px] text-gray-600 font-medium">
              <Text className="font-bold">Priority: </Text>{lab.priority}
            </Text>
          </View>
        )}
      </View>

      {/* Result / Upload row */}
      {isComplete ? (
        <View>
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-xs font-bold text-gray-700">Result:</Text>
            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: rs.bg }}>
              <Text className="text-[10px] font-bold" style={{ color: rs.text }}>
                {lab.result || "Available"}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1.5 bg-blue-50 py-2.5 rounded-xl">
              <Ionicons name="eye-outline" size={13} color="#2563eb" />
              <Text className="text-xs font-bold text-blue-600">View</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1.5 bg-emerald-50 py-2.5 rounded-xl">
              <Ionicons name="print-outline" size={13} color="#065f46" />
              <Text className="text-xs font-bold text-emerald-700">Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          className={`flex-row items-center justify-center gap-2 border border-blue-200 bg-blue-50 py-3 rounded-xl ${
            isUploading ? "opacity-60" : ""
          }`}
          onPress={() => onUpload(lab)}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Ionicons name="cloud-upload-outline" size={15} color="#2563eb" />
          )}
          <Text className="text-xs font-bold text-blue-600">
            {isUploading ? "Uploading…" : "Upload Report (PDF)"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Results Table Row ────────────────────────────────────────────────────────

const TableRow = ({ lab, onEdit, isLast }) => {
  const ss = statusStyle(lab.status);
  const rs = resultStyle(lab.result);
  return (
    <View
      className={`px-4 py-3 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      {/* Row top: test name + edit button */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
          {lab.testType}
        </Text>
        <TouchableOpacity
          className="h-7 w-7 rounded-xl bg-blue-50 items-center justify-center"
          onPress={() => onEdit(lab)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={13} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Row bottom: two columns of metadata */}
      <View className="flex-row flex-wrap gap-y-1.5">
        {/* Left column */}
        <View className="w-1/2 pr-2">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Ionicons name="person-outline" size={10} color="#94a3b8" />
            <Text className="text-[11px] text-gray-500 flex-1" numberOfLines={1}>
              {lab.patient}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="calendar-outline" size={10} color="#94a3b8" />
            <Text className="text-[11px] text-gray-500">{lab.orderedDate}</Text>
          </View>
        </View>

        {/* Right column: badges */}
        <View className="w-1/2 pl-2 items-start gap-1.5">
          {/* Result badge */}
          <View
            className="rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: rs.bg }}
          >
            <Text className="text-[10px] font-bold" style={{ color: rs.text }}>
              {lab.result ? `Result: ${lab.result}` : "Result: Pending"}
            </Text>
          </View>
          {/* Status badge */}
          <View
            className="rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: ss.bg }}
          >
            <Text className="text-[10px] font-bold" style={{ color: ss.text }}>
              {ss.label}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ─── Lab Form Modal ───────────────────────────────────────────────────────────

const LabFormModal = ({
  visible, isEditing, form, setForm,
  onSubmit, onCancel, saving, onShowPatients,
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
            {isEditing ? "Edit Lab Request" : "Request Lab Test"}
          </Text>
          <TouchableOpacity
            className="h-9 w-9 rounded-xl bg-gray-100 items-center justify-center"
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Patient */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-gray-600 mb-1.5">
              Patient (Admission No.) *
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={form.patient}
                onChangeText={(v) => setForm({ ...form, patient: v })}
                placeholder="Enter Admission No. or Patient ID"
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity
                className="h-12 w-12 rounded-2xl bg-blue-50 items-center justify-center border border-blue-100"
                onPress={onShowPatients}
                activeOpacity={0.7}
              >
                <Ionicons name="people-outline" size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Test Type */}
          <PickerField
            label="Test Type *"
            value={form.testType}
            options={TEST_TYPES}
            onSelect={(v) => setForm({ ...form, testType: v })}
          />

          {/* Reason */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-gray-600 mb-1.5">
              Reason for Test *
            </Text>
            <TextInput
              className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
              value={form.reason}
              onChangeText={(v) => setForm({ ...form, reason: v })}
              placeholder="Describe the reason for this test"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 72 }}
            />
          </View>

          {/* Priority */}
          <PickerField
            label="Priority"
            value={form.priority}
            options={PRIORITIES}
            onSelect={(v) => setForm({ ...form, priority: v })}
          />

          {/* Requesting Doctor */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-gray-600 mb-1.5">
              Requesting Doctor *
            </Text>
            <TextInput
              className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
              value={form.doctor}
              onChangeText={(v) => setForm({ ...form, doctor: v })}
              placeholder="Enter doctor's name"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </ScrollView>

        {/* footer */}
        <View className="flex-row gap-3 px-5 py-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 py-3.5 rounded-2xl"
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={16} color="#64748b" />
            <Text className="text-sm font-bold text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center gap-2 bg-blue-600 py-3.5 rounded-2xl shadow-lg shadow-blue-200 ${
              saving ? "opacity-70" : ""
            }`}
            onPress={onSubmit}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isEditing ? "save-outline" : "add-circle-outline"}
                  size={16}
                  color="#fff"
                />
                <Text className="text-sm font-bold text-white">
                  {isEditing ? "Update Request" : "Request Test"}
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

const LabTestsUploadContent = () => {
  const [labs, setLabs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null); // _rowKey of the card being uploaded
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [showPatientSheet, setShowPatientSheet] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // ── fetch lab tests ──────────────────────────────────────────────────────
  const fetchLabTests = async () => {
    setLoading(true);
    try {
      const data = await api.get(EP.LAB_TESTS);
      const raw = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setLabs(raw.flatMap(normalizeLabRecord));
    } catch (err) {
      console.error("Error fetching lab tests:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── fetch patients ───────────────────────────────────────────────────────
  const fetchPatients = async () => {
    try {
      const data = await api.get(EP.PATIENTS);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setPatients(list);
    } catch (err) {
      console.warn("Error fetching patients:", err);
    }
  };

  useEffect(() => {
    fetchLabTests();
    fetchPatients();
  }, []);

  // ── submit (add / edit) ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.patient.trim() || !form.testType || !form.reason.trim()) {
      Alert.alert("Validation", "Patient, test type, and reason are required.");
      return;
    }
    setSaving(true);
    const payload = {
      admission_number: form.patient,
      test_type: form.testType,
      reason: form.reason,
      priority: form.priority,
      requesting_doctor: form.doctor,
    };
    try {
      if (isEditing && editingRecordId) {
        await api.patch(EP.UPDATE_LAB_TEST(editingRecordId), payload);
      } else {
        await api.post(EP.LAB_TESTS, payload);
      }
      Alert.alert(
        "Success",
        `Lab test request ${isEditing ? "updated" : "saved"} successfully!`
      );
      closeModal();
      await fetchLabTests();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save lab test request");
    } finally {
      setSaving(false);
    }
  };

  // ── open edit ────────────────────────────────────────────────────────────
  const handleEditClick = (lab) => {
    setIsEditing(true);
    setEditingRecordId(lab.id);
    setForm({
      patient: lab.admission_number || lab.patient_id || lab.patient || "",
      testType: lab.testType || lab.test_type || "",
      reason: lab.reason || "",
      priority: lab.priority || "Routine",
      doctor: lab.doctor || lab.requesting_doctor || "Dr. Meena Rao",
    });
    setIsModalOpen(true);
  };

  // ── open add new ─────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setIsEditing(false);
    setEditingRecordId(null);
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingRecordId(null);
    setForm(emptyForm());
  };

  const handlePatientSelect = (admNo) => {
    setForm((prev) => ({ ...prev, patient: admNo }));
  };

  // ── upload report ────────────────────────────────────────────────────────
  const handleFileUpload = async (lab) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      // User cancelled
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileAsset = result.assets[0];

      // Guard non-PDF
      if (fileAsset.mimeType && fileAsset.mimeType !== "application/pdf") {
        Alert.alert("Invalid File", "Please select a PDF file.");
        return;
      }

      setUploadingId(lab._rowKey);

      await uploadLabReport(lab.id, fileAsset);

      // Optimistically update UI
      setLabs((prev) =>
        prev.map((l) =>
          l._rowKey === lab._rowKey
            ? { ...l, status: "completed", result: "Uploaded" }
            : l
        )
      );

      Alert.alert("Upload Successful", `"${fileAsset.name}" uploaded for ${lab.testType}.`);
      fetchLabTests(); // Refresh from server
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Upload Failed", err.message || "Could not upload the report.");
    } finally {
      setUploadingId(null);
    }
  };

  // ── counts ───────────────────────────────────────────────────────────────
  const countByStatus = (status) =>
    labs.filter((l) => l.status === status).length;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Header ── */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-black text-gray-900">Lab Reports</Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {labs.length} test{labs.length !== 1 ? "s" : ""} on record
            </Text>
          </View>
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              className="h-10 w-10 rounded-2xl bg-white items-center justify-center border border-gray-100 shadow-sm"
              onPress={fetchLabTests}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Ionicons name="refresh-outline" size={18} color="#64748b" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2.5 rounded-2xl flex-row items-center gap-2 shadow-lg shadow-blue-200"
              onPress={handleAddNew}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text className="text-xs font-bold text-white">Request Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats strip ── */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-amber-50 rounded-3xl p-4 shadow-sm">
            <Text className="text-xs font-bold text-amber-700 uppercase tracking-wide">Pending</Text>
            <Text className="text-3xl font-black text-amber-600 mt-1">{countByStatus("pending")}</Text>
          </View>
          <View className="flex-1 bg-emerald-50 rounded-3xl p-4 shadow-sm">
            <Text className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Completed</Text>
            <Text className="text-3xl font-black text-emerald-600 mt-1">{countByStatus("completed")}</Text>
          </View>
          <View className="flex-1 bg-rose-50 rounded-3xl p-4 shadow-sm">
            <Text className="text-xs font-bold text-rose-700 uppercase tracking-wide">Urgent</Text>
            <Text className="text-3xl font-black text-rose-600 mt-1">{countByStatus("urgent")}</Text>
          </View>
        </View>

        {/* ── Section label ── */}
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4 px-1">
          Pending &amp; Recent Tests
        </Text>

        {/* ── Lab Cards ── */}
        {loading && labs.length === 0 ? (
          <View className="py-16 items-center gap-3">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-xs text-gray-400 font-medium">Loading lab tests…</Text>
          </View>
        ) : labs.length === 0 ? (
          <View className="py-16 items-center gap-3 bg-white rounded-3xl border border-dashed border-gray-200">
            <View className="h-16 w-16 rounded-full bg-gray-100 items-center justify-center">
              <MaterialCommunityIcons name="flask-outline" size={30} color="#94a3b8" />
            </View>
            <Text className="text-base font-bold text-gray-700">No lab tests found</Text>
            <Text className="text-xs text-gray-400 text-center px-8">
              Tap "Request Test" to add a new lab order.
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1.5 mt-1"
              onPress={handleAddNew}
            >
              <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
              <Text className="text-sm font-bold text-blue-600">Request New Test</Text>
            </TouchableOpacity>
          </View>
        ) : (
          labs.map((lab, idx) => (
            <LabCard
              key={lab._rowKey}
              lab={lab}
              onEdit={handleEditClick}
              onUpload={handleFileUpload}
              isUploading={uploadingId === lab._rowKey}
              isLast={idx === labs.length - 1}
            />
          ))
        )}

        {/* ── Recent Results Table ── */}
        {labs.length > 0 && (
          <View className="mt-6 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-50">
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60"
              onPress={() => setShowTable((s) => !s)}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-bold text-gray-700">Recent Lab Results</Text>
              <Ionicons
                name={showTable ? "chevron-up" : "chevron-down"}
                size={16}
                color="#94a3b8"
              />
            </TouchableOpacity>

            {showTable && (
              <>
                {/* Table column header */}
                <View className="flex-row items-center px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex-1">
                    Test · Info
                  </Text>
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Result · Status
                  </Text>
                </View>

                {/* Table rows */}
                {labs.map((lab, idx) => (
                  <TableRow
                    key={lab._rowKey}
                    lab={lab}
                    onEdit={handleEditClick}
                    isLast={idx === labs.length - 1}
                  />
                ))}
              </>
            )}
          </View>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* ── Patient Bottom Sheet ── */}
      <PatientSheet
        visible={showPatientSheet}
        onClose={() => setShowPatientSheet(false)}
        patients={patients}
        onSelect={handlePatientSelect}
      />

      {/* ── Lab Form Modal ── */}
      <LabFormModal
        visible={isModalOpen}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={closeModal}
        saving={saving}
        onShowPatients={() => setShowPatientSheet(true)}
      />
    </View>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function LabTestsUpload() {
  return (
    <NurseLayout>
      <LabTestsUploadContent />
    </NurseLayout>
  );
}
