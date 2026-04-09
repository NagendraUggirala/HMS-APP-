import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,

  Switch,
  Dimensions,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

// ─── API Endpoints (matching web config) ──────────────────────────────────────
const DEPARTMENTS_URL = "/api/v1/hospital-admin/departments";
const departmentDetailsUrl = (id) => `${DEPARTMENTS_URL}/${id}`;
const departmentStatusUrl = (id) => `${DEPARTMENTS_URL}/${id}/status`;

// ─── Data Helpers ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", code: "", description: "", head_of_department: "", location: "",
  phone: "", email: "", operating_hours: "", bed_capacity: "",
  specializations: "", equipment_list: "", emergency_services: false,
};

const getDepartmentItems = (data) => {
  const raw = data?.data ?? data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.departments)) return raw.departments;
  if (Array.isArray(raw)) return raw;
  return [];
};

const mapDepartment = (item) => ({
  id: item?.id ?? item?.department_id ?? "",
  name: item?.name ?? "",
  code: item?.code ?? "",
  description: item?.description ?? "",
  head_of_department: item?.head_of_department ?? "",
  location: item?.location ?? "",
  phone: item?.phone ?? "",
  email: item?.email ?? "",
  operating_hours: item?.operating_hours ?? "",
  bed_capacity: item?.bed_capacity ?? 0,
  specializations: Array.isArray(item?.specializations) ? item.specializations : [],
  equipment_list: Array.isArray(item?.equipment_list) ? item.equipment_list : [],
  emergency_services: Boolean(item?.emergency_services),
  is_active: item?.is_active !== false,
});

const toTextArray = (value) =>
  String(value || "").split(",").map((e) => e.trim()).filter(Boolean);

// ─── Form Input ───────────────────────────────────────────────────────────────
const FormInput = ({ label, value, onChangeText, placeholder, keyboardType, error, icon, iconColor }) => (
  <View className="mb-4" style={styles.formHalf}>
    <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
    <View className="flex-row items-center border rounded-xl bg-white px-3 py-0" style={{ borderColor: error ? "#f87171" : "#d1d5db" }}>
      {icon && <Ionicons name={icon} size={16} color={iconColor || "#9ca3af"} style={{ marginRight: 8 }} />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType || "default"}
        className="flex-1 py-3 text-sm text-slate-800"
      />
    </View>
    {error ? <Text className="text-xs text-red-600 mt-1">{error}</Text> : null}
  </View>
);

