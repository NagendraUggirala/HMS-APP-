import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const { width } = Dimensions.get("window");

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, iconColor, iconBg }) => (
  <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100" style={styles.statCard}>
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-sm font-medium text-slate-500 mb-1">{label}</Text>
        <Text className="text-3xl font-black" style={{ color: iconColor }}>{value}</Text>
        <Text className="text-[10px] text-slate-400 mt-2">{sub}</Text>
      </View>
      <View className="h-12 w-12 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
    </View>
  </View>
);

// ─── Filter Tab ───────────────────────────────────────────────────────────────
const FilterTab = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mr-3 px-4 py-2 rounded-xl border ${isActive ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"}`}
  >
    <Text className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-600"}`}>{label}</Text>
  </TouchableOpacity>
);

// ─── Doctor Card ──────────────────────────────────────────────────────────────
const DoctorCard = ({ doctor, onEdit, onView, onDelete }) => (
  <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4" style={styles.doctorCard}>
    <View className="p-5">
      {/* Header */}
      <View className="flex-row items-start mb-4">
        <View className="relative mr-4">
          <Image source={{ uri: doctor.image }} style={styles.avatar} className="rounded-xl" />
          <View
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ backgroundColor: doctor.status === "Active" ? "#10b981" : "#9ca3af" }}
          />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-slate-800 text-lg" numberOfLines={1}>{doctor.name}</Text>
          <Text className="text-[10px] text-slate-400 mt-0.5">{doctor.id}</Text>
          <View
            className="self-start mt-2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: doctor.status === "Active" ? "#d1fae5" : "#f3f4f6" }}
          >
            <Text
              className="text-[10px] font-bold"
              style={{ color: doctor.status === "Active" ? "#059669" : "#6b7280" }}
            >
              {doctor.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Specialization */}
      <View className="mb-4">
        <View className="flex-row items-center mb-1.5">
          <MaterialCommunityIcons name="stethoscope" size={14} color="#6366f1" />
          <Text className="text-indigo-600 font-semibold text-sm ml-1.5">{doctor.specialization}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="business-outline" size={12} color="#94a3b8" />
          <Text className="text-slate-500 text-xs ml-1.5">{doctor.department}</Text>
        </View>
      </View>

      {/* Key info */}
      <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
        <View>
          <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fee</Text>
          <Text className="text-slate-800 font-bold">₹{doctor.fee}</Text>
        </View>
        <View>
          <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hours</Text>
          <Text className="text-slate-700 text-sm font-medium">{doctor.availability}</Text>
        </View>
        <View>
          <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contact</Text>
          <Text className="text-slate-600 text-[10px]" numberOfLines={1}>{doctor.contact}</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row mt-3 pt-1" style={{ gap: 8 }}>
        <TouchableOpacity onPress={onEdit} className="flex-1 flex-row items-center justify-center bg-blue-50 py-2.5 rounded-xl">
          <Feather name="edit" size={13} color="#2563eb" />
          <Text className="text-blue-700 font-semibold text-sm ml-1.5">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onView} className="flex-1 flex-row items-center justify-center bg-gray-50 py-2.5 rounded-xl">
          <Feather name="eye" size={13} color="#475569" />
          <Text className="text-slate-700 font-semibold text-sm ml-1.5">View</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} className="px-4 py-2.5 bg-red-50 rounded-xl items-center justify-center">
          <Feather name="trash-2" size={14} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ─── Form Input ───────────────────────────────────────────────────────────────
const FormInput = ({ label, required, value, onChangeText, placeholder, keyboardType, secureTextEntry, note }) => (
  <View className="mb-4">
    <View className="flex-row items-center mb-1">
      <Text className="text-sm font-semibold text-slate-700">{label}</Text>
      {required && <Text className="text-red-500 ml-1">*</Text>}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      keyboardType={keyboardType || "default"}
      secureTextEntry={secureTextEntry}
      className="border border-slate-300 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800"
    />
    {note && <Text className="text-[10px] text-slate-500 mt-1">{note}</Text>}
  </View>
);

