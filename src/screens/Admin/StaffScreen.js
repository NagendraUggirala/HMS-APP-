import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

// ─── API Endpoints ────────────────────────────────────────────────────────────
const STAFF_URL = "/api/v1/hospital-admin/staff";
const staffDetailsUrl = (id) => `${STAFF_URL}/${id}`;
const staffStatusUrl = (id) => `${STAFF_URL}/${id}/status`;
const staffResetPasswordUrl = (id) => `${STAFF_URL}/${id}/reset-password`;

// ─── Constants & Helpers ──────────────────────────────────────────────────────
const ROLE_OPTIONS = ["DOCTOR", "NURSE", "RECEPTIONIST", "LAB_TECH", "PHARMACIST"];
const SHIFT_OPTIONS = ["Morning (7AM-3PM)", "Evening (3PM-11PM)", "Night (11PM-7AM)", "Flexible", "Part-time"];

const EMPTY_FORM = {
  email: "", phone: "", first_name: "", last_name: "", role: "",
  password: "", emergency_contact: "", shift_timing: SHIFT_OPTIONS[0],
  joining_date: "", address: "", doctor_specialization: "",
};

const getStaffItems = (data) => {
  const raw = data?.data ?? data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.staff)) return raw.staff;
  if (Array.isArray(raw)) return raw;
  return [];
};

const toDisplayRole = (role) => {
  const value = String(role || "").toUpperCase();
  if (value === "LAB_TECH") return "Lab Tech";
  if (value === "PHARMACIST") return "Pharmacist";
  if (value === "DOCTOR") return "Doctor";
  if (value === "NURSE") return "Nurses";
  if (value === "RECEPTIONIST") return "Receptionists";
  return value || "Unknown";
};

