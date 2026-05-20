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
  Dimensions
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ExpiryStatCard = ({ title, value, label, icon, color, bgColor, gradient }) => (
  <View style={{ width: SCREEN_WIDTH * 0.45 }} className="bg-white p-5 rounded-[32px] mr-4 border border-slate-100 shadow-sm overflow-hidden">
    <View className={`absolute top-0 right-0 w-20 h-20 rounded-full ${bgColor} opacity-20 -mr-8 -mt-8`} />
    <View className={`w-11 h-11 rounded-2xl ${bgColor} items-center justify-center mb-4 shadow-sm`}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">{title}</Text>
    <View className="flex-row items-baseline mt-1">
      <Text className="text-slate-900 font-black text-2xl">{value}</Text>
      <Text className="text-slate-400 font-bold text-[10px] ml-1">items</Text>
    </View>
    <View className={`mt-3 self-start px-2 py-0.5 rounded-lg ${bgColor}`}>
      <Text style={{ color }} className="font-black text-[8px] uppercase tracking-widest">{label}</Text>
    </View>
  </View>
);

const AlertItem = ({ alert, onAction, onDiscard }) => {
  const isExpired = alert.level === "Expired";
  const badgeColor =
    alert.level === "Critical" ? "#ef4444" :
      alert.level === "Warning" ? "#f59e0b" :
        alert.level === "Monitor" ? "#10b981" : "#64748b";

  const badgeBg =
    alert.level === "Critical" ? "bg-red-50" :
      alert.level === "Warning" ? "bg-amber-50" :
        alert.level === "Monitor" ? "bg-emerald-50" : "bg-slate-100";

  return (
    <View className="bg-white p-5 rounded-[32px] mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-slate-900 font-black text-base" numberOfLines={1}>
              {alert.name}
            </Text>
            <View className={`ml-2 px-2 py-0.5 rounded-lg ${badgeBg}`}>
              <Text style={{ color: badgeColor }} className="font-black text-[8px] uppercase">
                {alert.level}
              </Text>
            </View>
          </View>
          <Text className="text-slate-400 font-bold text-[10px] mt-0.5 uppercase tracking-tighter">
            Batch: {alert.batch} • Qty: {alert.qty}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => isExpired ? onDiscard(alert) : onAction(alert)}
          className={`w-10 h-10 rounded-2xl items-center justify-center ${isExpired ? 'bg-rose-50' : 'bg-indigo-50'}`}
        >
          <Ionicons
            name={isExpired ? "trash-outline" : "arrow-forward-circle-outline"}
            size={20}
            color={isExpired ? "#ef4444" : "#4f46e5"}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between pt-4 border-t border-slate-50">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
          <Text className="text-slate-500 font-bold text-[10px] ml-1">Expiry: {alert.expiry}</Text>
        </View>
        <View className="flex-row items-center bg-slate-50 px-3 py-1 rounded-full">
          <Ionicons name="time-outline" size={10} color="#64748b" />
          <Text className="text-slate-600 font-black text-[9px] ml-1 uppercase">{alert.days}</Text>
        </View>
      </View>
    </View>
  );
};

