import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const SectionHeader = ({ icon, title, color }) => (
  <View className="flex-row items-center gap-3 mb-4 mt-2">
    <View style={{ backgroundColor: `${color}15` }} className="p-2 rounded-xl">
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text className="text-lg font-black text-slate-800">{title}</Text>
  </View>
);

const InputField = ({ label, value, onChangeText, placeholder, multiline = false }) => (
  <View className="mb-4">
    <Text className="text-slate-600 font-bold text-[10px] uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </Text>
    <TextInput
      className={`bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-medium ${multiline ? 'min-h-[80px]' : ''}`}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
    />
  </View>
);

const ToggleRow = ({ title, desc, value, onValueChange }) => (
  <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
    <View className="flex-1 pr-4">
      <Text className="text-slate-800 font-bold text-sm">{title}</Text>
      <Text className="text-slate-500 text-[10px] mt-0.5">{desc}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#e2e8f0", true: "#4f46e5" }}
      thumbColor={value ? "#ffffff" : "#f4f3f4"}
    />
  </View>
);

const MetricRow = ({ label, value }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
    <Text className="text-slate-500 text-xs font-medium">{label}</Text>
    <Text className="text-slate-900 font-black text-xs">{value}</Text>
  </View>
);

export default function PharmacySettings() {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [general, setGeneral] = useState({
    pharmacy_name: "",
    pharmacy_address: "",
    phone: "",
    email: "",
  });

  const [notifications, setNotifications] = useState({
    low_stock_alerts: true,
    expiry_alerts: true,
    purchase_order_updates: true,
    sales_reports_email: false,
  });

  const [dashboardData, setDashboardData] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch settings
      const settings = await pharmacyApi.getPharmacySettings().catch(err => {
        console.warn("[Settings] Settings fetch failed:", err);
        return null;
      });

      if (settings?.general) setGeneral(settings.general);
      if (settings?.notifications) setNotifications(settings.notifications);

      // Fetch dashboard metrics
      const [metrics, suppliers, medicines, po] = await Promise.allSettled([
        pharmacyApi.getDashboardOverview(),
        pharmacyApi.getSuppliers(),
        pharmacyApi.getMedicines(0, 10), // Small limit just for count
        pharmacyApi.getPurchaseOrders()
      ]);

      const overview = metrics.status === 'fulfilled' ? (metrics.value?.data || metrics.value || {}) : {};
      const suppliersList = suppliers.status === 'fulfilled' ? (suppliers.value?.suppliers || []) : [];
      const poList = po.status === 'fulfilled' ? (po.value?.purchase_orders || []) : [];

      setDashboardData({
        ...overview,
        active_suppliers_count: suppliersList.filter(s => s.status !== 'Inactive').length,
        pending_purchase_orders_count: poList.filter(p => p.status === 'PENDING').length,
      });

    } catch (error) {
      console.error("[Settings] Data fetch error:", error);
      Alert.alert("Error", "Failed to load settings. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await pharmacyApi.updatePharmacySettings({
        general,
        notifications,
      });
      Alert.alert("Success", "Settings updated successfully");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PharmacyLayout>
        <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-slate-500 font-bold mt-4">Loading configuration...</Text>
        </View>
      </PharmacyLayout>
    );
  }

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
          }
        >
          {/* Header */}
          <View className="p-6 pb-2 flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-black text-slate-900 tracking-tight">
                Settings
              </Text>
              <Text className="text-slate-500 font-medium mt-1">
                Pharmacy profile & system preferences
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-indigo-600 px-4 py-2.5 rounded-2xl flex-row items-center shadow-lg shadow-indigo-200"
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="white" />
                  <Text className="text-white font-black text-xs ml-2 uppercase">Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* User Profile Card */}
          <View className="mx-6 mt-4 mb-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 items-center overflow-hidden">
            <View className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
            <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center mb-3">
              <Text className="text-indigo-600 font-black text-xl">
                {currentUser?.name?.charAt(0) || "P"}
              </Text>
            </View>
            <Text className="text-slate-900 font-black text-lg">{currentUser?.name}</Text>
            <View className="bg-indigo-50 px-3 py-1 rounded-full mt-1 mb-4">
              <Text className="text-indigo-600 font-black text-[10px] uppercase">
                {currentUser?.role}
              </Text>
            </View>

            <View className="w-full border-t border-slate-50 pt-4 space-y-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail-outline" size={14} color="#94a3b8" />
                <Text className="text-slate-600 text-xs">{currentUser?.email}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="business-outline" size={14} color="#94a3b8" />
                <Text className="text-slate-600 text-xs">Hospital ID: {currentUser?.hospitalId}</Text>
              </View>
            </View>
          </View>

          {/* General Settings */}
          <View className="mx-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
            <SectionHeader icon="business" title="General Settings" color="#4f46e5" />
            <InputField
              label="Pharmacy Name"
              value={general.pharmacy_name}
              onChangeText={(t) => setGeneral({ ...general, pharmacy_name: t })}
              placeholder="e.g. Apollo Pharmacy"
            />
            <InputField
              label="Pharmacy Address"
              value={general.pharmacy_address}
              onChangeText={(t) => setGeneral({ ...general, pharmacy_address: t })}
              placeholder="Full operational address"
              multiline
            />
            <InputField
              label="Official Phone"
              value={general.phone}
              onChangeText={(t) => setGeneral({ ...general, phone: t })}
              placeholder="+91 XXXXX XXXXX"
            />
            <InputField
              label="Official Email"
              value={general.email}
              onChangeText={(t) => setGeneral({ ...general, email: t })}
              placeholder="pharmacy@hospital.com"
            />
          </View>

          {/* Notification Settings */}
          <View className="mx-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
            <SectionHeader icon="notifications" title="Notifications" color="#10b981" />
            <ToggleRow
              title="Low Stock Alerts"
              desc="Alerts when inventory falls below reorder levels"
              value={notifications.low_stock_alerts}
              onValueChange={() => setNotifications({ ...notifications, low_stock_alerts: !notifications.low_stock_alerts })}
            />
            <ToggleRow
              title="Expiry Alerts"
              desc="Warnings for batches approaching expiration"
              value={notifications.expiry_alerts}
              onValueChange={() => setNotifications({ ...notifications, expiry_alerts: !notifications.expiry_alerts })}
            />
            <ToggleRow
              title="Purchase Order Updates"
              desc="Status updates for POs and GRNs"
              value={notifications.purchase_order_updates}
              onValueChange={() => setNotifications({ ...notifications, purchase_order_updates: !notifications.purchase_order_updates })}
            />
            <ToggleRow
              title="Daily Sales Summary"
              desc="End-of-day revenue reports via email"
              value={notifications.sales_reports_email}
              onValueChange={() => setNotifications({ ...notifications, sales_reports_email: !notifications.sales_reports_email })}
            />
          </View>

          {/* Supply Chain Metrics */}
          <View className="mx-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <SectionHeader icon="analytics" title="Supply Chain Metrics" color="#f59e0b" />
            <MetricRow
              label="Active Suppliers"
              value={dashboardData?.active_suppliers_count || "0"}
            />
            <MetricRow
              label="Low Stock Items"
              value={dashboardData?.low_stock_count || dashboardData?.low_stock_items || "0"}
            />
            <MetricRow
              label="Total Medicines"
              value={dashboardData?.medicines_count || dashboardData?.total_medicines || "0"}
            />
            <MetricRow
              label="Pending Purchase Orders"
              value={dashboardData?.pending_purchase_orders_count || "0"}
            />

            <View className="mt-6 pt-4 border-t border-slate-50 flex-row justify-between items-center">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                System Status
              </Text>
              <View className="flex-row items-center gap-1">
                <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <Text className="text-emerald-500 font-bold text-[10px]">Live</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </PharmacyLayout>
  );
}
