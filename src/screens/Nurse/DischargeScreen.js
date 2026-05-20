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
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

// ─── endpoints ────────────────────────────────────────────────────────────────

const EP = {
  DISCHARGE_SUPPORT: "/api/v1/nurse/discharge-support",
  DISCHARGE_SUMMARY: "/api/v1/nurse/discharge-summary",
};

// ─── empty form ───────────────────────────────────────────────────────────────

const emptyForm = () => ({
  admissionNumber: "",
  patientName: "",
  admissionDate: "",
  dischargeDate: new Date().toISOString().split("T")[0],
  finalDiagnosis: "",
  secondaryDiagnoses: "",
  proceduresPerformed: "",
  hospitalCourse: "",
  followUpInstructions: "",
  dietInstructions: "",
  activityRestrictions: "",
  followUpDate: "",
  followUpDoctor: "Dr. Meena Rao",
});

// ─── status helpers ───────────────────────────────────────────────────────────

const statusStyle = (status) => {
  switch ((status || "ready").toLowerCase()) {
    case "ready":
      return { bg: "#d1fae5", text: "#065f46", label: "Ready for Discharge" };
    case "improving":
      return { bg: "#dbeafe", text: "#1e40af", label: "Improving" };
    case "observation":
      return { bg: "#fee2e2", text: "#991b1b", label: "Under Observation" };
    default:
      return { bg: "#d1fae5", text: "#065f46", label: "Ready for Discharge" };
  }
};

// ─── Patient Card ─────────────────────────────────────────────────────────────

const PatientCard = ({ patient, onPrepareSummary, onPrint, onEmail }) => {
  const ss = statusStyle(patient.status);
  return (
    <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-gray-50">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View className="h-12 w-12 rounded-2xl bg-blue-100 items-center justify-center mr-3">
          <MaterialCommunityIcons name="account" size={22} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-black text-blue-700" numberOfLines={1}>
            {patient.name}
          </Text>
          <Text className="text-[11px] text-gray-400 font-medium mt-0.5">
            Bed {patient.bed}
          </Text>
        </View>
        <View
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: ss.bg }}
        >
          <Text
            className="text-[9px] font-black uppercase"
            style={{ color: ss.text }}
          >
            {ss.label}
          </Text>
        </View>
      </View>

      {/* Info block */}
      <View className="bg-gray-50 rounded-2xl p-3 mb-3 gap-1.5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
          <Text className="text-[11px] text-gray-600 font-medium">
            <Text className="font-bold">Admitted: </Text>
            {patient.admissionDate}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="medkit-outline" size={12} color="#94a3b8" />
          <Text className="text-[11px] text-gray-600 font-medium flex-1" numberOfLines={2}>
            <Text className="font-bold">Condition: </Text>
            {patient.condition}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons name="pill" size={12} color="#94a3b8" />
          <Text className="text-[11px] text-gray-600 font-medium flex-1" numberOfLines={2}>
            <Text className="font-bold">Treatment: </Text>
            {patient.treatment}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 bg-blue-50 py-2.5 rounded-xl"
          onPress={() => onPrepareSummary(patient)}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={13} color="#2563eb" />
          <Text className="text-[11px] font-bold text-blue-600">Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 bg-emerald-50 py-2.5 rounded-xl"
          onPress={() => onPrint(patient)}
          activeOpacity={0.7}
        >
          <Ionicons name="print-outline" size={13} color="#065f46" />
          <Text className="text-[11px] font-bold text-emerald-700">Print</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 bg-purple-50 py-2.5 rounded-xl"
          onPress={() => onEmail(patient)}
          activeOpacity={0.7}
        >
          <Ionicons name="mail-outline" size={13} color="#6b21a8" />
          <Text className="text-[11px] font-bold text-purple-700">Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Section Input ────────────────────────────────────────────────────────────

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  disabled,
  keyboardType,
}) => (
  <View className="mb-4">
    <Text className="text-xs font-bold text-gray-600 mb-1.5">{label}</Text>
    <TextInput
      className={`border rounded-2xl px-4 py-3 text-sm text-gray-900 ${
        disabled ? "bg-gray-100 border-gray-100" : "bg-white border-gray-200"
      }`}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      editable={!disabled}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      textAlignVertical={multiline ? "top" : "center"}
      style={multiline ? { minHeight: 80 } : undefined}
      keyboardType={keyboardType || "default"}
    />
  </View>
);

// ─── Discharge Form Modal ─────────────────────────────────────────────────────