// ─── Picker Row ───────────────────────────────────────────────────────────────
const PickerRow = ({ label, required, options, selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-1">
        <Text className="text-sm font-semibold text-slate-700">{label}</Text>
        {required && <Text className="text-red-500 ml-1">*</Text>}
      </View>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="border border-slate-300 rounded-2xl bg-slate-50 px-4 py-3 flex-row items-center justify-between"
      >
        <Text className={`text-sm ${selected ? "text-slate-800" : "text-slate-400"}`}>
          {selected || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#94a3b8" />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View className="bg-white rounded-2xl shadow-2xl mx-6" style={{ maxHeight: 400, width: width - 48 }}>
            <View className="p-4 border-b border-gray-100">
              <Text className="text-base font-bold text-slate-800">Select {label}</Text>
            </View>
            <ScrollView className="px-2 py-2">
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                  className={`px-4 py-3 rounded-xl mb-1 ${selected === opt ? "bg-blue-50" : ""}`}
                >
                  <Text className={`text-sm ${selected === opt ? "text-blue-600 font-bold" : "text-slate-700"}`}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── View Detail Row ──────────────────────────────────────────────────────────
const DetailRow = ({ icon, iconColor, label, value }) => (
  <View className="bg-gray-50 rounded-xl p-4" style={styles.detailCard}>
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon} size={14} color={iconColor} />
      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-2">{label}</Text>
    </View>
    <Text className="text-slate-800 font-medium text-sm">{value}</Text>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONTENT
// ═══════════════════════════════════════════════════════════════════════════════
const DoctorContent = () => {
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  const emptyForm = {
    name: "", specialization: "", department: "", email: "", personalEmail: "",
    phone: "", qualification: "", experience: "", consultationFee: "",
    availability: "9AM-5PM", bio: "", password: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  const departments = ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "ENT", "Dermatology", "Ophthalmology", "Dentistry", "Psychiatry", "General Medicine"];
  const specializations = ["Cardiologist", "Orthopedic Surgeon", "Neurologist", "Pediatrician", "ENT Specialist", "Dermatologist", "Ophthalmologist", "Dentist", "Psychiatrist", "General Physician"];
  const availabilityOptions = ["9AM-5PM", "10AM-6PM", "8AM-4PM", "24/7 On-call", "Flexible Hours", "Weekends Only"];

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = () => {
    setLoading(true);
    setTimeout(() => {
      setDoctors([
        { id: "DOC-1001", name: "Dr. Meena Rao", specialization: "Cardiology", department: "Cardiology", availability: "9AM-5PM", fee: 800, contact: "+91 98765 43210", status: "Active", image: "https://i.pravatar.cc/100?img=1", email: "meena.rao@hospital.com", qualification: "MBBS, MD Cardiology", experience: "12", bio: "Senior Cardiologist with 12 years of experience" },
        { id: "DOC-1002", name: "Dr. Vivek Sharma", specialization: "Orthopedics", department: "Orthopedics", availability: "10AM-6PM", fee: 750, contact: "+91 98765 43211", status: "Active", image: "https://i.pravatar.cc/100?img=2", email: "vivek.sharma@hospital.com", qualification: "MBBS, MS Orthopedics", experience: "8", bio: "Orthopedic surgeon specializing in joint replacements" },
        { id: "DOC-1003", name: "Dr. Rajesh Menon", specialization: "Neurology", department: "Neurology", availability: "8AM-4PM", fee: 900, contact: "+91 98765 43212", status: "Active", image: "https://i.pravatar.cc/100?img=3", email: "rajesh.menon@hospital.com", qualification: "MBBS, DM Neurology", experience: "15", bio: "Neurologist with expertise in stroke management" },
        { id: "DOC-1004", name: "Dr. Anjali Desai", specialization: "Pediatrics", department: "Pediatrics", availability: "24/7 On-call", fee: 600, contact: "+91 98765 43213", status: "Active", image: "https://i.pravatar.cc/100?img=4", email: "anjali.desai@hospital.com", qualification: "MBBS, DCH", experience: "10", bio: "Pediatrician with special interest in child development" },
      ]);
      setLoading(false);
    }, 1000);
  };

  const set = (field) => (val) => setFormData((p) => ({ ...p, [field]: val }));
  const resetForm = () => { setFormData(emptyForm); setCurrentDoctor(null); };

  const validateForm = () => {
    const req = ["name", "email", "phone", "qualification", "department", "specialization", "experience", "consultationFee"];
    for (const f of req) {
      if (!formData[f]) { Alert.alert("Missing Field", `Please fill in the ${f} field`); return false; }
    }
    if (isAddModalOpen && !formData.password) { Alert.alert("Missing Field", "Please set a password"); return false; }
    return true;
  };

  const handleAddDoctor = () => {
    if (!validateForm()) return;
    const doc = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name, specialization: formData.specialization, department: formData.department,
      availability: formData.availability, fee: parseInt(formData.consultationFee),
      contact: formData.phone, status: "Active",
      image: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70) + 1}`,
      email: formData.email, qualification: formData.qualification,
      experience: formData.experience, bio: formData.bio,
    };
    setDoctors((p) => [doc, ...p]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditDoctor = () => {
    if (!validateForm()) return;
    setDoctors((p) =>
      p.map((d) =>
        d.id === currentDoctor.id
          ? { ...d, name: formData.name, specialization: formData.specialization, department: formData.department, availability: formData.availability, fee: parseInt(formData.consultationFee), contact: formData.phone, email: formData.email, qualification: formData.qualification, experience: formData.experience, bio: formData.bio }
          : d
      )
    );
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleToggleStatus = (id) => {
    setDoctors((p) => p.map((d) => d.id === id ? { ...d, status: d.status === "Active" ? "Inactive" : "Active" } : d));
  };

  const handleDeleteDoctor = () => {
    setDoctors((p) => p.filter((d) => d.id !== currentDoctor.id));
    setIsDeleteModalOpen(false);
    setCurrentDoctor(null);
  };

  const openEditModal = (doc) => {
    setCurrentDoctor(doc);
    setFormData({ name: doc.name, specialization: doc.specialization, department: doc.department, email: doc.email, personalEmail: "", phone: doc.contact, qualification: doc.qualification, experience: doc.experience, consultationFee: doc.fee.toString(), availability: doc.availability, bio: doc.bio || "", password: "" });
    setIsEditModalOpen(true);
  };

  const filteredDoctors = doctors.filter((d) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || d.name.toLowerCase().includes(s) || d.specialization.toLowerCase().includes(s);
    const matchDept = !departmentFilter || d.department === departmentFilter;
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter((d) => d.status === "Active").length;
  const inactiveDoctors = doctors.filter((d) => d.status === "Inactive").length;
  const uniqueDepts = new Set(doctors.map((d) => d.department)).size;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Doctors...</Text>
      </View>
    );
  }

  // ── Form Fields Renderer ──
  const renderFormFields = () => (
    <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
      <FormInput label="Full Name" required value={formData.name} onChangeText={set("name")} placeholder="Dr. John Doe" />
      <FormInput label="Work Email" required value={formData.email} onChangeText={set("email")} placeholder="doctor@hospital.com" keyboardType="email-address" />
      <FormInput label="Personal Email" value={formData.personalEmail} onChangeText={set("personalEmail")} placeholder="personal@email.com" keyboardType="email-address" />
      <FormInput label="Phone Number" required value={formData.phone} onChangeText={set("phone")} placeholder="+91 98765 43210" keyboardType="phone-pad" />
      <FormInput label="Qualification" required value={formData.qualification} onChangeText={set("qualification")} placeholder="MBBS, MD, etc." />
      <PickerRow label="Department" required options={departments} selected={formData.department} onSelect={set("department")} />
      <PickerRow label="Specialization" required options={specializations} selected={formData.specialization} onSelect={set("specialization")} />
      <FormInput label="Years of Experience" required value={formData.experience} onChangeText={set("experience")} placeholder="5" keyboardType="number-pad" />
      <FormInput label="Consultation Fee (₹)" required value={formData.consultationFee} onChangeText={set("consultationFee")} placeholder="500" keyboardType="number-pad" />
      {isAddModalOpen && (
        <FormInput label="Set Password" required value={formData.password} onChangeText={set("password")} placeholder="Enter a secure password" secureTextEntry note="Password must be at least 8 characters" />
      )}
      <PickerRow label="Availability" required options={availabilityOptions} selected={formData.availability} onSelect={set("availability")} />
      <FormInput label="Professional Bio" value={formData.bio} onChangeText={set("bio")} placeholder="Brief description about the doctor..." />
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
            <Text className="text-lg font-black text-gray-900">Doctor Management</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsAddModalOpen(true)}
          className="flex-row items-center bg-blue-600 px-4 py-2.5 rounded-xl shadow-sm"
        >
          <Ionicons name="add" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* ── Stats Grid ── */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard label="Total Doctors" value={totalDoctors} sub="Medical staff" icon="people" iconColor="#3b82f6" iconBg="#dbeafe" />
          <StatCard label="Active Doctors" value={activeDoctors} sub="Currently practicing" icon="checkmark-circle" iconColor="#10b981" iconBg="#d1fae5" />
          <StatCard label="Inactive Doctors" value={inactiveDoctors} sub="On leave / unavailable" icon="time-outline" iconColor="#f59e0b" iconBg="#fef3c7" />
          <StatCard label="Departments" value={uniqueDepts} sub="Specialized units" icon="business" iconColor="#8b5cf6" iconBg="#ede9fe" />
        </View>

        {/* ── Search & Filters ── */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <View className="flex-row items-center bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
            <Feather name="search" size={16} color="#9ca3af" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Name or specialization..."
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-2 text-sm text-slate-800"
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Department filter tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <FilterTab label="All Depts" isActive={!departmentFilter} onPress={() => setDepartmentFilter("")} />
            {departments.slice(0, 6).map((dept) => (
              <FilterTab key={dept} label={dept} isActive={departmentFilter === dept} onPress={() => setDepartmentFilter(departmentFilter === dept ? "" : dept)} />
            ))}
          </ScrollView>

          {/* Status filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterTab label="All Status" isActive={!statusFilter} onPress={() => setStatusFilter("")} />
            <FilterTab label="Active" isActive={statusFilter === "Active"} onPress={() => setStatusFilter(statusFilter === "Active" ? "" : "Active")} />
            <FilterTab label="Inactive" isActive={statusFilter === "Inactive"} onPress={() => setStatusFilter(statusFilter === "Inactive" ? "" : "Inactive")} />
          </ScrollView>

          {(searchTerm || departmentFilter || statusFilter) ? (
            <TouchableOpacity onPress={() => { setSearchTerm(""); setDepartmentFilter(""); setStatusFilter(""); }} className="flex-row items-center self-end mt-3">
              <Ionicons name="close-circle-outline" size={14} color="#3b82f6" />
              <Text className="text-blue-600 font-medium text-xs ml-1">Clear all filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── Doctor Cards ── */}
        {filteredDoctors.length > 0 ? (
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {filteredDoctors.map((doc) => (
              <View key={doc.id} style={styles.cardWrapper}>
                <DoctorCard
                  doctor={doc}
                  onEdit={() => openEditModal(doc)}
                  onView={() => { setCurrentDoctor(doc); setIsViewModalOpen(true); }}
                  onDelete={() => { setCurrentDoctor(doc); setIsDeleteModalOpen(true); }}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <View className="h-24 w-24 rounded-full bg-slate-100 items-center justify-center mb-6">
              <MaterialCommunityIcons name="doctor" size={48} color="#94a3b8" />
            </View>
            <Text className="text-2xl font-bold text-slate-700 mb-2">No Doctors Found</Text>
            <Text className="text-slate-500 mb-6">Try adjusting your search or filter criteria</Text>
            <TouchableOpacity onPress={() => setIsAddModalOpen(true)} className="flex-row items-center bg-blue-500 px-6 py-3 rounded-xl">
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Add New Doctor</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ══════════ ADD DOCTOR MODAL ══════════ */}
      <Modal visible={isAddModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50">
            <View className="flex-row items-center">
              <View className="h-10 w-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                <Ionicons name="person-add" size={20} color="white" />
              </View>
              <Text className="text-xl font-bold text-slate-800">Add New Doctor</Text>
            </View>
            <TouchableOpacity onPress={() => { setIsAddModalOpen(false); resetForm(); }}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          {renderFormFields()}
          <View className="flex-row px-5 py-4 border-t border-gray-100" style={{ gap: 12 }}>
            <TouchableOpacity onPress={() => { setIsAddModalOpen(false); resetForm(); }} className="flex-1 py-3 border border-gray-300 rounded-xl items-center">
              <Text className="font-semibold text-slate-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddDoctor} className="flex-1 py-3 bg-blue-600 rounded-xl items-center flex-row justify-center">
              <Ionicons name="add" size={16} color="white" />
              <Text className="font-semibold text-white ml-2">Add Doctor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════ EDIT DOCTOR MODAL ══════════ */}
      <Modal visible={isEditModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-indigo-50">
            <View className="flex-row items-center">
              <View className="h-10 w-10 bg-indigo-600 rounded-xl items-center justify-center mr-3">
                <Feather name="edit" size={18} color="white" />
              </View>
              <Text className="text-xl font-bold text-slate-800">Edit Doctor</Text>
            </View>
            <TouchableOpacity onPress={() => { setIsEditModalOpen(false); resetForm(); }}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          {renderFormFields()}
          <View className="flex-row px-5 py-4 border-t border-gray-100" style={{ gap: 12 }}>
            <TouchableOpacity onPress={() => { setIsEditModalOpen(false); resetForm(); }} className="flex-1 py-3 border border-gray-300 rounded-xl items-center">
              <Text className="font-semibold text-slate-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEditDoctor} className="flex-1 py-3 bg-indigo-600 rounded-xl items-center flex-row justify-center">
              <Ionicons name="save-outline" size={16} color="white" />
              <Text className="font-semibold text-white ml-2">Update Doctor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════ VIEW DOCTOR MODAL ══════════ */}
      <Modal visible={isViewModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-slate-800">Doctor Details</Text>
            <TouchableOpacity onPress={() => { setIsViewModalOpen(false); setCurrentDoctor(null); }}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {currentDoctor && (
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Profile header */}
              <View className="bg-blue-50 p-6">
                <View className="flex-row items-start">
                  <View className="relative mr-5">
                    <Image source={{ uri: currentDoctor.image }} style={{ width: 96, height: 96, borderRadius: 16, borderWidth: 3, borderColor: "white" }} />
                    <View
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: currentDoctor.status === "Active" ? "#10b981" : "#9ca3af" }}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between flex-wrap">
                      <Text className="text-2xl font-bold text-slate-800">{currentDoctor.name}</Text>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: currentDoctor.status === "Active" ? "#d1fae5" : "#f3f4f6" }}>
                        <Text style={{ color: currentDoctor.status === "Active" ? "#059669" : "#6b7280" }} className="text-xs font-bold">
                          {currentDoctor.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-slate-500 text-sm mt-1">{currentDoctor.id}</Text>
                    <View className="flex-row items-center mt-2">
                      <MaterialCommunityIcons name="stethoscope" size={16} color="#6366f1" />
                      <Text className="text-indigo-600 font-semibold ml-2">{currentDoctor.specialization}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Detail grid */}
              <View className="p-5 flex-row flex-wrap" style={{ gap: 10 }}>
                <DetailRow icon="business-outline" iconColor="#3b82f6" label="Department" value={currentDoctor.department} />
                <DetailRow icon="trophy-outline" iconColor="#8b5cf6" label="Experience" value={`${currentDoctor.experience} Years`} />
                <DetailRow icon="mail-outline" iconColor="#10b981" label="Email" value={currentDoctor.email} />
                <DetailRow icon="call-outline" iconColor="#f97316" label="Contact" value={currentDoctor.contact} />
                <DetailRow icon="calendar-outline" iconColor="#14b8a6" label="Availability" value={currentDoctor.availability} />
                <DetailRow icon="cash-outline" iconColor="#eab308" label="Consultation Fee" value={`₹${currentDoctor.fee}`} />
              </View>

              {/* Qualification + Bio */}
              <View className="px-5" style={{ gap: 10 }}>
                <DetailRow icon="school-outline" iconColor="#6366f1" label="Qualification" value={currentDoctor.qualification} />
                {currentDoctor.bio ? <DetailRow icon="book-outline" iconColor="#06b6d4" label="Bio" value={currentDoctor.bio} /> : null}
              </View>
            </ScrollView>
          )}

          {/* Footer actions */}
          {currentDoctor && (
            <View className="flex-row px-5 py-4 border-t border-gray-100" style={{ gap: 10 }}>
              <TouchableOpacity onPress={() => { setIsViewModalOpen(false); setCurrentDoctor(null); }} className="flex-1 py-3 border border-gray-300 rounded-xl items-center">
                <Text className="font-semibold text-slate-700">Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleToggleStatus(currentDoctor.id);
                  setCurrentDoctor({ ...currentDoctor, status: currentDoctor.status === "Active" ? "Inactive" : "Active" });
                }}
                className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
                style={{ backgroundColor: currentDoctor.status === "Active" ? "#f59e0b" : "#10b981" }}
              >
                <Ionicons name={currentDoctor.status === "Active" ? "pause" : "play"} size={14} color="white" />
                <Text className="font-semibold text-white ml-2">
                  {currentDoctor.status === "Active" ? "Deactivate" : "Activate"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setIsViewModalOpen(false); openEditModal(currentDoctor); }}
                className="flex-1 py-3 bg-blue-600 rounded-xl items-center flex-row justify-center"
              >
                <Feather name="edit" size={14} color="white" />
                <Text className="font-semibold text-white ml-2">Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* ══════════ DELETE CONFIRM MODAL ══════════ */}
      <Modal visible={isDeleteModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-2xl shadow-2xl mx-8 overflow-hidden" style={{ width: width - 64 }}>
            <View className="items-center p-6">
              <View className="h-16 w-16 bg-red-100 rounded-2xl items-center justify-center mb-5">
                <Ionicons name="warning-outline" size={30} color="#dc2626" />
              </View>
              <Text className="text-xl font-bold text-slate-800 mb-2">Confirm Deletion</Text>
              <Text className="text-slate-600 text-center mb-1">
                Are you sure you want to delete{" "}
                <Text className="font-bold text-red-600">{currentDoctor?.name}</Text>?
              </Text>
              <Text className="text-slate-400 text-sm mb-6">This action cannot be undone.</Text>
              <View className="flex-row w-full" style={{ gap: 12 }}>
                <TouchableOpacity onPress={() => { setIsDeleteModalOpen(false); setCurrentDoctor(null); }} className="flex-1 py-3 border border-gray-300 rounded-xl items-center">
                  <Text className="font-semibold text-slate-700">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteDoctor} className="flex-1 py-3 bg-red-500 rounded-xl items-center flex-row justify-center">
                  <Feather name="trash-2" size={14} color="white" />
                  <Text className="font-semibold text-white ml-2">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const DocterScreen = () => (
  <AdminLayout>
    <DoctorContent />
  </AdminLayout>
);

const styles = StyleSheet.create({
  statCard: {
    width: width > 1024 ? "23%" : width > 768 ? "48%" : "48%",
    marginBottom: 12,
  },
  doctorCard: {
    // full width on narrow screens
  },
  cardWrapper: {
    width: width > 1000 ? "32%" : width > 700 ? "48%" : "100%",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
  },
  detailCard: {
    width: (width - 32 - 40 - 10) / 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DocterScreen;