// ─── Department Row Card ──────────────────────────────────────────────────────
const DepartmentRow = ({ dept, onView, onEdit, onToggleStatus, statusLoading }) => (
  <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-3">
    {/* Top section */}
    <View className="flex-row items-start justify-between mb-3">
      <View className="flex-1 mr-3">
        <Text className="text-base font-bold text-gray-900">{dept.name}</Text>
        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>{dept.description || "-"}</Text>
      </View>
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <View className={`px-2 py-1 rounded-full ${dept.is_active ? "bg-emerald-100" : "bg-red-100"}`}>
          <Text className={`text-[10px] font-bold ${dept.is_active ? "text-emerald-700" : "text-red-700"}`}>
            {dept.is_active ? "Active" : "Inactive"}
          </Text>
        </View>
        {dept.emergency_services && (
          <View className="px-2 py-1 rounded-full bg-amber-100">
            <Text className="text-[10px] font-bold text-amber-700">ER</Text>
          </View>
        )}
      </View>
    </View>

    {/* Data chips */}
    <View className="flex-row flex-wrap mb-3" style={{ gap: 6 }}>
      <View className="flex-row items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
        <Ionicons name="pricetag-outline" size={11} color="#64748b" />
        <Text className="text-[10px] font-bold text-slate-600 ml-1">{dept.code || "-"}</Text>
      </View>
      <View className="flex-row items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
        <Ionicons name="person-outline" size={11} color="#64748b" />
        <Text className="text-[10px] font-bold text-slate-600 ml-1" numberOfLines={1}>{dept.head_of_department || "-"}</Text>
      </View>
      <View className="flex-row items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
        <Ionicons name="location-outline" size={11} color="#64748b" />
        <Text className="text-[10px] font-bold text-slate-600 ml-1">{dept.location || "-"}</Text>
      </View>
      <View className="flex-row items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
        <Ionicons name="bed-outline" size={11} color="#64748b" />
        <Text className="text-[10px] font-bold text-slate-600 ml-1">{dept.bed_capacity ?? 0} beds</Text>
      </View>
      <View className="flex-row items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
        <Ionicons name="call-outline" size={11} color="#64748b" />
        <Text className="text-[10px] font-bold text-slate-600 ml-1">{dept.phone || "-"}</Text>
      </View>
    </View>

    {/* Actions */}
    <View className="flex-row border-t border-gray-100 pt-3" style={{ gap: 8 }}>
      <TouchableOpacity onPress={onView} className="flex-1 flex-row items-center justify-center bg-blue-50 py-2.5 rounded-xl">
        <Feather name="eye" size={13} color="#2563eb" />
        <Text className="text-blue-700 font-semibold text-xs ml-1.5">View</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onEdit} className="flex-1 flex-row items-center justify-center bg-purple-50 py-2.5 rounded-xl">
        <Feather name="edit" size={13} color="#7c3aed" />
        <Text className="text-purple-700 font-semibold text-xs ml-1.5">Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onToggleStatus}
        disabled={statusLoading}
        className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${dept.is_active ? "bg-amber-50" : "bg-emerald-50"}`}
      >
        {statusLoading ? (
          <ActivityIndicator size="small" color={dept.is_active ? "#d97706" : "#059669"} />
        ) : (
          <>
            <Ionicons name={dept.is_active ? "pause" : "play"} size={13} color={dept.is_active ? "#d97706" : "#059669"} />
            <Text className={`font-semibold text-xs ml-1.5 ${dept.is_active ? "text-amber-700" : "text-emerald-700"}`}>
              {dept.is_active ? "Disable" : "Enable"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Detail Field ─────────────────────────────────────────────────────────────
const DetailField = ({ label, value }) => (
  <View className="mb-3">
    <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</Text>
    <View className="bg-gray-50 rounded-lg p-3">
      <Text className="text-sm text-gray-900">{value || "-"}</Text>
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONTENT
// ═══════════════════════════════════════════════════════════════════════════════
const DepartmentsContent = () => {
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [listError, setListError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectDoctorModal, setSelectDoctorModal] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");

  // Modal states
  const [modalState, setModalState] = useState({ add: false, edit: false });
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [details, setDetails] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Fetch Departments ──
  const fetchDepartments = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setListError("");
    try {
      const data = await api.get(`${DEPARTMENTS_URL}?page=1&limit=100&active_only=${activeOnly}`);
      setDepartments(getDepartmentItems(data).map(mapDepartment));
    } catch (error) {
      setListError(error?.message || "Unable to load departments.");
      setDepartments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const data = await api.get("/api/v1/hospital-admin/staff?role=DOCTOR&page=1&limit=100");
      const items = data?.data?.items || data?.items || data?.data || data || [];
      if (Array.isArray(items)) {
        setDoctors(items.map(d => ({
          id: d.id || d.staff_id || d.user_id || "",
          name: d.name || `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Unknown Doctor",
          specialization: d.doctor_specialization || d.specialization || d.department || ""
        })));
      }
    } catch (error) {
      console.warn("Failed to fetch doctors:", error);
      // Fallback for demo if API fails
      setDoctors([
        { id: "DOC-1001", name: "Dr. Meena Rao", specialization: "Cardiology" },
        { id: "DOC-1002", name: "Dr. Vivek Sharma", specialization: "Orthopedics" },
        { id: "DOC-1003", name: "Dr. Rajesh Menon", specialization: "Neurology" },
        { id: "DOC-1004", name: "Dr. Anjali Desai", specialization: "Pediatrics" },
      ]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, [activeOnly]);

  const onRefresh = () => { setRefreshing(true); fetchDepartments(true); };

  // ── Modal Openers ──
  const openAddModal = () => {
    setCurrentDepartment(null);
    setFormData(EMPTY_FORM);
    setFieldErrors({});
    setModalState({ add: true, edit: false });
  };

  const openEditModal = (dept) => {
    setCurrentDepartment(dept);
    setFormData({
      name: dept.name || "", code: dept.code || "", description: dept.description || "",
      head_of_department: dept.head_of_department || "", location: dept.location || "",
      phone: dept.phone || "", email: dept.email || "",
      operating_hours: dept.operating_hours || "", bed_capacity: String(dept.bed_capacity ?? ""),
      specializations: (dept.specializations || []).join(", "),
      equipment_list: (dept.equipment_list || []).join(", "),
      emergency_services: Boolean(dept.emergency_services),
    });
    setFieldErrors({});
    setModalState({ add: false, edit: true });
  };

  const closeModals = () => {
    setModalState({ add: false, edit: false });
    setCurrentDepartment(null);
    setFormData(EMPTY_FORM);
    setFieldErrors({});
  };

  const set = (field) => (value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
  };

  // ── Validation ──
  const validateForm = () => {
    const errors = {};
    const required = ["name", "code", "description", "head_of_department", "location", "phone", "email", "operating_hours", "bed_capacity"];
    required.forEach((f) => {
      if (!String(formData[f] ?? "").trim()) errors[f] = "This field is required.";
    });
    if (formData.bed_capacity !== "" && Number(formData.bed_capacity) < 0) errors.bed_capacity = "Must be 0 or greater.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => ({
    name: formData.name.trim(), code: formData.code.trim(), description: formData.description.trim(),
    head_of_department: formData.head_of_department.trim(), location: formData.location.trim(),
    phone: formData.phone.trim(), email: formData.email.trim(), operating_hours: formData.operating_hours.trim(),
    bed_capacity: Number(formData.bed_capacity || 0),
    specializations: toTextArray(formData.specializations), equipment_list: toTextArray(formData.equipment_list),
    emergency_services: Boolean(formData.emergency_services),
  });

  // ── Create ──
  const handleCreateDepartment = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      await api.post(DEPARTMENTS_URL, buildPayload());
      closeModals();
      fetchDepartments();
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to create department.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Update ──
  const handleUpdateDepartment = async () => {
    if (!validateForm() || !currentDepartment?.id) return;
    setSubmitLoading(true);
    try {
      await api.put(departmentDetailsUrl(currentDepartment.id), buildPayload());
      closeModals();
      fetchDepartments();
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to update department.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Toggle Status ──
  const handleToggleStatus = async (dept) => {
    const key = `status-${dept.id}`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      // api service doesn't have patch, use put with status endpoint
      const resolvedHeaders = await api.getHeaders();
      const response = await fetch(`${api.baseURL}${departmentStatusUrl(dept.id)}`, {
        method: "PATCH",
        headers: resolvedHeaders,
        body: JSON.stringify({ is_active: !dept.is_active }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `Failed to update status (${response.status})`);
      }
      fetchDepartments();
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to update department status.");
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  // ── Get Details ──
  const handleGetDetails = async (dept) => {
    try {
      const data = await api.get(departmentDetailsUrl(dept.id));
      setDetails(mapDepartment(data?.data ?? data));
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to load department details.");
    }
  };

  // ── Filtered list ──
  const filteredDepartments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return departments.filter((d) => {
      if (!q) return true;
      return [d.name, d.code, d.head_of_department, d.location, d.email]
        .some((f) => String(f || "").toLowerCase().includes(q));
    });
  }, [departments, searchTerm]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Departments...</Text>
      </View>
    );
  }

  // ── Form Fields Renderer ──
  const renderFormFields = () => (
    <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row flex-wrap" style={{ gap: 0 }}>
        <FormInput label="Department Name *" value={formData.name} onChangeText={set("name")} placeholder="e.g., Cardiology" icon="business-outline" iconColor="#3b82f6" error={fieldErrors.name} />
        <FormInput label="Department Code *" value={formData.code} onChangeText={set("code")} placeholder="e.g., CARD" icon="pricetag-outline" iconColor="#6366f1" error={fieldErrors.code} />

        {/* Head of Department Picker */}

        <View className="mb-4 w-full">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Head of Department *
          </Text>

          <TextInput
            placeholder="Enter Head of Department"
            value={formData.head_of_department}
            onChangeText={(text) =>
              setFormData({ ...formData, head_of_department: text })
            }
            className="border rounded-xl bg-white px-3 py-3 text-sm text-slate-800"
            style={{
              borderColor: fieldErrors.head_of_department ? "#f87171" : "#d1d5db",
            }}
          />

          {fieldErrors.head_of_department ? (
            <Text className="text-xs text-red-600 mt-1">
              {fieldErrors.head_of_department}
            </Text>
          ) : null}
        </View>

        <FormInput label="Location *" value={formData.location} onChangeText={set("location")} placeholder="Floor 2, Wing A" icon="location-outline" iconColor="#f59e0b" error={fieldErrors.location} />
        <FormInput label="Phone *" value={formData.phone} onChangeText={set("phone")} placeholder="+91 98765 43210" keyboardType="phone-pad" icon="call-outline" iconColor="#10b981" error={fieldErrors.phone} />
        <FormInput label="Email *" value={formData.email} onChangeText={set("email")} placeholder="dept@hospital.com" keyboardType="email-address" icon="mail-outline" iconColor="#ec4899" error={fieldErrors.email} />
        <FormInput label="Operating Hours *" value={formData.operating_hours} onChangeText={set("operating_hours")} placeholder="08:00-20:00" icon="time-outline" iconColor="#f97316" error={fieldErrors.operating_hours} />
        <FormInput label="Bed Capacity *" value={formData.bed_capacity} onChangeText={set("bed_capacity")} placeholder="0" keyboardType="number-pad" icon="bed-outline" iconColor="#3b82f6" error={fieldErrors.bed_capacity} />
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Description *</Text>
        <TextInput
          value={formData.description}
          onChangeText={set("description")}
          placeholder="Department description"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="border rounded-xl bg-white px-4 py-3 text-sm text-slate-800"
          style={{ borderColor: fieldErrors.description ? "#f87171" : "#d1d5db", minHeight: 80 }}
        />
        {fieldErrors.description ? <Text className="text-xs text-red-600 mt-1">{fieldErrors.description}</Text> : null}
      </View>

      {/* Specializations & Equipment */}
      <FormInput label="Specializations (comma separated)" value={formData.specializations} onChangeText={set("specializations")} placeholder="Angioplasty, Echo, ICU" />
      <FormInput label="Equipment List (comma separated)" value={formData.equipment_list} onChangeText={set("equipment_list")} placeholder="MRI, Ventilator" />

      {/* Emergency toggle */}
      <View className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 mb-4">
        <Text className="text-sm text-gray-700 font-medium">Emergency services available</Text>
        <Switch
          value={formData.emergency_services}
          onValueChange={(val) => setFormData((p) => ({ ...p, emergency_services: val }))}
          trackColor={{ false: "#d1d5db", true: "#86efac" }}
          thumbColor={formData.emergency_services ? "#10b981" : "#f4f4f5"}
        />
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</Text>
            <Text className="text-lg font-black text-gray-900">Departments</Text>
          </View>
        </View>
        <TouchableOpacity onPress={openAddModal} className="flex-row items-center bg-blue-600 px-4 py-2.5 rounded-xl shadow-sm">
          <Ionicons name="add-circle-outline" size={18} color="white" />
          <Text className="text-white font-bold text-sm ml-1">Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Search & Filter ── */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
          <View className="flex-row items-center bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
            <Feather name="search" size={16} color="#9ca3af" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by name, code, head, location..."
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-2 text-sm text-slate-800"
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Switch
                value={activeOnly}
                onValueChange={setActiveOnly}
                trackColor={{ false: "#d1d5db", true: "#86efac" }}
                thumbColor={activeOnly ? "#10b981" : "#f4f4f5"}
              />
              <Text className="text-sm text-gray-700 ml-2">Active only</Text>
            </View>
            <Text className="text-xs text-gray-500">{filteredDepartments.length} departments</Text>
          </View>
        </View>

        {/* ── Error Banner ── */}
        {listError ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text className="text-red-700 text-sm ml-2 flex-1">{listError}</Text>
            </View>
            <TouchableOpacity onPress={() => fetchDepartments()} className="bg-red-100 px-3 py-1.5 rounded-lg ml-3">
              <Text className="text-red-700 text-xs font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Department List ── */}
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((dept) => (
            <DepartmentRow
              key={dept.id}
              dept={dept}
              onView={() => handleGetDetails(dept)}
              onEdit={() => openEditModal(dept)}
              onToggleStatus={() => handleToggleStatus(dept)}
              statusLoading={actionLoading[`status-${dept.id}`]}
            />
          ))
        ) : (
          <View className="items-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <View className="h-20 w-20 rounded-full bg-blue-50 items-center justify-center mb-6">
              <MaterialCommunityIcons name="sitemap" size={36} color="#3b82f6" />
            </View>
            <Text className="text-xl font-bold text-gray-700 mb-2">No departments found</Text>
            <Text className="text-gray-500 mb-6">Try adjusting your search or active filter</Text>
          </View>
        )}
      </ScrollView>

      {/* ══════════ ADD MODAL ══════════ */}
      <Modal visible={modalState.add} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50">
            <View className="flex-row items-center">
              <View className="h-10 w-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                <Ionicons name="add-circle" size={20} color="white" />
              </View>
              <Text className="text-xl font-bold text-slate-800">Add New Department</Text>
            </View>
            <TouchableOpacity onPress={closeModals}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          {renderFormFields()}
          <View className="flex-row px-5 py-4 border-t border-gray-100" style={{ gap: 12 }}>
            <TouchableOpacity onPress={closeModals} className="flex-1 py-3 border border-gray-300 rounded-xl items-center">
              <Text className="font-semibold text-slate-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateDepartment} disabled={submitLoading} className="flex-1 py-3 bg-blue-600 rounded-xl items-center flex-row justify-center">
              {submitLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={16} color="white" />
                  <Text className="font-semibold text-white ml-2">Create Department</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════ EDIT MODAL ══════════ */}
      <Modal visible={modalState.edit} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-indigo-50">
            <View className="flex-row items-center">
              <View className="h-10 w-10 bg-indigo-600 rounded-xl items-center justify-center mr-3">
                <Feather name="edit" size={18} color="white" />
              </View>
              <Text className="text-xl font-bold text-slate-800">Edit Department</Text>
            </View>
            <TouchableOpacity onPress={closeModals}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          {renderFormFields()}
          <View className="flex-row px-5 py-4 border-t border-gray-100" style={{ gap: 12 }}>
            <TouchableOpacity onPress={closeModals} className="flex-1 py-3 border border-gray-300 rounded-xl items-center">
              <Text className="font-semibold text-slate-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUpdateDepartment} disabled={submitLoading} className="flex-1 py-3 bg-indigo-600 rounded-xl items-center flex-row justify-center">
              {submitLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={16} color="white" />
                  <Text className="font-semibold text-white ml-2">Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════ DETAILS MODAL ══════════ */}
      <Modal visible={Boolean(details)} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-slate-800">Department Details</Text>
            <TouchableOpacity onPress={() => setDetails(null)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {details && (
            <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="border-b border-gray-200 pb-4 mb-4">
                <Text className="text-2xl font-bold text-gray-800">{details.name}</Text>
                <Text className="text-sm text-gray-500 mt-1">{details.code}</Text>
              </View>

              <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                <View style={styles.detailHalf}><DetailField label="Head" value={details.head_of_department} /></View>
                <View style={styles.detailHalf}><DetailField label="Location" value={details.location} /></View>
                <View style={styles.detailHalf}><DetailField label="Phone" value={details.phone} /></View>
                <View style={styles.detailHalf}><DetailField label="Email" value={details.email} /></View>
                <View style={styles.detailHalf}><DetailField label="Operating Hours" value={details.operating_hours} /></View>
                <View style={styles.detailHalf}><DetailField label="Bed Capacity" value={String(details.bed_capacity ?? 0)} /></View>
              </View>

              <DetailField label="Description" value={details.description} />
              <DetailField label="Specializations" value={(details.specializations || []).join(", ") || "-"} />
              <DetailField label="Equipment List" value={(details.equipment_list || []).join(", ") || "-"} />
              <DetailField label="Emergency Services" value={details.emergency_services ? "Yes" : "No"} />
              <DetailField label="Status" value={details.is_active ? "Active" : "Inactive"} />
            </ScrollView>
          )}

          <View className="px-5 py-4 border-t border-gray-100">
            <TouchableOpacity onPress={() => setDetails(null)} className="bg-blue-600 py-3 rounded-xl items-center">
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ══════════ DOCTOR SELECTION MODAL ══════════ */}
      <Modal visible={selectDoctorModal} animationType="fade" transparent>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center p-6"
          activeOpacity={1}
          onPress={() => setSelectDoctorModal(false)}
        >
          <View className="bg-white rounded-[32px] w-full max-h-[80%] overflow-hidden shadow-2xl">
            <View className="p-6 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-black text-slate-800">Select Department Head</Text>
              <TouchableOpacity onPress={() => setSelectDoctorModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="p-4 bg-slate-50 border-b border-gray-100">
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
                <Ionicons name="search" size={16} color="#94a3b8" />
                <TextInput
                  placeholder="Search doctors..."
                  value={doctorSearch}
                  onChangeText={setDoctorSearch}
                  className="flex-1 ml-2 text-sm text-slate-800"
                />
              </View>
            </View>

            <ScrollView className="p-4">
              {doctorsLoading ? (
                <ActivityIndicator size="small" color="#3b82f6" className="my-10" />
              ) : (
                doctors
                  .filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase()))
                  .map(doc => (
                    <TouchableOpacity
                      key={doc.id}
                      onPress={() => {
                        set("head_of_department")(doc.name); // Storing name for display
                        setSelectDoctorModal(false);
                      }}
                      className="flex-row items-center p-4 mb-2 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <View className="h-10 w-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                        <Ionicons name="person" size={20} color="#3b82f6" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-slate-800">{doc.name}</Text>
                        <Text className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{doc.specialization}</Text>
                      </View>
                      {formData.head_of_department === doc.name && (
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const DepartmentsScreen = () => (
  <AdminLayout>
    <DepartmentsContent />
  </AdminLayout>
);

const styles = StyleSheet.create({
  formHalf: {
    width: "100%",
  },
  detailHalf: {
    width: (width - 32 - 40 - 10) / 2,
  },
});

export default DepartmentsScreen;