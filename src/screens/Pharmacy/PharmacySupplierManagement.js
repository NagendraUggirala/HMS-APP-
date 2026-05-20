import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  StyleSheet
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const emptyForm = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  gstin: "",
  drug_license_no: "",
  payment_terms: "NET_30",
  credit_limit: "0",
  rating: "0",
  notes: ""
};

const PAYMENT_TERMS = [
  { value: "IMMEDIATE", label: "Immediate" },
  { value: "NET_15", label: "Net 15 Days" },
  { value: "NET_30", label: "Net 30 Days" },
  { value: "NET_60", label: "Net 60 Days" }
];

const SupplierItem = ({ supplier, onPress, onEdit, onDelete }) => (
  <TouchableOpacity
    onPress={() => onPress(supplier)}
    className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 shadow-sm"
  >
    <View className="flex-row items-center mb-3">
      <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center">
        <MaterialCommunityIcons name="office-building" size={24} color="#4f46e5" />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-slate-900 font-black text-sm" numberOfLines={1}>
          {supplier.name}
        </Text>
        <Text className="text-slate-500 font-bold text-[10px]" numberOfLines={1}>
          {supplier.contact_person}
        </Text>
      </View>
      <View className="items-end">
        <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg">
          <Ionicons name="star" size={10} color="#f59e0b" />
          <Text className="text-amber-600 font-black text-[10px] ml-1">{supplier.rating || "0"}</Text>
        </View>
      </View>
    </View>

    <View className="flex-row items-center justify-between pt-3 border-t border-slate-50">
      <View className="flex-row items-center">
        <Ionicons name="call-outline" size={12} color="#94a3b8" />
        <Text className="text-slate-500 font-medium text-[10px] ml-1">{supplier.phone}</Text>
      </View>
      <View className="flex-row gap-4">
        <TouchableOpacity onPress={() => onEdit(supplier)}>
          <Ionicons name="pencil" size={18} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(supplier)}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <View style={{ width: SCREEN_WIDTH * 0.4 }} className="bg-white p-4 rounded-[32px] mr-3 border border-slate-100 shadow-sm">
    <View className={`w-10 h-10 rounded-2xl ${bgColor} items-center justify-center mb-3`}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">{title}</Text>
    <Text className="text-slate-900 font-black text-lg mt-0.5">{value}</Text>
  </View>
);

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = "default", multiline = false, disabled = false }) => (
  <View className="mb-4">
    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </Text>
    <TextInput
      className={`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold ${multiline ? 'min-h-[80px]' : ''} ${disabled ? 'opacity-50' : ''}`}
      value={String(value || "")}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      editable={!disabled}
    />
  </View>
);