const DischargeFormModal = ({
  visible,
  isEditing,
  form,
  setForm,
  onSubmit,
  onClose,
  saving,
}) => {
  const f = (key) => ({
    value: form[key],
    onChangeText: (v) => setForm((prev) => ({ ...prev, [key]: v })),
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
            <View>
              <Text className="text-base font-black text-gray-900">
                {isEditing ? "Edit Discharge Summary" : "Prepare Discharge Summary"}
              </Text>
              <Text className="text-[11px] text-gray-400 mt-0.5">
                {form.patientName || "New entry"}
              </Text>
            </View>
            <TouchableOpacity
              className="h-9 w-9 rounded-xl bg-gray-100 items-center justify-center"
              onPress={onClose}
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
            {/* Section: Patient */}
            <SectionLabel icon="person-outline" title="Patient Information" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label="Admission Number *"
                  placeholder="Admission No."
                  disabled={isEditing}
                  {...f("admissionNumber")}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Patient Name"
                  placeholder="Full name"
                  {...f("patientName")}
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label="Admission Date"
                  placeholder="YYYY-MM-DD"
                  {...f("admissionDate")}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Discharge Date"
                  placeholder="YYYY-MM-DD"
                  {...f("dischargeDate")}
                />
              </View>
            </View>

            <Field
              label="Attending Physician"
              placeholder="Doctor's name"
              {...f("followUpDoctor")}
            />

            {/* Section: Diagnosis */}
            <SectionLabel icon="medkit-outline" title="Diagnosis & Procedures" />

            <Field
              label="Final Diagnosis"
              placeholder="Enter final diagnosis"
              {...f("finalDiagnosis")}
            />
            <Field
              label="Secondary Diagnoses (comma separated)"
              placeholder="e.g. Hypertension, Diabetes"
              {...f("secondaryDiagnoses")}
            />
            <Field
              label="Procedures Performed (comma separated)"
              placeholder="e.g. Appendectomy, Blood Transfusion"
              {...f("proceduresPerformed")}
            />

            {/* Section: Clinical notes */}
            <SectionLabel icon="clipboard-outline" title="Clinical Notes" />

            <Field
              label="Hospital Course"
              placeholder="Describe hospital course..."
              multiline
              {...f("hospitalCourse")}
            />

            {/* Section: Discharge instructions */}
            <SectionLabel icon="home-outline" title="Discharge Instructions" />

            <Field
              label="Diet Instructions"
              placeholder="Enter diet instructions..."
              multiline
              {...f("dietInstructions")}
            />
            <Field
              label="Activity Restrictions"
              placeholder="Enter activity restrictions..."
              multiline
              {...f("activityRestrictions")}
            />
            <Field
              label="Follow-up Instructions & Discharge Notes"
              placeholder="Enter follow-up and discharge notes..."
              multiline
              {...f("followUpInstructions")}
            />

            {/* Section: Follow-up */}
            <SectionLabel icon="calendar-outline" title="Follow-up Appointment" />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label="Follow-up Date"
                  placeholder="YYYY-MM-DD"
                  {...f("followUpDate")}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Follow-up Doctor"
                  placeholder="Doctor's name"
                  {...f("followUpDoctor")}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-3 px-5 py-4 bg-white border-t border-gray-100">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 py-3.5 rounded-2xl"
              onPress={onClose}
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
                  <Ionicons name="save-outline" size={16} color="#fff" />
                  <Text className="text-sm font-bold text-white">
                    {isEditing ? "Update Summary" : "Save Summary"}
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

// ─── Print Preview Modal ──────────────────────────────────────────────────────

const PrintPreviewModal = ({ visible, form, patient, onClose }) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <Text className="text-base font-black text-gray-900">Print Preview</Text>
        <TouchableOpacity
          className="h-9 w-9 rounded-xl bg-gray-100 items-center justify-center"
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        {/* Document header */}
        <View className="items-center border-b border-gray-200 pb-4 mb-5">
          <Text className="text-xl font-black text-gray-800 tracking-wide">
            DISCHARGE SUMMARY
          </Text>
          <Text className="text-sm text-gray-500 mt-1">MediCloud Hospital</Text>
        </View>

        {/* Patient Info grid */}
        <View className="flex-row gap-4 mb-5">
          <View className="flex-1 gap-1.5">
            <PrintRow label="Patient Name" value={form.patientName || patient?.name || "—"} />
            <PrintRow label="Admission Date" value={form.admissionDate || patient?.admissionDate || "—"} />
            <PrintRow label="Discharge Date" value={form.dischargeDate || "—"} />
          </View>
          <View className="flex-1 gap-1.5">
            <PrintRow label="Attending Physician" value={form.followUpDoctor || "—"} />
            <PrintRow label="Follow-up Doctor" value={form.followUpDoctor || "—"} />
            <PrintRow label="Follow-up Date" value={form.followUpDate || "Not scheduled"} />
          </View>
        </View>

        <PrintSection title="Final Diagnosis" content={form.finalDiagnosis} />
        <PrintSection title="Secondary Diagnoses" content={form.secondaryDiagnoses} />
        <PrintSection title="Procedures Performed" content={form.proceduresPerformed} />
        <PrintSection title="Hospital Course" content={form.hospitalCourse} />
        <PrintSection title="Diet Instructions" content={form.dietInstructions} />
        <PrintSection title="Activity Restrictions" content={form.activityRestrictions} />
        <PrintSection title="Follow-up Instructions" content={form.followUpInstructions} />

        {/* Signature */}
        <View className="flex-row gap-8 mt-8 pt-4 border-t border-gray-200">
          <View className="flex-1">
            <View className="border-b border-gray-400 mb-2 pb-6" />
            <Text className="text-xs font-bold text-gray-700">Attending Physician</Text>
            <Text className="text-xs text-gray-500">{form.followUpDoctor}</Text>
          </View>
          <View className="flex-1">
            <View className="border-b border-gray-400 mb-2 pb-6" />
            <Text className="text-xs font-bold text-gray-700">Date</Text>
            <Text className="text-xs text-gray-500">{new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="flex-row gap-3 px-5 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 py-3.5 rounded-2xl"
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text className="text-sm font-bold text-gray-600">Close</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 bg-emerald-600 py-3.5 rounded-2xl"
          onPress={() => {
            Alert.alert("Print", "Print job sent to printer.");
            onClose();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="print-outline" size={16} color="#fff" />
          <Text className="text-sm font-bold text-white">Print Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── Email Modal ──────────────────────────────────────────────────────────────

const EmailModal = ({ visible, form, patient, onClose }) => {
  const patientName = form.patientName || patient?.name || "Patient";
  const [to, setTo] = useState("patient@example.com");
  const [subject, setSubject] = useState(`Discharge Summary - ${patientName}`);
  const [message, setMessage] = useState(
    `Dear ${patientName},\n\nPlease find your discharge summary attached.\n\nPatient: ${patientName}\nDischarge Date: ${form.dischargeDate || "—"}\n\nIf you have any questions, please contact our office.\n\nBest regards,\nMediCloud Hospital`
  );

  // Sync when modal opens with new patient
  useEffect(() => {
    setSubject(`Discharge Summary - ${patientName}`);
    setMessage(
      `Dear ${patientName},\n\nPlease find your discharge summary attached.\n\nPatient: ${patientName}\nDischarge Date: ${form.dischargeDate || "—"}\n\nIf you have any questions, please contact our office.\n\nBest regards,\nMediCloud Hospital`
    );
  }, [patientName, form.dischargeDate]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
            <Text className="text-base font-black text-gray-900">Email Discharge Summary</Text>
            <TouchableOpacity
              className="h-9 w-9 rounded-xl bg-gray-100 items-center justify-center"
              onPress={onClose}
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
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">To</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={to}
                onChangeText={setTo}
                placeholder="recipient@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Subject</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={subject}
                onChangeText={setSubject}
                placeholder="Subject"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-600 mb-1.5">Message</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                style={{ minHeight: 180 }}
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Info notice */}
            <View className="flex-row items-start gap-2 bg-blue-50 rounded-2xl p-3 border border-blue-100">
              <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
              <Text className="text-xs text-blue-700 font-medium flex-1">
                The discharge summary document will be attached automatically.
              </Text>
            </View>
          </ScrollView>

          <View className="flex-row gap-3 px-5 py-4 bg-white border-t border-gray-100">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 py-3.5 rounded-2xl"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-bold text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 bg-purple-600 py-3.5 rounded-2xl"
              onPress={() => {
                Alert.alert("Sent", "Discharge summary emailed successfully!");
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="send-outline" size={15} color="#fff" />
              <Text className="text-sm font-bold text-white">Send Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Small helpers ────────────────────────────────────────────────────────────

const SectionLabel = ({ icon, title }) => (
  <View className="flex-row items-center gap-2 mb-3 mt-1">
    <View className="h-6 w-6 rounded-lg bg-blue-50 items-center justify-center">
      <Ionicons name={icon} size={13} color="#2563eb" />
    </View>
    <Text className="text-xs font-black text-gray-700 uppercase tracking-wide">{title}</Text>
    <View className="flex-1 h-px bg-gray-100 ml-1" />
  </View>
);

const PrintRow = ({ label, value }) => (
  <View className="flex-row gap-1">
    <Text className="text-[11px] font-bold text-gray-700">{label}:</Text>
    <Text className="text-[11px] text-gray-600 flex-1" numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const PrintSection = ({ title, content }) => {
  if (!content) return null;
  return (
    <View className="mb-4">
      <Text className="text-sm font-black text-gray-800 border-b border-gray-200 pb-1 mb-2">
        {title}
      </Text>
      <Text className="text-[12px] text-gray-700 leading-5">{content}</Text>
    </View>
  );
};

// ─── Main Content ─────────────────────────────────────────────────────────────

const DischargeContent = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const [showFormModal, setShowFormModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchDischargePatients = async () => {
    setLoading(true);
    try {
      const data = await api.get(EP.DISCHARGE_SUPPORT);
      const rawData = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setPatients(
        rawData.map((p) => ({
          id: p.id || p.admission_number,
          admissionNumber: p.admission_number || p.id,
          name: p.patient_name || p.name || "Unknown Patient",
          bed: p.bed_number || p.bed_code || "N/A",
          admissionDate: p.admission_date
            ? new Date(p.admission_date).toLocaleDateString()
            : "N/A",
          condition: p.condition || p.diagnosis || p.chief_complaint || "N/A",
          treatment: p.treatment || p.treatment_plan || "N/A",
          status: (p.status || "ready").toLowerCase(),
        }))
      );
    } catch (err) {
      console.error("Error fetching discharge patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDischargePatients();
  }, []);

  // ── prepare summary ──────────────────────────────────────────────────────
  const handlePrepareSummary = async (patient) => {
    setSelectedPatient(patient);
    const admId = patient.admissionNumber || patient.id;
    try {
      const res = await api.get(
        `${EP.DISCHARGE_SUMMARY}?admission_number=${encodeURIComponent(admId)}`
      );
      const existing = Array.isArray(res?.data) && res.data.length > 0;
      if (existing) {
        const d = res.data[0];
        setIsEditing(true);
        setForm({
          admissionNumber: admId,
          patientName: patient.name,
          admissionDate: patient.admissionDate || "",
          dischargeDate: d.discharge_date || new Date().toISOString().split("T")[0],
          finalDiagnosis: d.final_diagnosis || "",
          secondaryDiagnoses: d.secondary_diagnoses?.join(", ") || "",
          proceduresPerformed: d.procedures_performed?.join(", ") || "",
          hospitalCourse: d.hospital_course || "",
          followUpInstructions: d.follow_up_instructions || "",
          dietInstructions: d.diet_instructions || "",
          activityRestrictions: d.activity_restrictions || "",
          followUpDate: d.follow_up_date || "",
          followUpDoctor: d.follow_up_doctor || "Dr. Meena Rao",
        });
        setShowFormModal(true);
        return;
      }
    } catch (_) {}

    // New entry
    setIsEditing(false);
    setForm({
      ...emptyForm(),
      admissionNumber: admId,
      patientName: patient.name,
      admissionDate: patient.admissionDate || "",
    });
    setShowFormModal(true);
  };

  // ── manual summary ───────────────────────────────────────────────────────
  const handleManualSummary = () => {
    setSelectedPatient(null);
    setIsEditing(false);
    setForm(emptyForm());
    setShowFormModal(true);
  };

  // ── save ─────────────────────────────────────────────────────────────────
  const handleSaveSummary = async () => {
    const patientId =
      selectedPatient?.admissionNumber ||
      selectedPatient?.id ||
      form.admissionNumber ||
      form.patientName;

    if (!patientId) {
      Alert.alert("Validation", "Admission number is required.");
      return;
    }

    setSaving(true);
    const payload = {
      admission_number: patientId,
      final_diagnosis: form.finalDiagnosis,
      secondary_diagnoses: form.secondaryDiagnoses
        ? form.secondaryDiagnoses.split(",").map((s) => s.trim())
        : [],
      procedures_performed: form.proceduresPerformed
        ? form.proceduresPerformed.split(",").map((s) => s.trim())
        : [],
      hospital_course: form.hospitalCourse,
      follow_up_instructions: form.followUpInstructions,
      diet_instructions: form.dietInstructions,
      activity_restrictions: form.activityRestrictions,
      follow_up_date: form.followUpDate,
      follow_up_doctor: form.followUpDoctor,
    };

    try {
      if (isEditing) {
        await api.patch(
          `${EP.DISCHARGE_SUMMARY}?admission_number=${encodeURIComponent(patientId)}`,
          payload
        );
      } else {
        await api.post(EP.DISCHARGE_SUMMARY, payload);
      }
      Alert.alert(
        "Success",
        `Discharge summary ${isEditing ? "updated" : "saved"} successfully!`
      );
      setShowFormModal(false);
      fetchDischargePatients();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save discharge summary.");
    } finally {
      setSaving(false);
    }
  };

  // ── print / email ────────────────────────────────────────────────────────
  const handlePrint = (patient) => {
    setSelectedPatient(patient);
    setForm((prev) => ({ ...prev, patientName: patient.name }));
    setShowPrintModal(true);
  };

  const handleEmail = (patient) => {
    setSelectedPatient(patient);
    setForm((prev) => ({ ...prev, patientName: patient.name }));
    setShowEmailModal(true);
  };

  // ── stats ────────────────────────────────────────────────────────────────
  const readyCount = patients.filter((p) => p.status === "ready").length;
  const total = patients.length;

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
            <Text className="text-2xl font-black text-gray-900">Discharge Summary</Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {total} patient{total !== 1 ? "s" : ""} pending
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 shadow-sm shadow-blue-200"
            onPress={handleManualSummary}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={14} color="#fff" />
            <Text className="text-[10px] font-bold text-white">Create Summary</Text>
          </TouchableOpacity>
        </View>

        {/* ── Daily Goal Banner ── */}
        {total > 0 && (
          <View className="bg-emerald-50 rounded-3xl p-5 mb-6 border border-emerald-100">
            <View className="flex-row items-center mb-1.5">
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text className="ml-2 text-emerald-800 font-bold text-sm">Daily Discharge Goal</Text>
            </View>
            <Text className="text-emerald-700 text-xs font-medium mb-3">
              {readyCount} of {total} patient{total !== 1 ? "s" : ""} ready for discharge today.
            </Text>
            <View
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${total > 0 ? (readyCount / total) * 100 : 0}%` }}
              />
            </View>
          </View>
        )}

        {/* ── Section label ── */}
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4 px-1">
          Pending Discharge Support
        </Text>

        {/* ── Patient Cards ── */}
        {loading ? (
          <View className="py-16 items-center gap-3">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-xs text-gray-400 font-medium">
              Loading discharge patients…
            </Text>
          </View>
        ) : patients.length === 0 ? (
          <View className="py-16 items-center gap-3 bg-white rounded-3xl border border-dashed border-gray-200">
            <View className="h-16 w-16 rounded-full bg-gray-100 items-center justify-center">
              <MaterialCommunityIcons name="hospital-box-outline" size={30} color="#94a3b8" />
            </View>
            <Text className="text-base font-bold text-gray-700">No patients pending</Text>
            <Text className="text-xs text-gray-400 text-center px-8">
              No patients currently pending discharge support.
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1.5 mt-1"
              onPress={handleManualSummary}
            >
              <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
              <Text className="text-sm font-bold text-blue-600">Create Manual Summary</Text>
            </TouchableOpacity>
          </View>
        ) : (
          patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onPrepareSummary={handlePrepareSummary}
              onPrint={handlePrint}
              onEmail={handleEmail}
            />
          ))
        )}

        <View className="h-6" />
      </ScrollView>

      {/* ── Discharge Form Modal ── */}
      <DischargeFormModal
        visible={showFormModal}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        onSubmit={handleSaveSummary}
        onClose={() => setShowFormModal(false)}
        saving={saving}
      />

      {/* ── Print Preview Modal ── */}
      <PrintPreviewModal
        visible={showPrintModal}
        form={form}
        patient={selectedPatient}
        onClose={() => setShowPrintModal(false)}
      />

      {/* ── Email Modal ── */}
      <EmailModal
        visible={showEmailModal}
        form={form}
        patient={selectedPatient}
        onClose={() => setShowEmailModal(false)}
      />
    </View>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function DischargeScreen() {
  return (
    <NurseLayout>
      <DischargeContent />
    </NurseLayout>
  );
}
