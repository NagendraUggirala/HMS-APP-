import React, { useState } from "react";
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
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

// ─── helpers ──────────────────────────────────────────────────────────────────

const normalizeNote = (note) => {
  const nn = note?.vital_signs?.nursing_note || {};
  return {
    id: note.id,
    patient_id: note.patient_id,
    doctor_id: note.doctor_id,
    appointment_id: note.appointment_id,
    chief_complaint: note.chief_complaint,
    history_of_present_illness: note.history_of_present_illness,
    created_at: note.created_at,
    updated_at: note.updated_at,
    details: nn.details || nn.note_content || "",
    note_content: nn.note_content,
    observation_title: nn.observation_title,
    title: nn.observation_title || note.title || "",
    priority: nn.priority,
    note_type: nn.note_type || note.note_type,
    follow_up_required: nn.follow_up_required,
    recorded_at: nn.recorded_at,
    recorded_by: nn.recorded_by,
  };
};

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
};

const getPriorityStyle = (priority) => {
  const p = (priority || "low").toLowerCase();
  if (p === "critical" || p === "high")
    return { bg: "#fff1f2", text: "#e11d48", label: "Critical" };
  if (p === "medium")
    return { bg: "#fefce8", text: "#ca8a04", label: "Medium" };
  if (p === "improving")
    return { bg: "#eff6ff", text: "#2563eb", label: "Follow-up" };
  return {
    bg: "#f0fdf4",
    text: "#16a34a",
    label: p.charAt(0).toUpperCase() + p.slice(1),
  };
};

const emptyForm = (admissionNumber = "") => ({
  admission_number: admissionNumber,
  patient_name: "",
  note_type: "Routine Observation",
  title: "",
  details: "",
  priority: "Low",
  follow_up: "No",
  nurse_name: "",
});

// ─── Dropdown options ─────────────────────────────────────────────────────────

const OPTIONS = {
  note_type: [
    "Routine Observation",
    "Medication Administration",
    "Vital Signs",
    "Patient Education",
    "Incident Report",
    "Critical Finding",
  ],
  priority: ["Low", "Medium", "High", "Critical"],
  follow_up: ["No", "Yes - Next Shift", "Yes - Today", "Yes - Immediately"],
};

// ─── SelectField ──────────────────────────────────────────────────────────────

const SelectField = ({ label, field, value, onChange }) => {
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
          {value}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#64748b" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.selectOverlay}
          onPress={() => setOpen(false)}
          activeOpacity={1}
        />
        <View style={styles.selectDropdown}>
          <Text style={styles.dropdownTitle}>{label}</Text>
          {OPTIONS[field].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.dropdownItem,
                opt === value && { backgroundColor: "#eff6ff" },
              ]}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
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
        </View>
      </Modal>
    </View>
  );
};

// ─── NoteCard ─────────────────────────────────────────────────────────────────