export default function PharmacySupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit | view
  const [selectedId, setSelectedId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [supData, dashData] = await Promise.all([
        pharmacyApi.getSuppliers(0, 500),
        pharmacyApi.getDashboardOverview()
      ]);

      const items = supData.suppliers || supData.items || supData.data || (Array.isArray(supData) ? supData : []);

      const normalized = items.map(s => ({
        ...s,
        id: s.id || s._id,
        name: s.name || s.supplier_name || "Unknown Vendor",
        contact_person: s.contact_person || s.contact || "N/A"
      })).filter(s => !s.is_deleted && s.status !== 'Deleted');

      setSuppliers(normalized);
      setDashboardData(dashData);
    } catch (error) {
      console.error("[Suppliers] Fetch error:", error);
      Alert.alert("Error", "Failed to load supplier data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (mode, sup = null) => {
    setMode(mode);
    if (sup) {
      setSelectedId(sup.id);
      setFormData({
        name: sup.name || "",
        contact_person: sup.contact_person || "",
        phone: sup.phone || "",
        email: sup.email || "",
        address_line1: sup.address_line1 || "",
        address_line2: sup.address_line2 || "",
        city: sup.city || "",
        state: sup.state || "",
        pincode: sup.pincode || "",
        country: sup.country || "India",
        gstin: sup.gstin || "",
        drug_license_no: sup.drug_license_no || "",
        payment_terms: sup.payment_terms || "NET_30",
        credit_limit: String(sup.credit_limit || "0"),
        rating: String(sup.rating || "0"),
        notes: sup.notes || ""
      });
    } else {
      setSelectedId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.contact_person.trim() || !formData.phone.trim()) {
      Alert.alert("Validation", "Name, Contact Person, and Phone are required.");
      return;
    }

    setIsActionLoading(true);
    try {
      const payload = {
        ...formData,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        rating: parseFloat(formData.rating) || 0
      };

      if (mode === "edit") {
        await pharmacyApi.updateSupplier(selectedId, payload);
        Alert.alert("Success", "Supplier updated successfully.");
      } else {
        await pharmacyApi.createSupplier(payload);
        Alert.alert("Success", "Supplier registered successfully.");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      Alert.alert("Error", error.message || "Operation failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = (sup) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to remove ${sup.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await pharmacyApi.deleteSupplier(sup.id);
              fetchData();
            } catch (error) {
              Alert.alert("Error", "Failed to delete supplier.");
            }
          }
        }
      ]
    );
  };

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        {/* Header */}
        <View className="p-6 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">
              Suppliers
            </Text>
            <Text className="text-slate-500 font-medium mt-1">
              Manage vendors & procurement
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleOpenModal("add")}
            className="bg-indigo-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
            <StatCard
              title="Total Suppliers"
              value={suppliers.length}
              icon="account-group"
              color="#4f46e5"
              bgColor="bg-indigo-50"
            />
            <StatCard
              title="Pending Deliveries"
              value={dashboardData?.pending_deliveries || "0"}
              icon="truck-delivery"
              color="#f59e0b"
              bgColor="bg-amber-50"
            />
            <StatCard
              title="Total Payables"
              value={`₹${(dashboardData?.total_payables || 0).toLocaleString()}`}
              icon="currency-inr"
              color="#10b981"
              bgColor="bg-emerald-50"
            />
          </ScrollView>
        </View>

        {/* Search */}
        <View className="px-6 py-2">
          <View className="bg-white border border-slate-200 rounded-3xl px-4 py-3 flex-row items-center shadow-sm">
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-700 font-bold"
              placeholder="Search by vendor name or contact..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* List */}
        <View className="flex-1 px-4 mt-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : (
            <FlatList
              data={suppliers.filter(s =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.contact_person.toLowerCase().includes(search.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SupplierItem
                  supplier={item}
                  onPress={(s) => handleOpenModal("view", s)}
                  onEdit={(s) => handleOpenModal("edit", s)}
                  onDelete={(s) => handleDelete(s)}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
              }
              ListEmptyComponent={
                <View className="py-20 items-center justify-center">
                  <MaterialCommunityIcons name="store-off-outline" size={60} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">No suppliers found</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Modal Form */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-6 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">
                  {mode === 'add' ? 'New Supplier' : mode === 'edit' ? 'Modify Supplier' : 'Supplier Details'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Ionicons name="close-circle" size={28} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {isActionLoading ? (
                <View className="py-20 items-center justify-center">
                  <ActivityIndicator size="large" color="#4f46e5" />
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                  {/* General */}
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="information-circle" size={16} color="#4f46e5" />
                    <Text className="text-slate-900 font-black text-xs uppercase tracking-tighter">General Info</Text>
                  </View>

                  <FormInput
                    label="Supplier Name *"
                    value={formData.name}
                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                    placeholder="e.g. PharmaCore Ltd"
                    disabled={mode === 'view'}
                  />

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <FormInput
                        label="Contact Person *"
                        value={formData.contact_person}
                        onChangeText={(t) => setFormData({ ...formData, contact_person: t })}
                        placeholder="Name"
                        disabled={mode === 'view'}
                      />
                    </View>
                    <View className="flex-1">
                      <FormInput
                        label="Phone *"
                        value={formData.phone}
                        onChangeText={(t) => setFormData({ ...formData, phone: t })}
                        placeholder="+91..."
                        keyboardType="phone-pad"
                        disabled={mode === 'view'}
                      />
                    </View>
                  </View>

                  <FormInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(t) => setFormData({ ...formData, email: t })}
                    placeholder="vendor@example.com"
                    keyboardType="email-address"
                    disabled={mode === 'view'}
                  />

                  {/* Address */}
                  <View className="flex-row items-center gap-2 mb-2 mt-4">
                    <Ionicons name="location" size={16} color="#4f46e5" />
                    <Text className="text-slate-900 font-black text-xs uppercase tracking-tighter">Location Details</Text>
                  </View>

                  <FormInput
                    label="Address Line 1"
                    value={formData.address_line1}
                    onChangeText={(t) => setFormData({ ...formData, address_line1: t })}
                    disabled={mode === 'view'}
                  />

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <FormInput
                        label="City"
                        value={formData.city}
                        onChangeText={(t) => setFormData({ ...formData, city: t })}
                        disabled={mode === 'view'}
                      />
                    </View>
                    <View className="flex-1">
                      <FormInput
                        label="State"
                        value={formData.state}
                        onChangeText={(t) => setFormData({ ...formData, state: t })}
                        disabled={mode === 'view'}
                      />
                    </View>
                  </View>

                  {/* Financials */}
                  <View className="flex-row items-center gap-2 mb-2 mt-4">
                    <Ionicons name="card" size={16} color="#4f46e5" />
                    <Text className="text-slate-900 font-black text-xs uppercase tracking-tighter">Legal & Financials</Text>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <FormInput
                        label="GSTIN"
                        value={formData.gstin}
                        onChangeText={(t) => setFormData({ ...formData, gstin: t })}
                        disabled={mode === 'view'}
                      />
                    </View>
                    <View className="flex-1">
                      <FormInput
                        label="Credit Limit (₹)"
                        value={formData.credit_limit}
                        onChangeText={(t) => setFormData({ ...formData, credit_limit: t })}
                        keyboardType="numeric"
                        disabled={mode === 'view'}
                      />
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1.5 ml-1">Payment Terms</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {PAYMENT_TERMS.map(t => (
                        <TouchableOpacity
                          key={t.value}
                          onPress={() => mode !== 'view' && setFormData({ ...formData, payment_terms: t.value })}
                          className={`px-4 py-2 rounded-xl border ${formData.payment_terms === t.value ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                        >
                          <Text className={`text-[10px] font-bold ${formData.payment_terms === t.value ? 'text-white' : 'text-slate-600'}`}>
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <FormInput
                    label="Internal Notes"
                    value={formData.notes}
                    onChangeText={(t) => setFormData({ ...formData, notes: t })}
                    placeholder="Add any internal comments..."
                    multiline
                    disabled={mode === 'view'}
                  />

                  {mode !== 'view' && (
                    <TouchableOpacity
                      onPress={handleSave}
                      disabled={isActionLoading}
                      className="bg-indigo-600 rounded-3xl py-4 items-center shadow-lg shadow-indigo-100 mt-6 mb-10"
                    >
                      <Text className="text-white font-black uppercase tracking-widest text-xs">
                        {mode === 'add' ? 'Register Supplier' : 'Update Records'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View className="h-10" />
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </PharmacyLayout>
  );
}