export default function PharmacyExpiryAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const fetchExpiryReport = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await pharmacyApi.getAlerts(0, 100, 'EXPIRY', 'PENDING');
      const items = Array.isArray(data) ? data : (data?.items || data?.data || []);

      const getLevel = (days) => {
        if (days <= 0) return "Expired";
        if (days <= 15) return "Critical";
        if (days <= 30) return "Warning";
        return "Monitor";
      };

      const formatted = items.map(item => {
        const meta = item.metadata || {};
        const daysLeft = meta.days_left ?? item.days_left ?? item.days_until_expiry;

        return {
          id: item.id,
          name: meta.medicine_name || item.name || item.item_name || item.message || 'Unknown Medicine',
          code: meta.item_code || item.code || 'N/A',
          batch: meta.batch_number || item.batch || 'N/A',
          qty: meta.stock || item.stock || item.quantity || 0,
          expiry: (meta.expiry_date || item.expiry_date)
            ? new Date(meta.expiry_date || item.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A',
          days: daysLeft !== undefined ? `${daysLeft} days` : 'N/A',
          level: item.priority || meta.expiry_status || item.level || getLevel(daysLeft),
          status: item.status,
          _original: item
        };
      });
      setAlerts(formatted);
    } catch (error) {
      console.error("[Expiry] Fetch error:", error);
      Alert.alert("Error", "Failed to load expiry alerts.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExpiryReport();
  }, [fetchExpiryReport]);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      await pharmacyApi.runExpiryScan();
      Alert.alert("Success", "Expiry scan completed successfully.");
      fetchExpiryReport();
    } catch (error) {
      const msg = error.message || "";
      if (msg.includes("Access denied") || msg.includes("HOSPITAL_ADMIN")) {
        Alert.alert("Permission Denied", "Only Hospital Admins can run manual scans.");
      } else {
        Alert.alert("Error", "Failed to run expiry scan.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleDiscard = async (alert) => {
    try {
      await pharmacyApi.acknowledgeAlert(alert.id);
      fetchExpiryReport();
    } catch (error) {
      Alert.alert("Error", "Failed to acknowledge alert.");
    }
  };

  const handleTakeAction = async (alert) => {
    try {
      await pharmacyApi.acknowledgeAlert(alert.id);
      Alert.alert("Action Initiated", `Processing removal for ${alert.name}`);
      fetchExpiryReport();
    } catch (error) {
      Alert.alert("Error", "Failed to process action.");
    }
  };

  const stats = {
    critical: alerts.filter(a => a.level === "Critical").length,
    warning: alerts.filter(a => a.level === "Warning").length,
    expired: alerts.filter(a => a.level === "Expired").length,
  };

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        {/* Header */}
        <View className="p-6 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">
              Expiry Alerts
            </Text>
            <Text className="text-slate-500 font-medium mt-1">
              Monitor nearing expiration dates
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRunScan}
            disabled={isScanning}
            className="bg-indigo-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
          >
            {isScanning ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="scan" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Analytics Scroll */}
        <View className="py-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
            <ExpiryStatCard
              title="Immediate Attention"
              value={stats.critical}
              label="15 Days Left"
              icon="alert-decagram"
              color="#ef4444"
              bgColor="bg-red-50"
            />
            <ExpiryStatCard
              title="Early Warning"
              value={stats.warning}
              label="30 Days Left"
              icon="clock-alert"
              color="#f59e0b"
              bgColor="bg-amber-50"
            />
            <ExpiryStatCard
              title="Already Expired"
              value={stats.expired}
              label="Action Needed"
              icon="cancel"
              color="#64748b"
              bgColor="bg-slate-100"
            />
          </ScrollView>
        </View>

        {/* List Section */}
        <View className="flex-1 px-4">
          <View className="flex-row items-center justify-between mb-4 px-2">
            <Text className="text-slate-900 font-black text-xs uppercase tracking-widest">
              Pending Alerts ({alerts.length})
            </Text>
            <TouchableOpacity onPress={() => Alert.alert("Export", "Expiry report exported to CSV")}>
              <Text className="text-indigo-600 font-black text-[10px] uppercase">Export PDF</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : (
            <FlatList
              data={alerts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AlertItem
                  alert={item}
                  onAction={handleTakeAction}
                  onDiscard={handleDiscard}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchExpiryReport(true)} />
              }
              ListEmptyComponent={
                <View className="py-20 items-center justify-center">
                  <MaterialCommunityIcons name="shield-check-outline" size={60} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">No active expiry alerts</Text>
                  <Text className="text-slate-300 text-xs mt-1">Your inventory is safe!</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </PharmacyLayout>
  );
}
