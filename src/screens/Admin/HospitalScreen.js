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
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AdminLayout, { useSidebar } from "./AdminLayout";

const { width } = Dimensions.get("window");

// ─── Info Field Card ──────────────────────────────────────────────────────────
const InfoField = ({ icon, iconColor, hoverColor, label, value, isEditing, onChangeText, borderColor }) => (
  <View style={[styles.infoField, { borderColor: borderColor || "#e5e7eb" }]}>
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon} size={14} color={iconColor} />
      <Text className="text-xs font-bold text-gray-700 ml-2 uppercase tracking-wider">{label}</Text>
    </View>
    {isEditing ? (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="text-sm text-gray-900 border-2 rounded-lg px-3 py-2"
        style={{ borderColor }}
      />
    ) : (
      <Text className="text-sm text-gray-900">{value}</Text>
    )}
  </View>
);

// ─── Tag Badge ────────────────────────────────────────────────────────────────
const TagBadge = ({ label, gradient, onRemove, isEditing }) => (
  <View style={[styles.tagBadge, { backgroundColor: gradient }]} className="flex-row items-center mr-2 mb-2 px-3 py-1 rounded-full shadow-sm">
    <Text className="text-white text-xs font-semibold">{label}</Text>
    {isEditing && (
      <TouchableOpacity onPress={onRemove} className="ml-2">
        <Ionicons name="close" size={11} color="white" />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Quick Action Button ──────────────────────────────────────────────────────
const QuickActionBtn = ({ action, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`rounded-2xl border p-4 mb-3 flex-row items-center justify-between ${
      isActive ? "border-blue-200/80 bg-white/22" : "border-white/15 bg-white/10"
    }`}
  >
    <View className="flex-row items-center flex-1">
      <View style={[styles.qaIcon, { backgroundColor: action.iconBg }]} className="h-12 w-12 rounded-2xl items-center justify-center mr-3">
        <Ionicons name={action.icon} size={20} color="white" />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center flex-wrap">
          <Text className="text-base font-semibold text-white mr-2">{action.title}</Text>
          <View className="border border-white/20 bg-white/10 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">{action.badge}</Text>
          </View>
        </View>
      </View>
    </View>
    <View className={`h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 ${isActive ? "bg-white/20" : ""}`}>
      <Ionicons name="arrow-forward" size={14} color="white" />
    </View>
  </TouchableOpacity>
);

// ─── Payment Row (compact card for mobile) ────────────────────────────────────
const PaymentRow = ({ payment, isLast }) => {
  const methodIcon =
    payment.method === "Credit Card" ? "card-outline" :
    payment.method === "Bank Transfer" ? "business-outline" :
    "phone-portrait-outline";
  const methodColor =
    payment.method === "Credit Card" ? "#3b82f6" :
    payment.method === "Bank Transfer" ? "#8b5cf6" : "#f97316";

  return (
    <View className={`px-4 py-3 ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Top: date + amount */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-[10px] font-bold text-gray-500">
          {new Date(payment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
        <Text className="text-xs font-black text-emerald-600">{payment.amount}</Text>
      </View>
      {/* Middle: description */}
      <Text className="text-[11px] font-semibold text-gray-800 mb-1.5" numberOfLines={1}>
        {payment.description}
      </Text>
      {/* Bottom: method + status + invoice */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name={methodIcon} size={11} color={methodColor} />
          <Text className="text-[10px] text-gray-500 ml-1">{payment.method}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
            <Text className="text-[9px] font-bold text-emerald-700">{payment.status}</Text>
          </View>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="document-text-outline" size={11} color="#3b82f6" />
            <Text className="text-[9px] font-bold text-blue-600 ml-0.5">Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const HospitalContent = () => {
  const { toggleSidebar } = useSidebar();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  // Modal States
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [newInsurance, setNewInsurance] = useState("");
  const [newHours, setNewHours] = useState("");

  useEffect(() => {
    loadHospitalData();
  }, []);

  const loadHospitalData = () => {
    setLoading(true);
    setTimeout(() => {
      const hospitalData = {
        name: "City General Hospital",
        logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&h=100&fit=crop",
        address: "123 Medical Center Drive, Healthcare City",
        contact: "+1 (555) 123-4567",
        email: "info@citygeneral.com",
        openingHours: "24/7 Emergency, OPD: 8AM–8PM",
        departments: ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "ENT"],
        insurancePartners: ["HealthGuard", "MediCare Plus", "SecureLife", "Wellness First"],
        currentPlan: {
          name: "Premium",
          type: "PREMIUM",
          price: "₹2,250",
          frequency: "/month",
          yearlyPrice: "₹27,000/year",
          features: ["Up to 5 doctors", "Up to 11 patients", "30 appointments / month"],
          status: "Active",
          renewalDate: "2026-04-30",
        },
        paymentHistory: [
          { id: "TXN001", date: "2026-03-30", description: "Monthly Plan - Premium", amount: "₹2,250", status: "Paid", method: "Credit Card", invoiceId: "INV-2026-003" },
          { id: "TXN002", date: "2026-02-28", description: "Monthly Plan - Premium", amount: "₹2,250", status: "Paid", method: "Bank Transfer", invoiceId: "INV-2026-002" },
          { id: "TXN003", date: "2026-01-30", description: "Monthly Plan - Premium", amount: "₹2,250", status: "Paid", method: "Credit Card", invoiceId: "INV-2026-001" },
          { id: "TXN004", date: "2025-12-30", description: "Monthly Plan - Premium", amount: "₹2,250", status: "Paid", method: "UPI", invoiceId: "INV-2025-012" },
          { id: "TXN005", date: "2025-11-30", description: "Monthly Plan - Premium", amount: "₹2,250", status: "Paid", method: "Credit Card", invoiceId: "INV-2025-011" },
        ],
      };
      setHospital(hospitalData);
      setFormData(hospitalData);
      setNewHours(hospitalData.openingHours);
      setLoading(false);
    }, 1000);
  };

  const handleSaveProfile = () => {
    setHospital(formData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData(hospital);
    setIsEditing(false);
  };

  const setField = (field) => (value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleManageInsurance = () => {
    if (newInsurance.trim()) {
      const updated = [...hospital.insurancePartners, newInsurance.trim()];
      setHospital((p) => ({ ...p, insurancePartners: updated }));
      setFormData((p) => ({ ...p, insurancePartners: updated }));
      setNewInsurance("");
      setShowInsuranceModal(false);
    }
  };

  const handleUpdateHours = () => {
    if (newHours?.trim()) {
      setHospital((p) => ({ ...p, openingHours: newHours }));
      setFormData((p) => ({ ...p, openingHours: newHours }));
      setShowHoursModal(false);
    }
  };

  const removeDepartment = (dept) => {
    const updated = hospital.departments.filter((d) => d !== dept);
    setHospital((p) => ({ ...p, departments: updated }));
    setFormData((p) => ({ ...p, departments: updated }));
  };

  const removeInsurance = (ins) => {
    const updated = hospital.insurancePartners.filter((i) => i !== ins);
    setHospital((p) => ({ ...p, insurancePartners: updated }));
    setFormData((p) => ({ ...p, insurancePartners: updated }));
  };

  const triggerQuickAction = (key, action) => {
    setActiveQuickAction(key);
    action();
    setTimeout(() => setActiveQuickAction((c) => (c === key ? null : c)), 700);
  };

  const quickActions = [
    { key: "department", title: "Add Department", badge: "Setup", icon: "add-circle-outline", iconBg: "#3b82f6", onClick: () => Alert.alert("Navigate", "Going to Department Management") },
    { key: "insurance", title: "Manage Insurance", badge: "Coverage", icon: "shield-outline", iconBg: "#10b981", onClick: () => setShowInsuranceModal(true) },
    { key: "hours", title: "Update Hours", badge: "Schedule", icon: "time-outline", iconBg: "#8b5cf6", onClick: () => setShowHoursModal(true) },
    { key: "analytics", title: "View Analytics", badge: "Insights", icon: "stats-chart-outline", iconBg: "#f59e0b", onClick: () => Alert.alert("Navigate", "Going to Reports") },
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Hospital Data...</Text>
      </View>
    );
  }

  const plan = hospital.currentPlan || {};

  return (
    <View className="flex-1 bg-gray-50">
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={toggleSidebar}
            className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50"
          >
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</Text>
            <Text className="text-lg font-black text-gray-900">Hospital Profile</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
          <Ionicons name="notifications-outline" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* ── Hospital Info Card ── */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* Gradient Header */}
          <View style={styles.gradientBlueHeader} className="p-5 border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="relative mr-4">
                <Image
                  source={{ uri: hospital.logo }}
                  style={styles.hospitalLogo}
                  className="rounded-xl"
                />
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => Alert.alert("Update Logo", "Logo update coming soon.")}
                    className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 rounded-full items-center justify-center"
                  >
                    <Ionicons name="camera" size={13} color="white" />
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-1">
                {isEditing ? (
                  <TextInput
                    value={formData.name}
                    onChangeText={setField("name")}
                    className="text-2xl font-bold text-blue-700 border-b-2 border-blue-500"
                  />
                ) : (
                  <Text className="text-2xl font-bold text-blue-700">{hospital.name}</Text>
                )}
                <View className="flex-row items-center mt-1">
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text className="text-xs text-gray-600 ml-1">Leading Healthcare Provider</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Grid */}
          <View className="p-5">
            <View className="flex-row" style={{ gap: 12 }}>
              {/* Left column */}
              <View style={{ flex: 1 }}>
                <InfoField icon="location-outline" iconColor="#3b82f6" borderColor="#93c5fd" label="Address" value={isEditing ? formData.address : hospital.address} isEditing={isEditing} onChangeText={setField("address")} />
                <InfoField icon="call-outline" iconColor="#10b981" borderColor="#6ee7b7" label="Contact" value={isEditing ? formData.contact : hospital.contact} isEditing={isEditing} onChangeText={setField("contact")} />
                <InfoField icon="mail-outline" iconColor="#8b5cf6" borderColor="#c4b5fd" label="Email" value={isEditing ? formData.email : hospital.email} isEditing={isEditing} onChangeText={setField("email")} />
              </View>
              {/* Right column */}
              <View style={{ flex: 1 }}>
                <InfoField icon="time-outline" iconColor="#f59e0b" borderColor="#fcd34d" label="Opening Hours" value={isEditing ? formData.openingHours : hospital.openingHours} isEditing={isEditing} onChangeText={setField("openingHours")} />

                {/* Departments */}
                <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-3">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="business-outline" size={14} color="#3b82f6" />
                    <Text className="text-xs font-bold text-gray-700 ml-2 uppercase tracking-wider">
                      Departments ({hospital.departments?.length})
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap">
                    {hospital.departments?.map((dept, idx) => (
                      <TagBadge key={idx} label={dept} gradient="#3b82f6" isEditing={isEditing} onRemove={() => removeDepartment(dept)} />
                    ))}
                  </View>
                </View>

                {/* Insurance */}
                <View className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="shield-checkmark-outline" size={14} color="#10b981" />
                    <Text className="text-xs font-bold text-gray-700 ml-2 uppercase tracking-wider">
                      Insurance Partners ({hospital.insurancePartners?.length})
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap">
                    {hospital.insurancePartners?.map((ins, idx) => (
                      <TagBadge key={idx} label={ins} gradient="#10b981" isEditing={isEditing} onRemove={() => removeInsurance(ins)} />
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row mt-5" style={{ gap: 10 }}>
              {isEditing ? (
                <>
                  <TouchableOpacity onPress={handleSaveProfile} className="flex-1 flex-row items-center justify-center bg-emerald-600 py-3 rounded-xl shadow-sm">
                    <Ionicons name="save-outline" size={16} color="white" />
                    <Text className="text-white font-bold ml-2">Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelEdit} className="flex-1 flex-row items-center justify-center bg-gray-200 py-3 rounded-xl">
                    <Ionicons name="close" size={16} color="#374151" />
                    <Text className="text-gray-800 font-bold ml-2">Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-1 flex-row items-center justify-center bg-blue-600 py-3 rounded-xl shadow-sm">
                    <Feather name="edit" size={15} color="white" />
                    <Text className="text-white font-bold ml-2">Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert("Update Logo", "Logo update coming soon.")} className="flex-1 flex-row items-center justify-center bg-emerald-600 py-3 rounded-xl shadow-sm">
                    <Ionicons name="image-outline" size={16} color="white" />
                    <Text className="text-white font-bold ml-2">Update Logo</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* ── Quick Actions Panel ── */}
        <View style={styles.quickActionsCard} className="rounded-3xl overflow-hidden mb-4 p-5">
          {/* Decorative blobs */}
          <View style={styles.blobTopRight} />
          <View style={styles.blobBottomLeft} />

          <View className="flex-row items-start mb-1">
            <View>
              <View className="flex-row items-center mb-1">
                <View className="h-2 w-2 rounded-full bg-emerald-300 mr-2" />
                <Text className="text-[10px] font-bold text-cyan-100 uppercase tracking-widest">Live Shortcuts</Text>
              </View>
              <View className="flex-row items-center mt-3 mb-2">
                <Ionicons name="flash" size={20} color="#fbbf24" />
                <Text className="text-xl font-bold text-white ml-2">Quick Actions</Text>
              </View>
              <Text className="text-sm text-blue-100 leading-5 mb-5">
                High-traffic tasks are grouped here so admins can update settings faster.
              </Text>
            </View>
          </View>

          {quickActions.map((action) => (
            <QuickActionBtn
              key={action.key}
              action={action}
              isActive={activeQuickAction === action.key}
              onPress={() => triggerQuickAction(action.key, action.onClick)}
            />
          ))}
        </View>

        {/* ── Current Plan + Payment History Row ── */}
        <View className="flex-col mb-4" style={{ gap: 12 }}>
          {/* Current Plan */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <View style={styles.planHeader} className="p-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 bg-blue-600 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="trophy-outline" size={18} color="white" />
                  </View>
                  <View>
                    <Text className="font-bold text-lg text-gray-800">Current Plan</Text>
                    <Text className="text-xs text-gray-600">Your subscription</Text>
                  </View>
                </View>
                <View className="bg-emerald-100 px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-emerald-700 uppercase">{plan.status || "Active"}</Text>
                </View>
              </View>
            </View>

            <View className="p-4">
              {/* Price */}
              <View className="items-center py-4 border-b border-gray-200 mb-4">
                <Text className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">{plan.type || "Premium"}</Text>
                <View className="flex-row items-end">
                  <Text className="text-4xl font-bold text-blue-600">{plan.price || "₹2,250"}</Text>
                  <Text className="text-gray-600 text-sm mb-1 ml-1">{plan.frequency || "/month"}</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-1">{plan.yearlyPrice || "₹27,000/year"}</Text>
              </View>

              {/* Features */}
              <Text className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3">Includes:</Text>
              {plan.features?.map((feat, i) => (
                <View key={i} className="flex-row items-start mb-3">
                  <View className="h-5 w-5 rounded-full bg-emerald-100 items-center justify-center mr-3 mt-0.5">
                    <Ionicons name="checkmark" size={11} color="#10b981" />
                  </View>
                  <Text className="text-sm text-gray-700 flex-1 leading-5">{feat}</Text>
                </View>
              ))}

              {/* Renewal */}
              <View className="bg-blue-50 rounded-xl p-3 items-center border border-blue-100 mt-2 mb-4">
                <Text className="text-[10px] text-gray-600 mb-1">Renewal Date</Text>
                <Text className="text-sm font-bold text-blue-600">
                  {new Date(plan.renewalDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                </Text>
              </View>

              {/* Buttons */}
              <View className="flex-col" style={{ gap: 8 }}>
                <TouchableOpacity className="flex-row items-center justify-center bg-blue-600 py-2.5 rounded-xl shadow-sm">
                  <Ionicons name="arrow-up-circle-outline" size={15} color="white" />
                  <Text className="text-white font-bold ml-2">Upgrade</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center justify-center bg-gray-100 py-2.5 rounded-xl">
                  <Ionicons name="information-circle-outline" size={15} color="#374151" />
                  <Text className="text-gray-700 font-bold ml-2">Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Payment History */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <View style={styles.paymentHeader} className="p-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 bg-emerald-600 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="receipt-outline" size={18} color="white" />
                  </View>
                  <View>
                    <Text className="font-bold text-lg text-gray-800">Payment History</Text>
                    <Text className="text-xs text-gray-600">Recent transactions</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-emerald-100 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="download-outline" size={12} color="#059669" />
                  <Text className="text-[10px] font-bold text-emerald-700 ml-1">Export</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-100" />

            {hospital.paymentHistory?.map((payment, idx) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                isLast={idx === hospital.paymentHistory.length - 1}
              />
            ))}

            {/* Footer */}
            <View className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex-row items-center justify-between">
              <Text className="text-xs text-gray-600">
                Showing {hospital.paymentHistory?.length || 0} transactions
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-xs font-bold text-blue-600 mr-1">View All</Text>
                <Ionicons name="arrow-forward" size={12} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Insurance Modal ── */}
      <Modal visible={showInsuranceModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox} className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <View className="bg-emerald-600 p-6 flex-row items-center">
              <View className="h-12 w-12 bg-emerald-400 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-outline" size={22} color="white" />
              </View>
              <View>
                <Text className="text-xl font-bold text-white">Add Insurance Partner</Text>
                <Text className="text-emerald-100 text-sm">Expand coverage options</Text>
              </View>
            </View>
            <View className="p-6">
              <Text className="text-sm font-bold text-gray-700 mb-2">Insurance Partner Name</Text>
              <TextInput
                value={newInsurance}
                onChangeText={setNewInsurance}
                placeholder="e.g., MediCare Plus"
                placeholderTextColor="#9ca3af"
                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm font-medium"
              />
            </View>
            <View className="flex-row px-6 pb-6" style={{ gap: 12 }}>
              <TouchableOpacity onPress={() => { setShowInsuranceModal(false); setNewInsurance(""); }} className="flex-1 bg-gray-200 py-3 rounded-xl items-center">
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleManageInsurance} className="flex-1 bg-emerald-600 py-3 rounded-xl items-center flex-row justify-center">
                <Ionicons name="checkmark" size={16} color="white" />
                <Text className="font-bold text-white ml-2">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Update Hours Modal ── */}
      <Modal visible={showHoursModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox} className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <View className="bg-purple-600 p-6 flex-row items-center">
              <View className="h-12 w-12 bg-purple-400 rounded-full items-center justify-center mr-3">
                <Ionicons name="time-outline" size={22} color="white" />
              </View>
              <View>
                <Text className="text-xl font-bold text-white">Update Operating Hours</Text>
                <Text className="text-purple-100 text-sm">Set your business hours</Text>
              </View>
            </View>
            <View className="p-6">
              <Text className="text-sm font-bold text-gray-700 mb-2">Operating Hours</Text>
              <TextInput
                value={newHours}
                onChangeText={setNewHours}
                placeholder="e.g., 24/7 Emergency, OPD: 8AM-8PM"
                placeholderTextColor="#9ca3af"
                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm font-medium"
              />
            </View>
            <View className="flex-row px-6 pb-6" style={{ gap: 12 }}>
              <TouchableOpacity onPress={() => setShowHoursModal(false)} className="flex-1 bg-gray-200 py-3 rounded-xl items-center">
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateHours} className="flex-1 bg-purple-600 py-3 rounded-xl items-center flex-row justify-center">
                <Ionicons name="checkmark" size={16} color="white" />
                <Text className="font-bold text-white ml-2">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const HospitalScreen = () => (
  <AdminLayout>
    <HospitalContent />
  </AdminLayout>
);

const styles = StyleSheet.create({
  infoField: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  tagBadge: {
    borderRadius: 999,
  },
  tagField: {
    marginBottom: 12,
  },
  halfCol: {
    flex: 1,
  },
  hospitalLogo: {
    width: 88,
    height: 88,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "white",
  },
  gradientBlueHeader: {
    backgroundColor: "#eff6ff",
  },
  planHeader: {
    backgroundColor: "#eff6ff",
  },
  paymentHeader: {
    backgroundColor: "#f0fdf4",
  },
  quickActionsCard: {
    backgroundColor: "#1e3a8a",
    position: "relative",
  },
  blobTopRight: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(34,211,238,0.15)",
  },
  blobBottomLeft: {
    position: "absolute",
    bottom: 40,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(99,102,241,0.15)",
  },
  qaIcon: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 420,
  },
});

export default HospitalScreen;