const NoteCard = ({ note, onEdit }) => {
  const ps = getPriorityStyle(note.priority);
  return (
    <View style={styles.card}>
      {/* header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {note.observation_title || note.title || "Untitled note"}
          </Text>
          <Text style={styles.cardMeta}>
            <Text style={{ fontWeight: "700" }}>Patient ID:</Text>{" "}
            {note.patient_id || "Unknown"}
            {"  ·  "}
            <Text style={{ fontWeight: "700" }}>Type:</Text>{" "}
            {note.note_type || "Nursing Note"}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: ps.bg }]}>
          <Text style={[styles.badgeText, { color: ps.text }]}>
            {ps.label}
          </Text>
        </View>
      </View>

      {/* body */}
      <Text style={styles.cardBody} numberOfLines={3}>
        {note.note_content || note.details || "No content available"}
      </Text>

      {note.follow_up_required !== undefined && (
        <Text style={styles.followUp}>
          Follow-up required: {note.follow_up_required ? "Yes" : "No"}
        </Text>
      )}
      {!!note.chief_complaint && (
        <Text style={styles.extraInfo}>
          Chief complaint: {note.chief_complaint}
        </Text>
      )}
      {!!note.history_of_present_illness && (
        <Text style={styles.extraInfo} numberOfLines={2}>
          History: {note.history_of_present_illness}
        </Text>
      )}

      {/* footer */}
      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.footerMeta}>
            Doctor ID: {note.doctor_id || "N/A"}
          </Text>
          <Text style={styles.footerMeta}>
            Recorded: {formatDate(note.recorded_at || note.created_at)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEdit(note)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={14} color="#2563eb" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── NoteFormModal ────────────────────────────────────────────────────────────

const NoteFormModal = ({
  visible,
  isEditing,
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
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
        {/* modal header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isEditing ? "Edit Nursing Note" : "Add New Nursing Note"}
          </Text>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Admission No & Patient Name */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Admission No. *</Text>
              <TextInput
                style={styles.input}
                value={form.admission_number}
                onChangeText={(v) =>
                  setForm({ ...form, admission_number: v })
                }
                placeholder="e.g. ADM-001"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                value={form.patient_name}
                onChangeText={(v) => setForm({ ...form, patient_name: v })}
                placeholder="Optional"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Note Type */}
          <View style={{ marginTop: 14 }}>
            <SelectField
              label="Note Type"
              field="note_type"
              value={form.note_type}
              onChange={(v) => setForm({ ...form, note_type: v })}
            />
          </View>

          {/* Observation title */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>Observation *</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(v) => setForm({ ...form, title: v })}
              placeholder="Enter observation title"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Details */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>Details *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.details}
              onChangeText={(v) => setForm({ ...form, details: v })}
              placeholder="Enter detailed notes"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Priority + Follow-up */}
          <View style={[styles.row, { marginTop: 14, gap: 10 }]}>
            <SelectField
              label="Priority"
              field="priority"
              value={form.priority}
              onChange={(v) => setForm({ ...form, priority: v })}
            />
            <SelectField
              label="Follow-up Required"
              field="follow_up"
              value={form.follow_up}
              onChange={(v) => setForm({ ...form, follow_up: v })}
            />
          </View>

          {/* Nurse Name */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>Nurse Name</Text>
            <TextInput
              style={styles.input}
              value={form.nurse_name}
              onChangeText={(v) => setForm({ ...form, nurse_name: v })}
              placeholder="Enter nurse name"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </ScrollView>

        {/* footer buttons */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.cancelBtn]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle-outline"
              size={16}
              color="#64748b"
            />
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.footerBtn,
              styles.saveBtn,
              saving && { opacity: 0.7 },
            ]}
            onPress={onSubmit}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={16} color="#fff" />
                <Text style={styles.saveBtnText}>Save Note</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

// ─── Main Content ─────────────────────────────────────────────────────────────

const NursingNotesContent = () => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [nursingNotes, setNursingNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [showSearch, setShowSearch] = useState(false);

  // ── fetch notes ───────────────────────────────────────────────────────
  const fetchNursingNotes = async () => {
    if (!admissionNumber.trim()) {
      setError("Please enter an admission number.");
      setNursingNotes([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(
        `/api/v1/nurse/nursing-notes?admission_number=${encodeURIComponent(
          admissionNumber.trim()
        )}`
      );
      const raw = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setNursingNotes(raw.map(normalizeNote));
    } catch (err) {
      setError(`Failed to fetch notes: ${err.message}`);
      setNursingNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // ── submit (add / edit) ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.details.trim()) {
      Alert.alert(
        "Validation",
        "Observation title and details are required."
      );
      return;
    }
    const payload = {
      admission_number: form.admission_number,
      observation_title: form.title,
      note_type: form.note_type,
      details: form.details,
      note_content: form.details,
      priority: form.priority.toUpperCase(),
      follow_up_required: form.follow_up.startsWith("Yes"),
      history_of_present_illness: form.details,
    };
    try {
      setSaving(true);
      if (isEditing) {
        await api.patch(
          `/api/v1/nurse/nursing-notes/${editingRecordId}`,
          payload
        );
      } else {
        await api.post("/api/v1/nurse/nursing-notes", payload);
      }
      await fetchNursingNotes();
      Alert.alert(
        "Success",
        `Nursing note ${isEditing ? "updated" : "saved"} successfully!`
      );
      closeModal();
    } catch (err) {
      Alert.alert("Error", `Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── open edit ─────────────────────────────────────────────────────────
  const handleEditClick = (note) => {
    setIsEditing(true);
    setEditingRecordId(note.id);
    const p = note.priority
      ? note.priority.charAt(0).toUpperCase() +
        note.priority.slice(1).toLowerCase()
      : "Low";
    setForm({
      admission_number: admissionNumber,
      patient_name: "",
      note_type: note.note_type || "Routine Observation",
      title: note.observation_title || note.title || "",
      details:
        note.note_content ||
        note.details ||
        note.history_of_present_illness ||
        "",
      priority: p,
      follow_up: note.follow_up_required ? "Yes - Today" : "No",
      nurse_name: "",
    });
    setIsModalOpen(true);
  };

  // ── open add ──────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setIsEditing(false);
    setEditingRecordId(null);
    setForm(emptyForm(admissionNumber));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingRecordId(null);
    setForm(emptyForm(admissionNumber));
  };

  // ── filter ────────────────────────────────────────────────────────────
  const filteredNotes = nursingNotes.filter((note) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return [
      note.patient_id,
      note.title,
      note.observation_title,
      note.note_type,
      note.note_content,
      note.details,
    ]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(s));
  });

  // ─────────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Page Header ── */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Nursing Notes</Text>
            <Text style={styles.pageSubtitle}>
              Record &amp; track patient observations
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowSearch((s) => !s)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showSearch ? "close" : "search"}
                size={18}
                color="#64748b"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddNew}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add Note</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search bar ── */}
        {showSearch && (
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={16}
              color="#94a3b8"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes…"
              placeholderTextColor="#94a3b8"
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoFocus
            />
            {!!searchTerm && (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Ionicons name="close-circle" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Admission lookup ── */}
        <View style={styles.lookupRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Enter admission number"
            placeholderTextColor="#94a3b8"
            value={admissionNumber}
            onChangeText={setAdmissionNumber}
            onSubmitEditing={fetchNursingNotes}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.loadBtn, loading && { opacity: 0.7 }]}
            onPress={fetchNursingNotes}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="cloud-download-outline"
                  size={16}
                  color="#fff"
                />
                <Text style={styles.loadBtnText}>Load</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Error ── */}
        {!loading && !!error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#e11d48"
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Result count ── */}
        {!loading && !error && nursingNotes.length > 0 && (
          <Text style={styles.resultCount}>
            {filteredNotes.length} note
            {filteredNotes.length !== 1 ? "s" : ""} found
          </Text>
        )}

        {/* ── Empty states ── */}
        {!loading && !error && nursingNotes.length > 0 && filteredNotes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              No notes match your search.
            </Text>
          </View>
        )}

        {!loading && !error && nursingNotes.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="note-text-outline"
              size={48}
              color="#cbd5e1"
            />
            <Text style={styles.emptyText}>
              Enter an admission number and tap{" "}
              <Text style={{ fontWeight: "700" }}>Load</Text> to view notes.
            </Text>
          </View>
        )}

        {/* ── Note cards ── */}
        {filteredNotes.map((note, idx) => (
          <NoteCard
            key={note.id || idx}
            note={note}
            onEdit={handleEditClick}
          />
        ))}
      </ScrollView>

      {/* ── Form Modal ── */}
      <NoteFormModal
        visible={isModalOpen}
        isEditing={isEditing}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={closeModal}
        saving={saving}
      />
    </View>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function NursingNotes() {
  return (
    <NurseLayout>
      <NursingNotesContent />
    </NurseLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── page
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pageTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  pageSubtitle: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    shadowColor: "#2563eb",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  // ── search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#1e293b" },

  // ── lookup
  lookupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  loadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  loadBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // ── feedback
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  errorText: { color: "#e11d48", fontSize: 13, fontWeight: "600", flex: 1 },
  resultCount: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 240,
    lineHeight: 20,
  },

  // ── card
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardMeta: { fontSize: 10, color: "#94a3b8" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  cardBody: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginBottom: 10,
  },
  followUp: {
    fontSize: 12,
    color: "#4f46e5",
    fontWeight: "700",
    marginBottom: 4,
  },
  extraInfo: { fontSize: 11, color: "#94a3b8", marginBottom: 2 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    marginTop: 6,
  },
  footerMeta: { fontSize: 10, color: "#94a3b8", fontWeight: "600" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  editBtnText: { fontSize: 12, color: "#2563eb", fontWeight: "700" },

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
  textarea: { minHeight: 90, paddingTop: 10 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  row: { flexDirection: "row" },

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
  modalTitle: { fontSize: 17, fontWeight: "900", color: "#0f172a" },
  closeBtn: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
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