const mapStaff = (item) => {
  const role = item?.role ?? item?.user_role ?? "";
  const firstName = item?.first_name ?? item?.firstName ?? "";
  const lastName = item?.last_name ?? item?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return {
    id: item?.id ?? item?.staff_id ?? item?.user_id ?? "",
    email: item?.email ?? "",
    phone: item?.phone ?? "",
    first_name: firstName,
    last_name: lastName,
    name: fullName || item?.name || "Unnamed Staff",
    role,
    roleLabel: toDisplayRole(role),
    shift_timing: item?.shift_timing ?? item?.shiftTiming ?? "-",
    joining_date: item?.joining_date ?? item?.joiningDate ?? "",
    address: item?.address ?? "",
    emergency_contact: item?.emergency_contact ?? item?.emergencyContact ?? "",
    doctor_specialization: item?.doctor_specialization ?? item?.doctorSpecialization ?? "",
    status: item?.is_active === false ? "Inactive" : "Active",
    is_active: item?.is_active !== false,
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "U")}&background=random`,
  };
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, colorConfig, icon, change }) => (
  <View className={`p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 ${colorConfig.bg}`} style={styles.statCard}>
    <View className="flex-row items-center justify-between mb-4">
      <View className={`h-10 w-10 items-center justify-center rounded-xl ${colorConfig.iconBg}`}>
        <MaterialCommunityIcons name={icon} size={20} className={colorConfig.text} color={colorConfig.iconColorHex} />
      </View>
      <View className="bg-white px-2 py-1 rounded-full border border-gray-200">
        <Text className="text-[9px] font-bold text-gray-500 uppercase">{change}</Text>
      </View>
    </View>
    <Text className={`text-3xl font-bold mb-1 ${colorConfig.text}`}>{value}</Text>
    <Text className="text-gray-600 text-sm font-medium">{label}</Text>
  </View>
);

// ─── Form Input ───────────────────────────────────────────────────────────────
const FormInput = ({ label, required, value, onChangeText, placeholder, keyboardType, error, icon, iconColor, secureTextEntry }) => (
  <View className="mb-4">
    <View className="flex-row items-center mb-1">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      {required && <Text className="text-red-500 ml-1">*</Text>}
    </View>
    <View className="flex-row items-center border rounded-xl bg-white px-3 py-0" style={{ borderColor: error ? "#f87171" : "#d1d5db" }}>
      {icon && <Ionicons name={icon} size={16} color={iconColor || "#9ca3af"} style={{ marginRight: 8 }} />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType || "default"}
        secureTextEntry={secureTextEntry}
        className="flex-1 py-3 text-sm text-slate-800"
      />
    </View>
    {error ? <Text className="text-xs text-red-600 mt-1">{error}</Text> : null}
  </View>
);

// ─── Main Content ─────────────────────────────────────────────────────────────
const StaffContent = () => {
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [listError, setListError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [passwordResetResult, setPasswordResetResult] = useState(null);

  // Modal states
  const [modalState, setModalState] = useState({ add: false });
  const [staffDetails, setStaffDetails] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Fetch Staff ──
  const fetchStaff = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setListError("");
    try {
      let url = `${STAFF_URL}?page=1&limit=100`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (statusFilter === "Active") url += `&active_only=true`;
      
      const data = await api.get(url);
      setStaff(getStaffItems(data).map(mapStaff));
    } catch (error) {
      setListError(error?.message || "Unable to load staff users.");
      setStaff([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStaff(); }, [roleFilter, statusFilter]);
  const onRefresh = () => { setRefreshing(true); fetchStaff(true); };

  // ── Modal Actions ──
  const openModal = () => {
    setFormData(EMPTY_FORM);
    setFieldErrors({});
    setModalState({ add: true });
  };
  const closeModal = () => {
    setModalState({ add: false });
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
    const req = ["email", "phone", "first_name", "last_name", "role", "password", "emergency_contact", "shift_timing", "joining_date", "address"];
    req.forEach((f) => {
      if (!String(formData[f] || "").trim()) errors[f] = "Required";
    });
    if (formData.role === "DOCTOR" && !String(formData.doctor_specialization || "").trim()) {
      errors.doctor_specialization = "Required for doctors";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Create ──
  const handleAddStaff = async () => {
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const payload = { ...formData };
      if (payload.role !== "DOCTOR") payload.doctor_specialization = "";
      await api.post(STAFF_URL, payload);
      closeModal();
      fetchStaff();
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to create staff user.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Toggle Status ──
  const handleToggleStatus = async (staffItem) => {
    const nextValue = !staffItem.is_active;
    const key = `status-${staffItem.id}`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      const response = await fetch(`${api.baseURL}${staffStatusUrl(staffItem.id)}`, {
        method: "PATCH",
        headers: api.getHeaders(),
        body: JSON.stringify({ is_active: nextValue }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `Failed to update status`);
      }
      fetchStaff();
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to update staff status.");
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  // ── Reset Password ──
  const handleResetPassword = (staffItem) => {
    Alert.alert("Reset Password", `Reset password for ${staffItem.name}?`, [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Reset", 
        style: "destructive",
        onPress: async () => {
          const key = `reset-${staffItem.id}`;
          setActionLoading((p) => ({ ...p, [key]: true }));
          try {
            const response = await fetch(`${api.baseURL}${staffResetPasswordUrl(staffItem.id)}`, {
              method: "POST",
              headers: api.getHeaders(),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.message || "Failed to reset password");
            
            const tempPassword = data?.temporary_password || data?.password || data?.data?.temporary_password || data?.data?.password || "";
            setPasswordResetResult({ name: staffItem.name, password: tempPassword });
          } catch (error) {
            Alert.alert("Error", error?.message || "Unable to reset password.");
          } finally {
            setActionLoading((p) => ({ ...p, [key]: false }));
          }
        }
      }
    ]);
  };

  // ── Details ──
  const handleGetDetails = async (staffItem) => {
    try {
      const data = await api.get(staffDetailsUrl(staffItem.id));
      const detail = data?.data ?? data;
      setStaffDetails({
        name: staffItem.name,
        id: detail?.id || detail?.staff_id || detail?.user_id || staffItem.id || "-",
        email: detail?.email || staffItem.email || "-",
        phone: detail?.phone || staffItem.phone || "-",
        role: toDisplayRole(detail?.role || staffItem.role),
        active: detail?.is_active === false ? "No" : "Yes",
        shift_timing: detail?.shift_timing || staffItem.shift_timing || "-",
        joining_date: detail?.hire_date || "-",
        address: detail?.address || "-",
        emergency_contact: detail?.emergency_contact || "-",
        doctor_specialization: detail?.doctor_specialization || "-",
      });
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to load staff details.");
    }
  };

  // ── Filters & Stats ──
  const filteredStaff = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return staff.filter((s) => !query || [s.name, s.email, s.phone, s.roleLabel].some((f) => String(f || "").toLowerCase().includes(query)));
  }, [staff, searchTerm]);

  const stats = useMemo(() => [
    { label: "Total Staff", value: staff.length, color: "blue", icon: "account-group", change: "Hospital users" },
    { label: "Doctors", value: staff.filter((s) => s.role === "DOCTOR").length, color: "green", icon: "doctor", change: "Medical staff" },
    { label: "Nurses", value: staff.filter((s) => s.role === "NURSE").length, color: "teal", icon: "needle", change: "Nursing team" },
    { label: "Receptionists", value: staff.filter((s) => s.role === "RECEPTIONIST").length, color: "rose", icon: "human-greeting", change: "Front desk" },
    { label: "Lab Tech", value: staff.filter((s) => s.role === "LAB_TECH").length, color: "purple", icon: "microscope", change: "Diagnostics team" },
    { label: "Pharmacists", value: staff.filter((s) => s.role === "PHARMACIST").length, color: "orange", icon: "pill", change: "Pharmacy team" },
  ], [staff]);

  const colorConfigs = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", iconBg: "bg-blue-100", iconColorHex: "#3b82f6" },
    green: { bg: "bg-green-50", text: "text-green-700", iconBg: "bg-green-100", iconColorHex: "#10b981" },
    teal: { bg: "bg-teal-50", text: "text-teal-700", iconBg: "bg-teal-100", iconColorHex: "#14b8a6" },
    rose: { bg: "bg-rose-50", text: "text-rose-700", iconBg: "bg-rose-100", iconColorHex: "#f43f5e" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", iconBg: "bg-purple-100", iconColorHex: "#a855f7" },
    orange: { bg: "bg-orange-50", text: "text-orange-700", iconBg: "bg-orange-100", iconColorHex: "#f97316" },
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Staff...</Text>
      </View>
    );
  }

  // ── Render Form ──
  const renderFormFields = () => (
    <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row flex-wrap" style={{ gap: 0 }}>
        <View style={styles.formHalf}>
          <FormInput label="First Name" required value={formData.first_name} onChangeText={set("first_name")} placeholder="John" icon="person-outline" error={fieldErrors.first_name} />
        </View>
        <View style={styles.formHalf}>
          <FormInput label="Last Name" required value={formData.last_name} onChangeText={set("last_name")} placeholder="Doe" icon="person-outline" error={fieldErrors.last_name} />
        </View>
        <View style={styles.formHalf}>
            <FormInput label="Email Address" required value={formData.email} onChangeText={set("email")} placeholder="staff@hospital.com" keyboardType="email-address" icon="mail-outline" error={fieldErrors.email} />
        </View>
        <View style={styles.formHalf}>
            <FormInput label="Phone Number" required value={formData.phone} onChangeText={set("phone")} placeholder="+91 98765 43210" keyboardType="phone-pad" icon="call-outline" error={fieldErrors.phone} />
        </View>
        <View style={styles.formHalf}>
            <FormInput label="Password" required value={formData.password} onChangeText={set("password")} placeholder="Enter password" secureTextEntry icon="lock-closed-outline" error={fieldErrors.password} />
        </View>
        <View style={styles.formHalf}>
            <FormInput label="Emergency Contact" required value={formData.emergency_contact} onChangeText={set("emergency_contact")} placeholder="+91 98765 43210" keyboardType="phone-pad" icon="warning-outline" error={fieldErrors.emergency_contact} />
        </View>
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-2 mt-2">Role *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {ROLE_OPTIONS.map(opt => (
          <TouchableOpacity 
            key={opt}
            onPress={() => set("role")(opt)}
            className={`px-4 py-2 border rounded-full mr-2 ${formData.role === opt ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}
          >
            <Text className={`text-xs font-bold ${formData.role === opt ? "text-white" : "text-gray-600"}`}>{toDisplayRole(opt)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {fieldErrors.role ? <Text className="text-xs text-red-600 mb-4">{fieldErrors.role}</Text> : null}

      <Text className="text-sm font-medium text-gray-700 mb-2">Shift Timing *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {SHIFT_OPTIONS.map(opt => (
           <TouchableOpacity 
            key={opt}
            onPress={() => set("shift_timing")(opt)}
            className={`px-3 py-1.5 border rounded-full mr-2 ${formData.shift_timing === opt ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300"}`}
          >
            <Text className={`text-[10px] font-bold ${formData.shift_timing === opt ? "text-white" : "text-gray-600"}`}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {fieldErrors.shift_timing ? <Text className="text-xs text-red-600 mb-4">{fieldErrors.shift_timing}</Text> : null}

      <FormInput label="Joining Date (YYYY-MM-DD)" required value={formData.joining_date} onChangeText={set("joining_date")} placeholder="2024-01-01" icon="calendar-outline" error={fieldErrors.joining_date} />
      
      {formData.role === "DOCTOR" && (
        <FormInput label="Doctor Specialization" required value={formData.doctor_specialization} onChangeText={set("doctor_specialization")} placeholder="Cardiology" icon="medkit-outline" error={fieldErrors.doctor_specialization} />
      )}

      {/* Address */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Address *</Text>
        <TextInput
          value={formData.address}
          onChangeText={set("address")}
          placeholder="Complete address"
          multiline
          numberOfLines={3}
          style={{ height: 80, borderColor: fieldErrors.address ? "#f87171" : "#d1d5db" }}
          className="border border-gray-300 rounded-xl bg-white px-4 py-3 text-sm text-slate-800"
        />
        {fieldErrors.address ? <Text className="text-xs text-red-600 mt-1">{fieldErrors.address}</Text> : null}
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
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medical Team</Text>
            <Text className="text-lg font-black text-gray-900">Staff Management</Text>
          </View>
        </View>
        <TouchableOpacity onPress={openModal} className="flex-row items-center bg-blue-600 px-4 py-2.5 rounded-xl shadow-sm">
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-bold text-sm ml-1 hidden sm:flex">Add Staff</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Stats Grid ── */}
        <View className="flex-row flex-wrap justify-between">
          {stats.map((s, idx) => (
             <StatCard key={idx} label={s.label} value={s.value} change={s.change} icon={s.icon} colorConfig={colorConfigs[s.color] || colorConfigs.blue} />
          ))}
        </View>

        {/* ── Search & Filters ── */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
          <View className="flex-row items-center bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 mb-3">
            <Feather name="search" size={16} color="#9ca3af" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by name, role, email..."
              className="flex-1 ml-2 py-1 text-sm text-slate-800"
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Ionicons name="close-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity onPress={() => {setRoleFilter(""); setStatusFilter("")}} className={`px-4 py-2 border rounded-full mr-2 ${!roleFilter && !statusFilter ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"}`}>
               <Text className={`text-xs font-bold ${!roleFilter && !statusFilter ? "text-white" : "text-gray-600"}`}>All</Text>
            </TouchableOpacity>
            {ROLE_OPTIONS.map((r) => (
               <TouchableOpacity key={r} onPress={() => setRoleFilter(roleFilter === r ? "" : r)} className={`px-3 py-1.5 border rounded-full mr-2 ${roleFilter === r ? "bg-blue-100 border-blue-300" : "bg-white border-gray-200"}`}>
                 <Text className={`text-xs font-bold ${roleFilter === r ? "text-blue-700" : "text-gray-600"}`}>{toDisplayRole(r)}</Text>
               </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setStatusFilter(statusFilter === "Active" ? "" : "Active")} className={`px-3 py-1.5 border rounded-full mr-2 ${statusFilter === "Active" ? "bg-green-100 border-green-300" : "bg-white border-gray-200"}`}>
                 <Text className={`text-xs font-bold ${statusFilter === "Active" ? "text-green-700" : "text-gray-600"}`}>Active Only</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {listError ? (
          <View className="bg-red-50 p-4 rounded-xl border border-red-200 mb-4 flex-row justify-between items-center">
            <Text className="text-red-700 text-sm flex-1">{listError}</Text>
            <TouchableOpacity onPress={() => fetchStaff()} className="bg-red-100 px-3 py-1.5 rounded-lg"><Text className="text-red-700 font-bold text-xs">Retry</Text></TouchableOpacity>
          </View>
        ) : null}

        {passwordResetResult ? (
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
            <Text className="text-blue-800 text-sm">
              <Ionicons name="key" size={14} /> Temporary password for <Text className="font-bold">{passwordResetResult.name}</Text>:
            </Text>
            <Text className="text-blue-900 font-black mt-1 text-base">{passwordResetResult.password || "Check backend"}</Text>
            <TouchableOpacity onPress={() => setPasswordResetResult(null)} className="absolute top-2 right-2 p-1"><Ionicons name="close" size={16} color="#1e3a8a"/></TouchableOpacity>
          </View>
        ) : null}

        {/* ── Staff List ── */}
        <View className="mb-2">
            <Text className="text-lg font-bold text-gray-800">Staff Members ({filteredStaff.length})</Text>
        </View>

        {filteredStaff.length > 0 ? (
          <View className="flex-row flex-wrap justify-between" style={{ gap: 0 }}>
            {filteredStaff.map((staffMember) => {
              const isActive = staffMember.status === "Active";
              return (
              <View key={staffMember.id} style={styles.staffCardWrapper} className="mb-4">
                <View className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <View className="flex-row items-center mb-3">
                    <View className="relative">
                      <Image source={{ uri: staffMember.image }} className="w-12 h-12 rounded-full bg-gray-100" />
                      <View className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white items-center justify-center ${isActive ? "bg-green-500" : "bg-red-500"}`}>
                         {isActive ? <Ionicons name="checkmark" size={8} color="white" /> : <Ionicons name="pause" size={8} color="white"/> }
                      </View>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{staffMember.name}</Text>
                      <Text className="text-xs text-gray-500">{staffMember.id}</Text>
                    </View>
                  </View>

                  <View className="mb-3 space-y-1 mt-1">
                     <View className="flex-row justify-between"><Text className="text-xs text-gray-500">Role:</Text><Text className="text-xs font-bold text-gray-700">{staffMember.roleLabel}</Text></View>
                     <View className="flex-row justify-between"><Text className="text-xs text-gray-500">Shift:</Text><Text className="text-xs font-semibold text-gray-800">{staffMember.shift_timing}</Text></View>
                     <View className="flex-row justify-between"><Text className="text-xs text-gray-500">Phone:</Text><Text className="text-xs font-semibold text-gray-800">{staffMember.phone}</Text></View>
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <View className={`px-2 py-1 rounded-md bg-gray-100`}>
                      <Text className={`text-[10px] font-bold text-gray-600 uppercase`}>{staffMember.role}</Text>
                    </View>
                    <View className="flex-row" style={{ gap: 6 }}>
                       <TouchableOpacity onPress={() => handleGetDetails(staffMember)} className="h-8 w-8 bg-blue-50 rounded-full items-center justify-center">
                         <Ionicons name="information" size={16} color="#3b82f6" />
                       </TouchableOpacity>
                       <TouchableOpacity disabled={actionLoading[`status-${staffMember.id}`]} onPress={() => handleToggleStatus(staffMember)} className={`h-8 w-8 rounded-full items-center justify-center ${isActive ? "bg-amber-50" : "bg-emerald-50"}`}>
                         {actionLoading[`status-${staffMember.id}`] ? <ActivityIndicator size="small" /> : <Ionicons name={isActive ? "pause" : "play"} size={14} color={isActive ? "#d97706" : "#059669"} />}
                       </TouchableOpacity>
                       <TouchableOpacity disabled={actionLoading[`reset-${staffMember.id}`]} onPress={() => handleResetPassword(staffMember)} className="h-8 w-8 bg-purple-50 rounded-full items-center justify-center">
                         {actionLoading[`reset-${staffMember.id}`] ? <ActivityIndicator size="small" /> : <Ionicons name="key" size={14} color="#9333ea" />}
                       </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )})}
          </View>
        ) : (
          <View className="items-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <View className="h-16 w-16 bg-blue-50 rounded-full items-center justify-center mb-4"><Ionicons name="people" size={32} color="#3b82f6"/></View>
            <Text className="text-lg font-bold text-gray-700">No staff found</Text>
            <Text className="text-gray-500 text-sm">Try adjusting your filters</Text>
          </View>
        )}
      </ScrollView>

      {/* ══════════ ADD MODAL ══════════ */}
      <Modal visible={modalState.add} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50">
            <View className="flex-row items-center">
              <View className="h-10 w-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                <Ionicons name="person-add" size={20} color="white" />
              </View>
              <Text className="text-xl font-bold text-slate-800">Add New Staff</Text>
            </View>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          {renderFormFields()}
          <View className="flex-row px-5 py-4 border-t border-gray-100" style={{ gap: 12 }}>
            <TouchableOpacity onPress={closeModal} className="flex-1 py-3 border border-gray-300 rounded-xl items-center">
              <Text className="font-semibold text-slate-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddStaff} disabled={submitLoading} className="flex-1 py-3 bg-blue-600 rounded-xl items-center flex-row justify-center">
              {submitLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                  <Text className="font-semibold text-white ml-2">Create Staff</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════ DETAILS MODAL ══════════ */}
      <Modal visible={Boolean(staffDetails)} animationType="slide" presentationStyle="pageSheet">
         <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
               <Text className="text-xl font-bold text-slate-800">Staff Details</Text>
               <TouchableOpacity onPress={() => setStaffDetails(null)}><Ionicons name="close" size={24} color="#64748b"/></TouchableOpacity>
            </View>
            {staffDetails && (
               <ScrollView className="flex-1 px-5 py-4">
                  <View className="mb-4 pb-4 border-b border-gray-100">
                     <Text className="text-2xl font-bold text-gray-900">{staffDetails.name}</Text>
                     <Text className="text-sm text-gray-500 font-mono mt-1">{staffDetails.id}</Text>
                  </View>
                  <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                     <View style={styles.detailHalf}>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</Text>
                        <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.email}</Text></View>
                     </View>
                     <View style={styles.detailHalf}>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</Text>
                        <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.phone}</Text></View>
                     </View>
                     <View style={styles.detailHalf}>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role</Text>
                        <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.role}</Text></View>
                     </View>
                     <View style={styles.detailHalf}>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</Text>
                        <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.active === "Yes" ? "Active" : "Inactive"}</Text></View>
                     </View>
                     <View style={styles.detailHalf}>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Shift</Text>
                        <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.shift_timing}</Text></View>
                     </View>
                     <View style={styles.detailHalf}>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined</Text>
                        <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.joining_date}</Text></View>
                     </View>
                  </View>

                  <View className="mt-4">
                     <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</Text>
                     <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.address}</Text></View>
                  </View>

                  <View className="flex-row flex-wrap mt-4" style={{ gap: 10 }}>
                     <View style={styles.formHalf}>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Emergency Contact</Text>
                        <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.emergency_contact}</Text></View>
                     </View>
                     {staffDetails.role === "Doctor" && (
                        <View style={styles.formHalf}>
                           <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Specialization</Text>
                           <View className="bg-gray-50 p-3 rounded-lg"><Text className="text-sm">{staffDetails.doctor_specialization}</Text></View>
                        </View>
                     )}
                  </View>
               </ScrollView>
            )}
            <View className="px-5 py-4 border-t border-gray-100">
               <TouchableOpacity onPress={() => setStaffDetails(null)} className="h-12 bg-blue-600 rounded-xl items-center justify-center">
                  <Text className="text-white font-bold">Close details</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>

    </View>
  );
};

const StaffScreen = () => (
  <AdminLayout>
    <StaffContent />
  </AdminLayout>
);

const styles = StyleSheet.create({
  statCard: {
    width: (width - 32 - 12) / 2, // 2 cols
  },
  staffCardWrapper: {
    width: (width > 600) ? "32%" : (width > 400 ? "48%" : "100%"), // responsive cols
  },
  formHalf: {
    width: width > 500 ? "48%" : "100%",
  },
  detailHalf: {
    width: (width - 32 - 40 - 10) / 2,
  }
});

export default StaffScreen;